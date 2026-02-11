

# Edit Hero Subtitle Text

## What Changes
The hero subtitle (translation key `hero.subtitle`) will be split into three separate lines with the period removed and a new sentence added.

## Current Text
"Fullest property source coverage in town. Professional guidance for every step of your property search."

## New Text (3 lines)
1. Fullest property source coverage in town
2. Professional guidance for every step of your property search
3. Best place to find great property deals

## Technical Details

**File: `src/translations/index.ts`**

Update the `hero.subtitle` value for all three languages:

- **English**: Change to `"Your first companion for property search in Hong Kong · Fullest property source coverage in town\n One stop professional comparioson tool\n Best place to find great property deals · powered by AI"`
- **zh-HK**: Change to `"搵樓第一步 · 涵蓋全港所有平台盤源\n專業對比 · 一眼睇曬\n業主盤 · 筍盤 · AI幫你慳到盡"`
- **zh-CN**: Change to `"找房第一步 · 覆盖全港所有平台盘源\n专业对比 · 一眼看清\n业主盘 · 优质房源 · AI帮您规划"`

**File: `src/components/landing/HeroSection.tsx`**

Update the `<p>` tag (line 29) to render each line separately using `whitespace-pre-line` so `\n` characters produce line breaks:

Change:
```tsx
<p className="mx-auto mt-4 max-w-2xl text-white/90 text-shadow-lg">
```
To:
```tsx
<p className="mx-auto mt-4 max-w-2xl text-white/90 text-shadow-lg whitespace-pre-line">
```

