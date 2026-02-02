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
import { ChevronDown, X } from "lucide-react";
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
  "Wong Tai Sin",
  "Kwun Tong",
  "Tsuen Wan",
  "Tuen Mun",
  "Yuen Long",
  "North",
  "Tai Po",
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

interface MultiSelectFilterProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  clearLabel: string;
}

function MultiSelectFilter({ label, options, selected, onChange, clearLabel }: MultiSelectFilterProps) {
  const hasSelection = selected.length > 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={hasSelection ? "default" : "outline"}
          size="sm"
          className={cn(
            "h-8 gap-1 rounded-full text-xs font-medium transition-all",
            hasSelection && "bg-accent text-accent-foreground hover:bg-accent/90"
          )}
        >
          {label}
          {hasSelection && (
            <Badge variant="secondary" className="ml-1 h-5 min-w-5 rounded-full px-1.5 text-xs">
              {selected.length}
            </Badge>
          )}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3" align="start">
        <div className="space-y-2">
          {options.map((option) => (
            <label
              key={option}
              className="flex cursor-pointer items-center gap-2 rounded-md p-1.5 hover:bg-muted"
            >
              <Checkbox
                checked={selected.includes(option)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onChange([...selected, option]);
                  } else {
                    onChange(selected.filter((s) => s !== option));
                  }
                }}
              />
              <span className="text-sm">{option}</span>
            </label>
          ))}
        </div>
        {hasSelection && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full text-xs"
            onClick={() => onChange([])}
          >
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
}

function RangeFilter({ label, min, max, step, value, onChange, formatValue, resetLabel }: RangeFilterProps) {
  const hasCustomRange = value[0] !== min || value[1] !== max;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={hasCustomRange ? "default" : "outline"}
          size="sm"
          className={cn(
            "h-8 gap-1 rounded-full text-xs font-medium transition-all",
            hasCustomRange && "bg-accent text-accent-foreground hover:bg-accent/90"
          )}
        >
          {label}
          {hasCustomRange && (
            <span className="ml-1 text-xs opacity-80">
              {formatValue(value[0])} - {formatValue(value[1])}
            </span>
          )}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span>{formatValue(value[0])}</span>
            <span>{formatValue(value[1])}</span>
          </div>
          <Slider
            min={min}
            max={max}
            step={step}
            value={value}
            onValueChange={(v) => onChange(v as [number, number])}
            className="w-full"
          />
          {hasCustomRange && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => onChange([min, max])}
            >
              {resetLabel}
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function FilterToggleBar({ filters, onFiltersChange }: FilterToggleBarProps) {
  const { t } = useTranslation();
  
  const activeFiltersCount = [
    filters.propertyTypes.length > 0,
    filters.priceRange[0] !== 0 || filters.priceRange[1] !== 200000000,
    filters.locations.length > 0,
    filters.bedrooms.length > 0,
    filters.bathrooms.length > 0,
    filters.sizeRange[0] !== 0 || filters.sizeRange[1] !== 5000,
    filters.floorLevels.length > 0,
    filters.buildingAge.length > 0,
    filters.orientations.length > 0,
    filters.developers.length > 0,
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    onFiltersChange({
      propertyTypes: [],
      priceRange: [0, 200000000],
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
      <div className="flex flex-wrap items-center gap-2">
        <MultiSelectFilter
          label={t('filter.propertyType')}
          options={PROPERTY_TYPES}
          selected={filters.propertyTypes}
          onChange={(v) => onFiltersChange({ ...filters, propertyTypes: v })}
          clearLabel={t('filter.clearSelection')}
        />
        <RangeFilter
          label={t('filter.price')}
          min={0}
          max={200000000}
          step={1000000}
          value={filters.priceRange}
          onChange={(v) => onFiltersChange({ ...filters, priceRange: v })}
          formatValue={(v) => `HK$${(v / 1000000).toFixed(0)}M`}
          resetLabel={t('filter.resetRange')}
        />
        <MultiSelectFilter
          label={t('filter.location')}
          options={LOCATIONS}
          selected={filters.locations}
          onChange={(v) => onFiltersChange({ ...filters, locations: v })}
          clearLabel={t('filter.clearSelection')}
        />
        <MultiSelectFilter
          label={t('filter.bedrooms')}
          options={BEDROOMS}
          selected={filters.bedrooms}
          onChange={(v) => onFiltersChange({ ...filters, bedrooms: v })}
          clearLabel={t('filter.clearSelection')}
        />
        <MultiSelectFilter
          label={t('filter.bathrooms')}
          options={BATHROOMS}
          selected={filters.bathrooms}
          onChange={(v) => onFiltersChange({ ...filters, bathrooms: v })}
          clearLabel={t('filter.clearSelection')}
        />
        <RangeFilter
          label={t('filter.size')}
          min={0}
          max={5000}
          step={50}
          value={filters.sizeRange}
          onChange={(v) => onFiltersChange({ ...filters, sizeRange: v })}
          formatValue={(v) => `${v} sqft`}
          resetLabel={t('filter.resetRange')}
        />
        <MultiSelectFilter
          label={t('filter.floorLevel')}
          options={FLOOR_LEVELS}
          selected={filters.floorLevels}
          onChange={(v) => onFiltersChange({ ...filters, floorLevels: v })}
          clearLabel={t('filter.clearSelection')}
        />
        <MultiSelectFilter
          label={t('filter.buildingAge')}
          options={BUILDING_AGE}
          selected={filters.buildingAge}
          onChange={(v) => onFiltersChange({ ...filters, buildingAge: v })}
          clearLabel={t('filter.clearSelection')}
        />
        <MultiSelectFilter
          label={t('filter.orientation')}
          options={ORIENTATIONS}
          selected={filters.orientations}
          onChange={(v) => onFiltersChange({ ...filters, orientations: v })}
          clearLabel={t('filter.clearSelection')}
        />
        <MultiSelectFilter
          label={t('filter.developer')}
          options={DEVELOPERS}
          selected={filters.developers}
          onChange={(v) => onFiltersChange({ ...filters, developers: v })}
          clearLabel={t('filter.clearSelection')}
        />
      </div>

      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {activeFiltersCount} {t('filter.filtersActive')}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 gap-1 px-2 text-xs"
            onClick={clearAllFilters}
          >
            <X className="h-3 w-3" />
            {t('filter.clearAll')}
          </Button>
        </div>
      )}
    </div>
  );
}
