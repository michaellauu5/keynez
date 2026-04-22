

# Make Header Banner 20% Taller

Increase the sticky header's height by 20% while keeping the existing banner background image, logo, nav, and all other styling intact.

## Change

### `src/components/layout/Header.tsx` (line 48)

```diff
- <div className="container flex h-16 items-center justify-between px-4 md:px-6">
+ <div className="container flex h-[77px] items-center justify-between px-4 md:px-6">
```

64px × 1.20 ≈ 77px. The existing logo (`h-14 md:h-16`) fits comfortably within the new height with no clipping.

## Out of Scope

- Background image, border, backdrop-blur — unchanged.
- Logo, nav links, language selector, user menu, mobile sheet — unchanged.

