import { useState } from "react";
import { ChevronDown, ChevronUp, X, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { regionOptions } from "@/data/mockProperties";

export interface FilterState {
  districts: string[];
  propertyTypes: string[];
  priceRange: [number, number];
  sizeRange: [number, number];
  bedrooms: number[];
  bathrooms: number[];
  floorLevels: string[];
  buildingAge: string[];
  orientations: string[];
  developers: string[];
  amenities: string[];
  nearMTR: boolean;
  hasBusRoutes: boolean;
}

interface AdvancedFilterSidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  transactionType: "sale" | "rent";
  activeFilterCount: number;
}

const propertyTypes = ["Apartment", "House", "Villa", "Studio", "Penthouse", "Commercial", "Parking"];
const floorLevelOptions = ["Low (1-10)", "Mid (11-25)", "High (26-40)", "Ultra High (40+)"];
const buildingAgeOptions = ["New (<5 years)", "Recent (5-10)", "Established (10-20)", "Older (20+)"];
const orientationOptions = ["North", "South", "East", "West"];
const developerOptions = ["Sun Hung Kai", "Henderson Land", "New World", "Cheung Kong", "Sino Land", "Wheelock", "Swire Properties", "Kerry Properties"];
const amenityOptions = ["Pool", "Gym", "Parking", "Pet-friendly", "Furnished", "Sea View", "Balcony", "Garden"];

const bedroomOptions = [0, 1, 2, 3, 4, 5]; // 0 = Studio
const bathroomOptions = [1, 2, 3, 4];

function FilterSection({ 
  title, 
  children, 
  defaultOpen = true,
  badge
}: { 
  title: string; 
  children: React.ReactNode; 
  defaultOpen?: boolean;
  badge?: number;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border-b border-border pb-4">
      <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium hover:text-foreground/80">
        <span className="flex items-center gap-2">
          {title}
          {badge !== undefined && badge > 0 && (
            <Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-[10px]">
              {badge}
            </Badge>
          )}
        </span>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2 space-y-2">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

function FilterContent({ 
  filters, 
  onFiltersChange, 
  transactionType 
}: { 
  filters: FilterState; 
  onFiltersChange: (filters: FilterState) => void;
  transactionType: "sale" | "rent";
}) {
  const [developerSearch, setDeveloperSearch] = useState("");

  const maxPrice = transactionType === "sale" ? 200000000 : 200000;
  const priceStep = transactionType === "sale" ? 1000000 : 1000;
  
  const formatPrice = (value: number) => {
    if (transactionType === "sale") {
      return value >= 1000000 ? `${(value / 1000000).toFixed(0)}M` : `${(value / 1000).toFixed(0)}K`;
    }
    return `${(value / 1000).toFixed(0)}K`;
  };

  const toggleArrayValue = <T,>(array: T[], value: T): T[] => {
    return array.includes(value) 
      ? array.filter(v => v !== value)
      : [...array, value];
  };

  const handleClearAll = () => {
    onFiltersChange({
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
    });
  };

  const filteredDevelopers = developerOptions.filter(d => 
    d.toLowerCase().includes(developerSearch.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Clear All Button */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Filters</h3>
        <Button variant="ghost" size="sm" onClick={handleClearAll} className="h-8 text-xs text-muted-foreground">
          <X className="h-3 w-3 mr-1" />
          Clear All
        </Button>
      </div>

      {/* District Filter */}
      <FilterSection title="District" badge={filters.districts.length}>
        <ScrollArea className="h-48">
          <div className="space-y-2 pr-4">
            {regionOptions.map(({ region, districts }) => (
              <div key={region} className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">{region}</p>
                {districts.map((district) => (
                  <div key={district} className="flex items-center space-x-2">
                    <Checkbox
                      id={`district-${district}`}
                      checked={filters.districts.includes(district)}
                      onCheckedChange={() => 
                        onFiltersChange({ 
                          ...filters, 
                          districts: toggleArrayValue(filters.districts, district) 
                        })
                      }
                    />
                    <Label htmlFor={`district-${district}`} className="text-sm cursor-pointer">
                      {district}
                    </Label>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </ScrollArea>
      </FilterSection>

      {/* Property Type */}
      <FilterSection title="Property Type" badge={filters.propertyTypes.length}>
        <div className="grid grid-cols-2 gap-2">
          {propertyTypes.map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={`type-${type}`}
                checked={filters.propertyTypes.includes(type)}
                onCheckedChange={() => 
                  onFiltersChange({ 
                    ...filters, 
                    propertyTypes: toggleArrayValue(filters.propertyTypes, type) 
                  })
                }
              />
              <Label htmlFor={`type-${type}`} className="text-sm cursor-pointer">
                {type}
              </Label>
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price Range">
        <div className="space-y-4 px-1">
          <Slider
            value={filters.priceRange}
            onValueChange={(value) => onFiltersChange({ ...filters, priceRange: value as [number, number] })}
            max={maxPrice}
            min={0}
            step={priceStep}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>HK${formatPrice(filters.priceRange[0])}</span>
            <span>HK${formatPrice(filters.priceRange[1])}{transactionType === "rent" ? "/mo" : ""}</span>
          </div>
        </div>
      </FilterSection>

      {/* Size Range */}
      <FilterSection title="Size (sqft)">
        <div className="space-y-4 px-1">
          <Slider
            value={filters.sizeRange}
            onValueChange={(value) => onFiltersChange({ ...filters, sizeRange: value as [number, number] })}
            max={5000}
            min={0}
            step={100}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{filters.sizeRange[0].toLocaleString()} sqft</span>
            <span>{filters.sizeRange[1].toLocaleString()} sqft</span>
          </div>
        </div>
      </FilterSection>

      {/* Bedrooms */}
      <FilterSection title="Bedrooms" badge={filters.bedrooms.length}>
        <div className="flex flex-wrap gap-2">
          {bedroomOptions.map((num) => (
            <Button
              key={num}
              variant={filters.bedrooms.includes(num) ? "default" : "outline"}
              size="sm"
              onClick={() => 
                onFiltersChange({ 
                  ...filters, 
                  bedrooms: toggleArrayValue(filters.bedrooms, num) 
                })
              }
              className="h-8 min-w-10"
            >
              {num === 0 ? "Studio" : num === 5 ? "5+" : num}
            </Button>
          ))}
        </div>
      </FilterSection>

      {/* Bathrooms */}
      <FilterSection title="Bathrooms" badge={filters.bathrooms.length}>
        <div className="flex flex-wrap gap-2">
          {bathroomOptions.map((num) => (
            <Button
              key={num}
              variant={filters.bathrooms.includes(num) ? "default" : "outline"}
              size="sm"
              onClick={() => 
                onFiltersChange({ 
                  ...filters, 
                  bathrooms: toggleArrayValue(filters.bathrooms, num) 
                })
              }
              className="h-8 min-w-10"
            >
              {num === 4 ? "4+" : num}
            </Button>
          ))}
        </div>
      </FilterSection>

      {/* Floor Level */}
      <FilterSection title="Floor Level" badge={filters.floorLevels.length} defaultOpen={false}>
        <div className="space-y-2">
          {floorLevelOptions.map((level) => (
            <div key={level} className="flex items-center space-x-2">
              <Checkbox
                id={`floor-${level}`}
                checked={filters.floorLevels.includes(level)}
                onCheckedChange={() => 
                  onFiltersChange({ 
                    ...filters, 
                    floorLevels: toggleArrayValue(filters.floorLevels, level) 
                  })
                }
              />
              <Label htmlFor={`floor-${level}`} className="text-sm cursor-pointer">
                {level}
              </Label>
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Building Age */}
      <FilterSection title="Building Age" badge={filters.buildingAge.length} defaultOpen={false}>
        <div className="space-y-2">
          {buildingAgeOptions.map((age) => (
            <div key={age} className="flex items-center space-x-2">
              <Checkbox
                id={`age-${age}`}
                checked={filters.buildingAge.includes(age)}
                onCheckedChange={() => 
                  onFiltersChange({ 
                    ...filters, 
                    buildingAge: toggleArrayValue(filters.buildingAge, age) 
                  })
                }
              />
              <Label htmlFor={`age-${age}`} className="text-sm cursor-pointer">
                {age}
              </Label>
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Orientation */}
      <FilterSection title="Orientation" badge={filters.orientations.length} defaultOpen={false}>
        <div className="flex flex-wrap gap-2">
          {orientationOptions.map((dir) => (
            <Button
              key={dir}
              variant={filters.orientations.includes(dir) ? "default" : "outline"}
              size="sm"
              onClick={() => 
                onFiltersChange({ 
                  ...filters, 
                  orientations: toggleArrayValue(filters.orientations, dir) 
                })
              }
              className="h-8"
            >
              {dir}
            </Button>
          ))}
        </div>
      </FilterSection>

      {/* Developer */}
      <FilterSection title="Developer" badge={filters.developers.length} defaultOpen={false}>
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search developer..."
              value={developerSearch}
              onChange={(e) => setDeveloperSearch(e.target.value)}
              className="pl-8 h-8"
            />
          </div>
          <ScrollArea className="h-32">
            <div className="space-y-2 pr-4">
              {filteredDevelopers.map((developer) => (
                <div key={developer} className="flex items-center space-x-2">
                  <Checkbox
                    id={`developer-${developer}`}
                    checked={filters.developers.includes(developer)}
                    onCheckedChange={() => 
                      onFiltersChange({ 
                        ...filters, 
                        developers: toggleArrayValue(filters.developers, developer) 
                      })
                    }
                  />
                  <Label htmlFor={`developer-${developer}`} className="text-sm cursor-pointer">
                    {developer}
                  </Label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </FilterSection>

      {/* Amenities */}
      <FilterSection title="Amenities" badge={filters.amenities.length} defaultOpen={false}>
        <div className="grid grid-cols-2 gap-2">
          {amenityOptions.map((amenity) => (
            <div key={amenity} className="flex items-center space-x-2">
              <Checkbox
                id={`amenity-${amenity}`}
                checked={filters.amenities.includes(amenity)}
                onCheckedChange={() => 
                  onFiltersChange({ 
                    ...filters, 
                    amenities: toggleArrayValue(filters.amenities, amenity) 
                  })
                }
              />
              <Label htmlFor={`amenity-${amenity}`} className="text-sm cursor-pointer">
                {amenity}
              </Label>
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Transportation */}
      <FilterSection title="Transportation" badge={(filters.nearMTR ? 1 : 0) + (filters.hasBusRoutes ? 1 : 0)} defaultOpen={false}>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="near-mtr"
              checked={filters.nearMTR}
              onCheckedChange={(checked) => 
                onFiltersChange({ ...filters, nearMTR: checked as boolean })
              }
            />
            <Label htmlFor="near-mtr" className="text-sm cursor-pointer">
              Near MTR Station
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="bus-routes"
              checked={filters.hasBusRoutes}
              onCheckedChange={(checked) => 
                onFiltersChange({ ...filters, hasBusRoutes: checked as boolean })
              }
            />
            <Label htmlFor="bus-routes" className="text-sm cursor-pointer">
              Bus Routes Nearby
            </Label>
          </div>
        </div>
      </FilterSection>
    </div>
  );
}

export function AdvancedFilterSidebar({ 
  filters, 
  onFiltersChange, 
  transactionType,
  activeFilterCount
}: AdvancedFilterSidebarProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1.5">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[320px] p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-80px)] p-4">
            <FilterContent 
              filters={filters} 
              onFiltersChange={onFiltersChange} 
              transactionType={transactionType}
            />
          </ScrollArea>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="w-72 shrink-0 sticky top-20 h-[calc(100vh-100px)]">
      <ScrollArea className="h-full pr-4">
        <FilterContent 
          filters={filters} 
          onFiltersChange={onFiltersChange}
          transactionType={transactionType}
        />
      </ScrollArea>
    </div>
  );
}
