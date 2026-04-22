

# Soften & Widen the Header Bar

The header currently feels "bolted on": a solid 64px strip with a hard bottom border and a busy `banner-bg.png` tile that clashes with the hero photo behind it. We'll make it taller, drop the hard edges, and let the hero image read through so the logo sits *on* the page instead of *on top of* it — while keeping the logo crisp.

## Changes

### `src/components/layout/Header.tsx`

**1. Increase vertical width**
- `h-16` → `h-20 md:h-24` on the inner container (64px → 80px mobile / 96px desktop).
- Logo grows proportionally: `h-14 md:h-16` → `h-16 md:h-20`, `max-w-[200px] md:max-w-[280px]` → `max-w-[220px] md:max-w-[320px]`. Source PNG already supports this without softness.

**2. Merge smoothly into the background**
- Remove the `banner-bg.png` background image and the hard `border-b border-primary/20`.
- Replace with a transparent header that uses a soft top-down gradient fade so it dissolves into the hero photo:
  ```tsx
  <header className="sticky top-0 z-50 w-full bg-gradient-to-b from-black/55 via-black/25 to-transparent backdrop-blur-md">
  ```
  - `from-black/55` keeps nav/logo legible at the very top.
  - `via-black/25 to-transparent` fades out so there is no visible seam against the hero image.
  - `backdrop-blur-md` (instead of `backdrop`) gently blurs whatever scrolls underneath, eliminating the "bolted plate" feel without a hard edge.
- Drop the `bannerBg` import.

**3. Keep logo sharp & visible against the lighter fade**
- Add a subtle drop shadow on the logo so it stays readable against bright sky areas of the hero:
  ```tsx
  className="... drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]"
  ```
- No filter/blur on the image itself — sharpness preserved.

**4. Nav link contrast**
- Inactive nav links currently use `text-muted-foreground` which can vanish over the hero. Switch to `text-white/80 hover:text-white` and active to `text-white` with the existing accent underline. Mobile sheet links unaffected.

## Visual result

```text
Before:                          After:
┌──────────────────────────┐    ╭ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─╮
│ [logo] nav  ···  [user]  │    │ [LOGO]  nav  ···  [user]│ ← taller, blurred fade
├──────────────────────────┤    │░░░░░░░░░░░░░░░░░░░░░░░░│
│  hero image starts here  │    │  hero image bleeds up  │ ← no seam
```

## Out of Scope
- No changes to `Layout`, hero section, or `banner-bg.png` (asset stays for any other use).
- No changes to mobile sheet panel styling.
- No translation, routing, or auth changes.

