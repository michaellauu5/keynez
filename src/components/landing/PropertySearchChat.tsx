import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Sparkles, Loader2 } from "lucide-react";
import { FilterToggleBar, FilterState } from "./FilterToggleBar";
import { PropertyResultsTable, PropertyResult } from "./PropertyResultsTable";
import { ExportActions } from "./ExportActions";
import { cn } from "@/lib/utils";

// Mock data for demonstration
const MOCK_PROPERTIES: PropertyResult[] = [
  {
    id: "1",
    name: "The Cullinan Tower 21",
    location: "West Kowloon",
    price: 85000000,
    size: 1250,
    bedrooms: "3",
    features: ["Sea View", "New Build", "Gym"],
  },
  {
    id: "2",
    name: "One Island South",
    location: "Wong Chuk Hang",
    price: 42000000,
    size: 890,
    bedrooms: "2",
    features: ["Mountain View", "Pet Friendly", "Pool"],
  },
  {
    id: "3",
    name: "Mount Nicholson",
    location: "The Peak",
    price: 280000000,
    size: 3200,
    bedrooms: "5+",
    features: ["Sea View", "Garden", "Parking"],
  },
  {
    id: "4",
    name: "The Pavilia Hill",
    location: "North Point",
    price: 35000000,
    size: 720,
    bedrooms: "2",
    features: ["City View", "Renovated", "Gym"],
  },
  {
    id: "5",
    name: "Larvotto",
    location: "Ap Lei Chau",
    price: 58000000,
    size: 1100,
    bedrooms: "3",
    features: ["Sea View", "Balcony", "Pool"],
  },
  {
    id: "6",
    name: "Victoria Peak House",
    location: "The Peak",
    price: 450000000,
    size: 5500,
    bedrooms: "5+",
    features: ["Sea View", "Garden", "Rooftop"],
  },
  {
    id: "7",
    name: "The Austin",
    location: "West Kowloon",
    price: 25000000,
    size: 550,
    bedrooms: "1",
    features: ["City View", "New Build", "Gym"],
  },
  {
    id: "8",
    name: "Ultima",
    location: "Ho Man Tin",
    price: 120000000,
    size: 2100,
    bedrooms: "4",
    features: ["Mountain View", "Pool", "Parking"],
  },
  {
    id: "9",
    name: "Grand Mayfair",
    location: "Mid-Levels",
    price: 68000000,
    size: 1400,
    bedrooms: "3",
    features: ["City View", "Pet Friendly", "Renovated"],
  },
  {
    id: "10",
    name: "Bel-Air Peak",
    location: "Pokfulam",
    price: 95000000,
    size: 1800,
    bedrooms: "4",
    features: ["Sea View", "Garden", "Parking"],
  },
  {
    id: "11",
    name: "The Morgan",
    location: "Sheung Wan",
    price: 32000000,
    size: 680,
    bedrooms: "2",
    features: ["City View", "Renovated", "Rooftop"],
  },
  {
    id: "12",
    name: "Park Mediterranean",
    location: "Ma On Shan",
    price: 15000000,
    size: 620,
    bedrooms: "2",
    features: ["Mountain View", "New Build", "Pool"],
  },
  {
    id: "13",
    name: "Kadooria Hill",
    location: "Ho Man Tin",
    price: 78000000,
    size: 1550,
    bedrooms: "3",
    features: ["Garden", "Pet Friendly", "Parking"],
  },
  {
    id: "14",
    name: "Repulse Bay Apartments",
    location: "Repulse Bay",
    price: 145000000,
    size: 2400,
    bedrooms: "4",
    features: ["Sea View", "Balcony", "Pool"],
  },
  {
    id: "15",
    name: "Island Crest",
    location: "Sai Ying Pun",
    price: 22000000,
    size: 480,
    bedrooms: "1",
    features: ["City View", "Gym", "Renovated"],
  },
];

export function PropertySearchChat() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<PropertyResult[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
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
    developers: [],
  });

  const handleSearch = async () => {
    setIsSearching(true);
    setSelectedIds([]);
    
    // Simulate AI search delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // In production, this would call an AI-powered search API
    // For now, we'll filter the mock data based on basic criteria
    let filteredResults = [...MOCK_PROPERTIES];

    // Apply some basic filtering logic
    if (filters.bedrooms.length > 0) {
      filteredResults = filteredResults.filter((p) =>
        filters.bedrooms.includes(p.bedrooms)
      );
    }

    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 200000000) {
      filteredResults = filteredResults.filter(
        (p) => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
      );
    }

    if (filters.sizeRange[0] > 0 || filters.sizeRange[1] < 5000) {
      filteredResults = filteredResults.filter(
        (p) => p.size >= filters.sizeRange[0] && p.size <= filters.sizeRange[1]
      );
    }

    // If there's a search query, we'd use AI to rank results
    // For now, just use the filtered results
    if (filteredResults.length === 0) {
      filteredResults = MOCK_PROPERTIES.slice(0, 15);
    }

    setResults(filteredResults.slice(0, 15));
    setIsSearching(false);
    setHasSearched(true);
  };

  const handleExportToResearchCanvas = (selectedResults: PropertyResult[]) => {
    // In production, this would navigate to the Research Canvas page
    // with the selected properties
    console.log("Exporting to Research Canvas:", selectedResults);
    alert(`Opening Research Canvas with ${selectedResults.length} properties...`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <Card className="border-0 bg-card/80 shadow-xl backdrop-blur-sm">
      <CardContent className="p-4 lg:p-6">
        {/* Filter Section */}
        <div className="mb-4">
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
              placeholder="Describe your ideal property..."
              className="h-12 pl-10 pr-4 text-base"
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={isSearching}
            className="h-12 gap-2 bg-accent px-6 text-accent-foreground hover:bg-accent/90"
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Search
          </Button>
        </div>

        {/* Results Section */}
        {hasSearched && (
          <div className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            {/* Export Actions */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {results.length} properties found
                {selectedIds.length > 0 && (
                  <span className="ml-2 font-medium text-foreground">
                    ({selectedIds.length} selected)
                  </span>
                )}
              </p>
              <ExportActions
                results={results}
                selectedIds={selectedIds}
                onExportToResearchCanvas={handleExportToResearchCanvas}
              />
            </div>

            {/* Results Table */}
            <PropertyResultsTable
              results={results}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
            />
          </div>
        )}

        {/* Initial State */}
        {!hasSearched && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 rounded-full bg-accent/20 p-4">
              <Sparkles className="h-8 w-8 text-accent" />
            </div>
            <h3 className="mb-2 font-serif text-lg font-semibold">
              AI-Powered Property Search
            </h3>
            <p className="max-w-md text-sm text-muted-foreground">
              Describe what you're looking for in natural language, or use the filters above.
              Our AI will find the most relevant properties for you.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
