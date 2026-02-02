import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Sparkles, Loader2, MapPin, DollarSign, Bed, Eye, AlertCircle } from "lucide-react";
import { FilterToggleBar, FilterState } from "./FilterToggleBar";
import { PropertyResultsTable, PropertyResult } from "./PropertyResultsTable";
import { ExportActions } from "./ExportActions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";
interface ExtractedCriteria {
  locations: string[];
  priceMin: number | null;
  priceMax: number | null;
  sizeMin: number | null;
  sizeMax: number | null;
  bedrooms: number[];
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
}
export function PropertySearchChat() {
  const {
    t
  } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [thinkingMessage, setThinkingMessage] = useState("");
  const [results, setResults] = useState<(PropertyResult & {
    rank?: number;
    relevanceScore?: number;
    matchReason?: string;
  })[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [extractedCriteria, setExtractedCriteria] = useState<ExtractedCriteria | null>(null);
  const [searchSummary, setSearchSummary] = useState("");
  const [highlightTerms, setHighlightTerms] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    propertyTypes: [],
    priceRange: [0, 200000000],
    locations: [],
    bedrooms: [],
    bathrooms: [],
    sizeRange: [0, 5000],
    floorLevels: [],
    buildingAge: [],
    orientations: [],
    developers: []
  });
  const THINKING_MESSAGES = [t('search.thinking.analyzing'), t('search.thinking.searching'), t('search.thinking.ranking'), t('search.thinking.preparing')];
  const handleSearch = async () => {
    setIsSearching(true);
    setSelectedIds([]);
    setExtractedCriteria(null);
    setSearchSummary("");

    // Animate thinking messages
    let messageIndex = 0;
    setThinkingMessage(THINKING_MESSAGES[0]);
    const thinkingInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % THINKING_MESSAGES.length;
      setThinkingMessage(THINKING_MESSAGES[messageIndex]);
    }, 800);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke<AISearchResponse>("ai-property-search", {
        body: {
          query: searchQuery,
          filters: {
            priceRange: filters.priceRange,
            sizeRange: filters.sizeRange,
            bedrooms: filters.bedrooms,
            locations: filters.locations
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

        // Build highlight terms from extracted criteria
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

      // Check for specific error types
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
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isSearching) {
      handleSearch();
    }
  };
  const handleRowClick = (property: PropertyResult) => {
    // Could open a details modal or navigate to property page
    console.log("Property clicked:", property);
  };
  return <Card className="border-0 bg-card/80 shadow-xl backdrop-blur-sm">
      <CardContent className="p-4 lg:p-6">
        {/* Filter Section */}
        <div className="mb-4">
          <FilterToggleBar filters={filters} onFiltersChange={setFilters} />
        </div>

        {/* Search Input Section */}
        <div className="mb-6 flex gap-2">
          <div className="relative flex-1">
            <Sparkles className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-accent" />
            <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={handleKeyDown} placeholder={t('search.placeholder')} className="h-12 pl-10 pr-4 text-base" disabled={isSearching} />
          </div>
          <Button onClick={handleSearch} disabled={isSearching} className="h-12 gap-2 bg-accent px-6 text-accent-foreground hover:bg-accent/90">
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            {t('search.button')}
          </Button>
        </div>

        {/* AI Thinking State */}
        {isSearching && <div className="mb-6 flex items-center justify-center gap-3 rounded-lg bg-accent/10 p-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent animate-pulse" />
              <span className="font-medium text-accent">{thinkingMessage}</span>
            </div>
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{
            animationDelay: "0ms"
          }} />
              <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{
            animationDelay: "150ms"
          }} />
              <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{
            animationDelay: "300ms"
          }} />
            </div>
          </div>}

        {/* Extracted Criteria Badges */}
        {extractedCriteria && !isSearching && <div className="mb-4 animate-in fade-in-50 slide-in-from-top-2 duration-300">
            <p className="text-xs text-muted-foreground mb-2">{t('search.aiUnderstood')}</p>
            <div className="flex flex-wrap gap-2">
              {extractedCriteria.locations.length > 0 && <Badge variant="secondary" className="gap-1">
                  <MapPin className="h-3 w-3" />
                  {extractedCriteria.locations.join(", ")}
                </Badge>}
              {(extractedCriteria.priceMin || extractedCriteria.priceMax) && <Badge variant="secondary" className="gap-1">
                  <DollarSign className="h-3 w-3" />
                  {extractedCriteria.priceMin ? `HK$${(extractedCriteria.priceMin / 1000000).toFixed(0)}M` : "Any"}{" "}
                  -{" "}
                  {extractedCriteria.priceMax ? `HK$${(extractedCriteria.priceMax / 1000000).toFixed(0)}M` : "Any"}
                </Badge>}
              {extractedCriteria.bedrooms.length > 0 && <Badge variant="secondary" className="gap-1">
                  <Bed className="h-3 w-3" />
                  {extractedCriteria.bedrooms.join(" or ")} BR
                </Badge>}
              {extractedCriteria.features.map(feature => <Badge key={feature} variant="outline" className="gap-1">
                  <Eye className="h-3 w-3" />
                  {feature}
                </Badge>)}
            </div>
          </div>}

        {/* Search Summary */}
        {searchSummary && !isSearching && <p className="text-sm text-muted-foreground mb-4 animate-in fade-in-50">
            {searchSummary}
          </p>}

        {/* Results Section */}
        {hasSearched && !isSearching && <div className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            {/* Export Actions */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {results.length} {t('search.propertiesFound')}
                {selectedIds.length > 0 && <span className="ml-2 font-medium text-foreground">
                    ({selectedIds.length} {t('search.selected')})
                  </span>}
              </p>
              <ExportActions results={results} selectedIds={selectedIds} searchQuery={searchQuery} />
            </div>

            {/* Results Table */}
            {results.length > 0 ? <PropertyResultsTable results={results} selectedIds={selectedIds} onSelectionChange={setSelectedIds} highlightTerms={highlightTerms} onRowClick={handleRowClick} /> : <div className="flex flex-col items-center justify-center py-12 text-center rounded-lg border border-dashed">
                <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">{t('search.noResults')}</p>
                <p className="text-sm text-muted-foreground mt-1">{t('search.noResultsHint')}</p>
              </div>}
          </div>}

        {/* Initial State */}
        {!hasSearched && !isSearching && <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 rounded-full bg-accent/20 p-4">
              <Sparkles className="h-8 w-8 bg-accent-foreground text-secondary-foreground" />
            </div>
            <h3 className="mb-2 font-serif text-lg font-semibold">
              {t('search.initialTitle')}
            </h3>
            <p className="max-w-md text-sm text-muted-foreground">
              {t('search.initialDescription')}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Badge variant="outline" className="cursor-pointer hover:bg-muted" onClick={() => setSearchQuery("3 bedroom in Mid-Levels with sea view")}>
                {t('search.sample.midLevels')}
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-muted" onClick={() => setSearchQuery("Family home under 50 million with garden")}>
                {t('search.sample.family')}
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-muted" onClick={() => setSearchQuery("Pet friendly apartment in Kowloon")}>
                {t('search.sample.petFriendly')}
              </Badge>
            </div>
          </div>}
      </CardContent>
    </Card>;
}