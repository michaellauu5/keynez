

# Localize "Try asking…" Empty State Hint

The "Try asking…" hint above the sliding prompt bubbles is hardcoded English. Localize it to match the active UI language.

## Changes

### `src/translations/index.ts`

Add new key `chat.empty.tryAsking`:

| Language | Text |
|---|---|
| en | `Try asking…` |
| zh-HK | `試下問…` |
| zh-CN | `试着问…` |

### `src/components/landing/ChatMessageList.tsx` (line 85)

Replace the hardcoded `<p className="text-xs">Try asking…</p>` with the translated value:

```tsx
<p className="text-xs">{t('chat.empty.tryAsking')}</p>
```

Pull `t` from the existing `useTranslation()` call already in the component (currently only `language` is destructured).

## Out of Scope
- No styling, layout, or sliding bubble changes.
- No changes to other empty-state copy.

