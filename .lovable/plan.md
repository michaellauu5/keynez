# Restructure Filters to Match Centaline + Fix CJK Font Consistency

Refactor `FilterToggleBar` to exactly 6 dropdowns mirroring [hk.centanet.com](https://hk.centanet.com/findproperty/en/list/rent), with localized option labels in EN / 繁中 / 简中, and add a CJK-safe font stack so Chinese characters render with consistent weight.

## 1. Six Filter Dropdowns (replaces current 10)


| #   | Dropdown          | Behavior                                                                                                                                                                                                                                                                                                                                                                   |
| --- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Type**          | Single-level multi-select: Apartment, Carpark, Office, Shop                                                                                                                                                                                                                                                                                                                |
| 2   | **Location**      | Two-level cascading: 6 regions → districts. Regions: Hong Kong Island, Kowloon, New Territories, Outlying Islands, Overseas, School Nets. Each expands inline (accordion) to district checkboxes. (futher cascade to sub districts according to Hong Kong's official district classifications, e.g. wan chai, tsim sha tsui etc. refer to centaline website for reference) |
| 3   | **Price**         | Preset radio list (Under HK$5,000/mo; 5,000–10,000; 10,000–15,000; 15,000–20,000; 20,000–30,000; 30,000–50,000; >50,000) **+ Custom range** slider toggle. Buy mode swaps to 万-based presets.                                                                                                                                                                              |
| 4   | **Saleable Area** | Range slider with presets (<300, 300–500, 500–800, 800–1200, 1200+ sqft) + custom.                                                                                                                                                                                                                                                                                         |
| 5   | **Bedrooms**      | Pill toggles: Studio, 1, 2, 3, 4+                                                                                                                                                                                                                                                                                                                                          |
| 6   | **More**          | Wide popover with 5 sub-sections: Building Age / Floor (High/Mid/Low) / Developers / Facilities (Pool, Gym, Clubhouse, Parking) / Views (Sea, Mountain, City, Garden) / Characteristics (New, Furnished, Pet-friendly, Duplex).                                                                                                                                            |


Existing FilterState shape extended with `districts: string[]` and `facilities: string[]`, `views: string[]`, `characteristics: string[]`. `bathrooms`, `orientations` removed from the toggle bar (kept in advanced sidebar to avoid breaking other components).

## 2. Localized Option Labels (3 languages)

Currently option lists (`PROPERTY_TYPES`, `LOCATIONS`, `BEDROOMS`, etc.) are hardcoded English strings. Move them to `src/translations/index.ts` under new keys, e.g.:

```
filter.opt.type.apartment   → Apartment / 住宅 / 住宅
filter.opt.type.carpark     → Carpark   / 車位 / 车位
filter.opt.region.hki       → Hong Kong Island / 香港島 / 香港岛
filter.opt.region.kln       → Kowloon / 九龍 / 九龙
...
```

Replace hardcoded arrays in `FilterToggleBar` with arrays of translation keys, render via `t(key)`. Selected values stored as canonical English keys (so filtering logic in `PropertyListingsSection` and `FilterSyncContext` mapping doesn't break).

## 3. CJK Font Consistency

The current `--font-sans` (`Work Sans`) has no Chinese glyphs, so the browser falls back to the system Chinese font per-character — causing the inconsistent weight ("bold characters sparingly") the user reported.

**Fix in `src/index.css`:**

- Import Noto Sans TC (繁) and Noto Sans SC (简) at weights 400/500/600/700 from Google Fonts.
- Update `--font-sans` to: `'Work Sans', 'Noto Sans TC', 'Noto Sans SC', ui-sans-serif, system-ui, ...`
- Add `html[lang="zh-HK"]` → font-family includes Noto Sans TC first; `html[lang="zh-CN"]` → Noto Sans SC first.
- Wire `LanguageContext` to set `document.documentElement.lang` whenever language changes.

This guarantees one consistent typeface family across all CJK glyphs at every weight.

## Files Changed


| File                                                            | Change                                                                                                                     |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `src/components/landing/FilterToggleBar.tsx`                    | Rewrite to 6 dropdowns with cascading Location and "More" mega-popover; use translation keys                               |
| `src/translations/index.ts`                                     | Add `filter.opt.*` keys for type/region/district/price-presets/area-presets/bedrooms/more sub-sections in EN, zh-HK, zh-CN |
| `src/contexts/LanguageContext.tsx`                              | Set `document.documentElement.lang` on language change                                                                     |
| `src/index.css`                                                 | Add Noto Sans TC/SC imports, update `--font-sans` stack, add `html[lang]` rules                                            |
| `src/components/landing/FilterToggleBar.tsx` (FilterState type) | Add `districts`, `facilities`, `views`, `characteristics`                                                                  |
| `src/contexts/FilterSyncContext.tsx`                            | Update default chat filters with new fields, extend mapping                                                                |
| `src/components/landing/PropertySearchChat.tsx`                 | Update default filter state with new fields (no behavior change)                                                           |


## Out of Scope

- The advanced sidebar (`FilterSidebar.tsx`) keeps its current full filter set; only the toggle bar is restructured.
- Bathrooms/orientation no longer in toggle bar but remain available in advanced sidebar.
- Centaline's exact district lists per region will be modeled best-effort from existing `LOCATIONS`.