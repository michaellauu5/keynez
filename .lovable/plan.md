

# Blend the Logo Into the Header

The logo PNG sits as a hard rectangle against the gradient header — its own background/edges read as a "sticker." We'll let it sit naturally on the hero by softening its edges, removing any implicit box, and giving it presence through type-grade shadow rather than a plate.

## Changes

### `src/components/layout/Header.tsx` (logo `<img>`, line ~50)

**1. Remove the box feel**
- Drop the heavy `drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]` (reads like a card shadow).
- Replace with a subtle dual shadow that hugs the glyph shapes, not the rectangle:
  ```tsx
  className="h-16 w-auto md:h-20 max-w-[220px] md:max-w-[320px] object-contain
             [filter:drop-shadow(0_1px_1px_rgba(0,0,0,0.35))_drop-shadow(0_4px_14px_rgba(0,0,0,0.25))]"
  ```
  `drop-shadow` (CSS filter) follows the PNG's alpha channel, so the shadow traces the logo's outline instead of a square — this is the key fix for "bolted on."

**2. Soften the seam with the gradient**
- Add a faint radial halo *behind* the logo only (not the whole header), so the gradient meets the logo gently:
  ```tsx
  <Link to="/" className="relative flex items-center -ml-4 md:-ml-6">
    <span aria-hidden className="absolute inset-0 -z-10 blur-2xl opacity-40
           bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.55),transparent_70%)]" />
    <img ... />
  </Link>
  ```
  The halo is invisible as a shape but lifts the logo off bright hero areas without a visible plate.

**3. Tighten size & alignment**
- Slightly reduce max width on desktop (`max-w-[320px]` → `max-w-[280px]`) so the logo doesn't dominate; keeps it confident, not loud.
- Remove the negative left margin (`-ml-4 md:-ml-6`) — it pushes the logo into the viewport edge and emphasizes the rectangle. Use `pl-1 md:pl-2` on the container instead for natural breathing room.

**4. Header gradient adjustment** (supports the blend)
- Strengthen the very top stop slightly so the logo's top edge has consistent contrast regardless of hero brightness:
  ```tsx
  className="... bg-gradient-to-b from-black/60 via-black/20 to-transparent backdrop-blur-md"
  ```
  (`from-black/55` → `from-black/60`, `via-black/25` → `via-black/20` for a faster, smoother fade.)

## Visual result

```text
Before:                          After:
┌────────────┐                   ·  ·  ·
│  [LOGO]    │  ← hard edges     · LOGO ·   ← shadow follows letters
└────────────┘                   ·  ·  ·     halo melts into gradient
   bolted plate                  sits on the page
```

## Out of Scope
- No changes to nav links, language selector, auth button, or mobile sheet.
- No new assets; uses existing `keynez-logo-new.png`.
- No changes to `Layout`, hero, or routing.

