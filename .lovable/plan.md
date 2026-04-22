

# Fix Sidebar Text Visibility & Section Title Keys

Two issues on the vertical FilterSidebar:

1. **Invisible toggle text** — Inactive Bedrooms / Bathrooms buttons (`variant="outline"`) and the Clear All button (`variant="ghost"`) inherit dark foreground text, which disappears against the sidebar's colored background. Active buttons (the green "bubble" style) render correctly and should stay green.
2. **Raw keys leaking** — Section titles for Facilities, Views, and Characteristics show as "filter.facilities", "filter.views", "filter.characteristics" because those translation keys don't exist. The actual keys (used by the chat bar) are `filter.more.facilities`, `filter.more.views`, `filter.more.characteristics`.

## Changes

### `src/components/landing/FilterSidebar.tsx`

**A. Keep inactive toggle text white (active stays green bubble)**

- Bedrooms button (line ~383): add white text classes for inactive state.
  ```tsx
  className={cn(
    "h-8 text-xs",
    active
      ? "bg-accent text-accent-foreground border-transparent"
      : "bg-transparent text-primary-foreground border-primary-foreground/40 hover:bg-primary-foreground/10 hover:text-primary-foreground"
  )}
  ```
- Bathrooms button (line ~405): same treatment (`h-8 w-12 text-xs` preserved).
- Clear All button (line ~283): replace `variant="ghost"` styling with explicit white text:
  ```tsx
  className="h-8 text-xs text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
  ```

No change to active "bubble" styling (`bg-accent text-accent-foreground` = green) — matches user's requirement.

**B. Fix the three section titles** (lines 430, 434, 438):

```diff
- <Section id="fac" title={t("filter.facilities")} ...>
+ <Section id="fac" title={t("filter.more.facilities")} ...>

- <Section id="views" title={t("filter.views")} ...>
+ <Section id="views" title={t("filter.more.views")} ...>

- <Section id="char" title={t("filter.characteristics")} ...>
+ <Section id="char" title={t("filter.more.characteristics")} ...>
```

These keys already exist in `en` / `zh-HK` / `zh-CN` translations (used by `FilterToggleBar`).

## Out of Scope

- No changes to active button colors, sidebar background, layout, or any other section.
- No translation file changes — reusing existing keys.
- No changes to `FilterToggleBar`, `PropertyListingsSection`, or context.

