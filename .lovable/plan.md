

# Add Sliding Suggested Prompts to Empty Chat State

Replace the static "Start a conversation to search properties" empty state in `ChatMessageList.tsx` with a more compact area showing 3 rows of animated, language-aware suggested prompt bubbles that slide in from the right, pause, and exit on staggered timings.

## 1. Reduce empty-state height by 30%

In `src/components/landing/ChatMessageList.tsx` (line ~71), the current empty state uses `h-full`. Wrap it in a container with `max-h-[70%]` and reduce vertical padding so the area visually shrinks ~30%. Keep the small Sparkles icon + heading line above the new sliding rows.

## 2. Create 15 prompt combinations × 3 languages

Add a new file `src/data/suggestedPrompts.ts` exporting:

```ts
export const SUGGESTED_PROMPTS: Record<Language, string[]> = {
  en:    [...15 entries...],
  "zh-HK": [...15 entries...],
  "zh-CN": [...15 entries...],
}
```

Sample English prompts (HK rental market flavoured):
1. Find me new apartments with best price for money ratio in Kennedy Town
2. 2BR sea-view flat in Sai Ying Pun under HK$28k
3. Pet-friendly walk-up in Sheung Wan with rooftop access
4. Family 3BR near international school in Tai Tam
5. High-floor studio in Causeway Bay below HK$18k
6. Newly renovated flat in Sham Shui Po under HK$15k
7. MTR-connected 2BR in Tsuen Wan with clubhouse
8. Quiet village house in Sai Kung with parking
9. Modern 1BR in Wan Chai walking distance to office
10. Sky-high 3BR in West Kowloon with harbour view
11. Furnished serviced apartment in Mid-Levels under HK$35k
12. Big balcony 2BR in Discovery Bay for remote work
13. Co-living friendly studio in Quarry Bay near MTR
14. Spacious 4BR with maid room in Clear Water Bay
15. Best value new development in Tseung Kwan O

Each translated into Traditional and Simplified Chinese with HK-localised district names (堅尼地城 / 坚尼地城, 西營盤 / 西营盘, etc.).

## 3. Three-row sliding ticker

Inside the empty state container, render 3 horizontal rows. Each row independently:

- Picks a prompt from `SUGGESTED_PROMPTS[language]`.
- Renders it as a pill bubble (rounded-full, bg-card, border, soft shadow).
- Animation per bubble: enter from right (`translateX(100%) → 0`), hold 3s, exit to left (`translateX(0) → -100%`).
- After exit, picks the next prompt and repeats.
- Each row uses a different stagger so the three bubbles do **not** enter or leave together:
  - Row 1: enter delay 0s, hold 3s, exit duration 0.6s → cycle ~4.0s
  - Row 2: enter delay 0.7s, hold 3s, exit duration 0.6s → cycle ~4.4s
  - Row 3: enter delay 1.4s, hold 3s, exit duration 0.6s → cycle ~4.8s

Implement with a small `<SlidingPromptRow>` subcomponent using `useEffect` + `setTimeout` to advance an index and toggle a CSS class (`animate-slide-in-from-right` / `animate-slide-out-to-left`). Define the two keyframes in `tailwind.config.ts` under `keyframes` + `animation`:

```ts
"prompt-in":  { "0%": { transform: "translateX(100%)", opacity: "0" },
                "100%": { transform: "translateX(0)",   opacity: "1" } },
"prompt-out": { "0%": { transform: "translateX(0)",    opacity: "1" },
                "100%": { transform: "translateX(-100%)", opacity: "0" } },
```

Each row uses `overflow-hidden` and centers the bubble. Clicking a bubble calls `onSuggestionClick(prompt)` (already passed into `ChatMessageList`) so users can pick a prompt mid-slide.

## 4. Language reactivity

Use `useTranslation()` to read the current `language` and pick the matching prompt array. When language changes, the ticker swaps to the new locale on its next cycle.

## Files Changed

| File | Change |
|------|--------|
| `src/data/suggestedPrompts.ts` | New: 15 prompts × 3 locales |
| `src/components/landing/ChatMessageList.tsx` | Shrink empty state height; replace static line with `<SlidingPromptRow>` × 3 |
| `tailwind.config.ts` | Add `prompt-in` / `prompt-out` keyframes & animation utilities |

## Out of Scope
- No changes to non-empty chat state, suggestions row after assistant messages, or loading state.
- No backend or webhook changes.

