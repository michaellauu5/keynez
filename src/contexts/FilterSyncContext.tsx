import { createContext, useContext, useState, useCallback, useRef, ReactNode } from "react";
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

const defaultListingFilters: ListingFilterState = {
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
  hasGym: null,
};

// --- Mapping helpers ---

function bedroomsStrToNum(strs: string[]): number[] {
  return strs.map(s => s === "Studio" ? 0 : s === "5+" ? 5 : parseInt(s)).filter(n => !isNaN(n));
}

function bedroomsNumToStr(nums: number[]): string[] {
  return nums.map(n => n === 0 ? "Studio" : n >= 5 ? "5+" : String(n));
}

function bathroomsStrToNum(strs: string[]): number[] {
  return strs.map(s => s === "4+" ? 4 : parseInt(s)).filter(n => !isNaN(n));
}

function bathroomsNumToStr(nums: number[]): string[] {
  return nums.map(n => n >= 4 ? "4+" : String(n));
}

function modeToTransactionType(mode: "rent" | "buy"): "all" | "sale" | "rent" {
  return mode === "rent" ? "rent" : "sale";
}

function transactionTypeToMode(tt: "all" | "sale" | "rent"): "rent" | "buy" | null {
  if (tt === "rent") return "rent";
  if (tt === "sale") return "buy";
  return null; // "all" has no direct mapping
}

const FilterSyncContext = createContext<FilterSyncContextValue | null>(null);

export function FilterSyncProvider({ children }: { children: ReactNode }) {
  const [chatFilters, setChatFiltersState] = useState<ChatFilterState>(defaultChatFilters);
  const [listingFilters, setListingFiltersState] = useState<ListingFilterState>(defaultListingFilters);
  const [searchMode, setSearchModeState] = useState<"rent" | "buy">("rent");
  
  // Guards to prevent infinite sync loops
  const syncingRef = useRef(false);

  const setChatFilters = useCallback((filters: ChatFilterState) => {
    setChatFiltersState(filters);
    if (syncingRef.current) return;
    syncingRef.current = true;
    
    // Propagate shared fields to listing filters
    setListingFiltersState(prev => ({
      ...prev,
      propertyTypes: filters.propertyTypes,
      bedrooms: bedroomsStrToNum(filters.bedrooms),
      bathrooms: bathroomsStrToNum(filters.bathrooms),
      regions: filters.locations, // locations → regions (best-effort)
      sizeRange: filters.sizeRange,
      // Don't sync priceRange directly — different scales per mode
    }));
    
    syncingRef.current = false;
  }, []);

  const setListingFilters = useCallback((filters: ListingFilterState) => {
    setListingFiltersState(filters);
    if (syncingRef.current) return;
    syncingRef.current = true;

    // Propagate shared fields to chat filters
    setChatFiltersState(prev => ({
      ...prev,
      propertyTypes: filters.propertyTypes,
      bedrooms: bedroomsNumToStr(filters.bedrooms),
      bathrooms: bathroomsNumToStr(filters.bathrooms),
      locations: filters.regions, // regions → locations
      sizeRange: filters.sizeRange,
    }));

    // Sync transactionType → searchMode
    const mappedMode = transactionTypeToMode(filters.transactionType);
    if (mappedMode) {
      setSearchModeState(mappedMode);
    }

    syncingRef.current = false;
  }, []);

  const setSearchMode = useCallback((mode: "rent" | "buy") => {
    setSearchModeState(mode);
    // Sync to listing transactionType
    setListingFiltersState(prev => ({
      ...prev,
      transactionType: modeToTransactionType(mode),
    }));
  }, []);

  return (
    <FilterSyncContext.Provider value={{
      chatFilters,
      setChatFilters,
      listingFilters,
      setListingFilters,
      searchMode,
      setSearchMode,
    }}>
      {children}
    </FilterSyncContext.Provider>
  );
}

export function useFilterSync() {
  const ctx = useContext(FilterSyncContext);
  if (!ctx) throw new Error("useFilterSync must be used within FilterSyncProvider");
  return ctx;
}
