import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Sparkles, Loader2, Filter, X, MessageCircle, Home, Key, RefreshCw, RotateCcw } from "lucide-react";
import { FilterToggleBar, FilterState } from "./FilterToggleBar";
import { PropertyResultsTable, PropertyResult } from "./PropertyResultsTable";
import { WebSearchResult } from "./WebSearchResultsTable";
import { PropertyDetailModal } from "./PropertyDetailModal";
import { ChatMessageList, WebhookResultData, ToolStatus } from "./ChatMessageList";
import { RecommendationsPayload } from "./RecommendationsView";
import { SearchSource } from "./SearchProgressIndicator";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";
import { useConversation, ChatMessage } from "@/hooks/useConversation";
import { getRandomSuggestions } from "@/data/suggestionsPool";
import { useWebhookSearch, WebhookFilters, WebhookPropertyResult, AgentRecommendation } from "@/hooks/useWebhookSearch";
import { cn } from "@/lib/utils";
import { streamChat, type ChatMessage as AgentChatMessage } from "@/services/agentClient";
import {
  IntakeForm,
  defaultIntakeValue,
  type IntakeFormValue,
  type IntakePayload,
} from "./IntakeForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SlidersHorizontal } from "lucide-react";

interface ExtractedCriteria {
  locations: string[];
  priceMin: number | null;
  priceMax: number | null;
  sizeMin: number | null;
  sizeMax: number | null;
  bedrooms: number[];
  bathrooms: number[];
  propertyTypes: string[];
  floorLevels: string[];
  buildingAge: string[];
  orientations: string[];
  developers: string[];
  features: string[];
  specialRequirements: string;
}

// Agent backend timeout (used as a soft cap for streaming requests)
const AGENT_TIMEOUT_MS = 120000;

const PRICE_DEFAULTS = {
  rent: [2000, 100000] as [number, number],
  buy: [1000000, 90000000] as [number, number],
};

const getDefaultFilters = (mode: 'rent' | 'buy'): FilterState => ({
  propertyTypes: [],
  priceRange: PRICE_DEFAULTS[mode],
  locations: [],
  districts: [],
  bedrooms: [],
  bathrooms: [],
  sizeRange: [0, 5000],
  floorLevels: [],
  buildingAge: [],
  orientations: [],
  developers: [],
  facilities: [],
  views: [],
  characteristics: [],
});

const DEFAULT_FILTERS: FilterState = getDefaultFilters('rent');

function countActiveFilters(filters: FilterState, mode: 'rent' | 'buy'): number {
  const defaults = PRICE_DEFAULTS[mode];
  let count = 0;
  if (filters.propertyTypes.length > 0) count++;
  if (filters.priceRange[0] !== defaults[0] || filters.priceRange[1] !== defaults[1]) count++;
  if (filters.locations.length > 0) count++;
  if (filters.bedrooms.length > 0) count++;
  if (filters.bathrooms.length > 0) count++;
  if (filters.sizeRange[0] !== 0 || filters.sizeRange[1] !== 5000) count++;
  if (filters.floorLevels.length > 0) count++;
  if (filters.buildingAge.length > 0) count++;
  if (filters.orientations.length > 0) count++;
  if (filters.developers.length > 0) count++;
  return count;
}

const PROPERTY_SOURCES = [
  "28Hse", "House730", "Squarefoot", "Spacious", "OneDay", 
  "Midland", "Centaline", "Property.hk", "Okay.com"
];

// Export helpers
function exportToCSV(results: PropertyResult[], mode: 'rent' | 'buy') {
  const headers = ['#', 'Building Name', 'Location', mode === 'rent' ? 'Monthly Rent' : 'Price', 'Bedrooms', 'Bathrooms', 'Size (sqft)', 'Floor Level', 'Features'];
  const rows = results.map((r, i) => [
    i + 1,
    r.name,
    r.location,
    r.price,
    r.bedrooms,
    r.bathrooms || '-',
    r.size,
    r.floorLevel || '-',
    r.features?.join('; ') || '-'
  ]);
  
  const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `keynez-${mode}-properties-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
}

interface PropertySearchChatProps {
  externalFilters?: FilterState;
  onFiltersChange?: (filters: FilterState) => void;
  externalSearchMode?: "rent" | "buy";
  onSearchModeChange?: (mode: "rent" | "buy") => void;
}

export function PropertySearchChat({
  externalFilters,
  onFiltersChange,
  externalSearchMode,
  onSearchModeChange,
}: PropertySearchChatProps = {}) {
  const { t, language } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [thinkingMessage, setThinkingMessage] = useState("");
  
  // CRITICAL: Rent vs Buy mode - prevents comingling results
  const [searchMode, setSearchModeInternal] = useState<"rent" | "buy">(externalSearchMode || "rent");
  
  // Sync searchMode with external
  const setSearchMode = useCallback((mode: "rent" | "buy") => {
    setSearchModeInternal(mode);
    onSearchModeChange?.(mode);
  }, [onSearchModeChange]);
  
  useEffect(() => {
    if (externalSearchMode && externalSearchMode !== searchMode) {
      setSearchModeInternal(externalSearchMode);
    }
  }, [externalSearchMode]);
  
  // Combined results (from both AI database and web search)
  const [results, setResults] = useState<(PropertyResult & {
    rank?: number;
    relevanceScore?: number;
    matchReason?: string;
    matchQuality?: 'perfect' | 'good' | 'partial';
  })[]>([]);
  
  // Web Search results for combining
  const [webResults, setWebResults] = useState<WebSearchResult[]>([]);
  
  // Search progress tracking
  const [searchSources, setSearchSources] = useState<SearchSource[]>(
    PROPERTY_SOURCES.map(name => ({ name, status: 'pending' as const }))
  );
  const [searchErrors, setSearchErrors] = useState<string[]>([]);
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [extractedCriteria, setExtractedCriteria] = useState<ExtractedCriteria | null>(null);
  const [searchSummary, setSearchSummary] = useState("");
  const [filterSummary, setFilterSummary] = useState("");
  const [highlightTerms, setHighlightTerms] = useState<string[]>([]);
  const [filtersInternal, setFiltersInternal] = useState<FilterState>(externalFilters || DEFAULT_FILTERS);
  
  // Sync with external filters
  const filters = externalFilters || filtersInternal;
  const setFilters = useCallback((f: FilterState) => {
    setFiltersInternal(f);
    onFiltersChange?.(f);
  }, [onFiltersChange]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  
  // Webhook-specific state
  const [agentRecommendations, setAgentRecommendations] = useState<AgentRecommendation[]>([]);
  const [webhookInsights, setWebhookInsights] = useState<string[]>([]);
  
  // Results data per message (for embedding in chat bubbles)
  const [messageResults, setMessageResults] = useState<Record<string, WebhookResultData>>({});
  
  // Rotating suggestions
  const [promptSuggestions, setPromptSuggestions] = useState<string[]>(() => 
    getRandomSuggestions('rent', 4)
  );
  
  // Property detail modal
  const [selectedProperty, setSelectedProperty] = useState<PropertyResult | WebSearchResult | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // Conversation state
  const conversation = useConversation(DEFAULT_FILTERS);
  const [showConversation, setShowConversation] = useState(false);
  
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastFiltersRef = useRef<FilterState>(DEFAULT_FILTERS);
  const lastSearchModeRef = useRef<"rent" | "buy">("rent");
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [streamingContent, setStreamingContent] = useState<string>("");
  const [agentMessages, setAgentMessages] = useState<AgentChatMessage[]>([]);
  const [toolStatus, setToolStatus] = useState<ToolStatus>({ current: "", completed: [] });
  const [messageRecommendations, setMessageRecommendations] = useState<Record<string, RecommendationsPayload>>({});
  const lastUserQueryRef = useRef<string>("");

  // Intake form state (rendered as the entry point before the first message).
  const [intakeValue, setIntakeValue] = useState<IntakeFormValue>(() =>
    defaultIntakeValue(externalSearchMode === "buy" ? "sale" : "rent"),
  );
  const [intakeSubmitted, setIntakeSubmitted] = useState(false);
  const [intakeDialogOpen, setIntakeDialogOpen] = useState(false);
  
  const activeFilterCount = countActiveFilters(filters, searchMode);

  // Rotate suggestions when mode changes & reset price range
  useEffect(() => {
    setPromptSuggestions(getRandomSuggestions(searchMode, 4));
    setFilters({ ...filters, priceRange: PRICE_DEFAULTS[searchMode] });
  }, [searchMode]);

  const refreshSuggestions = useCallback(() => {
    setPromptSuggestions(getRandomSuggestions(searchMode, 4));
  }, [searchMode]);

  // Traditional-Chinese status labels driven by tool_start events.
  const TOOL_LABELS: Record<string, string> = {
    query_listings: "正在搜尋盤源指數…",
    district_stats: "正在分析區內市場行情…",
    get_listing_detail: "正在核對盤源詳情…",
  };
  const DEFAULT_STATUS = "分析中…";

  // Streaming agent search via VITE_AGENT_URL (services/agentClient)
  const executeSearch = useCallback(async (
    query: string,
    currentFilters: FilterState,
    page: number = 1,
    isFollowUp: boolean = false
  ) => {
    // Cancel any in-flight stream
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsSearching(true);
    setSelectedIds([]);
    setSearchErrors([]);
    setStreamingContent("");
    setToolStatus({ current: DEFAULT_STATUS, completed: [], error: null });
    setSearchSources(PROPERTY_SOURCES.map(name => ({ name, status: 'pending' as const })));

    // Add user message to conversation
    if (query && !isFollowUp) {
      conversation.addUserMessage(query, false);
    } else if (query && isFollowUp) {
      conversation.addUserMessage(query, true);
    }
    lastUserQueryRef.current = query;

    setShowConversation(true);
    setThinkingMessage(DEFAULT_STATUS);

    // Conversation history contract: append the raw assistant_content from the
    // previous `done` event and send the whole array back with the new user turn.
    const userTurn: AgentChatMessage = { role: "user", content: query };
    const outboundMessages: AgentChatMessage[] = [...agentMessages, userTurn];
    setAgentMessages(outboundMessages);

    let acc = "";
    let sawTool = false;
    let pendingRecommendations: RecommendationsPayload | null = null;
    let timedOut = false;

    const timeoutId = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, AGENT_TIMEOUT_MS);

    await streamChat(outboundMessages, {
      signal: controller.signal,
      onToolStart: ({ name }) => {
        sawTool = true;
        const label = TOOL_LABELS[name] ?? `正在執行 ${name}…`;
        setToolStatus(s => ({ ...s, current: label }));
        setThinkingMessage(label);
      },
      onToolEnd: ({ summary }) => {
        if (summary) {
          setToolStatus(s => ({ ...s, completed: [...s.completed, `✓ ${summary}`] }));
        }
      },
      onToken: ({ text }) => {
        if (!sawTool && !acc) {
          setToolStatus(s => ({ ...s, current: "正在整理回覆…" }));
        }
        acc += text;
        setStreamingContent(acc);
      },
      onRecommendations: (payload) => {
        pendingRecommendations = payload;
      },
      onError: ({ message }) => {
        window.clearTimeout(timeoutId);
        const shown = timedOut
          ? "⚠️ 代理回應逾時，請再試一次。"
          : `⚠️ ${message}`;
        setSearchErrors([message]);
        setToolStatus({ current: "", completed: [], error: message });
        conversation.addAssistantMessage(shown);
        setStreamingContent("");
        setIsSearching(false);
        setHasSearched(true);
        setThinkingMessage("");
        // Roll back the optimistic assistant history entry; retry resends the user turn.
        setAgentMessages(prev => prev);
      },
      onDone: ({ assistant_content }) => {
        window.clearTimeout(timeoutId);
        // Contract: append RAW assistant_content string, unmodified, to history.
        const raw = assistant_content ?? "";
        const displayed = raw.trim() || acc.trim() || "(沒有內容)";
        const msg = conversation.addAssistantMessage(displayed);
        if (pendingRecommendations) {
          const rec = pendingRecommendations;
          setMessageRecommendations(prev => ({ ...prev, [msg.id]: rec }));
        }
        setAgentMessages(prev => [...prev, { role: "assistant", content: raw }]);
        setStreamingContent("");
        setToolStatus({ current: "", completed: [] });
        setIsSearching(false);
        setHasSearched(true);
        setThinkingMessage("");
      },
    });
  }, [conversation, searchMode, language, agentMessages]);

  // Auto-trigger search when filters or search mode change (debounced)
  useEffect(() => {
    const filtersChanged = JSON.stringify(filters) !== JSON.stringify(lastFiltersRef.current);
    const modeChanged = searchMode !== lastSearchModeRef.current;
    
    if ((filtersChanged || modeChanged) && hasSearched) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      // If mode changed, clear previous results first
      if (modeChanged) {
        setResults([]);
        setWebResults([]);
        setHasSearched(false);
      }
      
      searchTimeoutRef.current = setTimeout(() => {
        executeSearch(searchQuery, filters, 1, true);
      }, 300);
      
      lastFiltersRef.current = filters;
      lastSearchModeRef.current = searchMode;
    }
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [filters, searchMode, hasSearched, searchQuery, executeSearch]);

  // Inject a transient streaming-assistant message into the rendered list.
  const renderedMessages = useMemo<ChatMessage[]>(() => {
    if (!streamingContent) return conversation.messages;
    return [
      ...conversation.messages,
      {
        id: "__streaming__",
        role: "assistant",
        content: streamingContent,
        timestamp: new Date(),
      },
    ];
  }, [conversation.messages, streamingContent]);

  const handleSearch = async () => {
    if (isSearching || !searchQuery.trim()) return;
    lastFiltersRef.current = filters;
    const q = searchQuery;
    setSearchQuery("");
    await executeSearch(q, filters, 1, conversation.hasHistory);
  };

  const handleRetry = useCallback(() => {
    const q = lastUserQueryRef.current;
    if (!q || isSearching) return;
    executeSearch(q, filters, 1, conversation.hasHistory);
  }, [executeSearch, filters, conversation.hasHistory, isSearching]);

  /**
   * Compose the intake message: a fenced ```intake JSON block plus optional prose.
   * The backend understands this and returns results immediately.
   */
  const handleIntakeSubmit = useCallback(
    (payload: IntakePayload, notes: string) => {
      // Sync the rent/buy toggle with the intake choice.
      const mode = payload.hard_criteria.transaction_type === "sale" ? "buy" : "rent";
      if (mode !== searchMode) setSearchMode(mode);

      const isUpdate = intakeSubmitted;
      const json = JSON.stringify(payload, null, 2);
      const proseLines: string[] = [];
      if (isUpdate) proseLines.push("已更新篩選條件。");
      if (notes) proseLines.push(notes);
      const message = "```intake\n" + json + "\n```" + (proseLines.length ? "\n\n" + proseLines.join("\n\n") : "");

      setIntakeSubmitted(true);
      setIntakeDialogOpen(false);
      executeSearch(message, filters, 1, conversation.hasHistory);
    },
    [executeSearch, filters, conversation.hasHistory, searchMode, setSearchMode, intakeSubmitted],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isSearching) {
      handleSearch();
    }
  };

  const handleClearAllFilters = () => {
    const defaults = getDefaultFilters(searchMode);
    setFilters(defaults);
    if (hasSearched) {
      executeSearch(searchQuery, defaults, 1, true);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !isSearching) {
      executeSearch(searchQuery, filters, currentPage + 1, true);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    inputRef.current?.focus();
  };

  const handleRowClick = (property: PropertyResult | WebSearchResult) => {
    setSelectedProperty(property);
    setIsDetailModalOpen(true);
  };

  const handleAddToCanvas = (property: PropertyResult | WebSearchResult) => {
    toast.success("Added to Research Canvas");
  };

  const handleAddMultipleToCanvas = (ids: string[]) => {
    toast.success(`Added ${ids.length} properties to Research Canvas`);
  };

  const handleExportCSV = () => {
    exportToCSV(results, searchMode);
    toast.success("Exported to CSV");
  };

  const handleExportPDF = () => {
    window.print();
    toast.success("Opening print dialog for PDF export");
  };

  // Combine AI and web sources for display
  const allSourcesSearched = useMemo(() => {
    const sources = new Set<string>();
    sources.add("Keynez AI Database");
    searchSources.filter(s => s.status === 'done').forEach(s => sources.add(s.name));
    return Array.from(sources);
  }, [searchSources]);

  return (
    <>
      <Card className="border-0 bg-card/80 shadow-xl backdrop-blur-sm print:shadow-none print:border">
        <CardContent className="p-0 flex flex-col" style={{ minHeight: '600px' }}>
          {/* Header: Rent/Buy Toggle + Filters */}
          <div className="p-4 lg:p-6 pb-0 flex-shrink-0">
            {/* CRITICAL: Rent vs Buy Toggle */}
            <div className="mb-4 flex items-center justify-center">
              <div className="inline-flex items-center p-1 rounded-full bg-muted border-2 border-muted">
                <Button
                  variant={searchMode === "rent" ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "rounded-full px-6 gap-2 transition-all",
                    searchMode === "rent" && "bg-accent text-accent-foreground shadow-md"
                  )}
                  onClick={() => setSearchMode("rent")}
                >
                  <Key className="h-4 w-4" />
                  {t('chat.toggle.rent')}
                </Button>
                <Button
                  variant={searchMode === "buy" ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "rounded-full px-6 gap-2 transition-all",
                    searchMode === "buy" && "bg-primary text-primary-foreground shadow-md"
                  )}
                  onClick={() => setSearchMode("buy")}
                >
                  <Home className="h-4 w-4" />
                  {t('chat.toggle.buy')}
                </Button>
              </div>
            </div>

            {/* Filter Section */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">{t('filter.filters')}</span>
                  {activeFilterCount > 0 && (
                    <Badge className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs font-semibold">
                      {activeFilterCount} {t('filter.filtersActive')}
                    </Badge>
                  )}
                </div>
                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
                    onClick={handleClearAllFilters}
                  >
                    <X className="h-3 w-3" />
                    {t('filter.clearAll')}
                  </Button>
                )}
              </div>
              <FilterToggleBar filters={filters} onFiltersChange={setFilters} searchMode={searchMode} />
            </div>
          </div>

          {/* Intake form: entry point before the first message */}
          {!intakeSubmitted && !conversation.hasHistory && (
            <div className="px-4 lg:px-6 pb-4">
              <div className="rounded-xl border border-border bg-background/60 p-4 lg:p-5">
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-foreground">告訴我您想找什麼</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    填寫以下條件後開始搜尋，或稍後隨時修改。
                  </p>
                </div>
                <IntakeForm
                  value={intakeValue}
                  onChange={setIntakeValue}
                  onSubmit={handleIntakeSubmit}
                  disabled={isSearching}
                />
              </div>
            </div>
          )}

          {/* Modify-criteria button after first submit */}
          {intakeSubmitted && (
            <div className="px-4 lg:px-6 pb-2 flex-shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={() => setIntakeDialogOpen(true)}
                disabled={isSearching}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                修改搜尋條件
              </Button>
            </div>
          )}

          {/* Chat Messages Area - Scrollable */}
          <ChatMessageList
            messages={renderedMessages}
            suggestions={suggestions}
            onSuggestionClick={handleSuggestionClick}
            isLoading={isSearching}
            loadingMessage={thinkingMessage}
            messageResults={messageResults}
            messageRecommendations={messageRecommendations}
            toolStatus={toolStatus}
            streamingContent={streamingContent}
            onRetry={handleRetry}
            onRowClick={handleRowClick}
            onExportCSV={handleExportCSV}
            onExportPDF={handleExportPDF}
            onAddToCanvas={() => handleAddMultipleToCanvas(selectedIds)}
            onSearchAgain={() => {
              setSearchQuery("");
              setHasSearched(false);
              conversation.clearConversation();
              setMessageResults({});
              setMessageRecommendations({});
              setAgentMessages([]);
              setIntakeSubmitted(false);
            }}
          />


          {/* Search Input - Pinned at bottom */}
          <div className="p-4 lg:p-6 pt-3 border-t flex-shrink-0">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Sparkles className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-accent" />
                <Input
                  ref={inputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    conversation.hasHistory
                      ? 'Ask a follow-up: "show more", "3 bedrooms instead", "tell me about #3"...'
                      : t('search.placeholder')
                  }
                  className="h-12 pl-10 pr-4 text-base placeholder:text-muted-foreground/60 placeholder:font-normal"
                  disabled={isSearching}
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                className={cn(
                  "h-12 gap-2 px-6",
                  searchQuery.trim() 
                    ? "bg-accent text-accent-foreground hover:bg-accent/90" 
                    : "bg-muted text-muted-foreground"
                )}
              >
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                {t('search.button')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Detail Modal */}
      <PropertyDetailModal
        property={selectedProperty}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedProperty(null);
        }}
        onAddToCanvas={handleAddToCanvas}
        type={selectedProperty && 'buildingName' in selectedProperty ? 'web' : 'ai'}
      />

      {/* Modify-criteria dialog: reopens the intake form prefilled */}
      <Dialog open={intakeDialogOpen} onOpenChange={setIntakeDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>修改搜尋條件</DialogTitle>
          </DialogHeader>
          <IntakeForm
            value={intakeValue}
            onChange={setIntakeValue}
            onSubmit={handleIntakeSubmit}
            onCancel={() => setIntakeDialogOpen(false)}
            submitLabel="更新搜尋"
            disabled={isSearching}
            compact
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
