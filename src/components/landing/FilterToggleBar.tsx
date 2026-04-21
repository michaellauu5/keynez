import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

export interface FilterState {
  propertyTypes: string[];
  priceRange: [number, number];
  locations: string[];
  bedrooms: string[];
  bathrooms: string[];
  sizeRange: [number, number];
  floorLevels: string[];
  buildingAge: string[];
  orientations: string[];
  developers: string[];
}

interface FilterToggleBarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  searchMode?: "rent" | "buy";
}

const PROPERTY_TYPES = ["Apartment", "House", "Commercial", "Studio", "Penthouse"];
const LOCATIONS = [
  "Central & Western",
  "Wan Chai",
  "Eastern",
  "Southern",
  "Yau Tsim Mong",
  "Sham Shui Po",
  "Kowloon City",
  "Kwun Tong",
  "Tsuen Wan",
  "Tuen Mun",
  "Yuen Long",
  "Sha Tin",
  "Sai Kung",
  "Islands",
];
const BEDROOMS = ["Studio", "1", "2", "3", "4", "5+"];
const BATHROOMS = ["1", "2", "3", "4+"];
const FLOOR_LEVELS = ["Low (1-10)", "Mid (11-25)", "High (26-40)", "Ultra High (40+)"];
const BUILDING_AGE = ["New Build", "<5 years", "<10 years", "<20 years", "20+ years"];
const ORIENTATIONS = ["North", "South", "East", "West", "Sea View", "Mountain View", "City View"];
const DEVELOPERS = [
  "Sun Hung Kai",
  "Henderson Land",
  "New World Development",
  "Cheung Kong",
  "Sino Land",
  "Hang Lung",
  "Wharf Holdings",
  "Kerry Properties",
];

const PRICE_CONFIG = {
  rent: {
    min: 2000,
    max: 100000,
    step: 1000,
    format: (v: number) => `HK$${v.toLocaleString()}`,
    presets: [
      { label: "< HK$10,000", value: [2000, 10000] as [number, number] },
      { label: "HK$10k–20k", value: [10000, 20000] as [number, number] },
      { label: "HK$20k–30k", value: [20000, 30000] as [number, number] },
      { label: "HK$30k–50k", value: [30000, 50000] as [number, number] },
      { label: "> HK$50,000", value: [50000, 100000] as [number, number] },
    ],
  },
  buy: {
    min: 1000000,
    max: 90000000,
    step: 500000,
    format: (v: number) => `HK$${(v / 1000000).toFixed(v >= 10000000 ? 0 : 1)}M`,
    presets: [
      { label: "< HK$5M", value: [1000000, 5000000] as [number, number] },
      { label: "HK$5M–10M", value: [5000000, 10000000] as [number, number] },
      { label: "HK$10M–20M", value: [10000000, 20000000] as [number, number] },
      { label: "HK$20M–50M", value: [20000000, 50000000] as [number, number] },
      { label: "> HK$50M", value: [50000000, 90000000] as [number, number] },
    ],
  },
} as const;

interface MultiSelectFilterProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  clearLabel: string;
  compact?: boolean;
}

function FilterPill({ active, children }: { active?: boolean; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex h-10 items-center rounded-full border px-4 text-sm font-medium transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      {children}
    </span>
  );
}

function MultiSelectFilter({ label, options, selected, onChange, clearLabel, compact = false }: MultiSelectFilterProps) {
  const hasSelection = selected.length > 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className="text-left">
          <FilterPill active={hasSelection}>
            <span>{label}</span>
            {hasSelection && <Badge className="ml-2 rounded-full px-2 py-0 text-[11px]">{selected.length}</Badge>}
            <ChevronDown className="ml-2 h-4 w-4" />
          </FilterPill>
        </button>
      </PopoverTrigger>
      <PopoverContent className={cn("rounded-md border border-border bg-background p-4", compact ? "w-56" : "w-64")} align="start">
        <div className="space-y-2">
          {options.map((option) => (
            <label key={option} className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-accent">
              <Checkbox
                checked={selected.includes(option)}
                onCheckedChange={(checked) =>
                  checked ? onChange([...selected, option]) : onChange(selected.filter((item) => item !== option))
                }
              />
              <span className="text-sm text-foreground">{option}</span>
            </label>
          ))}
        </div>
        {hasSelection && (
          <Button variant="ghost" size="sm" className="mt-3 w-full rounded-full" onClick={() => onChange([])}>
            {clearLabel}
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}

interface RangeFilterProps {
  label: string;
  min: number;
  max: number;
  step: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  formatValue: (value: number) => string;
  resetLabel: string;
  presets?: { label: string; value: [number, number] }[];
}

function RangeFilter({ label, min, max, step, value, onChange, formatValue, resetLabel, presets }: RangeFilterProps) {
  const isCustom = value[0] !== min || value[1] !== max;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className="text-left">
          <FilterPill active={isCustom}>
            <span>{label}</span>
            {isCustom && <span className="ml-2 hidden text-xs sm:inline">{formatValue(value[0])} - {formatValue(value[1])}</span>}
            <ChevronDown className="ml-2 h-4 w-4" />
          </FilterPill>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 rounded-md border border-border bg-background p-4" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-foreground">
            <span>{formatValue(value[0])}</span>
            <span>{formatValue(value[1])}</span>
          </div>
          <Slider min={min} max={max} step={step} value={value} onValueChange={(next) => onChange(next as [number, number])} />
          {presets && (
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => {
                const active = value[0] === preset.value[0] && value[1] === preset.value[1];
                return (
                  <Button
                    key={preset.label}
                    variant={active ? "default" : "outline"}
                    size="sm"
                    className="rounded-full"
                    onClick={() => onChange(preset.value)}
                  >
                    {preset.label}
                  </Button>
                );
              })}
            </div>
          )}
          {isCustom && (
            <Button variant="ghost" size="sm" className="w-full rounded-full" onClick={() => onChange([min, max])}>
              {resetLabel}
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function FilterToggleBar({ filters, onFiltersChange, searchMode = "rent" }: FilterToggleBarProps) {
  const { t } = useTranslation();
  const priceConfig = PRICE_CONFIG[searchMode];

  const activeCount = [
    filters.propertyTypes.length > 0,
    filters.locations.length > 0,
    filters.bedrooms.length > 0,
    filters.bathrooms.length > 0,
    filters.floorLevels.length > 0,
    filters.buildingAge.length > 0,
    filters.orientations.length > 0,
    filters.developers.length > 0,
    filters.priceRange[0] !== priceConfig.min || filters.priceRange[1] !== priceConfig.max,
    filters.sizeRange[0] !== 0 || filters.sizeRange[1] !== 5000,
  ].filter(Boolean).length;

  const clearAll = () => {
    onFiltersChange({
      propertyTypes: [],
      priceRange: [priceConfig.min, priceConfig.max],
      locations: [],
      bedrooms: [],
      bathrooms: [],
      sizeRange: [0, 5000],
      floorLevels: [],
      buildingAge: [],
      orientations: [],
      developers: [],
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <MultiSelectFilter
          label={t("filter.location")}
          options={LOCATIONS}
          selected={filters.locations}
          onChange={(locations) => onFiltersChange({ ...filters, locations })}
          clearLabel={t("filter.clearSelection")}
        />
        <RangeFilter
          label={searchMode === "rent" ? t("filter.monthlyRent") : t("filter.salePrice")}
          min={priceConfig.min}
          max={priceConfig.max}
          step={priceConfig.step}
          value={filters.priceRange}
          onChange={(priceRange) => onFiltersChange({ ...filters, priceRange })}
          formatValue={priceConfig.format}
          resetLabel={t("filter.resetRange")}
          presets={priceConfig.presets}
        />
        <MultiSelectFilter
          label={t("filter.bedrooms")}
          options={BEDROOMS}
          selected={filters.bedrooms}
          onChange={(bedrooms) => onFiltersChange({ ...filters, bedrooms })}
          clearLabel={t("filter.clearSelection")}
          compact
        />
        <MultiSelectFilter
          label={t("filter.bathrooms")}
          options={BATHROOMS}
          selected={filters.bathrooms}
          onChange={(bathrooms) => onFiltersChange({ ...filters, bathrooms })}
          clearLabel={t("filter.clearSelection")}
          compact
        />
        <MultiSelectFilter
          label={t("filter.propertyType")}
          options={PROPERTY_TYPES}
          selected={filters.propertyTypes}
          onChange={(propertyTypes) => onFiltersChange({ ...filters, propertyTypes })}
          clearLabel={t("filter.clearSelection")}
        />

        <Popover>
          <PopoverTrigger asChild>
            <button type="button" className="text-left">
              <FilterPill active={filters.floorLevels.length + filters.buildingAge.length + filters.orientations.length + filters.developers.length > 0 || filters.sizeRange[0] !== 0 || filters.sizeRange[1] !== 5000}>
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                {t("filter.moreFilters")}
              </FilterPill>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[min(92vw,720px)] rounded-md border border-border bg-background p-5" align="start">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-4">
                <RangeFilter
                  label={t("filter.size")}
                  min={0}
                  max={5000}
                  step={50}
                  value={filters.sizeRange}
                  onChange={(sizeRange) => onFiltersChange({ ...filters, sizeRange })}
                  formatValue={(value) => `${value.toLocaleString()} sqft`}
                  resetLabel={t("filter.resetRange")}
                />
                <MultiSelectFilter
                  label={t("filter.floorLevel")}
                  options={FLOOR_LEVELS}
                  selected={filters.floorLevels}
                  onChange={(floorLevels) => onFiltersChange({ ...filters, floorLevels })}
                  clearLabel={t("filter.clearSelection")}
                />
                <MultiSelectFilter
                  label={t("filter.buildingAge")}
                  options={BUILDING_AGE}
                  selected={filters.buildingAge}
                  onChange={(buildingAge) => onFiltersChange({ ...filters, buildingAge })}
                  clearLabel={t("filter.clearSelection")}
                />
              </div>
              <div className="space-y-4">
                <MultiSelectFilter
                  label={t("filter.orientation")}
                  options={ORIENTATIONS}
                  selected={filters.orientations}
                  onChange={(orientations) => onFiltersChange({ ...filters, orientations })}
                  clearLabel={t("filter.clearSelection")}
                />
                <MultiSelectFilter
                  label={t("filter.developer")}
                  options={DEVELOPERS}
                  selected={filters.developers}
                  onChange={(developers) => onFiltersChange({ ...filters, developers })}
                  clearLabel={t("filter.clearSelection")}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {activeCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">{activeCount} {t("filter.filtersActive")}</span>
          <Button variant="ghost" size="sm" className="h-7 rounded-full px-3 text-xs" onClick={clearAll}>
            <X className="mr-1 h-3 w-3" />
            {t("filter.clearAll")}
          </Button>
        </div>
      )}
    </div>
  );
}
