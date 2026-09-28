# Skip Tang Rat SDK Title on Home Page

- Status: Verified
- Owner: Antigravity
- Date created: 2026-09-24
- Last updated: 2026-09-24

## Objective

Skip calling `sdk.setTitle` on the `/home` page in `components/providers/dga-native-chrome.tsx` so that Tang Rat (DGA) mobile app preserves its native service header/title instead of being overridden by `"e-License"`.

## Context and constraints

- `DgaNativeChrome` listens to route transitions and calls `sdk.setTitle(pageTitle(pathname), showBackButton)`.
- On `/home`, this set the title to `"e-License"`.
- The user requested "Case A": do not set the title on the Home page, leaving the native title untouched.

## Scope

- In `components/providers/dga-native-chrome.tsx`, bypass `sdk.setTitle` when `pathname === "/home"`.
- Verify with `bunx tsc --noEmit` and `bun run build`.

## Out of scope

- Changing QR scanning or file export SDK behaviors.
- Modifying authentication flow in `/auth/dga`.

## Security and permission considerations

- Native chrome titles are purely decorative / cosmetic for the In-App WebView. No security or authorization impact.

## Implementation checklist

- [x] Update `components/providers/dga-native-chrome.tsx` to skip `sdk.setTitle` on `/home`.
- [x] Run `bunx tsc --noEmit` and `bun run build`.

## Validation checklist

- [x] TypeScript check (`bunx tsc --noEmit`) passes cleanly.
- [x] Next.js build (`bun run build`) compiles cleanly.

## Progress log

- 2026-09-24: Created plan to skip `sdk.setTitle` on `/home`.
- 2026-09-24: Updated `components/providers/dga-native-chrome.tsx` to omit `sdk.setTitle` on `/home` while maintaining back button visibility management. Verified with `bunx tsc --noEmit` and `bun run build`.

## Changed files

- `components/providers/dga-native-chrome.tsx`
- `plan/2026-09-24-skip-home-dga-title.md`
- `plan/README.md`
