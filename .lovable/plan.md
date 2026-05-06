# Update StatCounter values & shrink "Coming soon"

## Changes

### `src/components/landing/StatCounter.tsx`

Update the `STATS` array with verified values for stats 1 & 2:

```diff
const STATS: StatDef[] = [
-  { key: "listings", value: 0, suffix: "+", labelKey: "stats.listingsIndexed", verified: false, tooltipKey: "stats.listingsTooltip" },
-  { key: "districts", value: 0, labelKey: "stats.districtsCovered", verified: false },
+  { key: "listings", value: 45000, suffix: "+", labelKey: "stats.listingsIndexed", verified: true, tooltipKey: "stats.listingsTooltip" },
+  { key: "districts", value: 17, labelKey: "stats.districtsCovered", verified: true },
   { key: "sources", value: 0, labelKey: "stats.dataSources", verified: false },
   { key: "speed", value: 0, suffix: "s", labelKey: "stats.firstMatch", verified: false },
];
```

In `StatItem`, shrink the "Coming soon" placeholder by 40% only for the 3rd (`sources`) and 4th (`speed`) columns. Change the unverified branch to:

```tsx
<p
  className={
    stat.key === "sources" || stat.key === "speed"
      ? "text-base md:text-lg font-semibold tracking-tight text-muted-foreground italic"
      : "text-2xl md:text-3xl font-semibold tracking-tight text-muted-foreground italic"
  }
>
  {t("stats.comingSoon")}
</p>
```

(40% reduction: `text-2xl`→`text-base`, `text-3xl`→`text-lg`.)

### `src/translations/index.ts`

Update the `stats.firstMatch` label to use the full word "average":
- en: `"average seconds to first match"`
- zh-HK: keep existing wording but ensure it reads "平均…" (full form)
- zh-CN: same — "平均…"

(The Chinese strings already use 平均 fully; only the English string changes from "avg" to "average".)

## Out of Scope

- Layout, grid, dividers, source-attribution footer line — unchanged.
- Tooltip on listings stat — unchanged.
