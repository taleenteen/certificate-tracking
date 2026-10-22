# Hide Profile Page Upper Navigation Header for Tang Rat Sessions

- Status: Verified
- Owner: Antigravity
- Date created: 2026-09-24
- Last updated: 2026-09-24

## Objective

Conditionally hide the upper navigation header (the white bar containing the back button and "โปรไฟล์ของฉัน") on the Profile page (`app/(app)/profile/page.tsx`) when the user arrives via "ทางรัฐ" (Tang Rat), using the existing channel check (`profile?.primaryChannel === "tang_rat"`).

## Context and constraints

- In the Tang Rat mobile app / In-App WebView, the host app already provides a native navigation header containing a back button and a title (set to "ข้อมูลส่วนตัว" via `dga-native-chrome.tsx`).
- Having an in-page navigation header with another back button and "โปรไฟล์ของฉัน" causes duplicate headers/back buttons in mobile view.
- In `app/(app)/profile/page.tsx`, `profile?.primaryChannel === "tang_rat"` is already used to distinguish Tang Rat sessions.

## Scope

- In `app/(app)/profile/page.tsx`, define `const isTangRat = profile?.primaryChannel === "tang_rat"`.
- Wrap the upper navigation header section with `{!isTangRat && ( ... )}`.
- Reuse `isTangRat` for `hasSecurityActions` (`!isTangRat || canLogout`).
- Verify with `bunx tsc --noEmit` and `bun run build`.

## Out of scope

- Redesigning the rest of the profile page or changing colors/styling.
- Modifying backend APIs or session hydration logic.

## Security and permission considerations

- Purely a UI presentation enhancement for mobile/WebView ergonomics. No security implications.

## Implementation checklist

- [x] Add `isTangRat` in `app/(app)/profile/page.tsx`.
- [x] Wrap upper navigation header with `{!isTangRat && ...}`.
- [x] Run `bunx tsc --noEmit` and `bun run build`.

## Validation checklist

- [x] TypeScript check (`bunx tsc --noEmit`) passes cleanly.
- [x] Next.js build (`bun run build`) compiles cleanly.

## Progress log

- 2026-09-24: Created plan and received approval from user to hide profile header for Tang Rat sessions.
- 2026-09-24: Implemented conditional upper navigation header rendering with `isTangRat` in `app/(app)/profile/page.tsx`. Verified with `bunx tsc --noEmit` and `bun run build`.

## Changed files

- `app/(app)/profile/page.tsx`
- `plan/2026-09-24-profile-hide-header-tang-rat.md`
- `plan/README.md`
