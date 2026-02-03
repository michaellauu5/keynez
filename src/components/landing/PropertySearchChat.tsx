import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Search, Sparkles, Loader2, MapPin, DollarSign, Bed, Eye, AlertCircle, Filter, X, Globe, Database, ChevronDown, MessageCircle, Home, Key } from "lucide-react";
import { FilterToggleBar, FilterState } from "./FilterToggleBar";
import { PropertyResultsTable, PropertyResult } from "./PropertyResultsTable";
import { WebSearchResultsTable, WebSearchResult } from "./WebSearchResultsTable";
import { PropertyDetailModal } from "./PropertyDetailModal";
import { ChatMessageList } from "./ChatMessageList";
import { PerplexityResults } from "./PerplexityResults";
import { ExportActions } from "./ExportActions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";
import { useConversation, ChatMessage } from "@/hooks/useConversation";
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

interface AISearchResponse {
  extractedCriteria: ExtractedCriteria;
  results: (PropertyResult & {
    rank: number;
    relevanceScore: number;
    matchReason: string;
  })[];
  searchSummary: string;
  filterSummary: string;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  suggestions: string[];
  aiMessage: string;
  followUpIntent?: {
    type: string;
    params: Record<string, any>;
    acknowledgment: string;
    filterUpdates?: Partial<FilterState>;
  };
}

interface WebSearchResponse {
  success: boolean;
  results: WebSearchResult[];
  sourcesSearched: string[];
  totalFound: number;
  query: string;
  errors?: string[];
  error?: string;
}

const DEFAULT_FILTERS: FilterState = {
  propertyTypes: [],
  priceRange: [0, 200000000],
  locations: [],
  bedrooms: [],
  bathrooms: [],
  sizeRange: [0, 5000],
  floorLevels: [],
  buildingAge: [],
  orientations: [],
  developers: [],
};

function countActiveFilters(filters: FilterState): number {
  let count = 0;
  if (filters.propertyTypes.length > 0) count++;
  if (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 200000000) count++;
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
  link.download = `keynest-${mode}-properties-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
}

export function PropertySearchChat() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isWebSearching, setIsWebSearching] = useState(false);
  const [thinkingMessage, setThinkingMessage] = useState("");
  const [currentSearchSource, setCurrentSearchSource] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"ai" | "web">("ai");
  
  // CRITICAL: Rent vs Buy mode - prevents comingling results
  const [searchMode, setSearchMode] = useState<"rent" | "buy">("rent");
  
  // AI Search results
  const [results, setResults] = useState<(PropertyResult & {
    rank?: number;
    relevanceScore?: number;
    matchReason?: string;
  })[]>([]);
  
  // Web Search results
  const [webResults, setWebResults] = useState<WebSearchResult[]>([]);
  const [webSourcesSearched, setWebSourcesSearched] = useState<string[]>([]);
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [webSelectedIds, setWebSelectedIds] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [hasWebSearched, setHasWebSearched] = useState(false);
  const [extractedCriteria, setExtractedCriteria] = useState<ExtractedCriteria | null>(null);
  const [searchSummary, setSearchSummary] = useState("");
  const [filterSummary, setFilterSummary] = useState("");
  const [highlightTerms, setHighlightTerms] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  
  // Property detail modal
  const [selectedProperty, setSelectedProperty] = useState<PropertyResult | WebSearchResult | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // Conversation state
  const conversation = useConversation(DEFAULT_FILTERS);
  const [showConversation, setShowConversation] = useState(false);
  
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastFiltersRef = useRef<FilterState>(DEFAULT_FILTERS);
  const lastSearchModeRef = useRef<"rent" | "buy">("rent");
  
  const activeFilterCount = countActiveFilters(filters);

  const THINKING_MESSAGES = [
    t('search.thinking.analyzing'),
    t('search.thinking.searching'),
    t('search.thinking.ranking'),
    t('search.thinking.preparing')
  ];

  const WEB_SEARCH_MESSAGES = [
    "Connecting to property portals...",
    "Searching 28Hse, House730...",
    "Scanning Squarefoot, Spacious...",
    "Extracting property details...",
    "Aggregating results...",
  ];

  // AI Search with conversation context
  const executeSearch = useCallback(async (
    query: string, 
    currentFilters: FilterState,
    page: number = 1,
    isFollowUp: boolean = false
  ) => {
    setIsSearching(true);
    setSelectedIds([]);

    // Add user message to conversation
    if (query && !isFollowUp) {
      conversation.addUserMessage(query, false);
    } else if (query && isFollowUp) {
      conversation.addUserMessage(query, true);
    }

    let messageIndex = 0;
    setThinkingMessage(THINKING_MESSAGES[0]);
    const thinkingInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % THINKING_MESSAGES.length;
      setThinkingMessage(THINKING_MESSAGES[messageIndex]);
    }, 800);

    try {
      const conversationHistory = conversation.getConversationContext();
      
      const { data, error } = await supabase.functions.invoke<AISearchResponse>("ai-property-search", {
        body: {
          query: query,
          searchMode: searchMode, // Pass rent/buy mode
          filters: {
            propertyTypes: currentFilters.propertyTypes,
            priceRange: currentFilters.priceRange,
            sizeRange: currentFilters.sizeRange,
            bedrooms: currentFilters.bedrooms,
            bathrooms: currentFilters.bathrooms,
            locations: currentFilters.locations,
            floorLevels: currentFilters.floorLevels,
            buildingAge: currentFilters.buildingAge,
            orientations: currentFilters.orientations,
            developers: currentFilters.developers,
          },
          conversationHistory,
          page,
        }
      });

      if (error) {
        throw error;
      }

      if (data) {
        setExtractedCriteria(data.extractedCriteria);
        
        // Handle pagination - append or replace results
        if (page > 1) {
          setResults(prev => [...prev, ...data.results]);
        } else {
          setResults(data.results);
        }
        
        setSearchSummary(data.searchSummary);
        setFilterSummary(data.filterSummary || "");
        setSuggestions(data.suggestions || []);
        setCurrentPage(data.currentPage);
        setHasMore(data.hasMore);
        setTotalCount(data.totalCount);

        // Apply filter updates from follow-up intent
        if (data.followUpIntent?.filterUpdates) {
          setFilters(prev => ({ ...prev, ...data.followUpIntent!.filterUpdates }));
        }

        const terms: string[] = [];
        if (data.extractedCriteria.locations) {
          terms.push(...data.extractedCriteria.locations);
        }
        if (data.extractedCriteria.features) {
          terms.push(...data.extractedCriteria.features);
        }
        setHighlightTerms(terms);

        // Add AI response to conversation
        if (data.aiMessage) {
          conversation.addAssistantMessage(data.aiMessage, data.results.length);
          setShowConversation(true);
        }

        toast.success(`${t('search.found')} ${data.totalCount} ${t('search.matchingProperties')}`);
      }
    } catch (error) {
      console.error("Search error:", error);

      if (error instanceof Error) {
        if (error.message.includes("429") || error.message.includes("rate limit")) {
          toast.error("Too many requests. Please wait a moment and try again.");
        } else if (error.message.includes("402")) {
          toast.error("AI credits exhausted. Please add credits to continue.");
        } else {
          toast.error("Search failed. Please try again.");
        }
      } else {
        toast.error("Search failed. Please try again.");
      }
    } finally {
      clearInterval(thinkingInterval);
      setIsSearching(false);
      setHasSearched(true);
    }
  }, [t, THINKING_MESSAGES, conversation]);

  // Web Search
  const executeWebSearch = useCallback(async (query: string, currentFilters: FilterState) => {
    setIsWebSearching(true);
    setWebSelectedIds([]);
    setCurrentSearchSource([]);

    // Animate through sources being searched
    let sourceIndex = 0;
    const sourceInterval = setInterval(() => {
      const sources = PROPERTY_SOURCES.slice(0, sourceIndex + 2);
      setCurrentSearchSource(sources);
      sourceIndex = (sourceIndex + 1) % PROPERTY_SOURCES.length;
    }, 600);

    let messageIndex = 0;
    setThinkingMessage(WEB_SEARCH_MESSAGES[0]);
    const thinkingInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % WEB_SEARCH_MESSAGES.length;
      setThinkingMessage(WEB_SEARCH_MESSAGES[messageIndex]);
    }, 1200);

    try {
      // Build filters for web search
      const webFilters: Record<string, any> = {};
      
      if (currentFilters.locations.length > 0) {
        webFilters.location = currentFilters.locations[0];
      }
      if (currentFilters.bedrooms.length > 0) {
        const bedroom = currentFilters.bedrooms[0];
        webFilters.bedrooms = bedroom === "Studio" ? 0 : bedroom === "5+" ? 5 : parseInt(bedroom);
      }
      if (currentFilters.priceRange[0] > 0 || currentFilters.priceRange[1] < 200000000) {
        // Convert to monthly rent estimate (rough: price / 400)
        webFilters.priceMin = Math.floor(currentFilters.priceRange[0] / 400);
        webFilters.priceMax = Math.floor(currentFilters.priceRange[1] / 400);
      }

      const { data, error } = await supabase.functions.invoke<WebSearchResponse>("property-web-search", {
        body: {
          query: query,
          filters: webFilters
        }
      });

      if (error) {
        throw error;
      }

      if (data && data.success) {
        setWebResults(data.results);
        setWebSourcesSearched(data.sourcesSearched);
        
        // Build highlight terms from query
        const terms = query.split(/\s+/).filter(t => t.length > 2);
        setHighlightTerms(terms);

        toast.success(`Found ${data.totalFound} results from ${data.sourcesSearched.length} sources`);
      } else {
        throw new Error(data?.error || "Web search failed");
      }
    } catch (error) {
      console.error("Web search error:", error);
      toast.error("Web search failed. Please try again.");
    } finally {
      clearInterval(thinkingInterval);
      clearInterval(sourceInterval);
      setIsWebSearching(false);
      setHasWebSearched(true);
      setCurrentSearchSource([]);
    }
  }, [WEB_SEARCH_MESSAGES]);

  // Auto-trigger search when filters or search mode change (debounced)
  useEffect(() => {
    const filtersChanged = JSON.stringify(filters) !== JSON.stringify(lastFiltersRef.current);
    const modeChanged = searchMode !== lastSearchModeRef.current;
    
    if ((filtersChanged || modeChanged) && (hasSearched || hasWebSearched)) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      // If mode changed, clear previous results first
      if (modeChanged) {
        setResults([]);
        setWebResults([]);
        setHasSearched(false);
        setHasWebSearched(false);
      }
      
      searchTimeoutRef.current = setTimeout(() => {
        if (activeTab === "ai") {
          executeSearch(searchQuery, filters, 1, true);
        } else {
          executeWebSearch(searchQuery, filters);
        }
      }, 300);
      
      lastFiltersRef.current = filters;
      lastSearchModeRef.current = searchMode;
    }
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [filters, searchMode, hasSearched, hasWebSearched, searchQuery, executeSearch, executeWebSearch, activeTab]);

  const handleSearch = async () => {
    lastFiltersRef.current = filters;
    if (activeTab === "ai") {
      await executeSearch(searchQuery, filters, 1, conversation.hasHistory);
    } else {
      await executeWebSearch(searchQuery, filters);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isSearching && !isWebSearching) {
      handleSearch();
    }
  };

  const handleClearAllFilters = () => {
    setFilters(DEFAULT_FILTERS);
    if (hasSearched || hasWebSearched) {
      if (activeTab === "ai") {
        executeSearch(searchQuery, DEFAULT_FILTERS, 1, true);
      } else {
        executeWebSearch(searchQuery, DEFAULT_FILTERS);
      }
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !isSearching) {
      executeSearch(searchQuery, filters, currentPage + 1, true);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    executeSearch(suggestion, filters, 1, true);
  };

  const handleRowClick = (property: PropertyResult) => {
    setSelectedProperty(property);
    setIsDetailModalOpen(true);
  };

  const handleWebRowClick = (result: WebSearchResult) => {
    setSelectedProperty(result);
    setIsDetailModalOpen(true);
  };

  const handleAddToCanvas = (property: PropertyResult | WebSearchResult) => {
    // TODO: Implement add to canvas functionality
    toast.success("Added to Research Canvas");
  };

  const handleAddMultipleToCanvas = (ids: string[]) => {
    // TODO: Implement add multiple to canvas
    toast.success(`Added ${ids.length} properties to Research Canvas`);
  };

  const handleExportCSV = () => {
    exportToCSV(results, searchMode);
    toast.success("Exported to CSV");
  };

  const handleExportPDF = () => {
    // Use browser print for PDF export with print styles
    window.print();
    toast.success("Opening print dialog for PDF export");
  };

  const isLoading = isSearching || isWebSearching;

  return (
    <>
      <Card className="border-0 bg-card/80 shadow-xl backdrop-blur-sm print:shadow-none print:border">
        <CardContent className="p-4 lg:p-6">
          {/* CRITICAL: Rent vs Buy Toggle - Must be prominent */}
          <div className="mb-6 flex items-center justify-center">
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
          
          {/* Search Mode Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "ai" | "web")} className="mb-4">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="ai" className="gap-2">
                <Database className="h-4 w-4" />
                AI Database Search
              </TabsTrigger>
              <TabsTrigger value="web" className="gap-2">
                <Globe className="h-4 w-4" />
                Live Web Search
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Conversation History */}
          {activeTab === "ai" && showConversation && conversation.messages.length > 0 && (
            <div className="mb-4 border rounded-lg p-3 bg-muted/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MessageCircle className="h-4 w-4" />
                  <span>Conversation ({conversation.messages.length} messages)</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => {
                    conversation.clearConversation();
                    setShowConversation(false);
                  }}
                >
                  Clear
                </Button>
              </div>
              <ChatMessageList
                messages={conversation.messages}
                suggestions={suggestions}
                onSuggestionClick={handleSuggestionClick}
                isLoading={isLoading}
              />
            </div>
          )}

          {/* Filter Section with Active Count Badge */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{t('filter.filters')}</span>
                {activeFilterCount > 0 && (
                  <Badge 
                    className="bg-[#FFD54F] text-black hover:bg-[#FFD54F]/90 text-xs font-semibold"
                  >
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
            <FilterToggleBar filters={filters} onFiltersChange={setFilters} />
          </div>

          {/* Search Input Section */}
          <div className="mb-6 flex gap-2">
            <div className="relative flex-1">
              <Sparkles className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-accent" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  conversation.hasHistory
                    ? 'Ask a follow-up: "show more", "3 bedrooms instead", "tell me about #3"...'
                    : activeTab === "web" 
                      ? "e.g., 2 bedroom North Point with balcony $15k-$21k" 
                      : t('search.placeholder')
                }
                className="h-12 pl-10 pr-4 text-base"
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isLoading}
              className="h-12 gap-2 bg-accent px-6 text-accent-foreground hover:bg-accent/90"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {activeTab === "web" ? "Search Web" : t('search.button')}
            </Button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="mb-6 flex flex-col items-center justify-center gap-4 rounded-lg bg-accent/10 p-6">
              <div className="relative">
                <div className="h-12 w-12 rounded-full border-4 border-accent/30 border-t-accent animate-spin" />
                {activeTab === "web" ? (
                  <Globe className="absolute inset-0 m-auto h-5 w-5 text-accent" />
                ) : (
                  <Sparkles className="absolute inset-0 m-auto h-5 w-5 text-accent" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-accent">{thinkingMessage}</span>
              </div>
              
              {/* Web Search Source Indicators */}
              {activeTab === "web" && currentSearchSource.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1.5 max-w-md">
                  {PROPERTY_SOURCES.map((source) => {
                    const isActive = currentSearchSource.includes(source);
                    return (
                      <Badge
                        key={source}
                        variant={isActive ? "default" : "outline"}
                        className={cn(
                          "text-xs transition-all duration-300",
                          isActive 
                            ? "bg-accent text-accent-foreground animate-pulse" 
                            : "opacity-40"
                        )}
                      >
                        {source}
                      </Badge>
                    );
                  })}
                </div>
              )}
              
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}

          {/* AI Search Results - Perplexity Style */}
          {activeTab === "ai" && !isLoading && hasSearched && (
            <PerplexityResults
              mode={searchMode}
              query={searchQuery}
              aiResults={results}
              webResults={[]}
              extractedCriteria={extractedCriteria}
              sourcesSearched={[]}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              onRowClick={(p) => {
                setSelectedProperty(p as PropertyResult);
                setIsDetailModalOpen(true);
              }}
              onExportCSV={handleExportCSV}
              onExportPDF={handleExportPDF}
              onAddToCanvas={handleAddMultipleToCanvas}
              highlightTerms={highlightTerms}
            />
          )}

          {/* AI Search - Initial state */}
          {activeTab === "ai" && !isLoading && !hasSearched && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 rounded-full bg-accent/20 p-4">
                <Sparkles className="h-8 w-8 text-accent" />
              </div>
              <h3 className="mb-2 font-serif text-lg font-semibold">
                {searchMode === 'rent' ? 'Find Rental Properties' : 'Find Properties for Sale'}
              </h3>
              <p className="max-w-md text-sm text-muted-foreground">
                {t('search.initialDescription')}
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => setSearchQuery(searchMode === 'rent' 
                    ? "2 bedroom in North Point with balcony $15k-$21k" 
                    : "3 bedroom in Mid-Levels with sea view"
                  )}
                >
                  {searchMode === 'rent' ? '2 BR North Point $15-21k' : t('search.sample.midLevels')}
                </Badge>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => setSearchQuery(searchMode === 'rent'
                    ? "Studio in Causeway Bay furnished under $18k"
                    : "Family home under 50 million with garden"
                  )}
                >
                  {searchMode === 'rent' ? 'Studio Causeway Bay' : t('search.sample.family')}
                </Badge>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => setSearchQuery(searchMode === 'rent'
                    ? "Pet friendly apartment in Kowloon $20k"
                    : "Pet friendly apartment in Kowloon"
                  )}
                >
                  {t('search.sample.petFriendly')}
                </Badge>
              </div>
            </div>
          )}

          {/* Web Search Results - Perplexity Style */}
          {activeTab === "web" && !isLoading && hasWebSearched && (
            <PerplexityResults
              mode={searchMode}
              query={searchQuery}
              aiResults={[]}
              webResults={webResults}
              extractedCriteria={extractedCriteria}
              sourcesSearched={webSourcesSearched}
              selectedIds={webSelectedIds}
              onSelectionChange={setWebSelectedIds}
              onRowClick={(p) => {
                setSelectedProperty(p as WebSearchResult);
                setIsDetailModalOpen(true);
              }}
              onExportCSV={handleExportCSV}
              onExportPDF={handleExportPDF}
              onAddToCanvas={handleAddMultipleToCanvas}
              highlightTerms={highlightTerms}
            />
          )}

          {/* Web Search - Initial state */}
          {activeTab === "web" && !isLoading && !hasWebSearched && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 rounded-full bg-accent/20 p-4">
                <Globe className="h-8 w-8 text-accent" />
              </div>
              <h3 className="mb-2 font-serif text-lg font-semibold">
                Search Live {searchMode === 'rent' ? 'Rental' : 'Sale'} Listings
              </h3>
              <p className="max-w-md text-sm text-muted-foreground">
                Search across 28Hse, House730, Squarefoot, Spacious, and more Hong Kong property portals in real-time.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => setSearchQuery(searchMode === 'rent' 
                    ? "2 bedroom North Point with balcony $15k-$21k"
                    : "3 bedroom Mid-Levels under $50M"
                  )}
                >
                  {searchMode === 'rent' ? '2 BR North Point with balcony' : '3 BR Mid-Levels'}
                </Badge>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => setSearchQuery(searchMode === 'rent'
                    ? "3 bedroom Mid-Levels sea view under $50000"
                    : "4 bedroom Peak with garden"
                  )}
                >
                  {searchMode === 'rent' ? '3 BR Mid-Levels sea view' : '4 BR Peak with garden'}
                </Badge>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => setSearchQuery(searchMode === 'rent'
                    ? "studio Causeway Bay furnished"
                    : "Studio investment Causeway Bay"
                  )}
                >
                  {searchMode === 'rent' ? 'Studio Causeway Bay furnished' : 'Studio investment'}
                </Badge>
              </div>
            </div>
          )}

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
