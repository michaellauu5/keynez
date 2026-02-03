import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Sparkles, Loader2, Filter, X, MessageCircle, Home, Key, RefreshCw } from "lucide-react";
import { FilterToggleBar, FilterState } from "./FilterToggleBar";
import { PropertyResultsTable, PropertyResult } from "./PropertyResultsTable";
import { WebSearchResult } from "./WebSearchResultsTable";
import { PropertyDetailModal } from "./PropertyDetailModal";
import { ChatMessageList } from "./ChatMessageList";
import { PerplexityResults } from "./PerplexityResults";
import { SearchProgressIndicator, SearchSource } from "./SearchProgressIndicator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";
import { useConversation, ChatMessage } from "@/hooks/useConversation";
import { getRandomSuggestions } from "@/data/suggestionsPool";
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
  const [thinkingMessage, setThinkingMessage] = useState("");
  
  // CRITICAL: Rent vs Buy mode - prevents comingling results
  const [searchMode, setSearchMode] = useState<"rent" | "buy">("rent");
  
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
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  
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
  
  const activeFilterCount = countActiveFilters(filters);

  // Rotate suggestions when mode changes
  useEffect(() => {
    setPromptSuggestions(getRandomSuggestions(searchMode, 4));
  }, [searchMode]);

  const refreshSuggestions = useCallback(() => {
    setPromptSuggestions(getRandomSuggestions(searchMode, 4));
  }, [searchMode]);

  const THINKING_MESSAGES = [
    t('search.thinking.analyzing'),
    t('search.thinking.searching'),
    t('search.thinking.ranking'),
    t('search.thinking.preparing')
  ];

  // Unified search that combines AI database + Web search
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
    setThinkingMessage(THINKING_MESSAGES[0]);
    const thinkingInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % THINKING_MESSAGES.length;
      setThinkingMessage(THINKING_MESSAGES[messageIndex]);
    }, 800);

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

    try {
      const conversationHistory = conversation.getConversationContext();
      
      // Execute both searches in parallel
      const [aiResult, webResult] = await Promise.allSettled([
        // AI Database Search
        supabase.functions.invoke<AISearchResponse>("ai-property-search", {
          body: {
            query: query,
            searchMode: searchMode,
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
        }),
        // Web Search
        supabase.functions.invoke<WebSearchResponse>("property-web-search", {
          body: {
            query: query,
            searchMode: searchMode,
            filters: {
              location: currentFilters.locations[0] || null,
              bedrooms: currentFilters.bedrooms.length > 0 
                ? (currentFilters.bedrooms[0] === "Studio" ? 0 : parseInt(currentFilters.bedrooms[0])) 
                : null,
              priceMin: currentFilters.priceRange[0] > 0 ? currentFilters.priceRange[0] : null,
              priceMax: currentFilters.priceRange[1] < 200000000 ? currentFilters.priceRange[1] : null,
            }
          }
        })
      ]);

      // Mark all sources as done
      setSearchSources(prev => prev.map(s => ({ ...s, status: 'done' as const })));

      let combinedResults: (PropertyResult & {
        rank?: number;
        relevanceScore?: number;
        matchReason?: string;
        matchQuality?: 'perfect' | 'good' | 'partial';
      })[] = [];
      let webResultsList: WebSearchResult[] = [];
      const errors: string[] = [];

      // Process AI results
      if (aiResult.status === 'fulfilled' && aiResult.value.data) {
        const data = aiResult.value.data;
        setExtractedCriteria(data.extractedCriteria);
        
        // Calculate match quality for each result
        const withQuality = data.results.map(r => ({
          ...r,
          matchQuality: (r.relevanceScore >= 80 ? 'perfect' : 
                        r.relevanceScore >= 60 ? 'good' : 'partial') as 'perfect' | 'good' | 'partial'
        }));
        
        combinedResults = [...combinedResults, ...withQuality];
        
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

        // Build highlight terms
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
      } else if (aiResult.status === 'rejected') {
        errors.push("AI database temporarily unavailable");
        setSearchSources(prev => {
          const updated = [...prev];
          updated[0] = { ...updated[0], status: 'error' };
          return updated;
        });
      }

      // Process Web results
      if (webResult.status === 'fulfilled' && webResult.value.data?.success) {
        webResultsList = webResult.value.data.results;
        setWebResults(webResultsList);
        
        // Update source statuses with result counts
        const sourcesWithCounts = webResult.value.data.sourcesSearched;
        setSearchSources(prev => prev.map(s => ({
          ...s,
          status: sourcesWithCounts.includes(s.name) ? 'done' : 'error',
          resultCount: webResultsList.filter(r => r.sourceDisplayName === s.name).length
        })));
      } else if (webResult.status === 'rejected') {
        errors.push("Web search temporarily unavailable, showing database results");
      }

      setSearchErrors(errors);

      // Merge and dedupe results (prioritize AI results, add unique web results)
      if (page > 1) {
        setResults(prev => [...prev, ...combinedResults]);
      } else {
        setResults(combinedResults);
      }

      const totalFound = combinedResults.length + webResultsList.length;
      if (totalFound > 0) {
        toast.success(`${t('search.found')} ${totalFound} ${t('search.matchingProperties')}`);
      } else {
        toast.info("No exact matches found. Try adjusting your criteria.");
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
      clearInterval(sourceInterval);
      setIsSearching(false);
      setHasSearched(true);
    }
  }, [t, THINKING_MESSAGES, conversation, searchMode]);

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
    lastFiltersRef.current = filters;
    await executeSearch(searchQuery, filters, 1, conversation.hasHistory);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isSearching) {
      handleSearch();
    }
  };

  const handleClearAllFilters = () => {
    setFilters(DEFAULT_FILTERS);
    if (hasSearched) {
      executeSearch(searchQuery, DEFAULT_FILTERS, 1, true);
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
    sources.add("KeyNest AI Database");
    searchSources.filter(s => s.status === 'done').forEach(s => sources.add(s.name));
    return Array.from(sources);
  }, [searchSources]);

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

          {/* Conversation History */}
          {showConversation && conversation.messages.length > 0 && (
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
                isLoading={isSearching}
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
                    : t('search.placeholder')
                }
                className="h-12 pl-10 pr-4 text-base"
                disabled={isSearching}
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isSearching}
              className="h-12 gap-2 bg-accent px-6 text-accent-foreground hover:bg-accent/90"
            >
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {t('search.button')}
            </Button>
          </div>

          {/* Search Progress Indicator */}
          {isSearching && (
            <div className="mb-6">
              <SearchProgressIndicator
                sources={searchSources}
                isSearching={isSearching}
                totalFound={results.length}
                errors={searchErrors}
              />
            </div>
          )}

          {/* Search Results - Perplexity Style */}
          {!isSearching && hasSearched && (
            <PerplexityResults
              mode={searchMode}
              query={searchQuery}
              aiResults={results}
              webResults={webResults}
              extractedCriteria={extractedCriteria}
              sourcesSearched={allSourcesSearched}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              onRowClick={handleRowClick}
              onExportCSV={handleExportCSV}
              onExportPDF={handleExportPDF}
              onAddToCanvas={handleAddMultipleToCanvas}
              highlightTerms={highlightTerms}
            />
          )}

          {/* Initial state - Show rotating suggestions */}
          {!isSearching && !hasSearched && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 rounded-full bg-accent/20 p-4">
                <Sparkles className="h-8 w-8 text-accent" />
              </div>
              <h3 className="mb-2 font-serif text-lg font-semibold">
                {searchMode === 'rent' ? 'Find Rental Properties' : 'Find Properties for Sale'}
              </h3>
              <p className="max-w-md text-sm text-muted-foreground mb-1">
                {t('search.initialDescription')}
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Searches AI database + 9 Hong Kong property portals simultaneously
              </p>
              
              {/* Rotating Suggestions */}
              <div className="flex flex-wrap justify-center gap-2 mb-3">
                {promptSuggestions.map((suggestion, idx) => (
                  <Badge
                    key={`${suggestion}-${idx}`}
                    variant="outline"
                    className="cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => {
                      setSearchQuery(suggestion);
                      executeSearch(suggestion, filters, 1, false);
                    }}
                  >
                    {suggestion}
                  </Badge>
                ))}
              </div>
              
              {/* Refresh suggestions button */}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-xs text-muted-foreground"
                onClick={refreshSuggestions}
              >
                <RefreshCw className="h-3 w-3" />
                More suggestions
              </Button>
            </div>
          )}

          {/* Load More Button */}
          {hasMore && !isSearching && hasSearched && (
            <div className="mt-6 flex justify-center">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                className="gap-2"
              >
                Load More Results
                <Badge variant="secondary" className="ml-1">
                  {results.length} / {totalCount}
                </Badge>
              </Button>
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
