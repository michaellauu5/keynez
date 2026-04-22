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
import { ChatMessageList, WebhookResultData } from "./ChatMessageList";
import { SearchSource } from "./SearchProgressIndicator";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";
import { useConversation, ChatMessage } from "@/hooks/useConversation";
import { getRandomSuggestions } from "@/data/suggestionsPool";
import { useWebhookSearch, WebhookFilters, WebhookPropertyResult, AgentRecommendation } from "@/hooks/useWebhookSearch";
import { cn } from "@/lib/utils";

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

// N8N Webhook configuration
const N8N_WEBHOOK_URL = 'https://properly.app.n8n.cloud/webhook-test/keynez_agent_input';
const WEBHOOK_TIMEOUT_MS = 60000;

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
  
  const activeFilterCount = countActiveFilters(filters, searchMode);

  // Rotate suggestions when mode changes & reset price range
  useEffect(() => {
    setPromptSuggestions(getRandomSuggestions(searchMode, 4));
    setFilters({ ...filters, priceRange: PRICE_DEFAULTS[searchMode] });
  }, [searchMode]);

  const refreshSuggestions = useCallback(() => {
    setPromptSuggestions(getRandomSuggestions(searchMode, 4));
  }, [searchMode]);

  // Loading messages for webhook search
  const LOADING_MESSAGES = [
    "🔍 Searching 28hse.com for listings...",
    "🔍 Checking Squarefoot database...",
    "🔍 Scanning Spacious listings...",
    "🔍 Searching Midland Realty...",
    "🔍 Checking Centaline properties...",
    "🔍 Gathering results from OneDay...",
    "📊 Analyzing and ranking properties...",
    "✨ Preparing your personalized results...",
  ];

  // Webhook-based unified search using n8n
  const executeSearch = useCallback(async (
    query: string, 
    currentFilters: FilterState,
    page: number = 1,
    isFollowUp: boolean = false
  ) => {
    setIsSearching(true);
    setSelectedIds([]);
    setSearchErrors([]);
    
    // Reset source statuses
    setSearchSources(PROPERTY_SOURCES.map(name => ({ name, status: 'pending' as const })));

    // Add user message to conversation
    if (query && !isFollowUp) {
      conversation.addUserMessage(query, false);
    } else if (query && isFollowUp) {
      conversation.addUserMessage(query, true);
    }

    let messageIndex = 0;
    setThinkingMessage(LOADING_MESSAGES[0]);
    const thinkingInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % LOADING_MESSAGES.length;
      setThinkingMessage(LOADING_MESSAGES[messageIndex]);
    }, 2500); // Rotate every 2.5 seconds

    // Animate source progress
    const sourceInterval = setInterval(() => {
      setSearchSources(prev => {
        const searching = prev.filter(s => s.status === 'searching').length;
        const pending = prev.filter(s => s.status === 'pending');
        
        // Mark next 2 as searching
        if (searching < 3 && pending.length > 0) {
          const updated = [...prev];
          const toStart = pending.slice(0, Math.min(2, pending.length));
          toStart.forEach(s => {
            const idx = updated.findIndex(u => u.name === s.name);
            if (idx !== -1) {
              updated[idx] = { ...updated[idx], status: 'searching' };
            }
          });
          return updated;
        }
        return prev;
      });
    }, 600);

    // Build webhook payload
    const conversationHistory = conversation.getConversationContext();
    const webhookPayload = {
      user_message: query,
      filters: {
        property_type: currentFilters.propertyTypes,
        transaction_type: searchMode === 'rent' ? 'Rent' : 'Buy',
        location: currentFilters.locations,
        price_range: {
          min: currentFilters.priceRange[0] > PRICE_DEFAULTS[searchMode][0] ? currentFilters.priceRange[0] : null,
          max: currentFilters.priceRange[1] < PRICE_DEFAULTS[searchMode][1] ? currentFilters.priceRange[1] : null,
          currency: 'HKD' as const,
        },
        bedrooms: currentFilters.bedrooms.length > 0 
          ? (currentFilters.bedrooms[0] === "Studio" ? 0 : parseInt(currentFilters.bedrooms[0])) 
          : null,
        bathrooms: currentFilters.bathrooms.length > 0 
          ? parseInt(currentFilters.bathrooms[0]) 
          : null,
        size_sqft: {
          min: currentFilters.sizeRange[0] > 0 ? currentFilters.sizeRange[0] : null,
          max: currentFilters.sizeRange[1] < 5000 ? currentFilters.sizeRange[1] : null,
        },
        floor_level: currentFilters.floorLevels,
        building_age: currentFilters.buildingAge,
        orientation: currentFilters.orientations,
        developer: currentFilters.developers,
        special_features: [] as string[],
        furnished: null,
        pet_friendly: null,
        parking: null,
      },
      language: language,
      conversation_id: sessionStorage.getItem('keynez_conversation_id') || crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      is_followup: isFollowUp,
      previous_results_count: results.length,
      conversation_history: conversationHistory.map(msg => ({
        role: msg.role,
        message: msg.content,
      })),
    };

    // Store conversation ID
    if (!sessionStorage.getItem('keynez_conversation_id')) {
      sessionStorage.setItem('keynez_conversation_id', webhookPayload.conversation_id);
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);

    try {
      console.log('📤 Payload:', webhookPayload);
      
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(webhookPayload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('📥 Status:', response.status);

      // Mark all sources as done
      setSearchSources(prev => prev.map(s => ({ ...s, status: 'done' as const })));

      if (!response.ok) {
        throw new Error(`Search failed with status ${response.status}`);
      }

      const responseText = await response.text();
      if (!responseText || responseText.trim() === '') {
        console.warn('Webhook returned empty response body');
        conversation.addAssistantMessage("⚠️ Search completed but no data was returned. Please try again.");
        setShowConversation(true);
        return;
      }
      
      let data: any;
      try {
        data = JSON.parse(responseText);
      } catch (parseErr) {
        console.error('Failed to parse webhook response:', responseText.substring(0, 200));
        throw new Error('Invalid response from search service');
      }
      
      console.log('📥 Data:', data);
      console.log('📥 Response keys:', Object.keys(data));

      // Validate response structure
      const hasExpectedFormat = data.results !== undefined || data.success !== undefined;

      if (!hasExpectedFormat) {
        console.warn('Unexpected n8n response format. Expected {success, results, insights, ...} but got:', Object.keys(data));
        conversation.addAssistantMessage(
          "The search service returned an unexpected response format. Please check your n8n workflow configuration to ensure it returns the expected JSON structure with `success`, `results`, and `insights` fields.\n\nReceived keys: " + Object.keys(data).join(', ')
        );
        setShowConversation(true);
        clearInterval(thinkingInterval);
        clearInterval(sourceInterval);
        setIsSearching(false);
        setThinkingMessage("");
        return;
      }

      if (!data.success && data.error) {
        throw new Error(data.error);
      }

      // Map webhook response to existing result format
      const webhookResults: (PropertyResult & {
        rank?: number;
        relevanceScore?: number;
        matchReason?: string;
        matchQuality?: 'perfect' | 'good' | 'partial';
      })[] = (data.results || []).map((r: any, index: number) => ({
        id: r.reference || `webhook-${index}`,
        name: r.building_name,
        location: r.location || r.district || r.area || '',
        price: searchMode === 'rent' ? (r.monthly_rent || r.rent || r.price || 0) : (r.sale_price || r.price || 0),
        size: r.size_sqft || 0,
        bedrooms: r.bedrooms || '-',
        bathrooms: r.bathrooms || '-',
        features: r.special_features || [],
        floorLevel: r.floor_level || '-',
        propertyType: 'Apartment',
        buildingAge: '-',
        orientation: '-',
        developer: '-',
        agentName: r.agent_name,
        agentContact: r.agent_contact,
        refNumber: r.reference,
        sourceUrl: r.source_url,
        sourceName: r.source_name || 'n8n',
        rank: index + 1,
        relevanceScore: r.match_score || 50,
        matchReason: r.match_reason || '',
        matchQuality: ((r.match_score || 50) >= 80 ? 'perfect' : 
                      (r.match_score || 50) >= 60 ? 'good' : 'partial') as 'perfect' | 'good' | 'partial',
      }));

      // Store agent recommendations if provided
      if (data.agent_recommendations) {
        // Store in state for PerplexityResults to display
        setAgentRecommendations(data.agent_recommendations);
      }

      // Store insights if provided
      if (data.insights) {
        setWebhookInsights(data.insights);
      }

      // Extract criteria from results for highlighting
      const extractedCriteria: ExtractedCriteria = {
        locations: currentFilters.locations,
        priceMin: currentFilters.priceRange[0] > 0 ? currentFilters.priceRange[0] : null,
        priceMax: currentFilters.priceRange[1] < 200000000 ? currentFilters.priceRange[1] : null,
        sizeMin: currentFilters.sizeRange[0] > 0 ? currentFilters.sizeRange[0] : null,
        sizeMax: currentFilters.sizeRange[1] < 5000 ? currentFilters.sizeRange[1] : null,
        bedrooms: currentFilters.bedrooms.map(b => b === 'Studio' ? 0 : parseInt(b)),
        bathrooms: currentFilters.bathrooms.map(b => parseInt(b)),
        propertyTypes: currentFilters.propertyTypes,
        floorLevels: currentFilters.floorLevels,
        buildingAge: currentFilters.buildingAge,
        orientations: currentFilters.orientations,
        developers: currentFilters.developers,
        features: [],
        specialRequirements: query,
      };
      setExtractedCriteria(extractedCriteria);

      // Build highlight terms
      const terms: string[] = [...currentFilters.locations];
      setHighlightTerms(terms);

      // Set results
      if (page > 1) {
        setResults(prev => [...prev, ...webhookResults]);
      } else {
        setResults(webhookResults);
      }
      
      setTotalCount(data.results_count || webhookResults.length);
      setCurrentPage(page);
      setHasMore(false); // Webhook returns all results at once

      // Add AI response to conversation and attach results to it
      const resultCount = data.results_count || webhookResults.length;
      if (resultCount > 0) {
        const summaryText = data.summary 
          || `I found **${resultCount} properties** matching your criteria. Here are the top results:`;
        const assistantMsg = conversation.addAssistantMessage(
          summaryText,
          resultCount
        );
        
        // Attach results to this message
        setMessageResults(prev => ({
          ...prev,
          [assistantMsg.id]: {
            mode: searchMode,
            results: webhookResults,
            insights: data.insights || [],
            agentRecommendations: data.agent_recommendations || [],
            highlightTerms: terms,
          }
        }));
        
        setShowConversation(true);
        toast.success(`${t('search.found')} ${resultCount} ${t('search.matchingProperties')}`);
      } else {
        conversation.addAssistantMessage(
          "No properties found matching your criteria. Try adjusting your filters or expanding your search area."
        );
        setShowConversation(true);
      }
      
    } catch (error) {
      clearTimeout(timeoutId);
      console.log('❌ Error:', error);

      // Mark sources as error
      setSearchSources(prev => prev.map(s => ({ ...s, status: 'error' as const })));

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          setSearchErrors(["Search is taking longer than expected. Please try again or refine your filters."]);
          conversation.addAssistantMessage("⚠️ Search timed out. Please try again or refine your filters.");
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          setSearchErrors(["Unable to connect to search service. Please check your connection and try again."]);
          conversation.addAssistantMessage("⚠️ Cannot connect to search service. Please check your connection.");
        } else {
          setSearchErrors([error.message]);
          conversation.addAssistantMessage(`⚠️ Search failed: ${error.message}. Please try again.`);
        }
      } else {
        setSearchErrors(["An unexpected error occurred."]);
        conversation.addAssistantMessage("⚠️ An unexpected error occurred. Please try again.");
      }
      setShowConversation(true);
    } finally {
      clearInterval(thinkingInterval);
      clearInterval(sourceInterval);
      setIsSearching(false);
      setHasSearched(true);
    }
  }, [t, conversation, searchMode, language, results.length]);

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

  const handleSearch = async () => {
    if (isSearching || !searchQuery.trim()) return;
    lastFiltersRef.current = filters;
    await executeSearch(searchQuery, filters, 1, conversation.hasHistory);
  };

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
                  For Rent
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
                  For Sale
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

          {/* Chat Messages Area - Scrollable */}
          <ChatMessageList
            messages={conversation.messages}
            suggestions={suggestions}
            onSuggestionClick={handleSuggestionClick}
            isLoading={isSearching}
            searchSources={searchSources}
            loadingMessage={thinkingMessage}
            messageResults={messageResults}
            onRowClick={handleRowClick}
            onExportCSV={handleExportCSV}
            onExportPDF={handleExportPDF}
            onAddToCanvas={() => handleAddMultipleToCanvas(selectedIds)}
            onSearchAgain={() => {
              setSearchQuery("");
              setHasSearched(false);
              conversation.clearConversation();
              setMessageResults({});
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
    </>
  );
}
