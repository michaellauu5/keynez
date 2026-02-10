

# Landing Page Redesign Plan

## 1. Fixed Background Image (Full Page)

**File: `src/assets/hero-living-room.png`** -- Replace with the uploaded image (copy `user-uploads://Canva_upscaled_freepik_homey-wide-view-of-a-living-room-with-balcony.png`).

**File: `src/pages/Index.tsx`** -- Move the background image from HeroSection to the Index page level, wrapping all content with a fixed background:
- Apply `background-attachment: fixed`, `background-size: cover`, `background-position: center` on an outer wrapper div
- Add a semi-transparent overlay so content remains readable
- Both HeroSection and PropertyListingsSection scroll over the static background

**File: `src/components/landing/HeroSection.tsx`** -- Remove the background image and overlay from this component (it moves to Index). Keep the section as a transparent container.

## 2. Chatbox Resize and Cleanup

**File: `src/components/landing/PropertySearchChat.tsx`**:
- Remove the entire "initial state" block (lines 655-697): the sparkles icon, "Find Rental Properties" / "Find Properties for Sale" heading, description text, suggested prompt badges, and "More suggestions" button
- Remove `minHeight: 600px` and `maxHeight: 80vh` from the CardContent style -- let the chat box size naturally, at least enlarged to be able to display the entire guidance message
- The chatbox will now contain only: Rent/Buy toggle, filter bar, chat messages area, and the search input

**File: `src/components/landing/HeroSection.tsx`**:
- Change the grid from `lg:grid-cols-[55fr_45fr]` to equal columns or adjust so chatbox and video are similar size
- Remove the full-width map section at the bottom of HeroSection

## 3. Remove Video Description Text

**File: `src/components/landing/VideoDemo.tsx`**:
- Remove the caption paragraph at line 93-95 (`t('video.caption')`)
- Remove the empty title section div (lines 51-55)

## 4. Fix Filter Labels (Chinese Display Bug)

**File: `src/components/landing/FilterToggleBar.tsx`**:
- The price filter label currently shows "月租" (rent) and "售价" (buy) hardcoded in Chinese regardless of language
- Update to use the translation system: use `t('filter.price')` or create new translation keys like `filter.monthlyRent` and `filter.salePrice`
- Add translation keys for all three languages

**File: `src/translations/index.ts`**:
- Add new keys:
  - `filter.monthlyRent`: "Monthly Rent" / "月租" / "月租"
  - `filter.salePrice`: "Sale Price" / "售價" / "售价"

## 5. Update Title and Subtitle

**File: `src/translations/index.ts`**:
- English:
  - `hero.title`: "Your Property Intelligence Companion in" (keep titleAccent as "Hong Kong")
  - `hero.subtitle`: "Fullest property source coverage in town. Professional guidance for every step of your property search"
- Chinese (zh-HK):
  - `hero.title` + `hero.titleAccent`: Combined to form "新一代 · 智能搵樓助理"
  - `hero.subtitle`: Translate the new subtitle
- Chinese (zh-CN):
  - Same approach with simplified characters

**File: `src/components/landing/HeroSection.tsx`**:
- Update `renderTitle()` for Chinese to render "新一代 · 智能搵樓助理" without the hardcoded trailing text "尋找您的理想居所"

## Technical Details

| File | Action |
|------|--------|
| `src/assets/hero-living-room.png` | Replace with new uploaded image |
| `src/pages/Index.tsx` | Add fixed background wrapper around children |
| `src/components/landing/HeroSection.tsx` | Remove bg image/overlay, remove map, update title render, adjust grid |
| `src/components/landing/PropertySearchChat.tsx` | Remove initial state block (suggestions, sparkles, headings) |
| `src/components/landing/VideoDemo.tsx` | Remove caption text and empty title div |
| `src/components/landing/FilterToggleBar.tsx` | Use translation keys for price filter label |
| `src/translations/index.ts` | Update hero.title, hero.subtitle, add filter.monthlyRent / filter.salePrice |

No new dependencies required.

