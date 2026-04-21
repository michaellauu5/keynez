import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { FilterState as ChatFilterState } from "@/components/landing/FilterToggleBar";
import { FilterState as ListingFilterState } from "@/components/landing/FilterSidebar";

interface FilterSyncContextValue {
  chatFilters: ChatFilterState;
  setChatFilters: (filters: ChatFilterState) => void;
  listingFilters: ListingFilterState;
  setListingFilters: (filters: ListingFilterState) => void;
  searchMode: "rent" | "buy";
  setSearchMode: (mode: "rent" | "buy") => void;
}

const PRICE_DEFAULTS = {
  rent: [2000, 100000] as [number, number],
  buy: [1000000, 90000000] as [number, number],
};

const defaultChatFilters = (mode: "rent" | "buy"): ChatFilterState => ({
  propertyTypes: [],
  priceRange: PRICE_DEFAULTS[mode],
  locations: [],
  bedrooms: [],
  bathrooms: [],
  sizeRange: [0, 5000],
  floorLevels: [],
  buildingAge: [],
  orientations: [],
  developers: [],
});

const defaultListingFilters = (mode: "rent" | "buy"): ListingFilterState => ({
  transactionType: mode === "rent" ? "rent" : "sale",
  regions: [],
  districts: [],
  propertyTypes: [],
  priceRange: PRICE_DEFAULTS[mode],
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

function bedroomsStrToNum(strs: string[]): number[] {
  return strs.map((s) => (s === "Studio" ? 0 : s === "5+" ? 5 : parseInt(s, 10))).filter((n) => !Number.isNaN(n));
}

function bedroomsNumToStr(nums: number[]): string[] {
  return nums.map((n) => (n === 0 ? "Studio" : n >= 5 ? "5+" : String(n)));
}

function bathroomsStrToNum(strs: string[]): number[] {
  return strs.map((s) => (s === "4+" ? 4 : parseInt(s, 10))).filter((n) => !Number.isNaN(n));
}

function bathroomsNumToStr(nums: number[]): string[] {
  return nums.map((n) => (n >= 4 ? "4+" : String(n)));
}

const FilterSyncContext = createContext<FilterSyncContextValue | null>(null);

export function FilterSyncProvider({ children }: { children: ReactNode }) {
  const [searchMode, setSearchModeState] = useState<"rent" | "buy">("rent");
  const [chatFilters, setChatFiltersState] = useState<ChatFilterState>(defaultChatFilters("rent"));
  const [listingFilters, setListingFiltersState] = useState<ListingFilterState>(defaultListingFilters("rent"));

  const setChatFilters = useCallback(
    (filters: ChatFilterState) => {
      setChatFiltersState(filters);
      setListingFiltersState((prev) => ({
        ...prev,
        transactionType: searchMode === "rent" ? "rent" : "sale",
        propertyTypes: filters.propertyTypes,
        priceRange: filters.priceRange,
        regions: filters.locations,
        bedrooms: bedroomsStrToNum(filters.bedrooms),
        bathrooms: bathroomsStrToNum(filters.bathrooms),
        sizeRange: filters.sizeRange,
      }));
    },
    [searchMode]
  );

  const setListingFilters = useCallback((filters: ListingFilterState) => {
    setListingFiltersState(filters);
    const nextMode = filters.transactionType === "sale" ? "buy" : "rent";
    setSearchModeState(nextMode);
    setChatFiltersState((prev) => ({
      ...prev,
      propertyTypes: filters.propertyTypes,
      priceRange: filters.priceRange,
      locations: filters.regions,
      bedrooms: bedroomsNumToStr(filters.bedrooms),
      bathrooms: bathroomsNumToStr(filters.bathrooms),
      sizeRange: filters.sizeRange,
    }));
  }, []);

  const setSearchMode = useCallback((mode: "rent" | "buy") => {
    setSearchModeState(mode);
    setChatFiltersState((prev) => ({ ...prev, ...defaultChatFilters(mode) }));
    setListingFiltersState((prev) => ({
      ...prev,
      transactionType: mode === "rent" ? "rent" : "sale",
      priceRange: PRICE_DEFAULTS[mode],
      propertyTypes: [],
      regions: [],
      districts: [],
      bedrooms: [],
      bathrooms: [],
      sizeRange: [0, 5000],
    }));
  }, []);

  return (
    <FilterSyncContext.Provider
      value={{
        chatFilters,
        setChatFilters,
        listingFilters,
        setListingFilters,
        searchMode,
        setSearchMode,
      }}
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
