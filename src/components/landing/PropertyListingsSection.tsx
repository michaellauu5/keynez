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
      // Transaction type
      if (filters.transactionType !== "all" && property.priceType !== filters.transactionType) {
        return false;
      }

      // Regions
      if (filters.regions.length > 0 && !filters.regions.includes(property.region)) {
        return false;
      }

      // Districts
      if (filters.districts.length > 0 && !filters.districts.includes(property.district)) {
        return false;
      }

      // Property types
      if (filters.propertyTypes.length > 0 && !filters.propertyTypes.includes(property.propertyType)) {
        return false;
      }

      // Price range (for sale properties only compare against sale price range)
      if (property.priceType === "sale") {
        if (property.price < filters.priceRange[0] || property.price > filters.priceRange[1]) {
          return false;
        }
      }

      // Size range
      if (property.size < filters.sizeRange[0] || property.size > filters.sizeRange[1]) {
        return false;
      }

      // Bedrooms
      if (filters.bedrooms.length > 0) {
        const bedroomMatch = filters.bedrooms.some((b) => {
          if (b === 5) return property.bedrooms >= 5;
          return property.bedrooms === b;
        });
        if (!bedroomMatch) return false;
      }

      // Bathrooms
      if (filters.bathrooms.length > 0) {
        const bathroomMatch = filters.bathrooms.some((b) => {
          if (b === 4) return property.bathrooms >= 4;
          return property.bathrooms === b;
        });
        if (!bathroomMatch) return false;
      }

      // Additional filters
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
    <section className="bg-muted/30">
      {/* Stat Counter */}
      <StatCounter />

      {/* Main Content */}
      <div className="container px-4 py-8 md:py-12">
        {/* Mobile Filter Button */}
        {isMobile && (
          <div className="mb-6">
            <FilterSidebar filters={filters} onFiltersChange={setFilters} />
          </div>
        )}

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          {!isMobile && (
            <FilterSidebar filters={filters} onFiltersChange={setFilters} />
          )}

          {/* Property Grid/Map */}
          <div className="flex-1 min-w-0">
            {/* View Toggle */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm font-medium text-foreground">
                <span className="text-lg font-bold">{filteredProperties.length}</span>{" "}
                <span className="text-muted-foreground">properties found</span>
              </p>
              <div className="flex border border-border rounded-md overflow-hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "h-9 px-3 rounded-none",
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
                    "h-9 px-3 rounded-none border-l border-border",
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
                className="h-[600px]"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
