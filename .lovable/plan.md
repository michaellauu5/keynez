
# Move Logo to Left Edge

## Change
**File: `src/components/layout/Header.tsx`** (line 49):
- Add negative left margin to the Link wrapping the logo to eliminate the gap between the logo and the left edge of the page
- Change `className="flex items-center"` to `className="flex items-center -ml-4 md:-ml-6"` which offsets the container padding (`px-4 md:px-6`) and pushes the logo flush to the left edge
