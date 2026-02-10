

# Replace HeroSection Background Image

## Change
Replace the current Hong Kong backdrop background in `HeroSection.tsx` with the uploaded living room illustration image. Apply slight transparency and ensure it covers the full screen.

## Implementation

**Copy asset**: Copy `user-uploads://freepik_homey-wide-view-of-a-living-room-with-balcony-over_61928.png` to `src/assets/hero-living-room.png`

**Modify `src/components/landing/HeroSection.tsx`**:
- Update the import: replace `hong-kong-backdrop.jpg` with the new `hero-living-room.png`
- The background image is already applied via inline `style={{ backgroundImage }}` on the section element
- Adjust the dark gradient overlay div (line 35) to be lighter/more transparent so the image shows through with a subtle transparency effect (e.g., `from-black/30 via-black/20 to-black/50`)
- Ensure `bg-cover bg-center` classes remain for full-screen fitting

