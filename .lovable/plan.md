# Shorten Search Placeholder

The placeholder text gets clipped on the search input because the second sentence is too long. Trim it to just the question for all locales.

## Changes

### `src/translations/index.ts`

Update `search.placeholder`:


| Language | New text                            |
| -------- | ----------------------------------- |
| en       | `What kind of place are you after?` |
| zh-HK    | `想搵乜嘢樓盤呢？`                          |
| zh-CN    | `想找什么样的房子？`                         |


## Out of Scope

- No styling, font, or input width changes.
- Follow-up placeholder (when conversation has history) untouched.