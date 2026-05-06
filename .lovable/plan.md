
# Add "How It Works" Section

Create a 3-step explainer between the hero and listings on the landing page.

## 1. New file: `src/components/landing/HowItWorks.tsx`

- Functional component using `useTranslation()`.
- Section wrapper: `<section className="py-16 md:py-24">` with a centered container.
- Optional section heading using `t("how.title")` (white text) and subtitle `t("how.subtitle")`.
- Steps list rendered as a responsive grid: `grid grid-cols-1 md:grid-cols-3 gap-8`.
- Each step is a card-less block with:
  - Accent chip: rounded-full icon container, `bg-primary/20` border `border-primary/40`, icon in `text-primary` (uses existing primary accent `#0EA5E9`). A small step number badge (`1`/`2`/`3`) sits above or inside the chip using `bg-primary text-primary-foreground` rounded-full.
  - Title: `text-xl font-semibold text-white`.
  - Description: `text-sm text-white/80 leading-relaxed`.
- Icons (lucide-react):
  1. `MessageSquare` — Tell us what you need
  2. `Sparkles` — AI searches every platform
  3. `LayoutGrid` — Compare and shortlist
- Steps array drives the render; each item: `{ icon, titleKey, descKey }`.
- Sits on the existing dark fixed-image overlay, so no own background — just transparent.

## 2. `src/pages/Index.tsx`

Insert between hero and listings:

```diff
  <HeroSection />
+ <HowItWorks />
  <PropertyListingsSection />
```

Add the import at the top.

## 3. `src/translations/index.ts`

Add the following keys to **each** of `en`, `zh-HK`, `zh-CN` blocks (grouped under a "How It Works Section" comment near the Hero section):

| Key | EN | zh-HK | zh-CN |
|---|---|---|---|
| `how.title` | How it works | 運作方式 | 运作方式 |
| `how.subtitle` | Find your next home in three simple steps | 三個簡單步驟，找到你的下一個家 | 三个简单步骤，找到你的下一个家 |
| `how.step1.title` | Tell us what you need | 告訴我們你的需要 | 告诉我们你的需要 |
| `how.step1.desc` | Describe your ideal place in plain Cantonese, English or Mandarin. | 用廣東話、英文或普通話描述你心目中的理想居所。 | 用粤语、英文或普通话描述你心目中的理想居所。 |
| `how.step2.title` | AI searches every platform | AI 搜遍每個平台 | AI 搜遍每个平台 |
| `how.step2.desc` | We cover 28Hse, Centaline, Midland, Squarefoot, OneDay and owner listings — in one go. | 一次過搜尋 28Hse、中原、美聯、Squarefoot、OneDay 及業主盤。 | 一次性搜寻 28Hse、中原、美联、Squarefoot、OneDay 及业主盘。 |
| `how.step3.title` | Compare and shortlist | 比較與篩選 | 比较与筛选 |
| `how.step3.desc` | Side-by-side comparisons, AI match score, export to PDF or the Research Canvas. | 並排比較、AI 匹配評分，匯出 PDF 或加入研究畫布。 | 并排比较、AI 匹配评分，导出 PDF 或加入研究画布。 |

## Out of scope

- No background image, parallax, or animation framework changes.
- No changes to Hero or Listings components.
- No new routes or data.
