import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { regionOptions } from "@/data/mockProperties";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";

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

function FilterContent({ filters, onFiltersChange }: FilterSidebarProps) {
  const { t } = useTranslation();
  const [openSections, setOpenSections] = useState<string[]>(["type", "district", "price", "size"]);

  const toggleSection = (section: string) => {
    setOpenSections((prev) => (prev.includes(section) ? prev.filter((item) => item !== section) : [...prev, section]));
  };

  const toggleArrayFilter = <K extends keyof FilterState>(key: K, value: string | number) => {
    const current = filters[key] as (string | number)[];
    const updated = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
    onFiltersChange({ ...filters, [key]: updated });
  };

  const activeFilterCount = useMemo(
    () =>
      [
        filters.transactionType !== "all",
        filters.regions.length > 0,
        filters.districts.length > 0,
        filters.propertyTypes.length > 0,
        filters.priceRange[0] > 2000 || filters.priceRange[1] < 90000000,
        filters.sizeRange[0] > 0 || filters.sizeRange[1] < 5000,
        filters.bedrooms.length > 0,
        filters.bathrooms.length > 0,
        filters.hasParking,
        filters.petsAllowed,
        filters.isFurnished,
        filters.isNew,
        filters.hasSeaView,
        filters.hasPool,
        filters.hasGym,
      ].filter(Boolean).length,
    [filters]
  );

  const clearAllFilters = () => {
    onFiltersChange({
      transactionType: "all",
      regions: [],
      districts: [],
      propertyTypes: [],
      priceRange: [2000, 90000000],
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
    });
  };

  const formatPrice = (value: number) => {
    if (value >= 1000000) return `HK$${(value / 1000000).toFixed(value >= 10000000 ? 0 : 1)}M`;
    return `HK$${value.toLocaleString()}`;
  };

  const moreFiltersConfig = [
    { key: "hasParking", labelKey: "filter.parking" },
    { key: "petsAllowed", labelKey: "filter.petsAllowed" },
    { key: "isFurnished", labelKey: "filter.furnished" },
    { key: "isNew", labelKey: "filter.newBuild" },
    { key: "hasSeaView", labelKey: "filter.seaView" },
    { key: "hasPool", labelKey: "filter.pool" },
    { key: "hasGym", labelKey: "filter.gym" },
  ] as const;

  return (
    <div className="space-y-4 rounded-md border border-border bg-card px-5 py-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div>
          <p className="text-xs uppercase tracking-normal text-muted-foreground">Browse filters</p>
          <h3 className="mt-1 text-lg font-semibold text-foreground">{t("filter.filters")}</h3>
        </div>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters} className="rounded-full text-xs">
            {t("filter.clearAll")} ({activeFilterCount})
          </Button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-1 rounded-full bg-muted p-1">
        {(["all", "sale", "rent"] as const).map((type) => (
          <Button
            key={type}
            variant={filters.transactionType === type ? "default" : "ghost"}
            size="sm"
            className={cn("rounded-full text-xs capitalize", filters.transactionType === type && "shadow-sm")}
            onClick={() => onFiltersChange({ ...filters, transactionType: type })}
          >
            {type === "all" ? t("filter.all") : type === "sale" ? t("filter.forSale") : t("filter.forRent")}
          </Button>
        ))}
      </div>

      <Collapsible open={openSections.includes("district")} onOpenChange={() => toggleSection("district")}>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium text-foreground">
          {t("filter.district")}
          {openSections.includes("district") ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-2">
          {regionOptions.map(({ region, districts }) => (
            <div key={region} className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox checked={filters.regions.includes(region)} onCheckedChange={() => toggleArrayFilter("regions", region)} />
                <label className="text-sm font-medium text-foreground">{region}</label>
              </div>
              {filters.regions.includes(region) && (
                <div className="ml-6 space-y-2">
                  {districts.map((district) => (
                    <div key={district} className="flex items-center gap-2">
                      <Checkbox checked={filters.districts.includes(district)} onCheckedChange={() => toggleArrayFilter("districts", district)} />
                      <label className="text-xs text-muted-foreground">{district}</label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      <Collapsible open={openSections.includes("type")} onOpenChange={() => toggleSection("type")}>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium text-foreground">
          {t("filter.propertyType")}
          {openSections.includes("type") ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="grid grid-cols-2 gap-2 pt-2">
          {propertyTypeOptions.map((type) => (
            <Button
              key={type}
              variant={filters.propertyTypes.includes(type) ? "default" : "outline"}
              size="sm"
              className="justify-start rounded-full"
              onClick={() => toggleArrayFilter("propertyTypes", type)}
            >
              {type}
            </Button>
          ))}
        </CollapsibleContent>
      </Collapsible>

      <Collapsible open={openSections.includes("price")} onOpenChange={() => toggleSection("price")}>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium text-foreground">
          {t("filter.priceRange")}
          {openSections.includes("price") ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4">
          <Slider value={filters.priceRange} onValueChange={(value) => onFiltersChange({ ...filters, priceRange: value as [number, number] })} min={2000} max={90000000} step={500000} className="mb-3" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatPrice(filters.priceRange[0])}</span>
            <span>{formatPrice(filters.priceRange[1])}</span>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible open={openSections.includes("size")} onOpenChange={() => toggleSection("size")}>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium text-foreground">
          {t("filter.size")}
          {openSections.includes("size") ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4">
          <Slider value={filters.sizeRange} onValueChange={(value) => onFiltersChange({ ...filters, sizeRange: value as [number, number] })} min={0} max={5000} step={100} className="mb-3" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{filters.sizeRange[0]} sqft</span>
            <span>{filters.sizeRange[1]} sqft</span>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible open={openSections.includes("bedrooms")} onOpenChange={() => toggleSection("bedrooms")}>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium text-foreground">
          {t("filter.bedrooms")}
          {openSections.includes("bedrooms") ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="flex flex-wrap gap-2 pt-2">
          {bedroomOptions.map((num) => (
            <Button key={num} variant={filters.bedrooms.includes(num) ? "default" : "outline"} size="sm" className="w-12 rounded-full text-xs" onClick={() => toggleArrayFilter("bedrooms", num)}>
              {num === 0 ? "Studio" : num === 5 ? "5+" : num}
            </Button>
          ))}
        </CollapsibleContent>
      </Collapsible>

      <Collapsible open={openSections.includes("bathrooms")} onOpenChange={() => toggleSection("bathrooms")}>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium text-foreground">
          {t("filter.bathrooms")}
          {openSections.includes("bathrooms") ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="flex flex-wrap gap-2 pt-2">
          {bathroomOptions.map((num) => (
            <Button key={num} variant={filters.bathrooms.includes(num) ? "default" : "outline"} size="sm" className="w-12 rounded-full text-xs" onClick={() => toggleArrayFilter("bathrooms", num)}>
              {num === 4 ? "4+" : num}
            </Button>
          ))}
        </CollapsibleContent>
      </Collapsible>

      <Collapsible open={openSections.includes("more")} onOpenChange={() => toggleSection("more")}>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium text-foreground">
          {t("filter.moreFilters")}
          {openSections.includes("more") ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-2">
          {moreFiltersConfig.map(({ key, labelKey }) => (
            <div key={key} className="flex items-center gap-2">
              <Checkbox checked={filters[key as keyof FilterState] === true} onCheckedChange={(checked) => onFiltersChange({ ...filters, [key]: checked ? true : null })} />
              <label className="text-sm text-foreground">{t(labelKey)}</label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export function FilterSidebar({ filters, onFiltersChange }: FilterSidebarProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const activeFilterCount = [filters.transactionType !== "all", filters.regions.length > 0, filters.propertyTypes.length > 0, filters.bedrooms.length > 0].filter(Boolean).length;

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="h-10 rounded-full px-4">
            <Filter className="mr-2 h-4 w-4" />
            {t("filter.filters")}
            {activeFilterCount > 0 && <span className="ml-2 rounded-full bg-accent px-2 py-0 text-[11px] text-accent-foreground">{activeFilterCount}</span>}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[320px] overflow-y-auto bg-background">
          <SheetHeader className="mb-4">
            <SheetTitle>{t("filter.filterProperties")}</SheetTitle>
          </SheetHeader>
          <FilterContent filters={filters} onFiltersChange={onFiltersChange} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside className="sticky top-24 h-fit max-h-[calc(100vh-7rem)] w-[300px] shrink-0 overflow-y-auto pr-4 pb-8">
      <FilterContent filters={filters} onFiltersChange={onFiltersChange} />
    </aside>
  );
}
