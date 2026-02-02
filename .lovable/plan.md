
# Complete Language Translation & Dummy Map Placement

## Overview
This plan addresses two key improvements:
1. **Full Translation Coverage**: Apply the language switch functionality to ALL content throughout the website, including components that currently have hardcoded English text
2. **Map Placement**: Add the interactive dummy Hong Kong map below the AI chat box, spanning full page width, positioned above the "45,000+ Active Listings" banner

---

## Part 1: Full Translation Coverage

### Current State Analysis
The translation system exists with translations for EN, Traditional Chinese, and Simplified Chinese, but many components still have hardcoded English text that doesn't change when the language is switched.

### Components Requiring Translation Updates

| Component | Hardcoded Text to Translate |
|-----------|---------------------------|
| `HeroSection.tsx` | Title, subtitle |
| `PropertySearchChat.tsx` | Placeholder text, button labels, thinking messages, badges, initial state text |
| `StatCounter.tsx` | "Active Listings" label |
| `FilterToggleBar.tsx` | Filter labels, button text |
| `FilterSidebar.tsx` | Section titles, filter labels, button text |
| `PropertyCard.tsx` | "For Sale", "For Rent", "New", "View Details", unit labels |
| `PropertyResultsTable.tsx` | Column headers, empty state text |
| `ExportActions.tsx` | Button labels |
| `DummyHongKongMap.tsx` | Legend labels, region names (keep in English but add translated tooltips) |
| `VideoDemo.tsx` | Title, description text |

### New Translation Keys to Add

```typescript
// Add to src/translations/index.ts

// Hero Section (enhanced)
"hero.title": "Find Your Perfect Property in Hong Kong",
"hero.titleAccent": "Hong Kong",
"hero.subtitle": "Powered by AI. Search in plain language and discover properties that match your lifestyle.",

// Search Chat
"search.placeholder": "Describe your ideal property... e.g., '3 bedroom in Mid-Levels with sea view under 50 million'",
"search.button": "Search",
"search.thinking.analyzing": "Analyzing your requirements...",
"search.thinking.searching": "Searching property database...",
"search.thinking.ranking": "Ranking by relevance...",
"search.thinking.preparing": "Preparing results...",
"search.aiUnderstood": "AI understood your search as:",
"search.propertiesFound": "properties found",
"search.selected": "selected",
"search.noResults": "No properties match your criteria",
"search.noResultsHint": "Try adjusting your search or filters",
"search.initialTitle": "AI-Powered Property Search",
"search.initialDescription": "Describe what you're looking for in natural language, or use the filters above. Our AI will find the most relevant properties for you.",
"search.emptyState": "Search for properties to see results here",

// Filters
"filter.propertyType": "Property Type",
"filter.price": "Price (HKD)",
"filter.location": "Location",
"filter.bedrooms": "Bedrooms",
"filter.bathrooms": "Bathrooms",
"filter.size": "Size (sqft)",
"filter.floorLevel": "Floor Level",
"filter.buildingAge": "Building Age",
"filter.orientation": "Orientation",
"filter.developer": "Developer",
"filter.clearSelection": "Clear selection",
"filter.resetRange": "Reset range",
"filter.filtersActive": "filter(s) active",
"filter.clearAll": "Clear all",
"filter.district": "District / Area",
"filter.moreFilters": "More Filters",
"filter.parking": "Parking",
"filter.petsAllowed": "Pets Allowed",
"filter.furnished": "Furnished",
"filter.newBuild": "New Build",
"filter.seaView": "Sea View",
"filter.pool": "Pool",
"filter.gym": "Gym",
"filter.all": "All",
"filter.forSale": "For Sale",
"filter.forRent": "For Rent",

// Stat Counter
"stats.activeListings": "Active Listings",

// Property Card
"property.new": "New",
"property.bed": "bed",
"property.bath": "bath",
"property.perMonth": "/mo",

// Table Headers
"table.propertyName": "Property Name",
"table.location": "Location",
"table.priceHKD": "Price (HKD)",
"table.sizeSqft": "Size (sqft)",
"table.bedrooms": "Bedrooms",
"table.match": "Match",
"table.keyFeatures": "Key Features",

// Export Actions
"export.toCSV": "Export to CSV",
"export.toPDF": "Export to PDF",
"export.toCanvas": "Export to Research Canvas",

// Map
"map.legend": "Legend",
"map.forSale": "For Sale",
"map.forRent": "For Rent",
"map.clustered": "Clustered",
"map.properties": "properties",
"map.viewDetails": "View Details",

// Video Demo
"video.title": "See How Keynest AI Works",
"video.subtitle": "AI-powered property search for Hong Kong",
"video.caption": "Our AI understands your preferences in plain language and finds the perfect properties in seconds.",
"video.tapToPause": "Tap to pause",
```

---

## Part 2: Dummy Map Placement

### Current Structure
```text
Index.tsx
├── Layout
│   ├── Header
│   ├── HeroSection
│   │   ├── Title & Subtitle
│   │   ├── Two Column Grid
│   │   │   ├── PropertySearchChat (left)
│   │   │   └── VideoDemo (right)
│   ├── PropertyListingsSection
│   │   ├── StatCounter ("45,000+ Active Listings")
│   │   ├── Filters
│   │   └── Property Grid/Map Toggle
│   └── Footer
```

### New Structure
```text
Index.tsx
├── Layout
│   ├── Header
│   ├── HeroSection
│   │   ├── Title & Subtitle
│   │   ├── Two Column Grid
│   │   │   ├── PropertySearchChat (left)
│   │   │   └── VideoDemo (right)
│   │   └── NEW: DummyHongKongMap (full width, below chat)
│   ├── PropertyListingsSection
│   │   ├── StatCounter ("45,000+ Active Listings")
│   │   ├── Filters
│   │   └── Property Grid/Map Toggle
│   └── Footer
```

### Visual Layout Change

**Before:**
```text
+----------------------------------------------------------+
|  [AI Chat Box]              |  [Video Demo]               |
+----------------------------------------------------------+
|                                                           |
|           45,000+ Active Listings                         |
|                                                           |
+----------------------------------------------------------+
```

**After:**
```text
+----------------------------------------------------------+
|  [AI Chat Box]              |  [Video Demo]               |
+----------------------------------------------------------+
|                                                           |
|  +------------------------------------------------------+ |
|  |                                                      | |
|  |              INTERACTIVE HONG KONG MAP               | |
|  |          (Full width, ~400px height)                 | |
|  |                                                      | |
|  +------------------------------------------------------+ |
|                                                           |
+----------------------------------------------------------+
|                                                           |
|           45,000+ Active Listings                         |
|                                                           |
+----------------------------------------------------------+
```

---

## File Changes Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/translations/index.ts` | Modify | Add all missing translation keys for EN, zh-HK, zh-CN |
| `src/components/landing/HeroSection.tsx` | Modify | Add translations, add DummyHongKongMap below grid |
| `src/components/landing/PropertySearchChat.tsx` | Modify | Apply translations to all text |
| `src/components/landing/StatCounter.tsx` | Modify | Apply translation to label |
| `src/components/landing/FilterToggleBar.tsx` | Modify | Apply translations to all labels |
| `src/components/landing/FilterSidebar.tsx` | Modify | Apply translations to all labels |
| `src/components/landing/PropertyCard.tsx` | Modify | Apply translations to badges and labels |
| `src/components/landing/PropertyResultsTable.tsx` | Modify | Apply translations to headers and empty state |
| `src/components/landing/ExportActions.tsx` | Modify | Apply translations to button labels |
| `src/components/landing/VideoDemo.tsx` | Modify | Apply translations to title and descriptions |
| `src/components/map/DummyHongKongMap.tsx` | Modify | Apply translations to legend and UI text |

---

## Implementation Details

### 1. Translation File Update

Add comprehensive translations for all three languages covering:
- All filter labels
- All button text
- All placeholder text
- All status messages
- All table headers
- All map legend text
- All empty/loading states

### 2. HeroSection.tsx Changes

```typescript
// Add at top
import { useTranslation } from '@/hooks/useTranslation';
import { DummyHongKongMap } from '@/components/map/DummyHongKongMap';
import { mockProperties } from '@/data/mockProperties';

export function HeroSection() {
  const { t } = useTranslation();
  
  return (
    <section className="bg-gradient-hero">
      <div className="container mx-auto px-4 py-8 lg:py-12">
        {/* Title with translations */}
        <h1>
          {t('hero.title').replace('Hong Kong', '')}
          <span className="text-accent">{t('hero.titleAccent')}</span>
        </h1>
        <p>{t('hero.subtitle')}</p>

        {/* Two Column Grid - existing */}
        <div className="grid gap-8 lg:grid-cols-[55fr_45fr]">
          <PropertySearchChat />
          <VideoDemo />
        </div>

        {/* NEW: Full Width Map */}
        <div className="mt-8 lg:mt-12">
          <DummyHongKongMap
            properties={mockProperties}
            className="h-[400px] rounded-xl shadow-lg"
          />
        </div>
      </div>
    </section>
  );
}
```

### 3. Component Translation Pattern

Each component will follow this pattern:

```typescript
import { useTranslation } from '@/hooks/useTranslation';

export function SomeComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('some.translationKey')}</h1>
      <button>{t('button.label')}</button>
    </div>
  );
}
```

### 4. PropertySearchChat.tsx Key Changes

- Translate all thinking messages
- Translate placeholder text
- Translate button labels
- Translate "AI understood your search as:"
- Translate "properties found" / "selected"
- Translate empty state messages
- Translate sample search badges

### 5. Filter Components Translation

- Translate all filter section titles
- Translate "Clear all", "Clear selection", "Reset range"
- Translate filter count text
- Keep property type names in English (they're proper nouns/industry terms)
- Keep location names in English (they're proper nouns)

---

## Technical Notes

### Translation Key Naming Convention
- Use dot notation: `section.subsection.element`
- Examples: `filter.propertyType`, `search.button`, `table.location`

### Dynamic Text with Variables
For text containing dynamic values, use template approach:
```typescript
// Instead of: `${count} properties found`
// Use translation: t('search.propertiesFound') 
// Display: `${count} ${t('search.propertiesFound')}`
```

### Keeping Proper Nouns in English
- District/region names (Central, Kowloon, etc.) remain in English
- Developer names remain in English
- These are recognized proper nouns that don't require translation

---

## Implementation Order

1. **Update translations/index.ts** - Add all missing translation keys for all three languages

2. **Update HeroSection.tsx** - Add translations and include DummyHongKongMap

3. **Update PropertySearchChat.tsx** - Full translation coverage

4. **Update filter components** - FilterToggleBar and FilterSidebar

5. **Update remaining components** - PropertyCard, PropertyResultsTable, ExportActions, VideoDemo, DummyHongKongMap, StatCounter

---

## Expected Result

After implementation:
- Switching language in the header dropdown will translate ALL text on the page
- The dummy Hong Kong map will appear below the chat/video section
- The map will span the full container width with rounded corners
- The "45,000+ Active Listings" banner will appear below the map
- All user-facing text will be available in English, Traditional Chinese, and Simplified Chinese
