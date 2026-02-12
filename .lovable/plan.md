

# Fix Webhook Response Handling for n8n Integration

## Problem

The webhook sends requests to n8n correctly (status 200), but n8n returns responses in unexpected formats:
- First call: empty body
- Subsequent calls: `{"myField":"value"}` (test/placeholder data)

The current code silently fails because it expects a specific response shape (`success`, `results`, `insights`, etc.) and shows generic "no results" messages when the shape doesn't match.

## Root Cause

Two issues:
1. **n8n side**: The webhook is returning test data, not the expected property results format. This is an n8n workflow configuration issue the user needs to fix separately.
2. **Frontend side**: The response handling doesn't provide useful feedback about what n8n actually returned, making debugging impossible.

## Solution

Make the frontend response handling more robust and informative so it works correctly when n8n returns proper data AND provides helpful debugging info when it doesn't.

## Technical Changes

### File: `src/components/landing/PropertySearchChat.tsx`

**1. Improve response validation and logging (around lines 317-340)**

After parsing the JSON response, add validation that checks whether the response matches the expected format. If it doesn't, log the actual response shape and show a descriptive message:

```typescript
console.log('Webhook response data:', data);
console.log('Response keys:', Object.keys(data));

// Validate response structure
const hasExpectedFormat = data.results !== undefined || data.success !== undefined;

if (!hasExpectedFormat) {
  console.warn('Unexpected n8n response format. Expected {success, results, insights, ...} but got:', Object.keys(data));
  conversation.addAssistantMessage(
    "The search service returned an unexpected response format. Please check your n8n workflow configuration to ensure it returns the expected JSON structure with `success`, `results`, and `insights` fields."
  );
  setShowConversation(true);
  return;
}
```

**2. Handle the `summary` field from n8n (around lines 418-443)**

When n8n returns a `summary` field, use it as the assistant message instead of a generic one:

```typescript
const summaryText = data.summary 
  || `I found **${resultCount} properties** matching your criteria. Here are the top results:`;
const assistantMsg = conversation.addAssistantMessage(summaryText, resultCount);
```

**3. Normalize response field names (around lines 340-370)**

Support both `monthly_rent` / `sale_price` and alternative field names like `price` or `rent` that n8n might use:

```typescript
price: searchMode === 'rent' 
  ? (r.monthly_rent || r.rent || r.price || 0) 
  : (r.sale_price || r.price || 0),
```

Also handle `location` / `district` / `area`:
```typescript
location: r.location || r.district || r.area || '',
```

**4. Add Accept header already present -- verify Content-Type handling**

The fetch already includes `Accept: application/json`. No change needed here.

### File: `src/hooks/useWebhookSearch.ts`

No changes needed -- this hook isn't actually used in the main search flow (PropertySearchChat has its own inline fetch logic).

## Summary of Changes

| File | Change |
|------|--------|
| `src/components/landing/PropertySearchChat.tsx` | Add response format validation with descriptive error messages |
| `src/components/landing/PropertySearchChat.tsx` | Use n8n `summary` field for assistant messages |
| `src/components/landing/PropertySearchChat.tsx` | Normalize alternative field names in result mapping |

## What the User Still Needs to Do (n8n Side)

The n8n workflow must be configured to return JSON in this format:
```json
{
  "success": true,
  "summary": "Found 15 properties...",
  "results_count": 15,
  "results": [...],
  "insights": [...],
  "agent_recommendations": [...]
}
```

Currently it returns `{"myField":"value"}` which is test/placeholder data.

