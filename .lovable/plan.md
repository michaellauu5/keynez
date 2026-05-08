## Goal

Replace the n8n webhook-based mock search flow in `PropertySearchChat.tsx` with a real backend call that streams Server-Sent Events (SSE) from a configurable agent endpoint. Drive the existing "thinking" UI from tool events, and render the final assistant reply as Markdown (with GFM tables).

## Files

### 1. New: `src/lib/agentClient.ts`

Thin SSE client. No React, no app state — just fetch + stream parsing.

- Read config from `import.meta.env`:
  - `VITE_AGENT_URL` (base URL)
  - `VITE_AGENT_SHARED_SECRET` (sent as `x-keynez-secret` header)
- Export types:
  - `AgentMessage = { role: 'system' | 'user' | 'assistant'; content: string }`
  - Callback shapes for `onToken(text)`, `onToolStart({ name, args })`, `onToolEnd({ name, summary })`, `onDone()`, plus optional `onError(err)` and `signal?: AbortSignal`.
- Export `streamAgentReply({ messages, onToken, onToolStart, onToolEnd, onDone, onError, signal })`:
  - `POST ${VITE_AGENT_URL}/chat` with `content-type: application/json` and `x-keynez-secret: VITE_AGENT_SHARED_SECRET`, body `{ messages }`.
  - Throw a clear error if env vars are missing.
  - Read `response.body` as a `ReadableStream`, decode with `TextDecoder`, buffer by `\n\n` SSE frame boundaries.
  - Parse each frame's `event:` and `data:` lines; `data` is JSON.
  - Dispatch:
    - `event: token`     → `onToken(data.text ?? data)` (string payload tolerated)
    - `event: tool_start` → `onToolStart({ name, args })`
    - `event: tool_end`   → `onToolEnd({ name, summary })`
    - `event: done`       → `onDone()` and exit loop
  - Return a `{ abort }` handle (wraps the AbortController) so callers can cancel.

### 2. New deps

Add `react-markdown` and `remark-gfm` via `bun add` so the assistant bubble can render GFM tables.

### 3. `src/components/landing/PropertySearchChat.tsx`

Replace the n8n `executeSearch` body (the `fetch(N8N_WEBHOOK_URL, …)` block plus all webhook response parsing) with a streaming agent call. Keep everything else — filters, `searchMode`, suggestions, mode toggle, `FilterToggleBar`, `ChatMessageList`, modal — unchanged.

- Maintain a `messages: AgentMessage[]` state alongside the existing `useConversation` hook (system + user + assistant turns). Seed with one `system` message describing Keynez context (mode, language, active filters serialized as JSON) so the backend has filter context without changing the request shape.
- On submit:
  1. Push the user turn into `messages` and into the existing conversation hook.
  2. Set `thinkingMessage` to the localized "analyzing" string, `isSearching = true`.
  3. Create an empty assistant message id; accumulate streamed tokens into a ref-backed string and update the displayed assistant content as tokens arrive.
  4. Call `streamAgentReply({ messages: [...messages, userTurn], onToken, onToolStart, onToolEnd, onDone })`.
- Tool → thinking-state mapping (drives the existing four phases):
  - `firecrawl_search`  → `'searching'`
  - `firecrawl_scrape`  → `'analyzing'`
  - any other tool      → keep current phase
  - on first token with no prior tool events → `'preparing'`
  - on `onDone` → clear thinking and finalize the assistant message
- Render the final assistant content with `<ReactMarkdown remarkPlugins={[remarkGfm]}>` inside the existing assistant bubble (in `ChatMessageList` the assistant branch already uses ReactMarkdown — extend that component to accept `remark-gfm` so streamed tables render correctly). No structural change to message list.
- Drop the n8n-specific state that is no longer fed (`agentRecommendations`, `webhookInsights`, `messageResults`, `searchSources` animation, `LOADING_MESSAGES` rotation). The progress UI keeps working off `thinkingMessage` only.
- Keep `filters`, `searchMode`, and `FilterSyncContext` wiring exactly as today.
- Add an `AbortController` ref so a new submit cancels an in-flight stream.

### 4. `.env.example`

Append:
```
VITE_AGENT_URL=
VITE_AGENT_SHARED_SECRET=
```

`.env` is auto-managed and not edited by hand; the user will add the real values via the Lovable secrets/env UI.

## Out of scope

- No backend/edge-function changes — the agent is assumed to live at `VITE_AGENT_URL`.
- No changes to `useWebhookSearch`, `PropertyResultsTable`, or `ChatResultsBubble` data shapes; they simply won't be populated by the agent path until tool events carry structured results (future work).
- No changes to translations, layout, or routing.

## Verification

- Build passes.
- With env vars unset, submitting shows a clear error toast (from `onError`) instead of a silent failure.
- With env vars set against a stub SSE server, the four thinking phases progress correctly and the final Markdown (including a GFM table) renders inside the assistant bubble.
