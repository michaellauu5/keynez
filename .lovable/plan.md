
# Implementation Plan: Keynez Rebrand + n8n Webhook Integration

## ✅ COMPLETED

All three major changes have been implemented:
1. ✅ Rebranded from "Keynest" to "Keynez" across the entire application
2. ✅ Replaced the logo with the new uploaded image
3. ✅ Integrated the AI chatbot with the n8n webhook

---

## Part 1: Company Rebrand (Keynest → Keynez)

### Files to Update

| File | Change Type |
|------|-------------|
| `src/assets/` | Add new logo file (copy from upload) |
| `src/components/layout/Header.tsx` | Update logo import, alt text |
| `src/components/layout/Footer.tsx` | Update logo references, alt text, localStorage key |
| `src/translations/index.ts` | Replace "Keynest" → "Keynez" in all 3 languages |
| `src/contexts/LanguageContext.tsx` | Update storage key (`keynest-language` → `keynez-language`) |
| `src/hooks/useCanvasState.ts` | Update storage keys (`keynest_*` → `keynez_*`) |
| `src/components/landing/PropertySearchChat.tsx` | Update export filename, references |
| `src/components/landing/ExportActions.tsx` | Update PDF title, filenames |
| `src/components/landing/PerplexityResults.tsx` | Update "KeyNest" → "Keynez" |
| `src/components/landing/PropertyDetailModal.tsx` | Update source name |
| `src/components/map/GoogleMapView.tsx` | Update comment reference |
| `index.html` | Update page title and meta tags |

### Total Occurrences
Approximately 20+ occurrences across 12 files need updating.

---

## Part 2: Logo Replacement

1. Copy uploaded logo to `src/assets/keynez-logo.jpg`
2. Update import statements in Header.tsx and Footer.tsx
3. Adjust logo styling if needed for the new dimensions

---

## Part 3: n8n Webhook Integration

### Overview
Replace the current dual-search (AI database + Firecrawl) with a single n8n webhook call that handles all search orchestration externally.

### Webhook Configuration
```text
URL: https://properly.app.n8n.cloud/webhook-test/keynez_agent_input
Method: POST
Content-Type: application/json
Timeout: 60 seconds
```

### Technical Implementation

#### A. Create Webhook Service Hook (`src/hooks/useWebhookSearch.ts`)

New hook to manage webhook communication:

- Generate and persist `conversation_id` (UUID) in session storage
- Handle request timeout with AbortController (60 seconds)
- Manage loading states with rotating messages
- Process response and error handling
- Support follow-up conversations with history

#### B. Request Payload Structure

```text
{
  user_message: string,
  filters: {
    property_type: string[],
    transaction_type: "Rent" | "Buy",
    location: string[],
    price_range: { min, max, currency: "HKD" },
    bedrooms: number | null,
    bathrooms: number | null,
    size_sqft: { min, max },
    floor_level: string[],
    building_age: string[],
    orientation: string[],
    developer: string[],
    special_features: string[],
    furnished: boolean | null,
    pet_friendly: boolean | null,
    parking: boolean | null
  },
  language: "en" | "zh-HK" | "zh-CN",
  conversation_id: string,
  timestamp: ISO string,
  is_followup?: boolean,
  previous_results_count?: number,
  followup_intent?: string,
  conversation_history?: [{role, message}]
}
```

#### C. Expected Response Structure

```text
{
  success: boolean,
  results_count: number,
  results: [{
    building_name, monthly_rent, bedrooms, bathrooms,
    size_sqft, floor_level, outdoor_space,
    special_features[], agent_name, agent_contact,
    reference, source_url, match_score
  }],
  insights: string[],
  agent_recommendations: [{name, specialization, contact}]
}
```

#### D. Update PropertySearchChat Component

Key changes:
1. Replace `executeSearch` function to call webhook instead of Edge Functions
2. Implement enhanced loading state with rotating messages
3. Add indeterminate progress bar animation
4. Handle response mapping to existing display components
5. Disable input during search, enable on completion
6. Implement 60-second timeout with retry button
7. Map webhook response to PerplexityResults format

#### E. Loading State Messages

Rotating messages every 2-3 seconds:
- "Searching 28hse.com for listings..."
- "Checking Squarefoot database..."
- "Scanning Spacious listings..."
- "Searching Midland Realty..."
- "Checking Centaline properties..."
- "Gathering results from OneDay..."
- "Analyzing and ranking properties..."
- "Preparing your personalized results..."

#### F. Error Handling

| Scenario | User Message |
|----------|--------------|
| Timeout (60s) | "Search is taking longer than expected. Please try again or refine your filters." |
| Network error | "Unable to connect to search service. Please check your connection and try again." |
| No results | "No properties found matching your criteria. Try adjusting your filters or expanding your search area." |

All errors show a "Retry Search" button.

---

## Technical Details

### Files to Create
| File | Purpose |
|------|---------|
| `src/hooks/useWebhookSearch.ts` | Webhook communication logic |

### Files to Modify
| File | Changes |
|------|---------|
| `src/components/landing/PropertySearchChat.tsx` | Replace search logic with webhook call, enhanced loading UI |
| `src/components/landing/SearchProgressIndicator.tsx` | Add indeterminate progress bar, rotating messages |
| `src/components/landing/PerplexityResults.tsx` | Add agent_recommendations section display |

### Dependencies
No new dependencies required - using native `fetch` API with AbortController.

### UI/UX Considerations
- Search button and input disabled during search
- Yellow accent (#FFD54F) spinner animation
- Fade transitions between loading messages
- Gradient animation on progress bar
- Smooth fade-in on results appearance

---

## Testing Considerations

After implementation, verify:
1. All "Keynest" → "Keynez" replacements are complete
2. New logo displays correctly in header and footer
3. Webhook request sends correct payload structure
4. Loading states cycle through messages properly
5. 60-second timeout works correctly
6. Results display in Perplexity-style format
7. Follow-up conversations include history
8. Error states show appropriate messages and retry button

