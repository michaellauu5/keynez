# Playful, Dimmed Search Placeholder

Update the search input placeholder copy in all three languages with a friendlier tone, and visually dim it to look like a hint.

## 1. New copy (`src/translations/index.ts`)

Replace `search.placeholder` for both the empty states. 


| Key                  | Language | New text                                                                    |
| -------------------- | -------- | --------------------------------------------------------------------------- |
| `search.placeholder` | en       | `What kind of place are you after? Even the trickiest wishlist is welcome.` |
| `search.placeholder` | zh-HK    | `想搵乜嘢樓盤？刁鑽要求都可以幫你架！`                                                        |
| `search.placeholder` | zh-CN    | `想找什么样的房子？特别的要求也能帮你搞定。`                                                     |
| &nbsp;               | &nbsp;   | &nbsp;                                                                      |
| &nbsp;               | &nbsp;   | &nbsp;                                                                      |
| &nbsp;               | &nbsp;   | &nbsp;                                                                      |


## 3. Dim the placeholder color

In the same `<Input>` (line ~725), append a placeholder utility so the suggestion looks soft/gray:

```tsx
className="h-12 pl-10 pr-4 text-base placeholder:text-muted-foreground/60 placeholder:font-normal"
```

This keeps the typed text full-strength while the placeholder reads as a hint.

## Files Changed


| File                                            | Change                                                                       |
| ----------------------------------------------- | ---------------------------------------------------------------------------- |
| `src/translations/index.ts`                     | Update `search.placeholder` x3 locales; add `search.placeholder.followup` x3 |
| `src/components/landing/PropertySearchChat.tsx` | Use translated follow-up key; add dim placeholder class                      |


## Out of Scope

- No changes to sliding suggestion bubbles or other input styling.
- Input border / size unchanged.