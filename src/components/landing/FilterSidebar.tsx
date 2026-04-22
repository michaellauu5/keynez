import { useState } from "react";
import { ChevronDown, ChevronUp, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "@/hooks/useTranslation";
import type { FilterState } from "./FilterToggleBar";

interface FilterSidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  searchMode?: "rent" | "buy";
}

// Re-declared option catalogues — mirror FilterToggleBar (single source of truth for keys)
const TYPE_OPTIONS = [
  { value: "Apartment", tKey: "filter.opt.type.apartment" },
  { value: "Carpark", tKey: "filter.opt.type.carpark" },
  { value: "Office", tKey: "filter.opt.type.office" },
  { value: "Shop", tKey: "filter.opt.type.shop" },
];

const REGION_DISTRICTS = [
  {
    region: "Hong Kong Island",
    regionKey: "filter.opt.region.hki",
    districts: [
      { value: "Central", tKey: "filter.opt.district.central" },
      { value: "Sheung Wan", tKey: "filter.opt.district.sheungwan" },
      { value: "Mid-Levels", tKey: "filter.opt.district.midlevels" },
      { value: "The Peak", tKey: "filter.opt.district.thepeak" },
      { value: "Wan Chai", tKey: "filter.opt.district.wanchai" },
      { value: "Causeway Bay", tKey: "filter.opt.district.causewaybay" },
      { value: "Happy Valley", tKey: "filter.opt.district.happyvalley" },
      { value: "North Point", tKey: "filter.opt.district.northpoint" },
      { value: "Quarry Bay", tKey: "filter.opt.district.quarrybay" },
      { value: "Tai Koo", tKey: "filter.opt.district.taikoo" },
      { value: "Shau Kei Wan", tKey: "filter.opt.district.shaukeiwan" },
      { value: "Chai Wan", tKey: "filter.opt.district.chaiwan" },
      { value: "Aberdeen", tKey: "filter.opt.district.aberdeen" },
      { value: "Repulse Bay", tKey: "filter.opt.district.repulsebay" },
      { value: "Stanley", tKey: "filter.opt.district.stanley" },
    ],
  },
  {
    region: "Kowloon",
    regionKey: "filter.opt.region.kln",
    districts: [
      { value: "Tsim Sha Tsui", tKey: "filter.opt.district.tst" },
      { value: "Jordan", tKey: "filter.opt.district.jordan" },
      { value: "Yau Ma Tei", tKey: "filter.opt.district.yaumatei" },
      { value: "Mong Kok", tKey: "filter.opt.district.mongkok" },
      { value: "Sham Shui Po", tKey: "filter.opt.district.shamshuipo" },
      { value: "Cheung Sha Wan", tKey: "filter.opt.district.cheungshawan" },
      { value: "Lai Chi Kok", tKey: "filter.opt.district.laichikok" },
      { value: "Kowloon Tong", tKey: "filter.opt.district.kowloontong" },
      { value: "Hung Hom", tKey: "filter.opt.district.hunghom" },
      { value: "To Kwa Wan", tKey: "filter.opt.district.tokwawan" },
      { value: "Kwun Tong", tKey: "filter.opt.district.kwuntong" },
      { value: "Wong Tai Sin", tKey: "filter.opt.district.wongtaisin" },
      { value: "Diamond Hill", tKey: "filter.opt.district.diamondhill" },
    ],
  },
  {
    region: "New Territories",
    regionKey: "filter.opt.region.nt",
    districts: [
      { value: "Sha Tin", tKey: "filter.opt.district.shatin" },
      { value: "Ma On Shan", tKey: "filter.opt.district.maonshan" },
      { value: "Tai Po", tKey: "filter.opt.district.taipo" },
      { value: "Fanling", tKey: "filter.opt.district.fanling" },
      { value: "Sheung Shui", tKey: "filter.opt.district.sheungshui" },
      { value: "Tsuen Wan", tKey: "filter.opt.district.tsuenwan" },
      { value: "Kwai Chung", tKey: "filter.opt.district.kwaichung" },
      { value: "Tsing Yi", tKey: "filter.opt.district.tsingyi" },
      { value: "Tuen Mun", tKey: "filter.opt.district.tuenmun" },
      { value: "Yuen Long", tKey: "filter.opt.district.yuenlong" },
      { value: "Tin Shui Wai", tKey: "filter.opt.district.tinshuiwai" },
      { value: "Sai Kung", tKey: "filter.opt.district.saikung" },
      { value: "Tseung Kwan O", tKey: "filter.opt.district.tko" },
    ],
  },
  {
    region: "Outlying Islands",
    regionKey: "filter.opt.region.islands",
    districts: [
      { value: "Lantau", tKey: "filter.opt.district.lantau" },
      { value: "Tung Chung", tKey: "filter.opt.district.tungchung" },
      { value: "Discovery Bay", tKey: "filter.opt.district.discoverybay" },
      { value: "Cheung Chau", tKey: "filter.opt.district.cheungchau" },
      { value: "Lamma Island", tKey: "filter.opt.district.lamma" },
      { value: "Peng Chau", tKey: "filter.opt.district.pengchau" },
    ],
  },
];

const BEDROOM_OPTIONS = [
  { value: "Studio", tKey: "filter.opt.bed.studio" },
  { value: "1", tKey: "filter.opt.bed.1" },
  { value: "2", tKey: "filter.opt.bed.2" },
  { value: "3", tKey: "filter.opt.bed.3" },
  { value: "4+", tKey: "filter.opt.bed.4p" },
];

const BATHROOM_OPTIONS = [
  { value: "1", tKey: "filter.opt.bed.1" },
  { value: "2", tKey: "filter.opt.bed.2" },
  { value: "3", tKey: "filter.opt.bed.3" },
  { value: "4+", tKey: "filter.opt.bed.4p" },
];

const FLOOR_OPTIONS = [
  { value: "High (26-40)", tKey: "filter.opt.floor.high" },
  { value: "Mid (11-25)", tKey: "filter.opt.floor.mid" },
  { value: "Low (1-10)", tKey: "filter.opt.floor.low" },
];

const AGE_OPTIONS = [
  { value: "New Build", tKey: "filter.opt.age.new" },
  { value: "<5 years", tKey: "filter.opt.age.lt5" },
  { value: "<10 years", tKey: "filter.opt.age.lt10" },
  { value: "<20 years", tKey: "filter.opt.age.lt20" },
  { value: "20+ years", tKey: "filter.opt.age.20p" },
];

const DEVELOPER_OPTIONS = [
  { value: "Sun Hung Kai", tKey: "filter.opt.dev.shk" },
  { value: "Henderson Land", tKey: "filter.opt.dev.henderson" },
  { value: "New World Development", tKey: "filter.opt.dev.nwd" },
  { value: "Cheung Kong", tKey: "filter.opt.dev.cheungkong" },
  { value: "Sino Land", tKey: "filter.opt.dev.sino" },
  { value: "Hang Lung", tKey: "filter.opt.dev.hanglung" },
  { value: "Wharf Holdings", tKey: "filter.opt.dev.wharf" },
  { value: "Kerry Properties", tKey: "filter.opt.dev.kerry" },
];

const FACILITY_OPTIONS = [
  { value: "Pool", tKey: "filter.opt.fac.pool" },
  { value: "Gym", tKey: "filter.opt.fac.gym" },
  { value: "Clubhouse", tKey: "filter.opt.fac.clubhouse" },
  { value: "Parking", tKey: "filter.opt.fac.parking" },
];

const VIEW_OPTIONS = [
  { value: "Sea", tKey: "filter.opt.view.sea" },
  { value: "Mountain", tKey: "filter.opt.view.mountain" },
  { value: "City", tKey: "filter.opt.view.city" },
  { value: "Garden", tKey: "filter.opt.view.garden" },
];

const CHARACTERISTIC_OPTIONS = [
  { value: "New", tKey: "filter.opt.char.new" },
  { value: "Furnished", tKey: "filter.opt.char.furnished" },
  { value: "Pet-friendly", tKey: "filter.opt.char.pet" },
  { value: "Duplex", tKey: "filter.opt.char.duplex" },
];

const PRICE_CONFIG = {
  rent: { min: 2000, max: 100000, step: 1000 },
  buy: { min: 1000000, max: 90000000, step: 500000 },
};

function formatPrice(v: number, mode: "rent" | "buy", language: string) {
  if (mode === "buy") {
    if (language === "en") {
      const m = v / 1_000_000;
      const str = Number.isInteger(m) ? m.toString() : m.toFixed(1);
      return `HK$${str}M`;
    }
    const unit = language === "zh-CN" ? "万" : "萬";
    return `HK$${(v / 10000).toLocaleString()}${unit}`;
  }
  return `HK$${v.toLocaleString()}`;
}

interface SectionProps {
  id: string;
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function Section({ title, open, onToggle, children }: SectionProps) {
  return (
    <Collapsible open={open} onOpenChange={onToggle}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium">
        {title}
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2 pb-1">{children}</CollapsibleContent>
    </Collapsible>
  );
}

function CheckList({
  options,
  selected,
  onChange,
}: {
  options: { value: string; tKey: string }[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="space-y-1.5">
      {options.map((opt) => {
        const label = t(opt.tKey);
        return (
          <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-sm">
            <Checkbox
              checked={selected.includes(opt.value)}
              onCheckedChange={(c) => {
                if (c) onChange([...selected, opt.value]);
                else onChange(selected.filter((s) => s !== opt.value));
              }}
            />
            <span>{label === opt.tKey ? opt.value : label}</span>
          </label>
        );
      })}
    </div>
  );
}

function FilterContent({ filters, onFiltersChange, searchMode = "rent" }: FilterSidebarProps) {
  const { t, language } = useTranslation();
  const priceConfig = PRICE_CONFIG[searchMode];
  const [openSections, setOpenSections] = useState<string[]>(["type", "location", "price"]);
  const toggle = (s: string) =>
    setOpenSections((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const set = <K extends keyof FilterState>(key: K, value: FilterState[K]) =>
    onFiltersChange({ ...filters, [key]: value });

  const isPriceCustom =
    filters.priceRange[0] !== priceConfig.min || filters.priceRange[1] !== priceConfig.max;
  const isAreaCustom = filters.sizeRange[0] !== 0 || filters.sizeRange[1] !== 5000;

  const activeCount =
    (filters.propertyTypes.length > 0 ? 1 : 0) +
    (filters.locations.length + filters.districts.length > 0 ? 1 : 0) +
    (isPriceCustom ? 1 : 0) +
    (isAreaCustom ? 1 : 0) +
    filters.bedrooms.length +
    filters.bathrooms.length +
    filters.floorLevels.length +
    filters.buildingAge.length +
    filters.developers.length +
    filters.facilities.length +
    filters.views.length +
    filters.characteristics.length;

  const clearAll = () =>
    onFiltersChange({
      ...filters,
      propertyTypes: [],
      priceRange: [priceConfig.min, priceConfig.max],
      locations: [],
      districts: [],
      bedrooms: [],
      bathrooms: [],
      sizeRange: [0, 5000],
      floorLevels: [],
      buildingAge: [],
      orientations: [],
      developers: [],
      facilities: [],
      views: [],
      characteristics: [],
    });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <h3 className="font-semibold text-primary-foreground">{t("filter.filters")}</h3>
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="h-8 text-xs text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
            {t("filter.clearAll")} ({activeCount})
          </Button>
        )}
      </div>

      <Section id="type" title={t("filter.type")} open={openSections.includes("type")} onToggle={() => toggle("type")}>
        <CheckList
          options={TYPE_OPTIONS}
          selected={filters.propertyTypes}
          onChange={(v) => set("propertyTypes", v)}
        />
      </Section>

      <Section
        id="location"
        title={t("filter.location")}
        open={openSections.includes("location")}
        onToggle={() => toggle("location")}
      >
        <div className="space-y-3">
          {REGION_DISTRICTS.map((r) => {
            const regionLabel = t(r.regionKey);
            return (
              <div key={r.region} className="space-y-1.5">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                  <Checkbox
                    checked={filters.locations.includes(r.region)}
                    onCheckedChange={(c) => {
                      if (c) set("locations", [...filters.locations, r.region]);
                      else set("locations", filters.locations.filter((l) => l !== r.region));
                    }}
                  />
                  <span>{regionLabel === r.regionKey ? r.region : regionLabel}</span>
                </label>
                {filters.locations.includes(r.region) && r.districts.length > 0 && (
                  <div className="ml-6 space-y-1">
                    {r.districts.map((d) => {
                      const dLabel = t(d.tKey);
                      return (
                        <label key={d.value} className="flex items-center gap-2 cursor-pointer text-xs">
                          <Checkbox
                            checked={filters.districts.includes(d.value)}
                            onCheckedChange={(c) => {
                              if (c) set("districts", [...filters.districts, d.value]);
                              else set("districts", filters.districts.filter((x) => x !== d.value));
                            }}
                          />
                          <span>{dLabel === d.tKey ? d.value : dLabel}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      <Section id="price" title={t("filter.price")} open={openSections.includes("price")} onToggle={() => toggle("price")}>
        <Slider
          value={filters.priceRange}
          onValueChange={(v) => set("priceRange", v as [number, number])}
          min={priceConfig.min}
          max={priceConfig.max}
          step={priceConfig.step}
          className="mb-2 mt-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatPrice(filters.priceRange[0], searchMode, language)}</span>
          <span>{formatPrice(filters.priceRange[1], searchMode, language)}</span>
        </div>
      </Section>

      <Section id="area" title={t("filter.area")} open={openSections.includes("area")} onToggle={() => toggle("area")}>
        <Slider
          value={filters.sizeRange}
          onValueChange={(v) => set("sizeRange", v as [number, number])}
          min={0}
          max={5000}
          step={50}
          className="mb-2 mt-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{filters.sizeRange[0]} {t("filter.sqft")}</span>
          <span>{filters.sizeRange[1]} {t("filter.sqft")}</span>
        </div>
      </Section>

      <Section id="bedrooms" title={t("filter.bedrooms")} open={openSections.includes("bedrooms")} onToggle={() => toggle("bedrooms")}>
        <div className="flex flex-wrap gap-2">
          {BEDROOM_OPTIONS.map((b) => {
            const label = t(b.tKey);
            const active = filters.bedrooms.includes(b.value);
            return (
              <Button
                key={b.value}
                variant={active ? "default" : "outline"}
                size="sm"
                className={cn(
                  "h-8 text-xs",
                  active
                    ? "bg-accent text-accent-foreground border-transparent"
                    : "bg-transparent text-primary-foreground border-primary-foreground/40 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                )}
                onClick={() => {
                  if (active) set("bedrooms", filters.bedrooms.filter((x) => x !== b.value));
                  else set("bedrooms", [...filters.bedrooms, b.value]);
                }}
              >
                {label === b.tKey ? b.value : label}
              </Button>
            );
          })}
        </div>
      </Section>

      <Section id="bathrooms" title={t("filter.bathrooms")} open={openSections.includes("bathrooms")} onToggle={() => toggle("bathrooms")}>
        <div className="flex flex-wrap gap-2">
          {BATHROOM_OPTIONS.map((b) => {
            const active = filters.bathrooms.includes(b.value);
            return (
              <Button
                key={b.value}
                variant={active ? "default" : "outline"}
                size="sm"
                className={cn(
                  "h-8 w-12 text-xs",
                  active
                    ? "bg-accent text-accent-foreground border-transparent"
                    : "bg-transparent text-primary-foreground border-primary-foreground/40 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                )}
                onClick={() => {
                  if (active) set("bathrooms", filters.bathrooms.filter((x) => x !== b.value));
                  else set("bathrooms", [...filters.bathrooms, b.value]);
                }}
              >
                {b.value}
              </Button>
            );
          })}
        </div>
      </Section>

      <Section id="floor" title={t("filter.floor")} open={openSections.includes("floor")} onToggle={() => toggle("floor")}>
        <CheckList options={FLOOR_OPTIONS} selected={filters.floorLevels} onChange={(v) => set("floorLevels", v)} />
      </Section>

      <Section id="age" title={t("filter.buildingAge")} open={openSections.includes("age")} onToggle={() => toggle("age")}>
        <CheckList options={AGE_OPTIONS} selected={filters.buildingAge} onChange={(v) => set("buildingAge", v)} />
      </Section>

      <Section id="dev" title={t("filter.developer")} open={openSections.includes("dev")} onToggle={() => toggle("dev")}>
        <CheckList options={DEVELOPER_OPTIONS} selected={filters.developers} onChange={(v) => set("developers", v)} />
      </Section>

      <Section id="fac" title={t("filter.more.facilities")} open={openSections.includes("fac")} onToggle={() => toggle("fac")}>
        <CheckList options={FACILITY_OPTIONS} selected={filters.facilities} onChange={(v) => set("facilities", v)} />
      </Section>

      <Section id="views" title={t("filter.more.views")} open={openSections.includes("views")} onToggle={() => toggle("views")}>
        <CheckList options={VIEW_OPTIONS} selected={filters.views} onChange={(v) => set("views", v)} />
      </Section>

      <Section id="char" title={t("filter.more.characteristics")} open={openSections.includes("char")} onToggle={() => toggle("char")}>
        <CheckList options={CHARACTERISTIC_OPTIONS} selected={filters.characteristics} onChange={(v) => set("characteristics", v)} />
      </Section>
    </div>
  );
}

export type { FilterState };

export function FilterSidebar({ filters, onFiltersChange, searchMode = "rent" }: FilterSidebarProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const activeCount =
    (filters.propertyTypes.length > 0 ? 1 : 0) +
    (filters.locations.length + filters.districts.length > 0 ? 1 : 0) +
    filters.bedrooms.length +
    filters.bathrooms.length;

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            {t("filter.filters")}
            {activeCount > 0 && (
              <span className="ml-1 bg-accent text-accent-foreground text-xs px-1.5 py-0.5 rounded-full">
                {activeCount}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[320px] overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>{t("filter.filterProperties")}</SheetTitle>
          </SheetHeader>
          <FilterContent filters={filters} onFiltersChange={onFiltersChange} searchMode={searchMode} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside className="w-[280px] shrink-0 sticky top-20 h-fit max-h-[calc(100vh-6rem)] overflow-y-auto pr-4 pb-8 text-primary-foreground">
      <FilterContent filters={filters} onFiltersChange={onFiltersChange} searchMode={searchMode} />
    </aside>
  );
}
