

# Dedicated Buy and Rent Property Listing Pages

## Overview
Create full-featured property search pages at `/buy` and `/rent` routes, modeled after 28hse.com functionality. These pages will feature comprehensive filtering capabilities, multiple view options (list/map toggle), and enhanced user features like saved searches and email alerts.

---

## File Changes Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/pages/BuyPage.tsx` | Create | Dedicated buy listings page |
| `src/pages/RentPage.tsx` | Create | Dedicated rent listings page |
| `src/components/listings/ListingsPageLayout.tsx` | Create | Shared layout component for both pages |
| `src/components/listings/AdvancedFilterSidebar.tsx` | Create | Enhanced filter panel with all options |
| `src/components/listings/ResultsHeader.tsx` | Create | Results count, view toggle, sort options |
| `src/components/listings/MapView.tsx` | Create | Map view placeholder/integration |
| `src/components/listings/SaveSearchDialog.tsx` | Create | Save search modal with email alerts |
| `src/data/mockProperties.ts` | Modify | Add more properties and filter fields |
| `src/components/landing/Header.tsx` | Modify | Update nav links to use proper routes |
| `src/App.tsx` | Modify | Add /buy and /rent routes |

---

## Layout Structure

```text
+----------------------------------------------------------+
|  HEADER (existing, with updated nav links)                |
+----------------------------------------------------------+
|                                                           |
|  Breadcrumb: Home > Buy / Rent > [District if selected]   |
|                                                           |
+----------------------------------------------------------+
|  FILTER      |  RESULTS HEADER                            |
|  SIDEBAR     |  [X properties found] [Save Search]        |
|              |  [Sort: Price v] [View: Grid | Map]        |
|  - District  +--------------------------------------------+
|  - Type      |                                            |
|  - Price     |  PROPERTY GRID (list view)                 |
|  - Size      |  +-------+ +-------+ +-------+             |
|  - Bedrooms  |  | Card  | | Card  | | Card  |             |
|  - Bathrooms |  +-------+ +-------+ +-------+             |
|  - Floor     |  +-------+ +-------+ +-------+             |
|  - Age       |  | Card  | | Card  | | Card  |             |
|  - Orient    |  +-------+ +-------+ +-------+             |
|  - Developer |                                            |
|  - Amenities |  - OR -                                    |
|  - Transport |                                            |
|              |  MAP VIEW (when toggled)                   |
|  [Clear All] |  +-----------------------------------+     |
|              |  |        Interactive Map            |     |
|              |  |     (Pins for properties)         |     |
|              |  +-----------------------------------+     |
|              |                                            |
+--------------+--------------------------------------------+
|                    PAGINATION                             |
|  Showing 1-24 of 1,247 properties    [< 1 2 3 4 5 ... >]  |
+----------------------------------------------------------+
```

---

## Technical Details

### 1. Enhanced Filter State

```typescript
// Extended filter interface
interface ExtendedFilterState {
  // Existing filters
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
  
  // New 28hse-style filters
  floorLevels: string[];      // "Low (1-10)", "Mid (11-25)", "High (26-40)", "Ultra High (40+)"
  buildingAge: string[];      // "New (<5 years)", "Recent (5-10)", "Established (10-20)", "Older (20+)"
  orientations: string[];     // "North", "South", "East", "West"
  developers: string[];       // Searchable dropdown
  nearMTR: boolean | null;    // MTR nearby
  hasBusRoutes: boolean | null;
  
  // Sort and view
  sortBy: "price_asc" | "price_desc" | "size_desc" | "newest" | "relevant";
  viewMode: "grid" | "map";
}
```

### 2. AdvancedFilterSidebar Component

Enhanced sidebar with all filter categories:

| Section | Type | Options |
|---------|------|---------|
| District | Multi-select dropdown | Popular districts at top, grouped by region |
| Property Type | Checkboxes | Apartment, House, Villa, Commercial, Parking, Studio, Penthouse |
| Price Range | Dual sliders | Min/Max with HKD formatting |
| Size Range | Dual sliders | Min/Max in square feet |
| Bedrooms | Button group | Studio, 1, 2, 3, 4, 5+ |
| Bathrooms | Button group | 1, 2, 3, 4+ |
| Floor Level | Checkboxes | Low/Mid/High/Ultra High |
| Building Age | Checkboxes | New, Recent, Established, Older |
| Orientation | Checkboxes | N, S, E, W checkboxes |
| Developer | Searchable dropdown | Sun Hung Kai, Henderson, New World, etc. |
| Amenities | Checkboxes | Pool, Gym, Parking, Pet-friendly, Furnished |
| Transportation | Checkboxes | MTR nearby, Bus routes |

Features:
- Collapsible sections with chevron icons
- "Clear all" button
- Active filter count badges
- Sticky sidebar on desktop
- Sheet/drawer on mobile

### 3. ResultsHeader Component

```typescript
interface ResultsHeaderProps {
  totalCount: number;
  sortBy: string;
  onSortChange: (sort: string) => void;
  viewMode: "grid" | "map";
  onViewModeChange: (mode: "grid" | "map") => void;
  onSaveSearch: () => void;
}
```

Features:
- Total count: "1,247 properties found"
- Sort dropdown: Price (low to high), Price (high to low), Size, Newest, Most relevant
- View toggle: Grid icon / Map icon buttons
- Save Search button with heart/bookmark icon
- Email alerts toggle

### 4. MapView Component (Placeholder)

Simple placeholder for map integration:
- Shows area of Hong Kong
- Message: "Map view coming soon"
- Option to integrate with Google Maps or Mapbox later
- Pin markers for property locations (mock positions)

### 5. SaveSearchDialog Component

Modal for saving search preferences:
- Search name input
- Email alerts checkbox
- Frequency dropdown: Daily, Weekly, Immediately
- Save button
- List of saved searches (localStorage)

### 6. BuyPage and RentPage

Both pages use the shared `ListingsPageLayout` component with:
- `transactionType` prop set to "sale" or "rent"
- Page title and meta info
- Pre-filtered data for the respective type
- Price range adjusted:
  - Buy: HK$0 - HK$200M
  - Rent: HK$0 - HK$200K/month

### 7. Enhanced Mock Data

Update `mockProperties.ts` with:
- 50+ properties for better pagination testing
- New fields: `floorLevel`, `buildingAge`, `orientation`, `developer`, `nearMTR`
- More realistic Hong Kong addresses
- Developer names: Sun Hung Kai, Henderson Land, New World, Cheung Kong, Sino Land

---

## Component Hierarchy

```text
BuyPage / RentPage
└── ListingsPageLayout
    ├── Header (existing)
    ├── Breadcrumbs
    ├── AdvancedFilterSidebar
    │   ├── DistrictSelector
    │   ├── PropertyTypeFilter
    │   ├── PriceRangeSlider
    │   ├── SizeRangeSlider
    │   ├── BedroomSelector
    │   ├── BathroomSelector
    │   ├── FloorLevelFilter
    │   ├── BuildingAgeFilter
    │   ├── OrientationFilter
    │   ├── DeveloperDropdown
    │   ├── AmenitiesFilter
    │   └── TransportationFilter
    ├── ResultsHeader
    │   ├── TotalCount
    │   ├── SortDropdown
    │   ├── ViewToggle
    │   └── SaveSearchButton
    ├── PropertyGrid (existing, reused)
    │   └── PropertyCard (existing)
    ├── MapView (when toggled)
    ├── Pagination
    └── SaveSearchDialog
```

---

## URL Parameters

Support for shareable filtered URLs:

```
/buy?districts=central,mid-levels&bedrooms=2,3&price_max=50000000
/rent?near_mtr=true&furnished=true&sort=price_asc
```

Use `react-router-dom` `useSearchParams` for:
- Reading initial filters from URL
- Updating URL on filter changes
- Shareable search links

---

## Mobile Responsiveness

- **Desktop**: 280px sidebar + 3-column grid
- **Tablet**: Collapsible top filter bar + 2-column grid
- **Mobile**: 
  - Full-width filter sheet (slide from left)
  - Single column cards
  - Sticky results header with filter button
  - Swipe gestures for navigation

---

## Implementation Order

1. Create `AdvancedFilterSidebar.tsx` with all filter options
2. Create `ResultsHeader.tsx` with count, sort, and view toggle
3. Create `MapView.tsx` placeholder component
4. Create `SaveSearchDialog.tsx` modal
5. Create `ListingsPageLayout.tsx` shared layout
6. Create `BuyPage.tsx` and `RentPage.tsx`
7. Update `mockProperties.ts` with new fields and more data
8. Update `Header.tsx` navigation links to use react-router `Link`
9. Add routes to `App.tsx`
10. Add URL parameter support for filters
11. Add pagination component

---

## Visual Design

- Matches existing design system (warm beige/brown tones)
- Filter sidebar: Light background with clear section dividers
- Active filters: Yellow accent badges
- Sort dropdown: Matches existing dropdown styling
- View toggle: Outlined buttons with active state
- Save search: Yellow accent button
- Map placeholder: Gradient overlay with location pin icon

