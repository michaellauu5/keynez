# Filter Refinements: Price Units, Area Label, Developer i18n, Overseas & School Net Lists

## Changes

### 1. `src/translations/index.ts`

**English buy price presets** — replace `万` with millions notation (also applicable to custom range):

- `filter.opt.price.buy.u500`: "Under HK$5M"
- `filter.opt.price.buy.500_1000`: "HK$5M – 10M"
- `filter.opt.price.buy.1000_2000`: "HK$10M – 20M"
- `filter.opt.price.buy.2000_5000`: "HK$20M – 50M"
- `filter.opt.price.buy.5000p`: "Above HK$50M"

(Chinese 萬 / 万 versions stay as-is.)

**English label**: change `filter.area` from "Saleable Area" → **"Area"**. Traditional/Simplified Chinese keep `實用面積` / `实用面积`.

**Add developer translation keys** for all 8 developers in EN / zh-HK / zh-CN, e.g.:

- Sun Hung Kai → 新鴻基地產 / 新鸿基地产
- Henderson Land → 恒基兆業 / 恒基兆业
- New World Development → 新世界發展 / 新世界发展
- Cheung Kong → 長江實業 / 长江实业
- Sino Land → 信和置業 / 信和置业
- Hang Lung → 恆隆地產 / 恒隆地产
- Wharf Holdings → 九龍倉 / 九龙仓
- Kerry Properties → 嘉里建設 / 嘉里建设

**Add Overseas region keys** (8 destinations): UK, Canada, Australia, Singapore, Japan, Thailand, Malaysia, USA — translated in 3 languages.

**Add School Nets keys** organized into 3 groups (Primary / Secondary / University), with HK official Centaline-style nets:

- **Primary nets** (12 representative): 11, 12, 14, 16, 18, 31, 34, 35, 40, 41, 91, 95
- **Secondary**: HK Island, Kowloon, NT regional bands
- **Universities**: HKU, CUHK, HKUST, PolyU, CityU, HKBU etc. 

Each with `filter.opt.schoolnet.*` keys in 3 languages (English uses "Primary Net 11" / Chinese uses "小學11校網" / "小学11校网" etc.)

### 2. `src/components/landing/FilterToggleBar.tsx`

**Fix `DEVELOPER_OPTIONS**` — replace placeholder `tKey` (currently the English name itself) with proper translation keys like `filter.opt.dev.shk`, `filter.opt.dev.henderson`, etc. so the `t(opt.tKey)` lookup succeeds in Chinese. Currently the fallback `t(opt.tKey) === opt.tKey ? opt.value : t(opt.tKey)` always returns English.

**Populate `Overseas` districts** array with 8 destination entries (UK, Canada, Australia, Singapore, Japan, Thailand, Malaysia, USA) using new translation keys.

**Populate `School Nets` districts** — since this region has 3 sub-categories (Primary/Secondary/University) rather than flat districts, render it specially: split the rendered Accordion content for `School Nets` into 3 grouped sub-headings (using `t("filter.opt.schoolnet.primary")` etc.) each with its own checkbox group. Other regions keep the flat `CheckboxGroup` rendering.

## Out of Scope

- No changes to filter selection logic or canonical English value mapping.
- Existing buy price `formatPrice` slider tooltip (which uses `万`) stays — only the preset radio labels change in English.