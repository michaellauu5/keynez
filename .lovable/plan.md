

# Replace Sidebar Filter Logic With Chat Filter Logic (Keep Vertical Layout)

Keep the existing vertical `FilterSidebar` UI/layout exactly as it is, but swap its underlying filter content and logic to mirror the chat's `FilterToggleBar`. Both bars will share the same state via `FilterSyncContext`, so selections stay in sync across all three languages with no drift.

## Scope

```text
[ Property Listings page — layout unchanged ]
  ┌────────────┬─────────────────────────────┐
  │  Sidebar   │  N properties · grid / map  │
  │  (vertical)│                             │
  │  ┌──────┐  │  [ property cards ]         │
  │  │Type  │  │                             │
  │  │Loc   │  │                             │
  │  │Price │  │                             │
  │  │Area  │  │                             │
  │  │Beds  │  │                             │
  │  │More  │  │                             │
  │  └──────┘  │                             │
  └────────────┴─────────────────────────────┘
```

The vertical column stays. Only the **filter fields, options, labels, and matching logic** change to match the chat bar.

## Changes

### 1. `src/components/landing/FilterSidebar.tsx` — rewrite contents, keep shell

- Keep the outer `<aside>` vertical layout, header ("Filters"), Clear All button, mobile Sheet wrapper, and overall styling.
- Replace its `FilterState` shape with the chat's `FilterState` (from `FilterToggleBar`): `propertyTypes`, `priceRange`, `locations`, `districts`, `bedrooms` (string[]), `bathrooms` (string[]), `sizeRange`, `floorLevels`, `buildingAge`, `orientations`, `developers`, `facilities`, `views`, `characteristics`.
- Replace each section with the same option lists and translation keys used by `FilterToggleBar` (Property Type, Location/Region, District, Price, Area, Bedrooms, Bathrooms, Floor, Building Age, Orientation, Developer, Facilities, Views, Characteristics). Render them as stacked vertical sections (Accordion or grouped blocks), not popovers — preserves the sidebar feel.
- Add a `searchMode: "rent" | "buy"` prop so the price slider uses the same min/max defaults as the chat (`2000–100000` rent, `1000000–90000000` buy).
- Drop sidebar-only fields (`transactionType`, `hasParking`, `petsAllowed`, `isFurnished`, `isNew`, `hasSeaView`, `hasPool`, `hasGym`) — these are now expressed via `facilities` / `views` / `characteristics` (matching the chat bar).

### 2. `src/components/landing/PropertyListingsSection.tsx` — wire to shared state + new filter logic

- Stop using `listingFilters` / `setListingFilters` / internal `FilterState`. Read `chatFilters`, `setChatFilters`, `searchMode` from `useFilterSync()`.
- Pass `chatFilters`, `setChatFilters`, `searchMode` to `<FilterSidebar />` (desktop and mobile Sheet).
- Rewrite `mockProperties.filter(...)` against the chat `FilterState`:

| Chat field | Property predicate |
|---|---|
| `searchMode` | `priceType === "rent"` if `"rent"`, else `"sale"` |
| `propertyTypes` | match `property.propertyType` |
| `districts` | match `property.district` (if non-empty) |
| `locations` | match `property.region` (if `districts` empty) |
| `priceRange` | `price` within range |
| `sizeRange` | `size` within range |
| `bedrooms` | `"Studio"→0`, `"5+"→≥5`, else exact |
| `bathrooms` | `"4+"→≥4`, else exact |
| `buildingAge` / `floorLevels` / `developers` | match corresponding property field |
| `facilities` | every selected ∈ `property.features` (Parking also honours `hasParking`) |
| `views` | `"${view} View"` ∈ `property.features` |
| `characteristics` | `New→isNew`, `Furnished→isFurnished`, `Pet-friendly→petsAllowed`, `Duplex→features.includes("Duplex")` |

Counter and grid/map toggle untouched.

### 3. `src/contexts/FilterSyncContext.tsx` — simplify

Both bars now use the chat `FilterState`. Drop the listing half:
- Remove `listingFilters`, `setListingFilters`, `defaultListingFilters`, all bedroom/bathroom/transactionType mapping helpers, and the cross-sync inside the setters.
- Keep `chatFilters` / `setChatFilters` / `searchMode` / `setSearchMode`.
- Update `FilterSyncContextValue` accordingly.

## Translations

No new keys. All option labels and section headings reuse the keys already defined for `FilterToggleBar` across `en` / `zh-HK` / `zh-CN`.

## Out of Scope

- `FilterToggleBar.tsx`, `PropertySearchChat.tsx`, AI search payload — untouched.
- `PropertyGrid`, `GoogleMapView`, `StatCounter`, `VideoDemo` — untouched.
- `AdvancedFilterSidebar.tsx` (used elsewhere) — untouched.
- No data-model changes to `mockProperties`.
- No visual restyle of the sidebar — same width, padding, header, Clear All, mobile Sheet.

