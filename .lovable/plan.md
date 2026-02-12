
# Synchronize Chatbot and Bottom Section Filter Toggles

## Problem
The chatbot (PropertySearchChat) and the bottom property listings section (PropertyListingsSection) each maintain their own independent filter state. Changing filters in one has no effect on the other.

## Solution
Lift filter state up to the Index page and pass it down to both components, with a mapping layer to translate between the two different FilterState interfaces.

## Technical Details

### 1. Create a shared filter context (`src/contexts/FilterSyncContext.tsx`)

A new React context that holds a single source of truth for filters. It stores the chatbot's `FilterToggleBar.FilterState` as the canonical format and exposes:
- `chatFilters` / `setChatFilters` -- used by PropertySearchChat
- `listingFilters` / `setListingFilters` -- used by PropertyListingsSection
- Internal mapping functions to convert between the two FilterState shapes

**Mapping logic:**
- `propertyTypes`: same field, direct sync
- `bedrooms`: chatbot uses `string[]` ("Studio", "1", "2"...), listing uses `number[]` (0, 1, 2...) -- map "Studio" to 0, parse others as integers
- `bathrooms`: similar string-to-number mapping
- `locations` (chatbot) maps to `regions` (listing) -- best-effort match by name
- `priceRange` / `sizeRange`: same tuple format, direct sync
- `transactionType` in listing maps to `searchMode` in chatbot (rent/buy)
- Boolean amenity filters (hasParking, petsAllowed, etc.) in the listing sidebar have no direct equivalent in the chatbot toggles, so they remain independent

### 2. Update `src/pages/Index.tsx`

Wrap `HeroSection` and `PropertyListingsSection` in `FilterSyncProvider`. Pass the shared filter state and callbacks as props to both components.

### 3. Update `src/components/landing/PropertySearchChat.tsx`

- Accept optional `externalFilters` and `onExternalFiltersChange` props
- When filters change internally, also call `onExternalFiltersChange`
- When `externalFilters` changes from outside, update internal `filters` state
- Sync `searchMode` (rent/buy) bidirectionally with the listing's `transactionType`

### 4. Update `src/components/landing/PropertyListingsSection.tsx`

- Accept optional `externalFilters` and `onExternalFiltersChange` props
- When filters change internally, also call `onExternalFiltersChange`
- When `externalFilters` changes from outside, update internal `filters` state

### 5. Update `src/components/landing/HeroSection.tsx`

- Pass through filter sync props from context to `PropertySearchChat`

### Files Changed
| File | Change |
|------|--------|
| `src/contexts/FilterSyncContext.tsx` | New -- shared filter context with mapping logic |
| `src/pages/Index.tsx` | Wrap in FilterSyncProvider, pass shared state |
| `src/components/landing/HeroSection.tsx` | Accept and forward filter sync props |
| `src/components/landing/PropertySearchChat.tsx` | Accept external filter props, sync bidirectionally |
| `src/components/landing/PropertyListingsSection.tsx` | Accept external filter props, sync bidirectionally |

### Behavior
- User toggles "2 bedrooms" in chatbot filters --> bottom listing section also filters to 2 bedrooms
- User selects "Eastern" district in bottom sidebar --> chatbot location filter updates to "Eastern"
- User switches Rent/Buy in chatbot --> bottom listing transactionType changes accordingly
- Amenity-only filters (parking, pets, etc.) in the bottom sidebar remain independent since the chatbot has no equivalent toggles
