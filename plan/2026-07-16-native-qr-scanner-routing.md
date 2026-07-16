# Native QR Scanner Routing

- Status: Implemented
- Owner: Agent
- Date created: 2026-07-16
- Last updated: 2026-07-16

## Objective

Use Tang Rat SDK v5 `scanQrCode()` for every QR action inside the Tang Rat app while preserving the HTML5 camera dialog as the browser-only fallback.

## Context and constraints

- Existing search and officer-verification views use the native-first hook, but navbar, search sheet, home, and license-list paths still invoke the browser dialog directly.
- The Tang Rat bridge can initialize after page code, and platform values must be normalized before comparison.
- Cancellation in the native scanner must never open the browser scanner afterward.

## Scope

- Wait briefly for the SDK bridge before determining native capability.
- Normalize platform values returned from SDK v5.
- Migrate all QR entry points to `useNativeQrScanner`.
- Retain `QrScannerDialog` only as browser fallback.

## Out of scope

- QR content parsing, native SDK version changes, or camera UI redesign.

## Security and permission considerations

- Native QR values continue through existing validation and external-URL handling.
- No QR content is persisted or logged by this change.

## Implementation checklist

- [x] Harden native SDK detection.
- [x] Migrate direct browser scanner entry points.
- [x] Update plan index and validate TypeScript/lint.

## Validation checklist

- [x] `bunx tsc --noEmit --incremental false`
- [x] File-scoped ESLint
- [ ] Manual Tang Rat native scan and browser fallback scan

## Progress log

- 2026-07-16: Started after native app QR actions opened the lower-quality HTML5 camera dialog.
- 2026-07-16: Added bounded SDK bridge wait/platform normalization and migrated navbar, search sheet, and home actions to native-first scanning. Removed the unused license-list scanner stub.
- 2026-07-16: TypeScript, focused ESLint, and whitespace validation passed. Physical Tang Rat and browser fallback checks remain pending.

## Changed files

- `lib/dga-native.ts`
- `components/app-shell/app-navbar.tsx`
- `components/shared/search-sheet-overlay.tsx`
- `components/app/home/home-dashboard.tsx`
- `components/app/licenses/license-list-page.tsx`
- `plan/README.md`

## Open questions and risks

- Physical device confirmation is required because SDK bridge behavior cannot be reproduced in a desktop browser.
