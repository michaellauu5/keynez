

# Update Chat Toggle Labels to "租樓/買樓" & "租房/买房"

The Rent/Buy toggle in the search chat currently uses the generic `filter.forRent` / `filter.forSale` keys (which render as "出租 / 出售"). Use dedicated keys so the toggle reads as a natural verb-noun pair without affecting other filter UIs.

## Changes

### 1. `src/translations/index.ts` — add two new keys per locale

| Key | en | zh-HK | zh-CN |
|---|---|---|---|
| `chat.toggle.rent` | `Rent` | `租樓` | `租房` |
| `chat.toggle.buy` | `Buy` | `買樓` | `买房` |

### 2. `src/components/landing/PropertySearchChat.tsx` (lines ~643, ~655)

Swap the toggle labels:

- `{t('filter.forRent')}` → `{t('chat.toggle.rent')}`
- `{t('filter.forSale')}` → `{t('chat.toggle.buy')}`

## Out of Scope
- No changes to `filter.forRent` / `filter.forSale` (still used by sidebar filters, badges, etc.).
- No styling, layout, or behavior changes.

