

# Bug Fix Plan: Price Filters, Webhook, and Suggested Prompts

## Bug Fix 1: Dynamic Price Filter Ranges (Rent vs Buy)

**Problem**: The price filter uses a static range of HK$0-200M regardless of Rent or Buy mode. This makes the slider unusable for rent searches (where prices are HK$2k-100k).

**Solution**: Pass `searchMode` into `FilterToggleBar` and dynamically configure the price slider based on transaction type.

### Changes

**`src/components/landing/FilterToggleBar.tsx`**:
- Add `searchMode` prop to `FilterToggleBarProps`
- Configure price slider dynamically:
  - Rent: min=2000, max=100000, step=1000, format as `HK$X,XXX`
  - Buy: min=1000000, max=90000000, step=500000, format in wan (万) as `HK$X万`
- Add quick-select preset buttons below the price slider popover
- Update `activeFiltersCount` check to use mode-specific defaults

**`src/components/landing/PropertySearchChat.tsx`**:
- Pass `searchMode` to `FilterToggleBar`
- Update `DEFAULT_FILTERS` price range to be mode-aware
- Reset `priceRange` in filters when `searchMode` changes (useEffect)
- Update `countActiveFilters` to check against mode-specific defaults
- Update webhook payload price range to use correct mode defaults

---

## Bug Fix 2: Webhook Not Sending Reliably

**Problem**: Console logs show "Failed to fetch" errors and one "Unexpected end of JSON input" error. The webhook URL (`webhook-test`) may be timing out or returning empty responses.

**Solution**: Add robust error handling, debug logging, and response validation.

### Changes

**`src/components/landing/PropertySearchChat.tsx`**:
- Add `console.log('Sending webhook payload:', webhookPayload)` before fetch
- Add `console.log('Webhook response status:', response.status)` after fetch
- Add response body text validation before calling `.json()` (check for empty body)
- Add `'Accept': 'application/json'` header to fetch request
- Handle empty response body gracefully (show "Search completed but no data returned")
- Prevent duplicate requests: check `isSearching` before executing and disable double-submit

---

## Bug Fix 3: Suggested Prompts Should Only Populate Input

**Problem**: Clicking a suggested prompt badge immediately triggers `executeSearch()`. Users should be able to edit the text before sending.

**Solution**: Change click handler to only set the input value and focus the field.

### Changes

**`src/components/landing/PropertySearchChat.tsx`**:
- Update `handleSuggestionClick` (line 501-504): Remove the `executeSearch()` call, only set `setSearchQuery(suggestion)` and focus the input
- Update the initial-state suggestion badges (lines 645-648): Same change -- only populate the input, do not auto-search
- Add `inputRef` (useRef) to the Input element for programmatic focus
- Ensure Search button is visually enabled/disabled based on `searchQuery` being non-empty

---

## Technical Summary

| File | Changes |
|------|---------|
| `src/components/landing/FilterToggleBar.tsx` | Add `searchMode` prop, dynamic price config, quick-select buttons |
| `src/components/landing/PropertySearchChat.tsx` | Pass searchMode to filters, fix suggestion click, add webhook logging, reset price on mode switch, add inputRef |

No new files or dependencies needed.

