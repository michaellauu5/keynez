import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { FilterState as ChatFilterState } from "@/components/landing/FilterToggleBar";

interface FilterSyncContextValue {
  chatFilters: ChatFilterState;
  setChatFilters: (filters: ChatFilterState) => void;
  searchMode: "rent" | "buy";
  setSearchMode: (mode: "rent" | "buy") => void;
}

const PRICE_DEFAULTS = {
  rent: [2000, 100000] as [number, number],
  buy: [1000000, 90000000] as [number, number],
};

const defaultChatFilters: ChatFilterState = {
  propertyTypes: [],
  priceRange: PRICE_DEFAULTS.rent,
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
};

const FilterSyncContext = createContext<FilterSyncContextValue | null>(null);

export function FilterSyncProvider({ children }: { children: ReactNode }) {
  const [chatFilters, setChatFiltersState] = useState<ChatFilterState>(defaultChatFilters);
  const [searchMode, setSearchModeState] = useState<"rent" | "buy">("rent");

  const setChatFilters = useCallback((filters: ChatFilterState) => {
    setChatFiltersState(filters);
  }, []);

  const setSearchMode = useCallback((mode: "rent" | "buy") => {
    setSearchModeState(mode);
    // Reset price range to new mode defaults if it was at the old mode's defaults
    setChatFiltersState((prev) => ({
      ...prev,
      priceRange: PRICE_DEFAULTS[mode],
    }));
  }, []);

  return (
    <FilterSyncContext.Provider
      value={{ chatFilters, setChatFilters, searchMode, setSearchMode }}
    >
      {children}
    </FilterSyncContext.Provider>
  );
}

export function useFilterSync() {
  const ctx = useContext(FilterSyncContext);
  if (!ctx) throw new Error("useFilterSync must be used within FilterSyncProvider");
  return ctx;
}
