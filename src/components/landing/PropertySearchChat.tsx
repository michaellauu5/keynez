import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Sparkles, Loader2, MapPin, DollarSign, Bed, Eye, AlertCircle, Filter, X, Globe, Database } from "lucide-react";
import { FilterToggleBar, FilterState } from "./FilterToggleBar";
import { PropertyResultsTable, PropertyResult } from "./PropertyResultsTable";
import { WebSearchResultsTable, WebSearchResult } from "./WebSearchResultsTable";
import { ExportActions } from "./ExportActions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";
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

export function PropertySearchChat() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isWebSearching, setIsWebSearching] = useState(false);
  const [thinkingMessage, setThinkingMessage] = useState("");
  const [currentSearchSource, setCurrentSearchSource] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"ai" | "web">("ai");
  
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
  
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastFiltersRef = useRef<FilterState>(DEFAULT_FILTERS);
  
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

  // AI Search
  const executeSearch = useCallback(async (query: string, currentFilters: FilterState) => {
    setIsSearching(true);
    setSelectedIds([]);

    let messageIndex = 0;
    setThinkingMessage(THINKING_MESSAGES[0]);
    const thinkingInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % THINKING_MESSAGES.length;
      setThinkingMessage(THINKING_MESSAGES[messageIndex]);
    }, 800);

    try {
      const { data, error } = await supabase.functions.invoke<AISearchResponse>("ai-property-search", {
        body: {
          query: query,
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
          }
        }
      });

      if (error) {
        throw error;
      }

      if (data) {
        setExtractedCriteria(data.extractedCriteria);
        setResults(data.results);
        setSearchSummary(data.searchSummary);
        setFilterSummary(data.filterSummary || "");

        const terms: string[] = [];
        if (data.extractedCriteria.locations) {
          terms.push(...data.extractedCriteria.locations);
        }
        if (data.extractedCriteria.features) {
          terms.push(...data.extractedCriteria.features);
        }
        setHighlightTerms(terms);

        toast.success(`${t('search.found')} ${data.results.length} ${t('search.matchingProperties')}`);
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
  }, [t, THINKING_MESSAGES]);

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

  // Auto-trigger search when filters change (debounced)
  useEffect(() => {
    const filtersChanged = JSON.stringify(filters) !== JSON.stringify(lastFiltersRef.current);
    
    if (filtersChanged && (hasSearched || hasWebSearched)) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      searchTimeoutRef.current = setTimeout(() => {
        if (activeTab === "ai") {
          executeSearch(searchQuery, filters);
        } else {
          executeWebSearch(searchQuery, filters);
        }
      }, 300);
      
      lastFiltersRef.current = filters;
    }
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [filters, hasSearched, hasWebSearched, searchQuery, executeSearch, executeWebSearch, activeTab]);

  const handleSearch = async () => {
    lastFiltersRef.current = filters;
    if (activeTab === "ai") {
      await executeSearch(searchQuery, filters);
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
        executeSearch(searchQuery, DEFAULT_FILTERS);
      } else {
        executeWebSearch(searchQuery, DEFAULT_FILTERS);
      }
    }
  };

  const handleRowClick = (property: PropertyResult) => {
    console.log("Property clicked:", property);
  };

  const handleWebRowClick = (result: WebSearchResult) => {
    window.open(result.sourceUrl, "_blank");
  };

  const isLoading = isSearching || isWebSearching;

  return (
    <Card className="border-0 bg-card/80 shadow-xl backdrop-blur-sm">
      <CardContent className="p-4 lg:p-6">
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
              placeholder={activeTab === "web" 
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

        {/* AI Search Results */}
        {activeTab === "ai" && !isLoading && (
          <>
            {/* Filter Summary Display */}
            {filterSummary && (
              <div className="mb-4 px-3 py-2 rounded-md bg-[#FFD54F]/10 border border-[#FFD54F]/30">
                <p className="text-sm font-medium text-foreground">{filterSummary}</p>
              </div>
            )}

            {/* Extracted Criteria Badges */}
            {extractedCriteria && (
              <div className="mb-4 animate-in fade-in-50 slide-in-from-top-2 duration-300">
                <p className="text-xs text-muted-foreground mb-2">{t('search.aiUnderstood')}</p>
                <div className="flex flex-wrap gap-2">
                  {extractedCriteria.locations.length > 0 && (
                    <Badge variant="secondary" className="gap-1">
                      <MapPin className="h-3 w-3" />
                      {extractedCriteria.locations.join(", ")}
                    </Badge>
                  )}
                  {(extractedCriteria.priceMin || extractedCriteria.priceMax) && (
                    <Badge variant="secondary" className="gap-1">
                      <DollarSign className="h-3 w-3" />
                      {extractedCriteria.priceMin ? `HK$${(extractedCriteria.priceMin / 1000000).toFixed(0)}M` : "Any"}{" "}
                      -{" "}
                      {extractedCriteria.priceMax ? `HK$${(extractedCriteria.priceMax / 1000000).toFixed(0)}M` : "Any"}
                    </Badge>
                  )}
                  {extractedCriteria.bedrooms.length > 0 && (
                    <Badge variant="secondary" className="gap-1">
                      <Bed className="h-3 w-3" />
                      {extractedCriteria.bedrooms.join(" or ")} BR
                    </Badge>
                  )}
                  {extractedCriteria.propertyTypes?.length > 0 && (
                    <Badge variant="secondary" className="gap-1">
                      {extractedCriteria.propertyTypes.join(", ")}
                    </Badge>
                  )}
                  {extractedCriteria.features.map((feature) => (
                    <Badge key={feature} variant="outline" className="gap-1">
                      <Eye className="h-3 w-3" />
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Search Summary */}
            {searchSummary && (
              <p className="text-sm text-muted-foreground mb-4 animate-in fade-in-50">
                {searchSummary}
              </p>
            )}

            {/* Results Section */}
            {hasSearched && (
              <div className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">
                      <span className="text-lg font-bold text-accent">{results.length}</span>{" "}
                      <span className="text-muted-foreground">{t('search.propertiesFound')}</span>
                    </p>
                    {selectedIds.length > 0 && (
                      <Badge variant="outline" className="ml-2">
                        {selectedIds.length} {t('search.selected')}
                      </Badge>
                    )}
                  </div>
                  <ExportActions
                    results={results}
                    selectedIds={selectedIds}
                    searchQuery={searchQuery}
                  />
                </div>

                {results.length > 0 ? (
                  <PropertyResultsTable
                    results={results}
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                    highlightTerms={highlightTerms}
                    onRowClick={handleRowClick}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center rounded-lg border border-dashed">
                    <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">{t('search.noResults')}</p>
                    <p className="text-sm text-muted-foreground mt-1">{t('search.noResultsHint')}</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Web Search Results */}
        {activeTab === "web" && !isLoading && (
          <>
            {/* Sources searched summary */}
            {webSourcesSearched.length > 0 && (
              <div className="mb-4 px-3 py-2 rounded-md bg-accent/10 border border-accent/30">
                <p className="text-sm font-medium text-foreground">
                  <span className="text-accent font-bold">{webResults.length} results</span> found from{" "}
                  <span className="text-accent">{webSourcesSearched.length} sources</span>
                  <span className="text-muted-foreground ml-2">
                    ({webSourcesSearched.join(", ")})
                  </span>
                </p>
              </div>
            )}

            {/* Results Section */}
            {hasWebSearched && (
              <div className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">
                      <span className="text-lg font-bold text-accent">{webResults.length}</span>{" "}
                      <span className="text-muted-foreground">listings found</span>
                    </p>
                    {webSelectedIds.length > 0 && (
                      <Badge variant="outline" className="ml-2">
                        {webSelectedIds.length} selected
                      </Badge>
                    )}
                  </div>
                </div>

                {webResults.length > 0 ? (
                  <WebSearchResultsTable
                    results={webResults}
                    selectedIds={webSelectedIds}
                    onSelectionChange={setWebSelectedIds}
                    highlightTerms={highlightTerms}
                    onRowClick={handleWebRowClick}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center rounded-lg border border-dashed">
                    <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No listings found</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Try adjusting your search query or filters
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Initial State */}
        {!hasSearched && !hasWebSearched && !isLoading && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 rounded-full bg-accent/20 p-4">
              {activeTab === "web" ? (
                <Globe className="h-8 w-8 text-accent" />
              ) : (
                <Sparkles className="h-8 w-8 text-accent" />
              )}
            </div>
            <h3 className="mb-2 font-serif text-lg font-semibold">
              {activeTab === "web" 
                ? "Search Live Property Listings" 
                : t('search.initialTitle')
              }
            </h3>
            <p className="max-w-md text-sm text-muted-foreground">
              {activeTab === "web"
                ? "Search across 28Hse, House730, Squarefoot, Spacious, and more Hong Kong property portals in real-time."
                : t('search.initialDescription')
              }
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {activeTab === "web" ? (
                <>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => setSearchQuery("2 bedroom North Point with balcony $15k-$21k")}
                  >
                    2 BR North Point with balcony
                  </Badge>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => setSearchQuery("3 bedroom Mid-Levels sea view under $50000")}
                  >
                    3 BR Mid-Levels sea view
                  </Badge>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => setSearchQuery("studio Causeway Bay furnished")}
                  >
                    Studio Causeway Bay furnished
                  </Badge>
                </>
              ) : (
                <>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => setSearchQuery("3 bedroom in Mid-Levels with sea view")}
                  >
                    {t('search.sample.midLevels')}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => setSearchQuery("Family home under 50 million with garden")}
                  >
                    {t('search.sample.family')}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => setSearchQuery("Pet friendly apartment in Kowloon")}
                  >
                    {t('search.sample.petFriendly')}
                  </Badge>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
