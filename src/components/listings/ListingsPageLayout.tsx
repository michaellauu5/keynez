import { useState, useMemo, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { PropertyGrid } from "@/components/landing/PropertyGrid";
import { AdvancedFilterSidebar, type FilterState } from "./AdvancedFilterSidebar";
import { ResultsHeader, type SortOption, type ViewMode } from "./ResultsHeader";
import { GoogleMapView } from "@/components/map/GoogleMapView";
import { SaveSearchDialog } from "./SaveSearchDialog";
import { mockProperties, type PropertyListing } from "@/data/mockProperties";
import { useIsMobile } from "@/hooks/use-mobile";

interface ListingsPageLayoutProps {
  transactionType: "sale" | "rent";
  title: string;
}

function getDefaultFilters(transactionType: "sale" | "rent"): FilterState {
  const maxPrice = transactionType === "sale" ? 200000000 : 200000;
  return {
    districts: [],
    propertyTypes: [],
    priceRange: [0, maxPrice],
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

function countActiveFilters(filters: FilterState, transactionType: "sale" | "rent"): number {
  let count = 0;
  const defaults = getDefaultFilters(transactionType);
  
  if (filters.districts.length) count++;
  if (filters.propertyTypes.length) count++;
  if (filters.bedrooms.length) count++;
  if (filters.bathrooms.length) count++;
  if (filters.floorLevels.length) count++;
  if (filters.buildingAge.length) count++;
  if (filters.orientations.length) count++;
  if (filters.developers.length) count++;
  if (filters.amenities.length) count++;
  if (filters.nearMTR) count++;
  if (filters.hasBusRoutes) count++;
  if (filters.priceRange[0] !== defaults.priceRange[0] || filters.priceRange[1] !== defaults.priceRange[1]) count++;
  if (filters.sizeRange[0] !== defaults.sizeRange[0] || filters.sizeRange[1] !== defaults.sizeRange[1]) count++;
  
  return count;
}

export function ListingsPageLayout({ transactionType, title }: ListingsPageLayoutProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile();
  
  const [filters, setFilters] = useState<FilterState>(() => getDefaultFilters(transactionType));
  const [sortBy, setSortBy] = useState<SortOption>("relevant");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null);

  // Sync filters from URL on mount
  useEffect(() => {
    const urlFilters = { ...getDefaultFilters(transactionType) };
    
    const districts = searchParams.get("districts");
    if (districts) urlFilters.districts = districts.split(",");
    
    const bedrooms = searchParams.get("bedrooms");
    if (bedrooms) urlFilters.bedrooms = bedrooms.split(",").map(Number);
    
    const sort = searchParams.get("sort") as SortOption;
    if (sort) setSortBy(sort);
    
    setFilters(urlFilters);
  }, [searchParams, transactionType]);

  // Update URL when filters change
  const updateURL = (newFilters: FilterState) => {
    const params = new URLSearchParams();
    
    if (newFilters.districts.length) {
      params.set("districts", newFilters.districts.join(","));
    }
    if (newFilters.bedrooms.length) {
      params.set("bedrooms", newFilters.bedrooms.join(","));
    }
    if (sortBy !== "relevant") {
      params.set("sort", sortBy);
    }
    
    setSearchParams(params, { replace: true });
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    updateURL(newFilters);
  };

  // Filter and sort properties
  const filteredProperties = useMemo(() => {
    let result = mockProperties.filter(p => p.priceType === transactionType);

    // Apply filters
    if (filters.districts.length) {
      result = result.filter(p => filters.districts.includes(p.district));
    }
    if (filters.propertyTypes.length) {
      result = result.filter(p => filters.propertyTypes.includes(p.propertyType));
    }
    if (filters.bedrooms.length) {
      result = result.filter(p => {
        if (filters.bedrooms.includes(5)) {
          return filters.bedrooms.includes(p.bedrooms) || p.bedrooms >= 5;
        }
        if (filters.bedrooms.includes(0)) {
          return filters.bedrooms.includes(p.bedrooms) || p.bedrooms === 0;
        }
        return filters.bedrooms.includes(p.bedrooms);
      });
    }
    if (filters.bathrooms.length) {
      result = result.filter(p => {
        if (filters.bathrooms.includes(4)) {
          return filters.bathrooms.includes(p.bathrooms) || p.bathrooms >= 4;
        }
        return filters.bathrooms.includes(p.bathrooms);
      });
    }
    
    // Price range
    result = result.filter(p => 
      p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );
    
    // Size range
    result = result.filter(p => 
      p.size >= filters.sizeRange[0] && p.size <= filters.sizeRange[1]
    );

    // Amenities
    if (filters.amenities.length) {
      result = result.filter(p => {
        const hasAmenities = filters.amenities.every(a => {
          if (a === "Pool") return p.features.includes("Pool");
          if (a === "Gym") return p.features.includes("Gym");
          if (a === "Parking") return p.hasParking;
          if (a === "Pet-friendly") return p.petsAllowed;
          if (a === "Furnished") return p.isFurnished;
          if (a === "Sea View") return p.features.includes("Sea View");
          if (a === "Balcony") return p.features.includes("Balcony");
          if (a === "Garden") return p.features.includes("Garden");
          return true;
        });
        return hasAmenities;
      });
    }

    // Sort
    switch (sortBy) {
      case "price_asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "size_desc":
        result.sort((a, b) => b.size - a.size);
        break;
      case "newest":
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      default:
        // relevant - no specific sorting
        break;
    }

    return result;
  }, [filters, sortBy, transactionType]);

  const activeFilterCount = countActiveFilters(filters, transactionType);

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 md:px-6 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground flex items-center gap-1">
            <Home className="h-4 w-4" />
            Home
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-foreground font-medium">{title}</span>
        </nav>

        {/* Page Title */}
        <h1 className="text-3xl font-bold text-foreground mb-6">{title}</h1>

        <div className="flex gap-8">
          {/* Filter Sidebar - Desktop */}
          {!isMobile && (
            <AdvancedFilterSidebar
              filters={filters}
              onFiltersChange={handleFiltersChange}
              transactionType={transactionType}
              activeFilterCount={activeFilterCount}
            />
          )}

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Mobile Filter Button + Results Header */}
            <div className="flex flex-col gap-4 mb-6">
              {isMobile && (
                <AdvancedFilterSidebar
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  transactionType={transactionType}
                  activeFilterCount={activeFilterCount}
                />
              )}
              
              <ResultsHeader
                totalCount={filteredProperties.length}
                sortBy={sortBy}
                onSortChange={setSortBy}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                onSaveSearch={() => setShowSaveDialog(true)}
              />
            </div>

            {/* Results */}
            {viewMode === "grid" && (
              <PropertyGrid 
                properties={filteredProperties}
                onPropertyHover={setHoveredPropertyId}
              />
            )}
            
            {viewMode === "map" && (
              <GoogleMapView
                properties={filteredProperties}
                hoveredPropertyId={hoveredPropertyId}
                onPropertyHover={setHoveredPropertyId}
                activeFilterCount={activeFilterCount}
                className="h-[600px]"
              />
            )}
            
            {viewMode === "split" && (
              <div className="grid grid-cols-2 gap-6">
                <div className="max-h-[600px] overflow-y-auto">
                  <PropertyGrid 
                    properties={filteredProperties}
                    onPropertyHover={setHoveredPropertyId}
                  />
                </div>
                <GoogleMapView
                  properties={filteredProperties}
                  hoveredPropertyId={hoveredPropertyId}
                  onPropertyHover={setHoveredPropertyId}
                  activeFilterCount={activeFilterCount}
                  className="h-[600px] sticky top-0"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Search Dialog */}
      <SaveSearchDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        filters={filters}
        transactionType={transactionType}
      />
    </div>
  );
}
