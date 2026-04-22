import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

/**
 * FilterState — extended with `districts`, `facilities`, `views`, `characteristics`.
 * Older fields kept for backward compatibility with sync context, advanced sidebar,
 * and PropertySearchChat payload mapping.
 */
export interface FilterState {
  propertyTypes: string[];
  priceRange: [number, number];
  locations: string[];      // region keys (e.g. "Hong Kong Island")
  districts: string[];      // sub-district keys (canonical English)
  bedrooms: string[];
  bathrooms: string[];
  sizeRange: [number, number];
  floorLevels: string[];
  buildingAge: string[];
  orientations: string[];
  developers: string[];
  facilities: string[];
  views: string[];
  characteristics: string[];
}

interface FilterToggleBarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  searchMode?: "rent" | "buy";
}

// ---- Option catalogues (canonical English keys + i18n key) ----

const TYPE_OPTIONS: { value: string; tKey: string }[] = [
  { value: "Apartment", tKey: "filter.opt.type.apartment" },
  { value: "Carpark", tKey: "filter.opt.type.carpark" },
  { value: "Office", tKey: "filter.opt.type.office" },
  { value: "Shop", tKey: "filter.opt.type.shop" },
];

const REGION_DISTRICTS: {
  region: string;
  regionKey: string;
  districts: { value: string; tKey: string }[];
}[] = [
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
  {
    region: "Overseas",
    regionKey: "filter.opt.region.overseas",
    districts: [
      { value: "United Kingdom", tKey: "filter.opt.overseas.uk" },
      { value: "Canada", tKey: "filter.opt.overseas.canada" },
      { value: "Australia", tKey: "filter.opt.overseas.australia" },
      { value: "Singapore", tKey: "filter.opt.overseas.singapore" },
      { value: "Japan", tKey: "filter.opt.overseas.japan" },
      { value: "Thailand", tKey: "filter.opt.overseas.thailand" },
      { value: "Malaysia", tKey: "filter.opt.overseas.malaysia" },
      { value: "United States", tKey: "filter.opt.overseas.usa" },
    ],
  },
  {
    region: "School Nets",
    regionKey: "filter.opt.region.schoolnets",
    districts: [],
  },
];

// School Nets grouped data: rendered specially in the Location accordion
const SCHOOLNET_GROUPS: {
  groupKey: string;
  options: { value: string; tKey: string }[];
}[] = [
  {
    groupKey: "filter.opt.schoolnet.primary",
    options: [
      { value: "Primary Net 11", tKey: "filter.opt.schoolnet.p11" },
      { value: "Primary Net 12", tKey: "filter.opt.schoolnet.p12" },
      { value: "Primary Net 14", tKey: "filter.opt.schoolnet.p14" },
      { value: "Primary Net 16", tKey: "filter.opt.schoolnet.p16" },
      { value: "Primary Net 18", tKey: "filter.opt.schoolnet.p18" },
      { value: "Primary Net 31", tKey: "filter.opt.schoolnet.p31" },
      { value: "Primary Net 34", tKey: "filter.opt.schoolnet.p34" },
      { value: "Primary Net 35", tKey: "filter.opt.schoolnet.p35" },
      { value: "Primary Net 40", tKey: "filter.opt.schoolnet.p40" },
      { value: "Primary Net 41", tKey: "filter.opt.schoolnet.p41" },
      { value: "Primary Net 91", tKey: "filter.opt.schoolnet.p91" },
      { value: "Primary Net 95", tKey: "filter.opt.schoolnet.p95" },
    ],
  },
  {
    groupKey: "filter.opt.schoolnet.secondary",
    options: [
      { value: "Secondary HK Island", tKey: "filter.opt.schoolnet.s_hki" },
      { value: "Secondary Kowloon", tKey: "filter.opt.schoolnet.s_kln" },
      { value: "Secondary New Territories", tKey: "filter.opt.schoolnet.s_nt" },
    ],
  },
  {
    groupKey: "filter.opt.schoolnet.university",
    options: [
      { value: "HKU", tKey: "filter.opt.schoolnet.u_hku" },
      { value: "CUHK", tKey: "filter.opt.schoolnet.u_cuhk" },
      { value: "HKUST", tKey: "filter.opt.schoolnet.u_hkust" },
      { value: "PolyU", tKey: "filter.opt.schoolnet.u_polyu" },
      { value: "CityU", tKey: "filter.opt.schoolnet.u_cityu" },
      { value: "HKBU", tKey: "filter.opt.schoolnet.u_hkbu" },
    ],
  },
];

const SCHOOLNET_VALUES = SCHOOLNET_GROUPS.flatMap((g) => g.options.map((o) => o.value));

interface PricePreset {
  tKey: string;
  value: [number, number];
}

const PRICE_PRESETS_RENT: PricePreset[] = [
  { tKey: "filter.opt.price.rent.u5k", value: [2000, 5000] },
  { tKey: "filter.opt.price.rent.5_10k", value: [5000, 10000] },
  { tKey: "filter.opt.price.rent.10_15k", value: [10000, 15000] },
  { tKey: "filter.opt.price.rent.15_20k", value: [15000, 20000] },
  { tKey: "filter.opt.price.rent.20_30k", value: [20000, 30000] },
  { tKey: "filter.opt.price.rent.30_50k", value: [30000, 50000] },
  { tKey: "filter.opt.price.rent.50kp", value: [50000, 100000] },
];

const PRICE_PRESETS_BUY: PricePreset[] = [
  { tKey: "filter.opt.price.buy.u500", value: [1000000, 5000000] },
  { tKey: "filter.opt.price.buy.500_1000", value: [5000000, 10000000] },
  { tKey: "filter.opt.price.buy.1000_2000", value: [10000000, 20000000] },
  { tKey: "filter.opt.price.buy.2000_5000", value: [20000000, 50000000] },
  { tKey: "filter.opt.price.buy.5000p", value: [50000000, 90000000] },
];

const AREA_PRESETS: PricePreset[] = [
  { tKey: "filter.opt.area.u300", value: [0, 300] },
  { tKey: "filter.opt.area.300_500", value: [300, 500] },
  { tKey: "filter.opt.area.500_800", value: [500, 800] },
  { tKey: "filter.opt.area.800_1200", value: [800, 1200] },
  { tKey: "filter.opt.area.1200p", value: [1200, 5000] },
];

const BEDROOM_OPTIONS: { value: string; tKey: string }[] = [
  { value: "Studio", tKey: "filter.opt.bed.studio" },
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
  rent: { min: 2000, max: 100000, step: 1000, presets: PRICE_PRESETS_RENT },
  buy: { min: 1000000, max: 90000000, step: 500000, presets: PRICE_PRESETS_BUY },
};

function formatPrice(v: number, mode: "rent" | "buy", language: string = "en") {
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

// ---------- Reusable trigger button ----------

interface FilterTriggerProps {
  label: string;
  count?: number;
  active?: boolean;
  summary?: string;
}

function FilterTrigger({ label, count, active, summary }: FilterTriggerProps) {
  const isActive = active || (count ?? 0) > 0;
  return (
    <Button
      variant={isActive ? "default" : "outline"}
      size="sm"
      className={cn(
        "h-9 gap-1.5 rounded-full text-xs font-medium px-4 transition-all",
        isActive &&
          "bg-[#FFD54F] text-black hover:bg-[#FFD54F]/90 border-[#FFD54F]"
      )}
    >
      <span>{label}</span>
      {summary && <span className="text-[11px] opacity-80">· {summary}</span>}
      {count !== undefined && count > 0 && (
        <Badge
          variant="secondary"
          className="ml-0.5 h-5 min-w-5 rounded-full bg-black/20 px-1.5 text-[10px] text-black"
        >
          {count}
        </Badge>
      )}
      <ChevronDown className="h-3.5 w-3.5 opacity-70" />
    </Button>
  );
}

// ---------- Multi-checkbox group ----------

function CheckboxGroup({
  options,
  selected,
  onChange,
  cols = 1,
}: {
  options: { value: string; tKey: string }[];
  selected: string[];
  onChange: (next: string[]) => void;
  cols?: 1 | 2 | 3;
}) {
  const { t } = useTranslation();
  const colsClass = cols === 3 ? "grid-cols-3" : cols === 2 ? "grid-cols-2" : "grid-cols-1";
  return (
    <div className={cn("grid gap-1.5", colsClass)}>
      {options.map((opt) => (
        <label
          key={opt.value}
          className="flex cursor-pointer items-center gap-2 rounded-md p-1.5 hover:bg-muted"
        >
          <Checkbox
            checked={selected.includes(opt.value)}
            onCheckedChange={(checked) => {
              if (checked) onChange([...selected, opt.value]);
              else onChange(selected.filter((s) => s !== opt.value));
            }}
          />
          <span className="text-sm">{t(opt.tKey) === opt.tKey ? opt.value : t(opt.tKey)}</span>
        </label>
      ))}
    </div>
  );
}

// ============== Main component ==============

export function FilterToggleBar({
  filters,
  onFiltersChange,
  searchMode = "rent",
}: FilterToggleBarProps) {
  const { t, language } = useTranslation();
  const priceConfig = PRICE_CONFIG[searchMode];
  const [priceTab, setPriceTab] = useState<"preset" | "custom">("preset");
  const [areaTab, setAreaTab] = useState<"preset" | "custom">("preset");

  const set = <K extends keyof FilterState>(key: K, value: FilterState[K]) =>
    onFiltersChange({ ...filters, [key]: value });

  const isPriceCustom =
    filters.priceRange[0] !== priceConfig.min ||
    filters.priceRange[1] !== priceConfig.max;
  const isAreaCustom =
    filters.sizeRange[0] !== 0 || filters.sizeRange[1] !== 5000;

  const moreCount =
    filters.buildingAge.length +
    filters.floorLevels.length +
    filters.developers.length +
    filters.facilities.length +
    filters.views.length +
    filters.characteristics.length;

  const totalActive =
    (filters.propertyTypes.length > 0 ? 1 : 0) +
    (filters.locations.length + filters.districts.length > 0 ? 1 : 0) +
    (isPriceCustom ? 1 : 0) +
    (isAreaCustom ? 1 : 0) +
    (filters.bedrooms.length > 0 ? 1 : 0) +
    (moreCount > 0 ? 1 : 0);

  const clearAll = () =>
    onFiltersChange({
      ...filters,
      propertyTypes: [],
      priceRange: [priceConfig.min, priceConfig.max],
      locations: [],
      districts: [],
      bedrooms: [],
      sizeRange: [0, 5000],
      floorLevels: [],
      buildingAge: [],
      developers: [],
      facilities: [],
      views: [],
      characteristics: [],
    });

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {/* 1. Type */}
        <Popover>
          <PopoverTrigger asChild>
            <span>
              <FilterTrigger
                label={t("filter.type")}
                count={filters.propertyTypes.length}
              />
            </span>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3" align="start">
            <CheckboxGroup
              options={TYPE_OPTIONS}
              selected={filters.propertyTypes}
              onChange={(v) => set("propertyTypes", v)}
            />
            {filters.propertyTypes.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 w-full text-xs"
                onClick={() => set("propertyTypes", [])}
              >
                {t("filter.clearSelection")}
              </Button>
            )}
          </PopoverContent>
        </Popover>

        {/* 2. Location (cascading) */}
        <Popover>
          <PopoverTrigger asChild>
            <span>
              <FilterTrigger
                label={t("filter.location")}
                count={filters.districts.length + filters.locations.length}
              />
            </span>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-2 max-h-[480px] overflow-y-auto" align="start">
            <Accordion type="multiple" className="w-full">
              {REGION_DISTRICTS.map((r) => {
                const isSchoolNets = r.region === "School Nets";
                const selectedInRegion = isSchoolNets
                  ? filters.districts.filter((d) => SCHOOLNET_VALUES.includes(d)).length
                  : filters.districts.filter((d) =>
                      r.districts.some((rd) => rd.value === d)
                    ).length;
                return (
                  <AccordionItem value={r.region} key={r.region} className="border-b">
                    <AccordionTrigger className="py-2 px-2 text-sm hover:no-underline">
                      <span className="flex items-center gap-2">
                        {t(r.regionKey)}
                        {selectedInRegion > 0 && (
                          <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                            {selectedInRegion}
                          </Badge>
                        )}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-2 pl-2">
                      {isSchoolNets ? (
                        <div className="space-y-3">
                          {SCHOOLNET_GROUPS.map((g) => (
                            <div key={g.groupKey}>
                              <p className="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                {t(g.groupKey)}
                              </p>
                              <CheckboxGroup
                                options={g.options}
                                selected={filters.districts}
                                onChange={(v) => {
                                  const groupValues = g.options.map((o) => o.value);
                                  const others = filters.districts.filter(
                                    (d) => !groupValues.includes(d)
                                  );
                                  const inGroup = v.filter((d) => groupValues.includes(d));
                                  const next = [...others, ...inGroup];
                                  const regions = REGION_DISTRICTS.filter((reg) => {
                                    if (reg.region === "School Nets") {
                                      return next.some((d) => SCHOOLNET_VALUES.includes(d));
                                    }
                                    return next.some((d) =>
                                      reg.districts.some((rd) => rd.value === d)
                                    );
                                  }).map((reg) => reg.region);
                                  onFiltersChange({
                                    ...filters,
                                    districts: next,
                                    locations: regions,
                                  });
                                }}
                                cols={1}
                              />
                            </div>
                          ))}
                        </div>
                      ) : r.districts.length > 0 ? (
                        <CheckboxGroup
                          options={r.districts}
                          selected={filters.districts}
                          onChange={(v) => {
                            // keep districts from other regions, replace this region's
                            const otherRegions = filters.districts.filter(
                              (d) => !r.districts.some((rd) => rd.value === d)
                            );
                            const inThisRegion = v.filter((d) =>
                              r.districts.some((rd) => rd.value === d)
                            );
                            const next = [...otherRegions, ...inThisRegion];
                            // also mirror region selection in `locations` for backward compat
                            const regions = REGION_DISTRICTS.filter((reg) => {
                              if (reg.region === "School Nets") {
                                return next.some((d) => SCHOOLNET_VALUES.includes(d));
                              }
                              return next.some((d) =>
                                reg.districts.some((rd) => rd.value === d)
                              );
                            }).map((reg) => reg.region);
                            onFiltersChange({
                              ...filters,
                              districts: next,
                              locations: regions,
                            });
                          }}
                          cols={2}
                        />
                      ) : (
                        <p className="px-2 py-1 text-xs text-muted-foreground">—</p>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
            {(filters.districts.length > 0 || filters.locations.length > 0) && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 w-full text-xs"
                onClick={() =>
                  onFiltersChange({ ...filters, districts: [], locations: [] })
                }
              >
                {t("filter.clearSelection")}
              </Button>
            )}
          </PopoverContent>
        </Popover>

        {/* 3. Price */}
        <Popover>
          <PopoverTrigger asChild>
            <span>
              <FilterTrigger
                label={searchMode === "rent" ? t("filter.monthlyRent") : t("filter.salePrice")}
                active={isPriceCustom}
                summary={
                  isPriceCustom
                    ? `${formatPrice(filters.priceRange[0], searchMode, language)} – ${formatPrice(filters.priceRange[1], searchMode, language)}`
                    : undefined
                }
              />
            </span>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-3" align="start">
            <div className="mb-3 flex gap-1 rounded-md bg-muted p-0.5 text-xs">
              <button
                type="button"
                className={cn(
                  "flex-1 rounded px-2 py-1.5 transition",
                  priceTab === "preset" ? "bg-background shadow-sm" : "text-muted-foreground"
                )}
                onClick={() => setPriceTab("preset")}
              >
                {t("filter.priceRange")}
              </button>
              <button
                type="button"
                className={cn(
                  "flex-1 rounded px-2 py-1.5 transition",
                  priceTab === "custom" ? "bg-background shadow-sm" : "text-muted-foreground"
                )}
                onClick={() => setPriceTab("custom")}
              >
                {t("filter.opt.price.custom")}
              </button>
            </div>

            {priceTab === "preset" ? (
              <div className="space-y-1">
                {priceConfig.presets.map((p) => {
                  const isSel =
                    filters.priceRange[0] === p.value[0] &&
                    filters.priceRange[1] === p.value[1];
                  return (
                    <button
                      type="button"
                      key={p.tKey}
                      onClick={() => set("priceRange", p.value)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-sm transition hover:bg-muted",
                        isSel && "bg-[#FFD54F]/30 font-medium"
                      )}
                    >
                      <span>{t(p.tKey)}</span>
                      {isSel && <span className="text-[10px]">✓</span>}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{formatPrice(filters.priceRange[0], searchMode, language)}</span>
                  <span>{formatPrice(filters.priceRange[1], searchMode, language)}</span>
                </div>
                <Slider
                  min={priceConfig.min}
                  max={priceConfig.max}
                  step={priceConfig.step}
                  value={filters.priceRange}
                  onValueChange={(v) => set("priceRange", v as [number, number])}
                />
              </div>
            )}

            {isPriceCustom && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 w-full text-xs"
                onClick={() => set("priceRange", [priceConfig.min, priceConfig.max])}
              >
                {t("filter.resetRange")}
              </Button>
            )}
          </PopoverContent>
        </Popover>

        {/* 4. Saleable Area */}
        <Popover>
          <PopoverTrigger asChild>
            <span>
              <FilterTrigger
                label={t("filter.area")}
                active={isAreaCustom}
                summary={
                  isAreaCustom
                    ? `${filters.sizeRange[0]} – ${filters.sizeRange[1]} ${t("filter.unit.area")}`
                    : undefined
                }
              />
            </span>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-3" align="start">
            <div className="mb-3 flex gap-1 rounded-md bg-muted p-0.5 text-xs">
              <button
                type="button"
                className={cn(
                  "flex-1 rounded px-2 py-1.5 transition",
                  areaTab === "preset" ? "bg-background shadow-sm" : "text-muted-foreground"
                )}
                onClick={() => setAreaTab("preset")}
              >
                {t("filter.area")}
              </button>
              <button
                type="button"
                className={cn(
                  "flex-1 rounded px-2 py-1.5 transition",
                  areaTab === "custom" ? "bg-background shadow-sm" : "text-muted-foreground"
                )}
                onClick={() => setAreaTab("custom")}
              >
                {t("filter.opt.price.custom")}
              </button>
            </div>

            {areaTab === "preset" ? (
              <div className="space-y-1">
                {AREA_PRESETS.map((p) => {
                  const isSel =
                    filters.sizeRange[0] === p.value[0] &&
                    filters.sizeRange[1] === p.value[1];
                  return (
                    <button
                      type="button"
                      key={p.tKey}
                      onClick={() => set("sizeRange", p.value)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-sm transition hover:bg-muted",
                        isSel && "bg-[#FFD54F]/30 font-medium"
                      )}
                    >
                      <span>{t(p.tKey)}</span>
                      {isSel && <span className="text-[10px]">✓</span>}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{filters.sizeRange[0]} {t("filter.unit.area")}</span>
                  <span>{filters.sizeRange[1]} {t("filter.unit.area")}</span>
                </div>
                <Slider
                  min={0}
                  max={5000}
                  step={50}
                  value={filters.sizeRange}
                  onValueChange={(v) => set("sizeRange", v as [number, number])}
                />
              </div>
            )}

            {isAreaCustom && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 w-full text-xs"
                onClick={() => set("sizeRange", [0, 5000])}
              >
                {t("filter.resetRange")}
              </Button>
            )}
          </PopoverContent>
        </Popover>

        {/* 5. Bedrooms — pill toggles */}
        <Popover>
          <PopoverTrigger asChild>
            <span>
              <FilterTrigger
                label={t("filter.bedrooms")}
                count={filters.bedrooms.length}
              />
            </span>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="start">
            <div className="flex flex-wrap gap-1.5">
              {BEDROOM_OPTIONS.map((b) => {
                const isSel = filters.bedrooms.includes(b.value);
                return (
                  <button
                    type="button"
                    key={b.value}
                    onClick={() =>
                      set(
                        "bedrooms",
                        isSel
                          ? filters.bedrooms.filter((x) => x !== b.value)
                          : [...filters.bedrooms, b.value]
                      )
                    }
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs transition",
                      isSel
                        ? "bg-[#FFD54F] text-black border-[#FFD54F]"
                        : "bg-background hover:bg-muted"
                    )}
                  >
                    {t(b.tKey)}
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>

        {/* 6. More */}
        <Popover>
          <PopoverTrigger asChild>
            <span>
              <FilterTrigger label={t("filter.more")} count={moreCount} />
            </span>
          </PopoverTrigger>
          <PopoverContent
            className="w-[640px] max-w-[calc(100vw-2rem)] p-4 max-h-[520px] overflow-y-auto"
            align="start"
          >
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {t("filter.more.age")}
                </p>
                <CheckboxGroup
                  options={AGE_OPTIONS}
                  selected={filters.buildingAge}
                  onChange={(v) => set("buildingAge", v)}
                />
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {t("filter.more.floor")}
                </p>
                <CheckboxGroup
                  options={FLOOR_OPTIONS}
                  selected={filters.floorLevels}
                  onChange={(v) => set("floorLevels", v)}
                />
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {t("filter.more.facilities")}
                </p>
                <CheckboxGroup
                  options={FACILITY_OPTIONS}
                  selected={filters.facilities}
                  onChange={(v) => set("facilities", v)}
                  cols={2}
                />
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {t("filter.more.views")}
                </p>
                <CheckboxGroup
                  options={VIEW_OPTIONS}
                  selected={filters.views}
                  onChange={(v) => set("views", v)}
                  cols={2}
                />
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {t("filter.more.characteristics")}
                </p>
                <CheckboxGroup
                  options={CHARACTERISTIC_OPTIONS}
                  selected={filters.characteristics}
                  onChange={(v) => set("characteristics", v)}
                  cols={2}
                />
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {t("filter.more.developers")}
                </p>
                <CheckboxGroup
                  options={DEVELOPER_OPTIONS}
                  selected={filters.developers}
                  onChange={(v) => set("developers", v)}
                />
              </div>
            </div>

            {moreCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-4 w-full text-xs"
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    buildingAge: [],
                    floorLevels: [],
                    developers: [],
                    facilities: [],
                    views: [],
                    characteristics: [],
                  })
                }
              >
                {t("filter.clearSelection")}
              </Button>
            )}
          </PopoverContent>
        </Popover>
      </div>

      {totalActive > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {totalActive} {t("filter.filtersActive")}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 gap-1 px-2 text-xs"
            onClick={clearAll}
          >
            <X className="h-3 w-3" />
            {t("filter.clearAll")}
          </Button>
        </div>
      )}
    </div>
  );
}