
# Landing Page Images, Logo Enhancement & Color Theme Update

## Overview
This plan implements four key visual changes:
1. **Hong Kong skyline photo** as landing page backdrop (first uploaded image)
2. **Google Maps screenshot** replacing the current dummy SVG map (second uploaded image)
3. **Enlarged logo** in header and **add logo** to footer bottom-left
4. **Light blue primary / Yellow secondary** color theme adjustment

---

## File Changes Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/assets/hong-kong-backdrop.jpg` | Create (copy) | Landing page hero background image |
| `src/assets/hong-kong-map.png` | Create (copy) | Dummy Google Maps image |
| `src/index.css` | Modify | Update color scheme to light blue primary, yellow secondary |
| `src/components/landing/HeroSection.tsx` | Modify | Add backdrop image with overlay |
| `src/components/map/DummyHongKongMap.tsx` | Modify | Replace SVG with actual map image |
| `src/components/layout/Header.tsx` | Modify | Enlarge logo (from h-8/h-10 to h-12/h-14) |
| `src/components/layout/Footer.tsx` | Modify | Add logo in bottom-left of copyright section |

---

## Part 1: Asset Management

### Copy Images to Project
```text
user-uploads://Hong_Kong.jpg → src/assets/hong-kong-backdrop.jpg
user-uploads://Screenshot_2026-02-02_at_23.55.36.png → src/assets/hong-kong-map.png
```

---

## Part 2: Color Theme Update

### Updated CSS Variables (`src/index.css`)

Transform the color scheme to use **light blue as primary** and **yellow/gold as secondary accent**:

```css
:root {
  /* Background: light off-white (keep) */
  --background: 60 20% 98%;
  --foreground: 36 38% 13%;

  /* Card: pure white (keep) */
  --card: 0 0% 100%;
  --card-foreground: 36 38% 13%;

  /* Primary: Light Blue (NEW - was warm brown) */
  --primary: 199 93% 45%;           /* #0EA5E9 - bright sky blue */
  --primary-foreground: 0 0% 100%;  /* White text on blue */

  /* Secondary: Golden Yellow (NEW - elevated from accent) */
  --secondary: 45 100% 51%;         /* #FFC107 - rich gold */
  --secondary-foreground: 36 38% 13%; /* Dark text on yellow */

  /* Muted: light beige (keep) */
  --muted: 38 40% 92%;
  --muted-foreground: 32 19% 36%;

  /* Accent: Yellow/Gold (CTAs, highlights) - keep */
  --accent: 45 100% 65%;            /* #FFD54F */
  --accent-foreground: 36 38% 13%;

  /* Border: warm beige (keep) */
  --border: 38 40% 85%;
  --input: 38 40% 85%;
  --ring: 199 93% 45%;              /* Blue ring (updated) */

  /* Sky color for reference */
  --sky: 199 93% 74%;               /* Light sky blue */
}
```

### Visual Color Mapping
```text
+----------------------------------+
|  BEFORE           →    AFTER     |
+----------------------------------+
|  Primary: Brown   →    Blue      |
|  Secondary: Beige →    Yellow    |
|  Accent: Yellow   →    Yellow    |
|  CTA Buttons      →    Yellow bg |
|  Headers/Links    →    Blue      |
+----------------------------------+
```

---

## Part 3: Hero Section with Backdrop

### Changes to `HeroSection.tsx`

Add the Hong Kong skyline as a full-bleed background with dark overlay for text readability:

```typescript
import hongKongBackdrop from '@/assets/hong-kong-backdrop.jpg';

export function HeroSection() {
  return (
    <section 
      className="relative bg-cover bg-center bg-no-repeat min-h-[90vh]"
      style={{ backgroundImage: `url(${hongKongBackdrop})` }}
    >
      {/* Dark gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
      
      {/* Content with relative positioning */}
      <div className="relative z-10 container mx-auto px-4 py-8 lg:py-12">
        {/* Title - white text for contrast */}
        <h1 className="text-white text-shadow-lg ...">
          {renderTitle()}
        </h1>
        
        {/* ... rest of content */}
      </div>
    </section>
  );
}
```

### Title Text Styling
- Change from `text-primary` to `text-white` for contrast against backdrop
- Add `text-accent` for "Hong Kong" highlight (yellow pops on dark bg)
- Add subtle text shadow for legibility

---

## Part 4: Dummy Map with Real Image

### Changes to `DummyHongKongMap.tsx`

Replace the SVG-based map with the uploaded Google Maps screenshot:

```typescript
import hongKongMapImage from '@/assets/hong-kong-map.png';

export function DummyHongKongMap({ ... }) {
  return (
    <div className={cn("relative h-[500px] rounded-lg overflow-hidden", className)}>
      {/* Map Image Background */}
      <img
        src={hongKongMapImage}
        alt="Hong Kong Map"
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Overlay for property markers */}
      <div className="absolute inset-0">
        {/* Property markers positioned over the image */}
        {/* ... marker logic remains similar */}
      </div>
      
      {/* Controls, Legend, etc. remain the same */}
    </div>
  );
}
```

Key changes:
- Remove the SVG `<path>` region shapes
- Remove the water pattern background
- Use the uploaded map image as the base layer
- Keep zoom/pan controls (they'll zoom the image)
- Keep the legend and property markers overlay
- Markers will be positioned absolutely over the image

---

## Part 5: Logo Size Adjustments

### Header Logo (Enlarge)

```typescript
// In Header.tsx
<img
  src={keynestLogo}
  alt="Keynest AI"
  className="h-12 w-auto md:h-14"  // Changed from h-8/h-10
/>
```

### Footer Logo (Add to Copyright Section)

```typescript
// In Footer.tsx - Update copyright section
<div className="mt-12 pt-8 border-t border-primary-foreground/20">
  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
    {/* Logo at bottom left */}
    <Link to="/" className="flex items-center">
      <img
        src={keynestLogo}
        alt="Keynest AI"
        className="h-10 w-auto brightness-0 invert"
      />
    </Link>
    
    {/* Copyright at center/right */}
    <p className="text-sm text-primary-foreground/60">
      © {currentYear} Keynest AI. {t('footer.copyright')}.
    </p>
  </div>
</div>
```

---

## Visual Layout Summary

### Hero Section
```text
+------------------------------------------------------------------+
|  [Hong Kong Skyline Photo - Full Width Background]                |
|  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ Dark Overlay ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓               |
|                                                                   |
|      "Find Your Perfect Property in HONG KONG"                    |
|      (White text with yellow accent)                              |
|                                                                   |
|  +--------------------------+  +------------------------+         |
|  |     AI Chat Box          |  |     Video Demo         |        |
|  |     (white card)         |  |     (white card)       |        |
|  +--------------------------+  +------------------------+         |
|                                                                   |
|  +----------------------------------------------------------+    |
|  |                                                          |    |
|  |          [Google Maps Screenshot]                        |    |
|  |          with property markers overlay                   |    |
|  |                                                          |    |
|  +----------------------------------------------------------+    |
+------------------------------------------------------------------+
```

### Footer
```text
+------------------------------------------------------------------+
|  FOOTER CONTENT (4 columns as before)                             |
+------------------------------------------------------------------+
|  [Logo]                              © 2026 Keynest AI...         |
+------------------------------------------------------------------+
```

---

## Implementation Order

1. **Copy assets** - Copy both uploaded images to `src/assets/`

2. **Update color scheme** - Modify `src/index.css` CSS variables

3. **Update HeroSection** - Add backdrop image and overlay styling

4. **Update DummyHongKongMap** - Replace SVG with map image

5. **Update Header** - Enlarge logo

6. **Update Footer** - Add logo to copyright section

---

## Technical Notes

### Text Shadow for Hero
Add a utility class in `src/index.css`:
```css
.text-shadow-lg {
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}
```

### Image Optimization
- The backdrop image will be imported via ES6 modules for proper bundling
- Vite will optimize the images during build

### Responsive Considerations
- Backdrop uses `bg-cover bg-center` for proper scaling
- Map image uses `object-cover` for consistent display
- Logo sizes adjust at `md:` breakpoint
