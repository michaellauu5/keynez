
# Overhaul Keynez Front-End to a Compass-Style Browsing Experience

## Goal
Redesign the homepage plus Buy/Rent pages to feel much more coherent, premium, and logical, using Compass as a close reference for layout and browsing behavior while preserving:
- Keynez logo
- current landing background image
- current chat interface behavior for now

## What will change

### 1. Create a new site-wide design system layer
Refine the current visual language into a tighter premium system:
- define clearer spacing scale for desktop/tablet/mobile
- standardize card radius, shadows, borders, and surface treatments
- tighten typography hierarchy for headlines, section labels, filter labels, result counts, and metadata
- keep Keynez colors, but rebalance them so gold is used as accent/highlight rather than everywhere
- make white/off-white surfaces the main browsing canvas, with the hero image reserved for the top landing experience

### 2. Rebuild the homepage structure to match Compass-style logic
Restructure `/` into clearer sections:

```text
Sticky header
Hero with large search-led experience
Quick search mode switch (Buy / Rent / Sell placeholder state)
Primary search bar + compact top-level filters
Results browsing section below
- sticky filter rail or sticky top filter bar
- results header with count, sort, and map/grid toggle
- coherent property cards/grid
Optional editorial/supporting sections after listings
Footer
```

Key changes:
- reduce the current stacked/fragmented feel
- make the hero more search-first and less panel-heavy
- move from “chat-first plus separate listing module” toward a more unified browsing experience
- keep the chatbot component visually present, but contain it within a cleaner search shell rather than making it dominate the whole composition

### 3. Redesign filter architecture for logic and consistency
The current filters are split across different components and data models, which causes awkward behavior. The redesign will unify the browsing model:

#### Homepage
- convert the top search/filter area into a Compass-style horizontal filter system
- keep only high-value filters visible by default:
  - transaction type
  - location
  - price
  - beds
  - baths
  - property type
  - more filters
- move secondary filters into a structured “All filters” panel/drawer
- improve active-filter chips and clear-all behavior
- preserve filter sync with the lower results section, but simplify the user-facing interaction

#### Buy/Rent pages
- make Buy/Rent pages use the same filter logic and visual system as homepage browsing
- align labels, ranges, and selection rules across pages
- remove redundant differences between homepage filters and listings-page filters

#### Logic fixes included
- normalize rent vs buy price defaults and display formatting
- fix inconsistent region/district/location mapping
- make filter counts more reliable
- ensure clearing or switching modes resets only the right fields
- review whether price sync between top filters and listing filters should be exact instead of partial

### 4. Unify results browsing experience across homepage, Buy, and Rent
Create one consistent browsing shell for all listing surfaces:
- sticky results header
- cleaner count/sort/view controls
- grid/map/split behavior aligned across pages
- stronger empty states
- consistent pagination/load-more behavior
- better spacing between filter rail, header, and cards

This likely means reusing or refactoring the current:
- `PropertyListingsSection`
- `ListingsPageLayout`
- `ResultsHeader`
- `PropertyGrid`
- filter sidebars

into a shared system rather than two parallel implementations.

### 5. Refresh property cards to feel closer to Compass
Keep existing data and core actions, but redesign cards:
- cleaner image-first presentation
- calmer metadata hierarchy
- less visual clutter in badges/buttons
- more professional spacing inside the card
- more deliberate placement of price, address, specs, and agent info
- consistent hover/active states for map-linked browsing

### 6. Improve header and footer to match the new experience
Since you want Header/Footer included:
- refine header into a cleaner premium sticky navigation
- make primary nav feel more like a property platform
- preserve logo placement
- improve desktop/mobile navigation spacing and active states
- treat “Sell” as either a proper page/CTA state or a clearly intentional placeholder
- simplify footer so it supports the browsing experience instead of competing with it

### 7. Keep chatbot behavior stable while restyling its container
Per your instruction, chat functionality will not be expanded right now. Instead:
- keep current webhook/chat behavior intact
- restyle surrounding shell so it fits the new search-led homepage
- improve only layout framing, spacing, mode toggle placement, and visual integration
- avoid changing the conversational flow itself unless required by the new layout

## Technical implementation approach

### A. Consolidate duplicated browsing systems
There are currently parallel filter/listing systems:
- homepage: `FilterToggleBar` + `FilterSidebar` + `PropertyListingsSection`
- Buy/Rent pages: `AdvancedFilterSidebar` + `ListingsPageLayout`

The redesign should converge these into a shared architecture:
- one reusable filter schema for browsing UI
- one shared results header
- one shared listings/map container
- page-specific wrappers only where necessary

### B. Refactor filter synchronization layer
`FilterSyncContext` already syncs chatbot and listing filters, but it is incomplete and partly best-effort.
It should be redesigned to:
- support exact field mapping for shared filters
- centralize rent/buy mode defaults
- reduce special-case merge behavior
- expose a cleaner API for homepage and listings pages

### C. Separate “search UI” from “conversation engine”
`PropertySearchChat.tsx` currently owns too much layout and filter UI.
Refactor into:
- search shell / visual container
- filter controls
- conversation/results area
- payload logic and message handling

That will make the redesign easier without destabilizing webhook behavior.

### D. Standardize content and labels
As part of the overhaul:
- translate hardcoded Buy/Rent titles and UI labels
- align wording across homepage and listings pages
- ensure English/Traditional/Simplified labels remain consistent in the new filter layout

## Files likely affected

### Core layout/design
- `src/pages/Index.tsx`
- `src/components/layout/Header.tsx`
- `src/components/layout/Footer.tsx`
- `src/index.css`

### Homepage search + filters
- `src/components/landing/HeroSection.tsx`
- `src/components/landing/PropertySearchChat.tsx`
- `src/components/landing/FilterToggleBar.tsx`
- `src/components/landing/PropertyListingsSection.tsx`
- `src/components/landing/PropertyGrid.tsx`
- `src/components/landing/PropertyCard.tsx`

### Shared browsing and listings pages
- `src/pages/BuyPage.tsx`
- `src/pages/RentPage.tsx`
- `src/components/listings/ListingsPageLayout.tsx`
- `src/components/listings/ResultsHeader.tsx`
- `src/components/listings/AdvancedFilterSidebar.tsx`

### State / mapping
- `src/contexts/FilterSyncContext.tsx`
- possibly shared filter config extracted into a new common module

### Content/i18n
- `src/translations/index.ts`

## Recommended rollout
1. Establish new design tokens and spacing rules
2. Rebuild header/footer
3. Rebuild homepage hero + search/filter shell
4. Unify filter model and synchronization
5. Rebuild homepage results section
6. Port the same browsing shell to Buy/Rent pages
7. Polish responsive behavior and multilingual labels

## Expected outcome
After implementation, Keynez will feel much closer to Compass in browsing logic and polish:
- stronger visual coherence
- more professional spacing
- filters that behave more logically
- a unified property discovery flow across homepage, Buy, and Rent
- preserved Keynez branding elements instead of a full rebrand

## Notes
- The current chat interface functionality will be preserved, only visually reframed.
- The redesign will focus on front-end structure and interaction logic first, not backend/search intelligence changes.
- During implementation, I should also clean up obvious inconsistencies discovered in the current browsing code, including duplicated filter behavior and hardcoded page text.
