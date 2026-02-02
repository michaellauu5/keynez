

# Keynest AI Landing Page - Bottom Section

## Overview
Create the property listings section for the bottom half of the landing page, featuring an animated statistics counter, property cards with image carousels, and a comprehensive filtering sidebar inspired by Centanet's design.

---

## File Changes Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/assets/keynest-logo.png` | Copy | Store the Keynest AI logo for header |
| `src/components/landing/Header.tsx` | Create | Navigation header with logo |
| `src/components/landing/StatCounter.tsx` | Create | Animated 45,000+ listings counter |
| `src/components/landing/PropertyCard.tsx` | Create | Individual property card with carousel |
| `src/components/landing/PropertyGrid.tsx` | Create | Grid layout for property cards |
| `src/components/landing/FilterSidebar.tsx` | Create | Comprehensive filtering panel |
| `src/components/landing/PropertyListingsSection.tsx` | Create | Main container for listings section |
| `src/pages/Index.tsx` | Modify | Add Header and PropertyListingsSection |

---

## Visual Design

### Layout Structure
```text
+--------------------------------------------------+
|  [Logo]  Buy | Rent | Sell | Research   [Login]  |  <-- Header (new)
+--------------------------------------------------+
|                  HERO SECTION                     |  <-- Existing
|         (AI Chat + Video Demo)                    |
+--------------------------------------------------+
|                                                   |
|   "45,000+ Active Listings"  (animated counter)   |
|                                                   |
+--------------------------------------------------+
|  FILTER     |        PROPERTY GRID                |
|  SIDEBAR    |   +------+ +------+ +------+        |
|             |   | Card | | Card | | Card |        |
|  - District |   +------+ +------+ +------+        |
|  - Type     |   +------+ +------+ +------+        |
|  - Price    |   | Card | | Card | | Card |        |
|  - Size     |   +------+ +------+ +------+        |
|  - Rooms    |                                     |
|  - More     |   [Load More / Pagination]          |
+--------------------------------------------------+
```

### Responsive Behavior
- Desktop: Sidebar (280px) + 3-4 column grid
- Tablet: Collapsible filter drawer + 2 column grid
- Mobile: Filter modal + 1 column stack

---

## Component Details

### 1. Header Component
**Location**: `src/components/landing/Header.tsx`

- Keynest AI logo (copied from user upload) positioned top-left
- Main navigation links: Buy, Rent, Sell, Research Canvas
- Language selector dropdown (placeholder)
- Login button with user icon
- Sticky positioning on scroll
- Mobile hamburger menu

### 2. Animated Stat Counter
**Location**: `src/components/landing/StatCounter.tsx`

- Large, prominent display: "45,000+ Active Listings"
- Number animates from 0 to 45,000 on scroll into view
- Uses Intersection Observer for trigger
- Smooth easeOut animation over 2 seconds
- Yellow accent underline decoration

### 3. Property Card Component
**Location**: `src/components/landing/PropertyCard.tsx`

Each card includes:
- **Image Carousel**: Using Embla carousel with dots navigation
  - Multiple property images (3-5 per property)
  - Swipe enabled on mobile
  - Arrow navigation on hover
- **Price**: Bold, prominent in HKD format
- **Property Type Badge**: "For Sale" (green) or "For Rent" (blue)
- **Location**: Address and district
- **Property Info Row**: Icons for bedrooms, bathrooms, size (sqft)
- **Agent Section**: Avatar, name, contact button
- **Action Buttons**:
  - Heart icon for save/favorite (toggleable)
  - "View Details" button

### 4. Property Grid
**Location**: `src/components/landing/PropertyGrid.tsx`

- Responsive grid: 1 column (mobile) / 2 (tablet) / 3-4 (desktop)
- Gap spacing of 24px
- Animated card entrance (staggered fade-in)
- Pagination or "Load More" button
- Shows 12 properties initially, loads 12 more on demand

### 5. Filter Sidebar (Centanet-inspired)
**Location**: `src/components/landing/FilterSidebar.tsx`

Filter categories based on Centanet reference:

1. **Transaction Type**: Buy / Rent toggle
2. **District/Area**: Multi-level dropdown
   - Hong Kong Island, Kowloon, New Territories East/West
   - Sub-districts within each region
3. **Property Type**: Checkboxes
   - Apartment, House, Commercial, Studio, Penthouse
4. **Price Range**: Dual-handle slider
   - Sale: HK$0 - HK$200M
   - Rent: HK$0 - HK$200K/month
5. **Size Range**: Dual-handle slider (0 - 5,000 sqft)
6. **Bedrooms**: Number selector buttons (Studio, 1, 2, 3, 4, 5+)
7. **Bathrooms**: Number selector buttons (1, 2, 3, 4+)
8. **Additional Filters** (expandable):
   - Parking included
   - Pets allowed
   - Furnished
   - New Build
   - Sea View
   - Pool
   - Gym

**Mobile Behavior**: Slides in as a drawer/sheet from left

### 6. Main Listings Section Container
**Location**: `src/components/landing/PropertyListingsSection.tsx`

- Manages filter state
- Coordinates between FilterSidebar and PropertyGrid
- Contains the stat counter at top
- Handles mock data filtering logic
- Background: Subtle gradient continuation from hero

---

## Mock Data Structure

```typescript
interface PropertyListing {
  id: string;
  name: string;
  address: string;
  district: string;
  region: string;
  price: number;
  priceType: "sale" | "rent";
  size: number;
  bedrooms: number;
  bathrooms: number;
  propertyType: string;
  images: string[];
  features: string[];
  agent: {
    name: string;
    avatar: string;
    phone: string;
  };
  isNew: boolean;
  hasParking: boolean;
  petsAllowed: boolean;
  isFurnished: boolean;
}
```

Generate 20+ mock properties with realistic Hong Kong addresses and price ranges.

---

## Technical Implementation

### Dependencies
- Uses existing Embla carousel for image galleries
- Uses existing shadcn/ui components (Slider, Checkbox, Sheet, Button, Badge)
- Intersection Observer API for scroll animations
- React state for filter management

### Animation Details
- **Counter Animation**: Custom hook with requestAnimationFrame
- **Card Entrance**: CSS keyframe animation with staggered delay
- **Filter Transitions**: Smooth height/opacity transitions
- **Carousel**: Embla's built-in smooth scrolling

### Accessibility
- Keyboard navigation for carousel
- ARIA labels on all interactive elements
- Focus management in filter sidebar
- Screen reader friendly stat counter

---

## Implementation Order

1. Copy logo to `src/assets/`
2. Create Header component with logo
3. Create StatCounter with animation
4. Create PropertyCard with image carousel
5. Create FilterSidebar with all filter options
6. Create PropertyGrid with pagination
7. Create PropertyListingsSection container
8. Update Index.tsx to include new sections
9. Add mock data for demonstration

