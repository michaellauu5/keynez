

# Restore Full-Width Header Bar With Smooth Edges

Bring back the solid header band that spans the full width (like two iterations ago), but keep it feeling integrated — no hard seam, logo stays sharp, hero still bleeds in softly at the bottom.

## Changes

### `src/components/layout/Header.tsx`

**1. Header background — solid band, soft bottom**

Replace the current top-down fade with a stronger, mostly-opaque band that occupies the full bar height and only fades at the very bottom edge:

```tsx
<header className="sticky top-0 z-50 w-full border-b border-white/5
                   bg-gradient-to-b from-black/75 via-black/70 to-black/40
                   backdrop-blur-xl">
```

- `from-black/75 via-black/70` keeps the entire bar visually filled (the "cross bar" look).
- `to-black/40` + `border-white/5` gives a whisper-soft bottom edge instead of a hard line — no bolted-on seam.
- `backdrop-blur-xl` strengthens separation from the hero without needing an image.

**2. Remove the per-logo halo**

The radial halo behind the logo is no longer needed once the bar itself is filled — it would double up and look muddy. Delete the `<span aria-hidden …radial-gradient… />` element and simplify the Link wrapper:

```tsx
<Link to="/" className="flex items-center">
  <img … />
</Link>
```

**3. Keep logo sharp & soften its edges into the band**

Retain the alpha-tracing dual `drop-shadow` so the logo doesn't read as a rectangle against the now-darker band, and lighten it slightly since the background is already dark:

```tsx
className="h-16 w-auto md:h-20 max-w-[220px] md:max-w-[280px] object-contain
           [filter:drop-shadow(0_1px_1px_rgba(0,0,0,0.45))_drop-shadow(0_2px_10px_rgba(0,0,0,0.35))]"
```

No size/position changes — stays at current `h-20/h-24` container with `pl-1 md:pl-2`.

**4. Nav / actions — unchanged**

Active underline, white nav text, language dropdown, auth button, and mobile sheet remain exactly as they are. They already read well on a darker band.

## Visual result

```text
Now (fades to transparent):        After (filled band, soft bottom):
┌ · · · · · · · · · · · · ┐        ┌─────────────────────────────┐
│ LOGO  nav   ···  [user] │        │ LOGO   nav   ···   [user]   │  ← solid cross bar
│ · · · · · · · · · · · · │        │░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░ ░│  ← 1px soft fade
│  hero bleeds through    │        │   hero starts cleanly       │
```

## Out of Scope

- No changes to Layout, hero, routing, translations, or auth.
- No new assets — uses existing `keynez-logo-new.png`.
- `banner-bg.png` not reintroduced (the gradient band achieves the same "filled" effect more cleanly).

