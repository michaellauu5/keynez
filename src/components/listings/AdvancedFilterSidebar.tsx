import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Filter, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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

const propertyTypes = ["Apartment", "House", "Villa", "Studio", "Penthouse", "Commercial"];
const floorLevelOptions = ["Low (1-10)", "Mid (11-25)", "High (26-40)", "Ultra High (40+)"];
const buildingAgeOptions = ["New (<5 years)", "Recent (5-10)", "Established (10-20)", "Older (20+)"];
const orientationOptions = ["North", "South", "East", "West"];
const developerOptions = ["Sun Hung Kai", "Henderson Land", "New World", "Cheung Kong", "Sino Land", "Wheelock", "Swire Properties", "Kerry Properties"];
const amenityOptions = ["Pool", "Gym", "Parking", "Pet-friendly", "Furnished", "Sea View", "Balcony", "Garden"];
const bedroomOptions = [0, 1, 2, 3, 4, 5];
const bathroomOptions = [1, 2, 3, 4];

function FilterSection({ title, children, defaultOpen = true, badge }: { title: string; children: React.ReactNode; defaultOpen?: boolean; badge?: number }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border-b border-border py-4">
      <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-medium text-foreground">
        <span className="flex items-center gap-2">
          {title}
          {badge !== undefined && badge > 0 && <Badge variant="secondary" className="rounded-full px-2 py-0 text-[11px]">{badge}</Badge>}
        </span>
        {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3 pt-4">{children}</CollapsibleContent>
    </Collapsible>
  );
}

function FilterContent({ filters, onFiltersChange, transactionType }: { filters: FilterState; onFiltersChange: (filters: FilterState) => void; transactionType: "sale" | "rent" }) {
  const [developerSearch, setDeveloperSearch] = useState("");
  const maxPrice = transactionType === "sale" ? 90000000 : 100000;
  const minPrice = transactionType === "sale" ? 1000000 : 2000;
  const priceStep = transactionType === "sale" ? 500000 : 1000;

  const filteredDevelopers = useMemo(
    () => developerOptions.filter((developer) => developer.toLowerCase().includes(developerSearch.toLowerCase())),
    [developerSearch]
  );

  const toggleValue = <T,>(values: T[], value: T) => (values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);

  const clearAll = () => {
    onFiltersChange({
      districts: [],
      propertyTypes: [],
      priceRange: [minPrice, maxPrice],
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

  const formatPrice = (value: number) =>
    transactionType === "sale" ? `HK$${(value / 1000000).toFixed(value >= 10000000 ? 0 : 1)}M` : `HK$${value.toLocaleString()}`;

  return (
    <div className="rounded-md border border-border bg-card px-5 py-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-normal text-muted-foreground">All filters</p>
          <h3 className="mt-1 text-lg font-semibold text-foreground">Refine your search</h3>
        </div>
        <Button variant="ghost" size="sm" className="rounded-full text-xs" onClick={clearAll}>
          <X className="mr-1 h-3 w-3" />
          Clear all
        </Button>
      </div>

      <FilterSection title="District" badge={filters.districts.length}>
        <ScrollArea className="h-48">
          <div className="space-y-4 pr-4">
            {regionOptions.map(({ region, districts }) => (
              <div key={region} className="space-y-2">
                <p className="text-xs uppercase tracking-normal text-muted-foreground">{region}</p>
                {districts.map((district) => (
                  <div key={district} className="flex items-center gap-3">
                    <Checkbox checked={filters.districts.includes(district)} onCheckedChange={() => onFiltersChange({ ...filters, districts: toggleValue(filters.districts, district) })} />
                    <Label className="text-sm text-foreground">{district}</Label>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </ScrollArea>
      </FilterSection>

      <FilterSection title="Property Type" badge={filters.propertyTypes.length}>
        <div className="grid grid-cols-2 gap-2">
          {propertyTypes.map((type) => (
            <Button key={type} variant={filters.propertyTypes.includes(type) ? "default" : "outline"} size="sm" className="justify-start rounded-full" onClick={() => onFiltersChange({ ...filters, propertyTypes: toggleValue(filters.propertyTypes, type) })}>
              {type}
            </Button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Price Range">
        <div className="space-y-4 px-1">
          <Slider value={filters.priceRange} onValueChange={(value) => onFiltersChange({ ...filters, priceRange: value as [number, number] })} max={maxPrice} min={minPrice} step={priceStep} />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatPrice(filters.priceRange[0])}</span>
            <span>{formatPrice(filters.priceRange[1])}</span>
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Size (sqft)">
        <div className="space-y-4 px-1">
          <Slider value={filters.sizeRange} onValueChange={(value) => onFiltersChange({ ...filters, sizeRange: value as [number, number] })} max={5000} min={0} step={100} />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{filters.sizeRange[0].toLocaleString()} sqft</span>
            <span>{filters.sizeRange[1].toLocaleString()} sqft</span>
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Bedrooms" badge={filters.bedrooms.length}>
        <div className="flex flex-wrap gap-2">
          {bedroomOptions.map((num) => (
            <Button key={num} variant={filters.bedrooms.includes(num) ? "default" : "outline"} size="sm" className="min-w-10 rounded-full" onClick={() => onFiltersChange({ ...filters, bedrooms: toggleValue(filters.bedrooms, num) })}>
              {num === 0 ? "Studio" : num === 5 ? "5+" : num}
            </Button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Bathrooms" badge={filters.bathrooms.length}>
        <div className="flex flex-wrap gap-2">
          {bathroomOptions.map((num) => (
            <Button key={num} variant={filters.bathrooms.includes(num) ? "default" : "outline"} size="sm" className="min-w-10 rounded-full" onClick={() => onFiltersChange({ ...filters, bathrooms: toggleValue(filters.bathrooms, num) })}>
              {num === 4 ? "4+" : num}
            </Button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Floor Level" badge={filters.floorLevels.length} defaultOpen={false}>
        <div className="space-y-2">
          {floorLevelOptions.map((level) => (
            <div key={level} className="flex items-center gap-3">
              <Checkbox checked={filters.floorLevels.includes(level)} onCheckedChange={() => onFiltersChange({ ...filters, floorLevels: toggleValue(filters.floorLevels, level) })} />
              <Label className="text-sm text-foreground">{level}</Label>
            </div>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Building Age" badge={filters.buildingAge.length} defaultOpen={false}>
        <div className="space-y-2">
          {buildingAgeOptions.map((age) => (
            <div key={age} className="flex items-center gap-3">
              <Checkbox checked={filters.buildingAge.includes(age)} onCheckedChange={() => onFiltersChange({ ...filters, buildingAge: toggleValue(filters.buildingAge, age) })} />
              <Label className="text-sm text-foreground">{age}</Label>
            </div>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Orientation" badge={filters.orientations.length} defaultOpen={false}>
        <div className="flex flex-wrap gap-2">
          {orientationOptions.map((orientation) => (
            <Button key={orientation} variant={filters.orientations.includes(orientation) ? "default" : "outline"} size="sm" className="rounded-full" onClick={() => onFiltersChange({ ...filters, orientations: toggleValue(filters.orientations, orientation) })}>
              {orientation}
            </Button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Developer" badge={filters.developers.length} defaultOpen={false}>
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={developerSearch} onChange={(e) => setDeveloperSearch(e.target.value)} placeholder="Search developer" className="h-10 rounded-full pl-9" />
          </div>
          <ScrollArea className="h-32">
            <div className="space-y-2 pr-4">
              {filteredDevelopers.map((developer) => (
                <div key={developer} className="flex items-center gap-3">
                  <Checkbox checked={filters.developers.includes(developer)} onCheckedChange={() => onFiltersChange({ ...filters, developers: toggleValue(filters.developers, developer) })} />
                  <Label className="text-sm text-foreground">{developer}</Label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </FilterSection>

      <FilterSection title="Amenities" badge={filters.amenities.length} defaultOpen={false}>
        <div className="grid grid-cols-2 gap-2">
          {amenityOptions.map((amenity) => (
            <div key={amenity} className="flex items-center gap-3">
              <Checkbox checked={filters.amenities.includes(amenity)} onCheckedChange={() => onFiltersChange({ ...filters, amenities: toggleValue(filters.amenities, amenity) })} />
              <Label className="text-sm text-foreground">{amenity}</Label>
            </div>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Transit" badge={filters.nearMTR ? 1 : 0} defaultOpen={false}>
        <div className="flex items-center gap-3">
          <Checkbox checked={filters.nearMTR} onCheckedChange={(checked) => onFiltersChange({ ...filters, nearMTR: Boolean(checked) })} />
          <Label className="text-sm text-foreground">Near MTR station</Label>
        </div>
      </FilterSection>
    </div>
  );
}

export function AdvancedFilterSidebar({ filters, onFiltersChange, transactionType, activeFilterCount }: AdvancedFilterSidebarProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="h-10 rounded-full px-4">
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {activeFilterCount > 0 && <Badge variant="secondary" className="ml-2 rounded-full px-2 py-0 text-[11px]">{activeFilterCount}</Badge>}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[340px] bg-background p-0">
          <SheetHeader className="border-b border-border px-4 py-4">
            <SheetTitle>All Filters</SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-72px)] p-4">
            <FilterContent filters={filters} onFiltersChange={onFiltersChange} transactionType={transactionType} />
          </ScrollArea>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="sticky top-24 h-[calc(100vh-120px)] w-80 shrink-0">
      <ScrollArea className="h-full pr-4">
        <FilterContent filters={filters} onFiltersChange={onFiltersChange} transactionType={transactionType} />
      </ScrollArea>
    </div>
  );
}
