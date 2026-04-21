import { useMemo, useState } from "react";
import { FilterSidebar } from "./FilterSidebar";
import { PropertyGrid } from "./PropertyGrid";
import { GoogleMapView } from "@/components/map/GoogleMapView";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockProperties } from "@/data/mockProperties";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useFilterSync } from "@/contexts/FilterSyncContext";
import { LayoutGrid, Map, Rows3 } from "lucide-react";

type ViewMode = "grid" | "map" | "split";
type SortOption = "recommended" | "price-asc" | "price-desc" | "size-desc";

export function PropertyListingsSection() {
  const { listingFilters, setListingFilters } = useFilterSync();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortOption>("recommended");
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const filteredProperties = useMemo(() => {
    const filtered = mockProperties.filter((property) => {
      if (listingFilters.transactionType !== "all" && property.priceType !== listingFilters.transactionType) return false;
      if (listingFilters.regions.length > 0 && !listingFilters.regions.includes(property.region)) return false;
      if (listingFilters.districts.length > 0 && !listingFilters.districts.includes(property.district)) return false;
      if (listingFilters.propertyTypes.length > 0 && !listingFilters.propertyTypes.includes(property.propertyType)) return false;
      if (property.price < listingFilters.priceRange[0] || property.price > listingFilters.priceRange[1]) return false;
      if (property.size < listingFilters.sizeRange[0] || property.size > listingFilters.sizeRange[1]) return false;

      if (listingFilters.bedrooms.length > 0) {
        const match = listingFilters.bedrooms.some((bedrooms) => (bedrooms >= 5 ? property.bedrooms >= 5 : property.bedrooms === bedrooms));
        if (!match) return false;
      }

      if (listingFilters.bathrooms.length > 0) {
        const match = listingFilters.bathrooms.some((bathrooms) => (bathrooms >= 4 ? property.bathrooms >= 4 : property.bathrooms === bathrooms));
        if (!match) return false;
      }

      if (listingFilters.hasParking && !property.hasParking) return false;
      if (listingFilters.petsAllowed && !property.petsAllowed) return false;
      if (listingFilters.isFurnished && !property.isFurnished) return false;
      if (listingFilters.isNew && !property.isNew) return false;
      if (listingFilters.hasSeaView && !property.features.includes("Sea View")) return false;
      if (listingFilters.hasPool && !property.features.includes("Pool")) return false;
      if (listingFilters.hasGym && !property.features.includes("Gym")) return false;

      return true;
    });

    switch (sortBy) {
      case "price-asc":
        return filtered.sort((a, b) => a.price - b.price);
      case "price-desc":
        return filtered.sort((a, b) => b.price - a.price);
      case "size-desc":
        return filtered.sort((a, b) => b.size - a.size);
      default:
        return filtered;
    }
  }, [listingFilters, sortBy]);

  return (
    <section className="bg-background">
      <div className="container px-4 py-14 md:px-6 md:py-16">
        <div className="grid gap-6 border-b border-border pb-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-xs uppercase tracking-normal text-muted-foreground">Curated browsing</p>
            <h2 className="mt-3 text-3xl font-semibold text-foreground md:text-4xl">A more coherent way to search, compare, and refine.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
              Browse homes with a compact filter system, cleaner card layout, and a results area that keeps map and list interactions aligned.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <div className="rounded-md border border-border bg-card p-4">
              <p className="text-xs uppercase tracking-normal text-muted-foreground">Results</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{filteredProperties.length}</p>
              <p className="mt-1 text-sm text-muted-foreground">matching homes</p>
            </div>
            <div className="rounded-md border border-border bg-card p-4">
              <p className="text-xs uppercase tracking-normal text-muted-foreground">Mode</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{listingFilters.transactionType === "rent" ? "Rent" : listingFilters.transactionType === "sale" ? "Buy" : "All listings"}</p>
              <p className="mt-1 text-sm text-muted-foreground">Synchronized with hero search</p>
            </div>
            <div className="rounded-md border border-border bg-card p-4">
              <p className="text-xs uppercase tracking-normal text-muted-foreground">Map linked</p>
              <p className="mt-2 text-lg font-semibold text-foreground">Live hover state</p>
              <p className="mt-1 text-sm text-muted-foreground">Cards and pins stay coordinated</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-8">
          {!isMobile && <FilterSidebar filters={listingFilters} onFiltersChange={setListingFilters} />}

          <div className="min-w-0 flex-1">
            <div className="sticky top-24 z-20 mb-6 rounded-md border border-border bg-background/95 p-4 shadow-sm backdrop-blur-xl">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">Compass-style browsing flow</Badge>
                    <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">Professional spacing</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="text-xl font-semibold text-foreground">{filteredProperties.length}</span> properties found
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  {isMobile && <FilterSidebar filters={listingFilters} onFiltersChange={setListingFilters} />}
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value as SortOption)}
                    className="h-10 rounded-full border border-border bg-background px-4 text-sm text-foreground outline-none"
                  >
                    <option value="recommended">Recommended</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="size-desc">Size: Largest First</option>
                  </select>
                  <div className="flex overflow-hidden rounded-full border border-border bg-background">
                    <Button variant="ghost" size="sm" className={cn("rounded-none px-3", viewMode === "grid" && "bg-accent text-accent-foreground")} onClick={() => setViewMode("grid")}> <LayoutGrid className="h-4 w-4" /> </Button>
                    <Button variant="ghost" size="sm" className={cn("rounded-none border-l border-border px-3", viewMode === "map" && "bg-accent text-accent-foreground")} onClick={() => setViewMode("map")}> <Map className="h-4 w-4" /> </Button>
                    {!isMobile && <Button variant="ghost" size="sm" className={cn("rounded-none border-l border-border px-3", viewMode === "split" && "bg-accent text-accent-foreground")} onClick={() => setViewMode("split")}><Rows3 className="h-4 w-4" /></Button>}
                  </div>
                </div>
              </div>
            </div>

            {viewMode === "grid" && <PropertyGrid properties={filteredProperties} onPropertyHover={setHoveredPropertyId} highlightedPropertyId={hoveredPropertyId} />}
            {viewMode === "map" && (
              <GoogleMapView
                properties={filteredProperties}
                hoveredPropertyId={hoveredPropertyId}
                onPropertyHover={setHoveredPropertyId}
                className="h-[720px] rounded-md border border-border"
              />
            )}
            {viewMode === "split" && (
              <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.85fr)]">
                <div className="min-w-0">
                  <PropertyGrid properties={filteredProperties} onPropertyHover={setHoveredPropertyId} highlightedPropertyId={hoveredPropertyId} />
                </div>
                <GoogleMapView
                  properties={filteredProperties}
                  hoveredPropertyId={hoveredPropertyId}
                  onPropertyHover={setHoveredPropertyId}
                  className="sticky top-24 h-[820px] rounded-md border border-border"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
