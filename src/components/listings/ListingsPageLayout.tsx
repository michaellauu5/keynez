import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { PropertyGrid } from "@/components/landing/PropertyGrid";
import { AdvancedFilterSidebar, type FilterState } from "./AdvancedFilterSidebar";
import { ResultsHeader, type SortOption, type ViewMode } from "./ResultsHeader";
import { GoogleMapView } from "@/components/map/GoogleMapView";
import { SaveSearchDialog } from "./SaveSearchDialog";
import { mockProperties } from "@/data/mockProperties";
import { useIsMobile } from "@/hooks/use-mobile";

interface ListingsPageLayoutProps {
  transactionType: "sale" | "rent";
  title: string;
}

function getDefaultFilters(transactionType: "sale" | "rent"): FilterState {
  return {
    districts: [],
    propertyTypes: [],
    priceRange: transactionType === "sale" ? [1000000, 90000000] : [2000, 100000],
    sizeRange: [0, 5000],
    bedrooms: [],
    bathrooms: [],
    floorLevels: [],
    buildingAge: [],
    orientations: [],
    developers: [],
    amenities: [],
    nearMTR: false,
    hasBusRoutes: false,
  };
}

function countActiveFilters(filters: FilterState, transactionType: "sale" | "rent") {
  const defaults = getDefaultFilters(transactionType);
  return [
    filters.districts.length > 0,
    filters.propertyTypes.length > 0,
    filters.bedrooms.length > 0,
    filters.bathrooms.length > 0,
    filters.floorLevels.length > 0,
    filters.buildingAge.length > 0,
    filters.orientations.length > 0,
    filters.developers.length > 0,
    filters.amenities.length > 0,
    filters.nearMTR,
    filters.priceRange[0] !== defaults.priceRange[0] || filters.priceRange[1] !== defaults.priceRange[1],
    filters.sizeRange[0] !== defaults.sizeRange[0] || filters.sizeRange[1] !== defaults.sizeRange[1],
  ].filter(Boolean).length;
}

export function ListingsPageLayout({ transactionType, title }: ListingsPageLayoutProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const [filters, setFilters] = useState<FilterState>(() => getDefaultFilters(transactionType));
  const [sortBy, setSortBy] = useState<SortOption>("relevant");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null);

  useEffect(() => {
    const next = { ...getDefaultFilters(transactionType) };
    const districts = searchParams.get("districts");
    const bedrooms = searchParams.get("bedrooms");
    const sort = searchParams.get("sort") as SortOption | null;

    if (districts) next.districts = districts.split(",");
    if (bedrooms) next.bedrooms = bedrooms.split(",").map(Number);
    if (sort) setSortBy(sort);

    setFilters(next);
  }, [searchParams, transactionType]);

  const handleFiltersChange = (nextFilters: FilterState) => {
    setFilters(nextFilters);
    const params = new URLSearchParams();
    if (nextFilters.districts.length) params.set("districts", nextFilters.districts.join(","));
    if (nextFilters.bedrooms.length) params.set("bedrooms", nextFilters.bedrooms.join(","));
    if (sortBy !== "relevant") params.set("sort", sortBy);
    setSearchParams(params, { replace: true });
  };

  const filteredProperties = useMemo(() => {
    const filtered = mockProperties.filter((property) => {
      if (property.priceType !== transactionType) return false;
      if (filters.districts.length > 0 && !filters.districts.includes(property.district)) return false;
      if (filters.propertyTypes.length > 0 && !filters.propertyTypes.includes(property.propertyType)) return false;
      if (property.price < filters.priceRange[0] || property.price > filters.priceRange[1]) return false;
      if (property.size < filters.sizeRange[0] || property.size > filters.sizeRange[1]) return false;
      if (filters.floorLevels.length > 0 && !filters.floorLevels.includes(property.floorLevel)) return false;
      if (filters.buildingAge.length > 0 && !filters.buildingAge.includes(property.buildingAge)) return false;
      if (filters.orientations.length > 0 && !filters.orientations.includes(property.orientation)) return false;
      if (filters.developers.length > 0 && !filters.developers.includes(property.developer)) return false;
      if (filters.nearMTR && !property.nearMTR) return false;

      if (filters.bedrooms.length > 0) {
        const matches = filters.bedrooms.some((bedrooms) => (bedrooms >= 5 ? property.bedrooms >= 5 : property.bedrooms === bedrooms));
        if (!matches) return false;
      }

      if (filters.bathrooms.length > 0) {
        const matches = filters.bathrooms.some((bathrooms) => (bathrooms >= 4 ? property.bathrooms >= 4 : property.bathrooms === bathrooms));
        if (!matches) return false;
      }

      if (filters.amenities.length > 0) {
        const amenityMatches = filters.amenities.every((amenity) => {
          if (amenity === "Pool") return property.features.includes("Pool");
          if (amenity === "Gym") return property.features.includes("Gym");
          if (amenity === "Parking") return property.hasParking;
          if (amenity === "Pet-friendly") return property.petsAllowed;
          if (amenity === "Furnished") return property.isFurnished;
          if (amenity === "Sea View") return property.features.includes("Sea View");
          if (amenity === "Balcony") return property.features.includes("Balcony");
          if (amenity === "Garden") return property.features.includes("Garden");
          return true;
        });
        if (!amenityMatches) return false;
      }

      return true;
    });

    switch (sortBy) {
      case "price_asc":
        return filtered.sort((a, b) => a.price - b.price);
      case "price_desc":
        return filtered.sort((a, b) => b.price - a.price);
      case "size_desc":
        return filtered.sort((a, b) => b.size - a.size);
      case "newest":
        return filtered.sort((a, b) => Number(b.isNew) - Number(a.isNew));
      default:
        return filtered;
    }
  }, [filters, sortBy, transactionType]);

  const activeFilterCount = countActiveFilters(filters, transactionType);

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-8 md:px-6 md:py-10">
        <nav className="mb-6 flex items-center text-sm text-muted-foreground">
          <Link to="/" className="flex items-center gap-1 transition-colors hover:text-foreground">
            <Home className="h-4 w-4" />
            Home
          </Link>
          <ChevronRight className="mx-2 h-4 w-4" />
          <span className="text-foreground">{title}</span>
        </nav>

        <div className="grid gap-6 border-b border-border pb-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs uppercase tracking-normal text-muted-foreground">{transactionType === "sale" ? "Buy" : "Rent"} listings</p>
            <h1 className="mt-3 text-4xl font-semibold text-foreground">{title}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
              A cleaner Compass-style browsing flow with aligned filters, improved spacing, and a shared results shell across the site.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-border bg-card p-4">
              <p className="text-xs uppercase tracking-normal text-muted-foreground">Search</p>
              <p className="mt-2 text-lg font-semibold text-foreground">Compact filter rail</p>
            </div>
            <div className="rounded-md border border-border bg-card p-4">
              <p className="text-xs uppercase tracking-normal text-muted-foreground">Sort</p>
              <p className="mt-2 text-lg font-semibold text-foreground">Professional result controls</p>
            </div>
            <div className="rounded-md border border-border bg-card p-4">
              <p className="text-xs uppercase tracking-normal text-muted-foreground">View</p>
              <p className="mt-2 text-lg font-semibold text-foreground">Grid, map, or split</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-8">
          {!isMobile && (
            <AdvancedFilterSidebar
              filters={filters}
              onFiltersChange={handleFiltersChange}
              transactionType={transactionType}
              activeFilterCount={activeFilterCount}
            />
          )}

          <div className="min-w-0 flex-1">
            <div className="mb-6 flex flex-col gap-4">
              {isMobile && (
                <AdvancedFilterSidebar
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  transactionType={transactionType}
                  activeFilterCount={activeFilterCount}
                />
              )}
              <div className="sticky top-24 z-20">
                <ResultsHeader
                  totalCount={filteredProperties.length}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  onSaveSearch={() => setShowSaveDialog(true)}
                />
              </div>
            </div>

            {viewMode === "grid" && (
              <PropertyGrid properties={filteredProperties} onPropertyHover={setHoveredPropertyId} highlightedPropertyId={hoveredPropertyId} />
            )}
            {viewMode === "map" && (
              <GoogleMapView
                properties={filteredProperties}
                hoveredPropertyId={hoveredPropertyId}
                onPropertyHover={setHoveredPropertyId}
                activeFilterCount={activeFilterCount}
                className="h-[760px] rounded-md border border-border"
              />
            )}
            {viewMode === "split" && (
              <div className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(360px,0.88fr)]">
                <div className="min-w-0">
                  <PropertyGrid properties={filteredProperties} onPropertyHover={setHoveredPropertyId} highlightedPropertyId={hoveredPropertyId} />
                </div>
                <GoogleMapView
                  properties={filteredProperties}
                  hoveredPropertyId={hoveredPropertyId}
                  onPropertyHover={setHoveredPropertyId}
                  activeFilterCount={activeFilterCount}
                  className="sticky top-24 h-[860px] rounded-md border border-border"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <SaveSearchDialog open={showSaveDialog} onOpenChange={setShowSaveDialog} filters={filters} transactionType={transactionType} />
    </div>
  );
}
