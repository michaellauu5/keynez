import { useState, useMemo } from "react";
import { LayoutGrid, Map as MapIcon } from "lucide-react";
import { StatCounter } from "./StatCounter";
import { FilterSidebar, type FilterState } from "./FilterSidebar";
import { PropertyGrid } from "./PropertyGrid";
import { GoogleMapView } from "@/components/map/GoogleMapView";
import { Button } from "@/components/ui/button";
import { mockProperties } from "@/data/mockProperties";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const defaultFilters: FilterState = {
  transactionType: "all",
  regions: [],
  districts: [],
  propertyTypes: [],
  priceRange: [0, 200000000],
  sizeRange: [0, 5000],
  bedrooms: [],
  bathrooms: [],
  hasParking: null,
  petsAllowed: null,
  isFurnished: null,
  isNew: null,
  hasSeaView: null,
  hasPool: null,
  hasGym: null,
};

type ViewMode = "grid" | "map";

export function PropertyListingsSection() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const filteredProperties = useMemo(() => {
    return mockProperties.filter((property) => {
      if (filters.transactionType !== "all" && property.priceType !== filters.transactionType) return false;
      if (filters.regions.length > 0 && !filters.regions.includes(property.region)) return false;
      if (filters.districts.length > 0 && !filters.districts.includes(property.district)) return false;
      if (filters.propertyTypes.length > 0 && !filters.propertyTypes.includes(property.propertyType)) return false;
      if (property.priceType === "sale") {
        if (property.price < filters.priceRange[0] || property.price > filters.priceRange[1]) return false;
      }
      if (property.size < filters.sizeRange[0] || property.size > filters.sizeRange[1]) return false;
      if (filters.bedrooms.length > 0) {
        const bedroomMatch = filters.bedrooms.some((b) => (b === 5 ? property.bedrooms >= 5 : property.bedrooms === b));
        if (!bedroomMatch) return false;
      }
      if (filters.bathrooms.length > 0) {
        const bathroomMatch = filters.bathrooms.some((b) => (b === 4 ? property.bathrooms >= 4 : property.bathrooms === b));
        if (!bathroomMatch) return false;
      }
      if (filters.hasParking === true && !property.hasParking) return false;
      if (filters.petsAllowed === true && !property.petsAllowed) return false;
      if (filters.isFurnished === true && !property.isFurnished) return false;
      if (filters.isNew === true && !property.isNew) return false;
      if (filters.hasSeaView === true && !property.features.includes("Sea View")) return false;
      if (filters.hasPool === true && !property.features.includes("Pool")) return false;
      if (filters.hasGym === true && !property.features.includes("Gym")) return false;
      return true;
    });
  }, [filters]);

  return (
    <section className="bg-secondary py-section lg:py-section-lg">
      {/* Section Header */}
      <div className="mx-auto max-w-[1400px] px-6 md:px-12 mb-12 text-center">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          45,000+ Active Listings
        </h2>
        <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
          Verified properties from trusted agents across Hong Kong
        </p>
      </div>

      {/* Stat Counter */}
      <StatCounter />

      {/* Main Content */}
      <div className="mx-auto max-w-[1400px] px-6 md:px-12 mt-12">
        {/* Mobile Filter Button */}
        {isMobile && (
          <div className="mb-6">
            <FilterSidebar filters={filters} onFiltersChange={setFilters} />
          </div>
        )}

        <div className="flex gap-10">
          {/* Desktop Sidebar */}
          {!isMobile && <FilterSidebar filters={filters} onFiltersChange={setFilters} />}

          {/* Property Grid/Map */}
          <div className="flex-1 min-w-0">
            {/* View Toggle */}
            <div className="flex items-center justify-between mb-8">
              <p className="text-sm font-medium text-foreground">
                <span className="text-2xl font-bold">{filteredProperties.length}</span>{" "}
                <span className="text-muted-foreground">properties found</span>
              </p>
              <div className="flex border border-border rounded-lg overflow-hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "h-9 px-4 rounded-none transition-colors",
                    viewMode === "grid" && "bg-accent text-accent-foreground"
                  )}
                  title="Grid View"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("map")}
                  className={cn(
                    "h-9 px-4 rounded-none border-l border-border transition-colors",
                    viewMode === "map" && "bg-accent text-accent-foreground"
                  )}
                  title="Map View"
                >
                  <MapIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Results */}
            {viewMode === "grid" ? (
              <PropertyGrid
                properties={filteredProperties}
                onPropertyHover={setHoveredPropertyId}
              />
            ) : (
              <GoogleMapView
                properties={filteredProperties}
                hoveredPropertyId={hoveredPropertyId}
                onPropertyHover={setHoveredPropertyId}
                className="h-[600px] rounded-xl"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
