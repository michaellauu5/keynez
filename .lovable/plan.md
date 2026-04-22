

# Localize "For Rent / For Sale" Toggle

The Rent/Buy toggle in the search chat is hardcoded English. Use existing translation keys so it follows the active site language.

## Change

### `src/components/landing/PropertySearchChat.tsx` (lines 643, 655)

Replace hardcoded text with translations:

```tsx
<Key className="h-4 w-4" />
{t('filter.forRent')}
```

```tsx
<Home className="h-4 w-4" />
{t('filter.forSale')}
```

`t` is already available via the existing `useTranslation()` hook in this component — no new imports needed. Translation keys `filter.forRent` and `filter.forSale` already exist for all three locales (en / zh-HK / zh-CN).

## Out of Scope
- No styling, layout, or behavior changes.
- No new translation keys (existing ones are reused).

