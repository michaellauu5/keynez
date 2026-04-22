import { useState, useMemo } from "react";
import { LayoutGrid, Map as MapIcon } from "lucide-react";
import { StatCounter } from "./StatCounter";
import { VideoDemo } from "./VideoDemo";
import { FilterSidebar } from "./FilterSidebar";
import { PropertyGrid } from "./PropertyGrid";
import { GoogleMapView } from "@/components/map/GoogleMapView";
import { Button } from "@/components/ui/button";
import { mockProperties } from "@/data/mockProperties";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useFilterSync } from "@/contexts/FilterSyncContext";

type ViewMode = "grid" | "map";

export function PropertyListingsSection() {
  const { chatFilters, setChatFilters, searchMode } = useFilterSync();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const filteredProperties = useMemo(() => {
    const f = chatFilters;
    return mockProperties.filter((p) => {
      // Transaction type via searchMode
      if (searchMode === "rent" && p.priceType !== "rent") return false;
      if (searchMode === "buy" && p.priceType !== "sale") return false;

      // Property types
      if (f.propertyTypes.length > 0) {
        const match = f.propertyTypes.some(
          (t) => t.toLowerCase() === p.propertyType.toLowerCase(),
        );
        if (!match) return false;
      }

      // Districts (preferred) else regions/locations
      if (f.districts.length > 0) {
        if (!f.districts.includes(p.district)) return false;
      } else if (f.locations.length > 0) {
        if (!f.locations.includes(p.region)) return false;
      }

      // Price
      if (p.price < f.priceRange[0] || p.price > f.priceRange[1]) return false;

      // Size
      if (p.size < f.sizeRange[0] || p.size > f.sizeRange[1]) return false;

      // Bedrooms
      if (f.bedrooms.length > 0) {
        const ok = f.bedrooms.some((b) => {
          if (b === "Studio") return p.bedrooms === 0;
          if (b === "4+") return p.bedrooms >= 4;
          if (b === "5+") return p.bedrooms >= 5;
          const n = parseInt(b);
          return !isNaN(n) && p.bedrooms === n;
        });
        if (!ok) return false;
      }

      // Bathrooms
      if (f.bathrooms.length > 0) {
        const ok = f.bathrooms.some((b) => {
          if (b === "4+") return p.bathrooms >= 4;
          const n = parseInt(b);
          return !isNaN(n) && p.bathrooms === n;
        });
        if (!ok) return false;
      }

      // Building age
      if (f.buildingAge.length > 0 && !f.buildingAge.includes(p.buildingAge)) return false;

      // Floor level
      if (f.floorLevels.length > 0 && !f.floorLevels.includes(p.floorLevel)) return false;

      // Developer
      if (f.developers.length > 0 && !f.developers.includes(p.developer)) return false;

      // Facilities — every selected must be present
      if (f.facilities.length > 0) {
        const ok = f.facilities.every((fac) => {
          if (fac === "Parking") return p.hasParking || p.features.includes("Parking");
          return p.features.includes(fac);
        });
        if (!ok) return false;
      }

      // Views — every selected must be present (e.g. "Sea View")
      if (f.views.length > 0) {
        const ok = f.views.every((v) => p.features.includes(`${v} View`));
        if (!ok) return false;
      }

      // Characteristics
      if (f.characteristics.length > 0) {
        const ok = f.characteristics.every((c) => {
          if (c === "New") return p.isNew;
          if (c === "Furnished") return p.isFurnished;
          if (c === "Pet-friendly") return p.petsAllowed;
          if (c === "Duplex") return p.features.includes("Duplex");
          return false;
        });
        if (!ok) return false;
      }

      return true;
    });
  }, [chatFilters, searchMode]);

  return (
    <section className="bg-black/20 backdrop-blur-sm">
      {/* Stat Counter + Video */}
      <div className="container px-4 py-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
          <StatCounter />
          <VideoDemo />
        </div>
      </div>

      {/* Main Content */}
      <div className="container px-4 py-8 md:py-12">
        {/* Mobile Filter Button */}
        {isMobile && (
          <div className="mb-6">
            <FilterSidebar
              filters={chatFilters}
              onFiltersChange={setChatFilters}
              searchMode={searchMode}
            />
          </div>
        )}

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          {!isMobile && (
            <FilterSidebar
              filters={chatFilters}
              onFiltersChange={setChatFilters}
              searchMode={searchMode}
            />
          )}

          {/* Property Grid/Map */}
          <div className="flex-1 min-w-0">
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
                    viewMode === "grid" && "bg-accent text-accent-foreground",
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
                    viewMode === "map" && "bg-accent text-accent-foreground",
                  )}
                  title="Map View"
                >
                  <MapIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

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
