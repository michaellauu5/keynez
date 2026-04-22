

# Fix Mixed-Language Strings in Custom Price & Area Sliders

The custom-range price slider and saleable-area slider in `FilterToggleBar.tsx` show hardcoded `万` and `sqft` regardless of UI language. Make them follow the active language so they match the preset (non-customised) options.

## Changes

### `src/components/landing/FilterToggleBar.tsx`

1. **`formatPrice` becomes language-aware** — accept the current `language` (or pass `t`) and switch the buy-mode unit:
   - `en` → `HK$50M` style: convert from raw value to millions, e.g. `HK$${(v/1_000_000).toLocaleString()}M`
   - `zh-HK` → `HK$${(v/10000).toLocaleString()}萬`
   - `zh-CN` → `HK$${(v/10000).toLocaleString()}万`
   - Rent mode stays `HK$${v.toLocaleString()}` in all languages.

2. **Area slider unit** — replace the hardcoded `sqft` literal in three spots (custom-summary line ~673, and the two slider min/max labels ~728-729) with a translated unit:
   - `en` → `sqft`
   - `zh-HK` → `平方呎`
   - `zh-CN` → `平方尺`
   
   Source it from a new translation key `filter.unit.area` (added to all three locales) and render `{value} {t("filter.unit.area")}`.

3. **Wire `useTranslation`'s `language`** into the component (already imported via `useTranslation`) and pass it to `formatPrice` calls at lines 583, 638, 639.

### `src/translations/index.ts`

Add one new key per locale:
- `en`: `"filter.unit.area": "sqft"`
- `zh-HK`: `"filter.unit.area": "平方呎"`
- `zh-CN`: `"filter.unit.area": "平方尺"`

## Out of Scope
- Preset labels (already localised correctly).
- Rent price formatting (no unit suffix to localise).
- Other components using `sqft` (table headers etc. already have separate localised keys).

