
# HD Logo & New Color Scheme Implementation

## Overview
Replace the existing Keynest AI logo with the new HD version and implement the comprehensive new color scheme across the entire application. This will update the CSS variables, Tailwind configuration, and ensure all components reflect the fresh mint-green to sky-blue gradient aesthetic with warm brown accents.

---

## File Changes Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/assets/keynest-logo.png` | Replace | Update with new HD logo |
| `src/index.css` | Modify | Update all CSS variables with new HSL values |
| `tailwind.config.ts` | Modify | Add custom colors and ensure font configuration |
| `src/components/landing/HeroSection.tsx` | Modify | Apply new hero gradient |
| `src/components/layout/Header.tsx` | Modify | Update styling for new color scheme |
| `src/components/layout/Footer.tsx` | Modify | Update footer styling |
| `src/components/map/DummyHongKongMap.tsx` | Modify | Update map colors to match new palette |
| `src/components/ui/button.tsx` | Modify | Add coral hover variant |

---

## Color Conversion to HSL

The new color scheme converted to HSL format for CSS variables:

```text
PRIMARY COLORS:
- primary-bg-start (#E8F5E9) → 125 40% 94%    (mint green)
- primary-bg-end (#BBDEFB)   → 207 89% 86%    (sky blue)
- primary-dark (#5D4E37)     → 34 27% 29%     (warm brown)
- primary-text (#3E2723)     → 10 28% 19%     (dark brown)

SECONDARY COLORS:
- secondary-yellow (#FFD54F) → 45 100% 65%    (golden yellow)
- secondary-gold (#FFC107)   → 45 100% 51%    (rich gold)
- secondary-beige (#F5F5DC)  → 60 56% 91%     (cream beige)

ACCENT COLORS:
- accent-coral (#FF8A65)     → 14 100% 70%    (coral orange)
- accent-sage (#A5D6A7)      → 122 38% 74%    (sage green)
- accent-sky (#81D4FA)       → 199 93% 74%    (light sky)

NEUTRAL COLORS:
- background-light (#FAFAF8) → 60 20% 98%     (off-white)
- background-card (#FFFFFF)  → 0 0% 100%      (pure white)
- text-primary (#2C2416)     → 36 38% 13%     (dark earth)
- text-secondary (#6D5D4B)   → 32 19% 36%     (muted brown)
- border-color (#E8DCC8)     → 38 40% 85%     (warm border)
```

---

## Detailed Implementation

### 1. Logo Replacement
Copy the uploaded HD logo to `src/assets/keynest-logo.png`:
- High resolution for crisp display on all screen sizes
- Used in Header, Footer, and Login Modal
- No code changes needed - same import path

### 2. CSS Variables Update (`src/index.css`)

Replace the `:root` color variables with the new scheme:

```css
:root {
  /* New Keynest AI Color Scheme */
  
  /* Background: light off-white */
  --background: 60 20% 98%;
  --foreground: 36 38% 13%;

  /* Card: pure white */
  --card: 0 0% 100%;
  --card-foreground: 36 38% 13%;

  --popover: 0 0% 100%;
  --popover-foreground: 36 38% 13%;

  /* Primary: warm brown (for buttons, links) */
  --primary: 34 27% 29%;
  --primary-foreground: 60 20% 98%;

  /* Secondary: cream beige */
  --secondary: 60 56% 91%;
  --secondary-foreground: 36 38% 13%;

  /* Muted: light beige */
  --muted: 38 40% 92%;
  --muted-foreground: 32 19% 36%;

  /* Accent: golden yellow (CTAs, highlights) */
  --accent: 45 100% 65%;
  --accent-foreground: 36 38% 13%;

  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 100%;

  /* Border: warm beige border */
  --border: 38 40% 85%;
  --input: 38 40% 85%;
  --ring: 45 100% 65%;

  --radius: 0.5rem;

  /* Additional custom colors */
  --coral: 14 100% 70%;
  --sage: 122 38% 74%;
  --sky: 199 93% 74%;
  --gold: 45 100% 51%;
}
```

Update gradient utilities:

```css
.bg-gradient-hero {
  background: linear-gradient(135deg, #E8F5E9 0%, #BBDEFB 100%);
}

.bg-gradient-card {
  background: linear-gradient(180deg, #FAFAF8 0%, #F5F5DC 100%);
}

.bg-gradient-accent {
  background: linear-gradient(90deg, #FFD54F 0%, #FFC107 100%);
}
```

### 3. Tailwind Configuration Update (`tailwind.config.ts`)

Add custom colors and update font configuration:

```typescript
extend: {
  colors: {
    // ... existing semantic colors ...
    coral: "hsl(var(--coral))",
    sage: "hsl(var(--sage))",
    sky: "hsl(var(--sky))",
    gold: "hsl(var(--gold))",
  },
  fontFamily: {
    sans: ["Inter", "system-ui", "sans-serif"],
    serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
  },
  fontSize: {
    // Consistent type scale
    'xs': ['0.875rem', { lineHeight: '1.25rem' }],   // 14px
    'sm': ['1rem', { lineHeight: '1.5rem' }],        // 16px
    'base': ['1.25rem', { lineHeight: '1.75rem' }],  // 20px
    'lg': ['1.5rem', { lineHeight: '2rem' }],        // 24px
    'xl': ['2rem', { lineHeight: '2.5rem' }],        // 32px
    '2xl': ['3rem', { lineHeight: '1' }],            // 48px
  },
  borderRadius: {
    DEFAULT: "0.5rem", // 8px
  },
}
```

### 4. Component Updates

**HeroSection.tsx:**
- Use new `bg-gradient-hero` class
- Apply `text-[#5D4E37]` (primary-dark) for headings

**Header.tsx:**
- Clean white background with subtle border
- Primary-dark color for text
- Yellow accent for active states

**Footer.tsx:**
- Use primary-dark background
- Light text for contrast
- Yellow accent for links on hover

**PropertyCard.tsx:**
- White card with subtle shadow
- Coral hover states for buttons
- Yellow accent badges

**DummyHongKongMap.tsx:**
- Update region fills to use new palette colors
- Sage green for land areas
- Sky blue for water background

**Button hover states:**
- Add coral color option for hover effects

---

## Visual Summary

```text
+----------------------------------------------------------+
|  HEADER (white bg, warm brown text)                       |
|  [Logo] Home Buy Rent Sell Canvas    [Lang] [User]       |
+----------------------------------------------------------+
|                                                           |
|  HERO SECTION                                             |
|  Background: Mint Green → Sky Blue gradient               |
|                                                           |
|  "Find Your Perfect Property" (warm brown heading)        |
|                                                           |
|  +------------------+  +------------------+                |
|  | AI Chat Card     |  | Video Demo       |               |
|  | (white bg)       |  | (white bg)       |               |
|  | [Yellow CTA]     |  |                  |               |
|  +------------------+  +------------------+                |
|                                                           |
+----------------------------------------------------------+
|  PROPERTY CARDS                                           |
|  +----------+  +----------+  +----------+                 |
|  | [Image]  |  | [Image]  |  | [Image]  |                |
|  | White bg |  | White bg |  | White bg |                |
|  | Shadow   |  | Shadow   |  | Shadow   |                |
|  | [Yellow] |  | [Yellow] |  | [Yellow] |  ← CTAs        |
|  +----------+  +----------+  +----------+                 |
|                                                           |
+----------------------------------------------------------+
|  FOOTER (warm brown bg)                                   |
|  Light text, yellow links on hover                        |
+----------------------------------------------------------+
```

---

## Dark Mode Considerations

The dark mode will be updated to complement the light theme:
- Dark warm brown background
- Light cream text
- Maintaining yellow/gold accents
- Coral for interactive elements

---

## Implementation Order

1. **Logo Replacement**
   - Copy new HD logo to src/assets

2. **Core Styling**
   - Update src/index.css with new CSS variables
   - Update gradient utilities
   - Add smooth transitions for hover states

3. **Tailwind Config**
   - Add custom colors
   - Verify font configuration
   - Add consistent type scale

4. **Component Updates**
   - Update HeroSection with new gradient
   - Update Header styling
   - Update Footer styling
   - Update PropertyCard hover states
   - Update DummyHongKongMap colors

5. **Testing**
   - Verify all pages render correctly
   - Check color contrast for accessibility
   - Test hover states and transitions
