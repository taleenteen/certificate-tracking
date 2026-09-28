# Skip Tang Rat SDK Title on Home Page

- Status: Verified
- Owner: Antigravity
- Date created: 2026-09-24
- Last updated: 2026-09-28

## Objective

Update `components/providers/dga-native-chrome.tsx` to set the Tang Rat SDK title for `/home` to `"ระบบตรวจสอบใบอนุญาตอิเล็กทรอนิกส์"` (revised from previous behavior of skipping title setting).

## Context and constraints

- `DgaNativeChrome` listens to route transitions and calls `sdk.setTitle(pageTitle(pathname), showBackButton)`.
- Previously on 2026-09-24, title setting was bypassed on `/home` at user request.
- On 2026-09-28, user requested to re-enable `sdk.setTitle` on `/home` using the specific title `"ระบบตรวจสอบใบอนุญาตอิเล็กทรอนิกส์"`.

## Scope

- In `components/providers/dga-native-chrome.tsx`, map `/home` to `"ระบบตรวจสอบใบอนุญาตอิเล็กทรอนิกส์"`.
- Call `sdk.setTitle(pageTitle(pathname), showBackButton)` uniformly across routes including `/home`.
- Ensure `showBackButton` remains `false` on `/home` and `true` on inner pages.
- Verify with `bunx tsc --noEmit` and `bun run build`.

## Out of scope

- Changing titles on other pages.
- Changing QR scanning or file export SDK behaviors.

## Security and permission considerations

- Native chrome titles are purely decorative / cosmetic for the In-App WebView. No security or authorization impact.

## Implementation checklist

- [x] Update `PAGE_TITLES["/home"]` and default fallback in `components/providers/dga-native-chrome.tsx`.
- [x] Call `sdk.setTitle` on `/home`.
- [x] Run `bunx tsc --noEmit` and `bun run build`.

## Validation checklist

- [x] TypeScript check (`bunx tsc --noEmit`) passes cleanly.
- [x] Next.js build (`bun run build`) compiles cleanly.

## Progress log

- 2026-09-24: Created plan to skip `sdk.setTitle` on `/home`.
- 2026-09-24: Updated `components/providers/dga-native-chrome.tsx` to omit `sdk.setTitle` on `/home` while maintaining back button visibility management. Verified with `bunx tsc --noEmit` and `bun run build`.
- 2026-09-28: User requested to set `/home` title to `"ระบบตรวจสอบใบอนุญาตอิเล็กทรอนิกส์"`. Re-enabled `sdk.setTitle` on `/home` and updated mapping. Verified with `bunx tsc --noEmit` and `bun run build`.

## Changed files

- `components/providers/dga-native-chrome.tsx`
- `plan/2026-09-24-skip-home-dga-title.md`
- `plan/README.md`
