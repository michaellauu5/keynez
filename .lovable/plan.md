

# Fix Chatbot Webhook Integration

## Current State
The webhook integration is **mostly implemented** — it sends correctly, parses responses, maps results, and renders via `ChatResultsBubble`. The core issues are:

1. **Errors show as toasts instead of chat bubbles** — timeout, network, and empty-result errors use `toast.error()` rather than appearing as assistant messages in chat
2. **Chat area is too small** — currently `minHeight: 500px`, should be `600px`
3. **Missing debug console.logs** — key response steps lack the requested emoji-prefixed logs
4. **No retry button in error bubbles** — errors should include a retry action

## Changes

### File: `src/components/landing/PropertySearchChat.tsx`

1. **Increase chat area height** (line 622): Change `minHeight: '500px'` to `minHeight: '600px'`

2. **Add debug console.logs** (lines 326-365): Add `📤`, `📥`, `❌` prefixed logs at each step:
   - `console.log('📤 Payload:', webhookPayload)` before fetch
   - `console.log('📥 Status:', response.status)` after fetch
   - `console.log('📥 Data:', data)` after JSON parse
   - `console.log('❌ Error:', error)` in catch block

3. **Move error handling from toasts to chat bubbles** (lines 495-516): Replace `toast.error()` calls with `conversation.addAssistantMessage()` for each error case:
   - Timeout: `"⚠️ Search timed out. Please try again or refine your filters."`
   - Network: `"⚠️ Cannot connect to search service. Please check your connection."`
   - No results: already handled correctly as chat bubble
   - Generic: `"⚠️ Search failed: [error message]. Please try again."`

4. **Empty response handling** (line 351): Change the empty response message to use the `⚠️` prefix for consistency

### File: `src/components/landing/ChatMessageList.tsx`

5. **Add retry support to error messages**: Detect messages starting with `⚠️` and render a "Retry" button below them that calls `onSearchAgain`

These are targeted fixes — the webhook send logic, response parsing, result mapping, `ChatResultsBubble` rendering, loading state with rotating messages, and multi-round conversation all work correctly already.

