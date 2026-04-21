import { useState } from "react";
import { ChevronDown, ChevronUp, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { regionOptions } from "@/data/mockProperties";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "@/hooks/useTranslation";
export interface FilterState {
  transactionType: "all" | "sale" | "rent";
  regions: string[];
  districts: string[];
  propertyTypes: string[];
  priceRange: [number, number];
  sizeRange: [number, number];
  bedrooms: number[];
  bathrooms: number[];
  hasParking: boolean | null;
  petsAllowed: boolean | null;
  isFurnished: boolean | null;
  isNew: boolean | null;
  hasSeaView: boolean | null;
  hasPool: boolean | null;
  hasGym: boolean | null;
}
interface FilterSidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}
const propertyTypeOptions = ["Apartment", "House", "Studio", "Penthouse", "Commercial"];
const bedroomOptions = [0, 1, 2, 3, 4, 5];
const bathroomOptions = [1, 2, 3, 4];
function FilterContent({
  filters,
  onFiltersChange
}: FilterSidebarProps) {
  const {
    t
  } = useTranslation();
  const [openSections, setOpenSections] = useState<string[]>(["type", "district", "price"]);
  const toggleSection = (section: string) => {
    setOpenSections(prev => prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]);
  };
  const toggleArrayFilter = <K extends keyof FilterState,>(key: K, value: string | number) => {
    const current = filters[key] as (string | number)[];
    const updated = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
    onFiltersChange({
      ...filters,
      [key]: updated
    });
  };
  const activeFilterCount = [filters.transactionType !== "all" ? 1 : 0, filters.regions.length, filters.districts.length, filters.propertyTypes.length, filters.priceRange[0] > 0 || filters.priceRange[1] < 200000000 ? 1 : 0, filters.sizeRange[0] > 0 || filters.sizeRange[1] < 5000 ? 1 : 0, filters.bedrooms.length, filters.bathrooms.length, filters.hasParking ? 1 : 0, filters.petsAllowed ? 1 : 0, filters.isFurnished ? 1 : 0, filters.isNew ? 1 : 0, filters.hasSeaView ? 1 : 0, filters.hasPool ? 1 : 0, filters.hasGym ? 1 : 0].reduce((a, b) => a + b, 0);
  const clearAllFilters = () => {
    onFiltersChange({
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
      hasGym: null
    });
  };
  const formatPrice = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(0)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };
  const moreFiltersConfig = [{
    key: "hasParking",
    labelKey: "filter.parking"
  }, {
    key: "petsAllowed",
    labelKey: "filter.petsAllowed"
  }, {
    key: "isFurnished",
    labelKey: "filter.furnished"
  }, {
    key: "isNew",
    labelKey: "filter.newBuild"
  }, {
    key: "hasSeaView",
    labelKey: "filter.seaView"
  }, {
    key: "hasPool",
    labelKey: "filter.pool"
  }, {
    key: "hasGym",
    labelKey: "filter.gym"
  }];
  return <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <h3 className="font-semibold text-primary-foreground">{t('filter.filters')}</h3>
        {activeFilterCount > 0 && <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-8 text-xs">
            {t('filter.clearAll')} ({activeFilterCount})
          </Button>}
      </div>

      {/* Transaction Type */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg">
        {(["all", "sale", "rent"] as const).map(type => <Button key={type} variant={filters.transactionType === type ? "default" : "ghost"} size="sm" className={cn("flex-1 h-8 text-xs capitalize", filters.transactionType === type && "bg-accent text-accent-foreground")} onClick={() => onFiltersChange({
        ...filters,
        transactionType: type
      })}>
            {type === "all" ? t('filter.all') : type === "sale" ? t('filter.forSale') : t('filter.forRent')}
          </Button>)}
      </div>

      {/* District/Area */}
      <Collapsible open={openSections.includes("district")} onOpenChange={() => toggleSection("district")}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium">
          {t('filter.district')}
          {openSections.includes("district") ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-2">
          {regionOptions.map(({
          region,
          districts
        }) => <div key={region} className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox id={`region-${region}`} checked={filters.regions.includes(region)} onCheckedChange={() => toggleArrayFilter("regions", region)} />
                <label htmlFor={`region-${region}`} className="text-sm font-medium cursor-pointer">
                  {region}
                </label>
              </div>
              {filters.regions.includes(region) && <div className="ml-6 space-y-1.5">
                  {districts.map(district => <div key={district} className="flex items-center gap-2">
                      <Checkbox id={`district-${district}`} checked={filters.districts.includes(district)} onCheckedChange={() => toggleArrayFilter("districts", district)} />
                      <label htmlFor={`district-${district}`} className="text-xs cursor-pointer">
                        {district}
                      </label>
                    </div>)}
                </div>}
            </div>)}
        </CollapsibleContent>
      </Collapsible>

      {/* Property Type */}
      <Collapsible open={openSections.includes("type")} onOpenChange={() => toggleSection("type")}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium">
          {t('filter.propertyType')}
          {openSections.includes("type") ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          {propertyTypeOptions.map(type => <div key={type} className="flex items-center gap-2">
              <Checkbox id={`type-${type}`} checked={filters.propertyTypes.includes(type)} onCheckedChange={() => toggleArrayFilter("propertyTypes", type)} />
              <label htmlFor={`type-${type}`} className="text-sm cursor-pointer">
                {type}
              </label>
            </div>)}
        </CollapsibleContent>
      </Collapsible>

      {/* Price Range */}
      <Collapsible open={openSections.includes("price")} onOpenChange={() => toggleSection("price")}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium">
          {t('filter.priceRange')}
          {openSections.includes("price") ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 pb-2">
          <Slider value={filters.priceRange} onValueChange={value => onFiltersChange({
          ...filters,
          priceRange: value as [number, number]
        })} min={0} max={200000000} step={1000000} className="mb-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatPrice(filters.priceRange[0])}</span>
            <span>{formatPrice(filters.priceRange[1])}</span>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Size Range */}
      <Collapsible open={openSections.includes("size")} onOpenChange={() => toggleSection("size")}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium">
          {t('filter.size')}
          {openSections.includes("size") ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 pb-2">
          <Slider value={filters.sizeRange} onValueChange={value => onFiltersChange({
          ...filters,
          sizeRange: value as [number, number]
        })} min={0} max={5000} step={100} className="mb-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{filters.sizeRange[0]} sqft</span>
            <span>{filters.sizeRange[1]} sqft</span>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Bedrooms */}
      <Collapsible open={openSections.includes("bedrooms")} onOpenChange={() => toggleSection("bedrooms")}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium">
          {t('filter.bedrooms')}
          {openSections.includes("bedrooms") ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <div className="flex flex-wrap gap-2">
            {bedroomOptions.map(num => <Button key={num} variant={filters.bedrooms.includes(num) ? "default" : "outline"} size="sm" className={cn("h-8 w-12 text-xs", filters.bedrooms.includes(num) && "bg-accent text-accent-foreground")} onClick={() => toggleArrayFilter("bedrooms", num)}>
                {num === 0 ? "Studio" : num === 5 ? "5+" : num}
              </Button>)}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Bathrooms */}
      <Collapsible open={openSections.includes("bathrooms")} onOpenChange={() => toggleSection("bathrooms")}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium">
          {t('filter.bathrooms')}
          {openSections.includes("bathrooms") ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <div className="flex flex-wrap gap-2">
            {bathroomOptions.map(num => <Button key={num} variant={filters.bathrooms.includes(num) ? "default" : "outline"} size="sm" className={cn("h-8 w-12 text-xs", filters.bathrooms.includes(num) && "bg-accent text-accent-foreground")} onClick={() => toggleArrayFilter("bathrooms", num)}>
                {num === 4 ? "4+" : num}
              </Button>)}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Additional Filters */}
      <Collapsible open={openSections.includes("more")} onOpenChange={() => toggleSection("more")}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium">
          {t('filter.moreFilters')}
          {openSections.includes("more") ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-2">
          {moreFiltersConfig.map(({
          key,
          labelKey
        }) => <div key={key} className="flex items-center gap-2">
              <Checkbox id={key} checked={filters[key as keyof FilterState] === true} onCheckedChange={checked => onFiltersChange({
            ...filters,
            [key]: checked ? true : null
          })} />
              <label htmlFor={key} className="text-sm cursor-pointer">
                {t(labelKey)}
              </label>
            </div>)}
        </CollapsibleContent>
      </Collapsible>
    </div>;
}
export function FilterSidebar({
  filters,
  onFiltersChange
}: FilterSidebarProps) {
  const {
    t
  } = useTranslation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const activeFilterCount = [filters.transactionType !== "all" ? 1 : 0, filters.regions.length, filters.propertyTypes.length, filters.bedrooms.length].reduce((a, b) => a + b, 0);
  if (isMobile) {
    return <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            {t('filter.filters')}
            {activeFilterCount > 0 && <span className="ml-1 bg-accent text-accent-foreground text-xs px-1.5 py-0.5 rounded-full">
                {activeFilterCount}
              </span>}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>{t('filter.filterProperties')}</SheetTitle>
          </SheetHeader>
          <FilterContent filters={filters} onFiltersChange={onFiltersChange} />
        </SheetContent>
      </Sheet>;
  }
  return <aside className="w-[280px] shrink-0 sticky top-20 h-fit max-h-[calc(100vh-6rem)] overflow-y-auto pr-4 pb-8 text-primary-foreground">
      <FilterContent filters={filters} onFiltersChange={onFiltersChange} />
    </aside>;
}