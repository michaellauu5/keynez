

# Use Wood Texture as Header Banner Background

## Changes

**1. Copy the uploaded image to the project**
- Copy `user-uploads://banner.png` to `src/assets/banner-bg.png`

**2. File: `src/components/layout/Header.tsx`**
- Import the banner image: `import bannerBg from '@/assets/banner-bg.png';`
- On the `<header>` element (line 46), replace the gradient background classes (`bg-gradient-to-r from-primary/10 via-sky/5 to-accent/10`) with an inline style using the banner image as a full-width background (`backgroundImage`, `backgroundSize: cover`, `backgroundPosition: center`)
- Keep `backdrop-blur`, `border-b`, `sticky top-0 z-50` intact
- Logo position and all other elements remain unchanged

