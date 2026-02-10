

# Connect Background Across Sections

## Problem
The `PropertyListingsSection` has `bg-primary-foreground` on its root `<section>`, which creates a solid white background that blocks the fixed background image set in `Index.tsx`.

## Solution
Remove `bg-primary-foreground` from the `<section>` element in `PropertyListingsSection.tsx` so the fixed background image from the parent page shows through seamlessly. Add a subtle semi-transparent backdrop to keep content readable.

## Changes

**File: `src/components/landing/PropertyListingsSection.tsx`** (line 98):
- Change `className="bg-primary-foreground"` to `className="bg-black/20 backdrop-blur-sm"` (or similar light overlay) so the background image is visible but content remains readable
- This keeps all element positions unchanged

One line change total.

