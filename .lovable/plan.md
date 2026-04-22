

# Fix Simplified Chinese Hero Title

The Simplified Chinese hero title currently reads "智能搵楼助理" — it mixes the Cantonese verb "搵" with the Simplified noun "楼". Replace with proper Simplified Chinese phrasing.

## Change

### `src/translations/index.ts` (line 699, zh-CN locale)

```diff
- "hero.titleAccent": "智能搵楼助理",
+ "hero.titleAccent": "智能找房助理",
```

## Out of Scope
- zh-HK ("智能搵樓助理") and en ("Hong Kong") titles unchanged.
- No styling or layout changes.

