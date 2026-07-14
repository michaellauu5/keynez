# Plan: unify chat filters + fix language coverage

## 1. Remove the duplicated filter UI

Right now `PropertySearchChat` renders two filter surfaces stacked on top of each other:

- The **original chip-based bar**: the Rent/Buy toggle + `FilterToggleBar` (property types, price, districts, bedrooms, size, floor, age, orientation, developer, facilities, views, characteristics), plus the "X filters active / Clear all" row.
- The **new intake form** (`IntakeForm`) with 租/買 toggle, region → district chips, 預算 slider, 房數, 面積, 軟性偏好, notes.

The intake form is the newer, richer, and required-fields-validated one, and it already owns the same axes (transaction type, districts, budget, bedrooms, sqft). We'll **remove the older bar** and keep the intake form as the single source of truth.

Changes in `src/components/landing/PropertySearchChat.tsx`:

- Remove the JSX block that renders the Rent/Buy pill toggle + `Filter` label row + `FilterToggleBar` (roughly lines 503–560).
- Remove imports that become unused: `FilterToggleBar`, `Filter`, `X`, `Home`, `Key`, `Badge`, `countActiveFilters`, `activeFilterCount`, `handleClearAllFilters` and its helpers if no longer used.
- Keep the `searchMode` state, but drive it exclusively from the intake form's `transaction_type` (already wired in `handleIntakeSubmit`). Continue to sync it to parent via `onSearchModeChange`.
- Keep the auto-search-on-filter-change effect but simplify: filter changes now come only from intake submissions, so we can drop the debounced re-run tied to the removed bar. Follow-up searches after intake still go through the chat input.
- `FilterSyncContext`/`externalFilters`: keep the prop shape so `HeroSection` still compiles, but populate `filters` from the intake payload inside `handleIntakeSubmit` (map districts, priceRange, bedrooms, sizeRange) so downstream consumers (property listings sync) keep working. No behavior change for them beyond filters now being sourced from intake.
- The "修改搜尋條件" button (already present) remains the only way to change filters after the first submit — this is the "integrate to make it cleaner" behavior the user asked for.

`FilterToggleBar.tsx` itself is still used by `PropertyListingsSection` / listings pages, so we leave the file in place; we only stop rendering it inside the chat.

## 2. Make chat UI honor the page language

The language selector supports **English / 繁體中文 / 简体中文**, but several chat surfaces are hardcoded (mostly to Traditional Chinese). Route every user-visible string through `useTranslation()` and add matching keys to all three locales in `src/translations/index.ts`.

Strings to translate (with new i18n keys):

`PropertySearchChat.tsx`:
- `chat.tool.query_listings` — "Searching listings…" / "正在搜尋盤源指數…" / "正在搜寻盘源指数…"
- `chat.tool.district_stats` — market analysis line
- `chat.tool.get_listing_detail` — verifying listing details line
- `chat.tool.generic` — "Running {name}…" template
- `chat.status.default` — "Analyzing…" / "分析中…" / "分析中…"
- `chat.status.composing` — "Composing reply…" / "正在整理回覆…"
- `chat.error.timeout` — "⚠️ Agent response timed out. Please try again."
- `chat.error.prefix` — "⚠️ {message}"
- `chat.intake.updatedNote` — "Filters updated." / "已更新篩選條件。"
- `chat.intake.title` — "Tell me what you're looking for" / "告訴我您想找什麼"
- `chat.intake.subtitle` — "Fill in your criteria to start; you can revise anytime."
- `chat.intake.modifyButton` — "Edit criteria" / "修改搜尋條件"
- `chat.intake.modifyDialogTitle` — same
- `chat.intake.submitUpdate` — "Update search" / "更新搜尋"
- `chat.input.followupPlaceholder` — English/繁/简 versions of the follow-up hint.

`ChatMessageList.tsx`:
- Fallback string on line 290 ("分析中…") → use `chat.status.default`.
- Any other hardcoded UI copy in the file (retry button, empty state, section headers) — audit and translate.

`IntakeForm.tsx`:
- All hardcoded Chinese labels: `intake.bedroom.studio` (開放式), soft-preference labels (近地鐵, 樓齡較新, 景觀, 連傢電, 有裝修, 業主盤, 可養寵物, 有會所, 寧靜, 高層), validation messages ("請選擇至少一個地區", "預算上限必須大於下限"), sqft toggle labels ("重設為不限" / "設定範圍"), notes placeholder, default `submitLabel` ("開始搜尋"), and section headings inside the form (租/買, 地區, 預算, 房數, 面積, 軟性偏好, 備註).
- Region preset labels 港島/九龍/新界 and the district chip labels stay in Chinese as **data values** (the backend expects Traditional Chinese district names per project rules), but their surrounding UI labels get translated.

`RecommendationsView.tsx`:
- Table headers on lines 103–104 (排名, 屋苑/大廈, 地區, 價格, 房數, 面積, 樓齡, 距離港鐵, 景觀, 特色, 評分, 代理/業主, 來源) → i18n keys under `rec.table.*`.
- "查看原盤" button, "已剔除 N 個資料不完整的盤源" muted line, "—" placeholder is fine.

`translations/index.ts`:
- Add all new keys to `en`, `zh-HK`, `zh-CN` blocks. Traditional stays as today; add English and Simplified equivalents. Reuse existing keys where they already exist (`chat.toggle.rent`, `filter.filters`, etc. — but most of those are on the bar we're removing).

## 3. Verification

- Type-check passes.
- Visually confirm the chat card shows only the intake form before first search, and the "Edit criteria" button after.
- Switch language to English and 简体中文 in the header dropdown, then open the chat: intake labels, tool status animations, streaming placeholders, retry copy, and recommendations table header all follow the selection.
- Submit a search in each language and confirm the tool status line ("Searching listings…") localizes.

## Out of scope

- The `FilterToggleBar` component itself and the listings pages that use it — untouched.
- Backend `intake` payload contract — unchanged; districts still sent in Traditional Chinese.
- Any styling redesign of the intake form beyond removing the sibling bar above it.
