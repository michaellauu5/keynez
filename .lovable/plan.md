
# Dummy Hong Kong Map & AI Property Search Chatbot Implementation

## Overview
This plan implements two major features:
1. **Dummy Interactive Hong Kong Map**: A placeholder map component with Hong Kong districts that works without Google Maps API
2. **AI Property Search Chatbot**: Natural language property search using Qwen API (via Lovable AI gateway) with structured results and export functionality

---

## Part 1: Dummy Interactive Hong Kong Map

### New Component
**File: `src/components/map/DummyHongKongMap.tsx`**

An interactive SVG-based map of Hong Kong showing districts with property pins:

**Features:**
- SVG outline of Hong Kong regions (Hong Kong Island, Kowloon, New Territories)
- Clickable district areas with hover effects
- Property markers positioned on district locations
- Color-coded pins (Blue for Sale, Green for Rent)
- Tooltip showing property count per district
- Click district to filter properties
- Marker click shows property info popup
- Pan/zoom controls (CSS transforms)
- Keynest color palette (beige, brown, yellow accents)

**Map Data Structure:**
```typescript
const HONG_KONG_DISTRICTS = {
  "Hong Kong Island": {
    path: "M...", // SVG path
    center: { x: 70, y: 75 },
    districts: ["Central", "Mid-Levels", "The Peak", "Wan Chai", "Causeway Bay", "Happy Valley", "Repulse Bay"]
  },
  "Kowloon": {
    path: "M...",
    center: { x: 55, y: 45 },
    districts: ["Tsim Sha Tsui", "Mong Kok", "Kowloon Tong", "Ho Man Tin", "Hung Hom", "Kowloon City"]
  },
  // ... New Territories
};
```

### Update GoogleMapView
**File: `src/components/map/GoogleMapView.tsx`**

Modify to show dummy map when API key is not configured:

```typescript
if (!apiKey) {
  return (
    <DummyHongKongMap
      properties={properties}
      hoveredPropertyId={hoveredPropertyId}
      onPropertyClick={onPropertyClick}
      // ... other props
    />
  );
}
```

---

## Part 2: AI Property Search Chatbot

### Architecture

```text
User Input → Edge Function → Lovable AI Gateway → Qwen API
                    ↓
         Parse criteria + Match properties
                    ↓
         Ranked JSON results (top 15)
                    ↓
         Display in sortable table
```

### Step 1: Create Edge Function for AI Search
**File: `supabase/functions/ai-property-search/index.ts`**

Edge function that:
1. Receives natural language query + filters
2. Constructs prompt for Qwen to extract property criteria
3. Calls Lovable AI Gateway
4. Parses structured response
5. Returns ranked properties

**Prompt Engineering:**
```typescript
const systemPrompt = `You are a Hong Kong property search assistant. 
Extract property search criteria from user messages and return structured JSON.

Extract these fields:
- location: array of district names
- priceMin/priceMax: in HKD
- sizeMin/sizeMax: in sqft
- bedrooms: number or range
- features: array (sea view, pool, gym, parking, etc.)
- specialRequirements: any other criteria

Also provide a relevance scoring explanation for each match.`;
```

**Response Format:**
```typescript
interface AISearchResponse {
  extractedCriteria: {
    locations: string[];
    priceRange: [number, number];
    sizeRange: [number, number];
    bedrooms: number[];
    features: string[];
    specialRequirements: string;
  };
  results: Array<{
    rank: number;
    propertyId: string;
    name: string;
    location: string;
    price: number;
    size: number;
    bedrooms: string;
    features: string[];
    relevanceScore: number;
    matchReason: string;
  }>;
  searchSummary: string;
}
```

### Step 2: Create Supabase Config
**File: `supabase/config.toml`**

```toml
project_id = "keynest-ai"

[functions.ai-property-search]
verify_jwt = false
```

### Step 3: Update PropertySearchChat Component
**File: `src/components/landing/PropertySearchChat.tsx`**

Modify to:
1. Call the edge function instead of mock filtering
2. Show AI thinking/loading state with animated dots
3. Display extracted criteria badges
4. Show relevance scores and match reasons
5. Highlight matching keywords in results

**New Features:**
- AI thinking indicator with progress messages
- Extracted criteria display (pills/badges)
- Match reason column in results
- Relevance score visualization (progress bar)

### Step 4: Update PropertyResultsTable
**File: `src/components/landing/PropertyResultsTable.tsx`**

Add new columns:
- Rank column (1-15)
- Match Score (percentage bar)
- Keyword highlighting for matched terms
- Clickable rows that expand to show details

**New Props:**
```typescript
interface PropertyResultsTableProps {
  results: PropertyResult[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  highlightTerms?: string[];
  onRowClick?: (property: PropertyResult) => void;
}
```

### Step 5: Enhance Export Functionality
**File: `src/components/landing/ExportActions.tsx`**

Current implementation already supports:
- CSV export ✓
- PDF export (print-based) ✓
- Research Canvas export ✓

Enhancements:
- Add search query to exports
- Include match reasons in CSV/PDF
- Better PDF formatting with images

---

## File Changes Summary

| File | Action | Purpose |
|------|--------|---------|
| `supabase/config.toml` | Create | Supabase configuration |
| `supabase/functions/ai-property-search/index.ts` | Create | AI search edge function |
| `src/components/map/DummyHongKongMap.tsx` | Create | Interactive placeholder map |
| `src/components/map/GoogleMapView.tsx` | Modify | Use dummy map when no API key |
| `src/components/landing/PropertySearchChat.tsx` | Modify | Integrate AI search |
| `src/components/landing/PropertyResultsTable.tsx` | Modify | Add rank, score, highlighting |
| `src/components/landing/ExportActions.tsx` | Modify | Enhanced exports |

---

## Dummy Map Visual Design

```text
+--------------------------------------------------+
|  [Filter by District ▼]           [+] [-] [⌖]   |
+--------------------------------------------------+
|                                                   |
|     New Territories                               |
|   +-------------------+                           |
|   |  ● ●    Sha Tin   |                          |
|   |      ●  Tai Po    |                          |
|   +---------+---------+                           |
|             |                                     |
|     Kowloon |                                     |
|   +---------+                                     |
|   | ● TST   |                                     |
|   | ● MK  ● |                                     |
|   +----+----+                                     |
|        |                                          |
|   Hong Kong Island                                |
|   +------------------+                            |
|   |● Central ● WC    |                           |
|   |    ● Mid-Levels  |                           |
|   +------------------+                            |
|                                                   |
|  ● = Property marker (click for details)          |
|  Hover district = highlight + count              |
+--------------------------------------------------+
```

---

## AI Search Flow

```text
1. User types: "3 bedroom apartment in Mid-Levels under 50 million with sea view"

2. AI extracts:
   ┌────────────────────────────────────────┐
   │ 📍 Mid-Levels  🛏️ 3 BR  💰 <$50M      │
   │ 🌊 Sea View                            │
   └────────────────────────────────────────┘

3. AI matches & ranks properties:
   ┌────┬─────────────────┬──────────┬───────┐
   │ #1 │ Grand Mayfair   │ $48M     │ 95%   │
   │ #2 │ Peak Residence  │ $45M     │ 88%   │
   │ #3 │ ...             │ ...      │ ...   │
   └────┴─────────────────┴──────────┴───────┘
```

---

## Implementation Order

1. **Supabase Setup**
   - Create config.toml
   - Create ai-property-search edge function

2. **Dummy Map**
   - Create DummyHongKongMap component
   - Update GoogleMapView to use it as fallback

3. **AI Search Integration**
   - Update PropertySearchChat to call edge function
   - Add loading/thinking states
   - Display extracted criteria

4. **Results Enhancement**
   - Add rank and score columns
   - Implement keyword highlighting
   - Enhance export with search context

---

## Technical Notes

### Lovable AI Gateway
- Uses existing `LOVABLE_API_KEY` (already configured)
- Model: `google/gemini-3-flash-preview` (default, fast)
- Endpoint: `https://ai.gateway.lovable.dev/v1/chat/completions`

### Edge Function Structure
```typescript
// supabase/functions/ai-property-search/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = { /* ... */ };

serve(async (req) => {
  // 1. Parse request (query, filters)
  // 2. Call Lovable AI to extract criteria
  // 3. Match against mock properties
  // 4. Return ranked results
});
```

### Property Matching Logic
The edge function will:
1. Use AI to parse natural language into structured criteria
2. Filter mock properties based on extracted criteria
3. Calculate relevance scores based on:
   - Exact location match: +30 points
   - Price within range: +25 points
   - Bedroom match: +20 points
   - Feature matches: +5 points each
4. Return top 15 sorted by score

---

## Expected User Experience

1. User opens landing page
2. Types natural language query or uses filters
3. Clicks "Search" button
4. Sees AI "thinking" animation
5. Extracted criteria appear as badges
6. Results table shows with:
   - Rank numbers (1-15)
   - Highlighted matching keywords
   - Relevance scores
7. Can sort by any column
8. Can select and export to CSV/PDF/Research Canvas
