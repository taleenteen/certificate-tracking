# Native Runtime Capability Gate

- Status: Verified
- Owner: Agent
- Date created: 2026-07-17
- Last updated: 2026-07-17

## Objective

Use one Tang Rat SDK runtime decision for all native-only features while keeping
mToken login independent of SDK availability when the landing URL already
contains `mToken` and `appId`.

## Context and constraints

- The SDK script remains globally loaded with `beforeInteractive`.
- The stable login flow is URL-first and must continue to exchange valid URL
  parameters even when the SDK bridge is late or unavailable.
- A Tang Rat session with a missing bridge must retain the regular browser QR
  camera and browser download fallback.
- A regular browser must retain QR camera and blob-download behaviour.

## Scope

- Add a client runtime provider that resolves SDK/platform capability once and
  can retry the bridge check on user action.
- Persist a tab-only Tang Rat entry marker after a URL-based mToken handoff.
- Route QR scanning, file export, and native chrome through that provider.
- Prefer native QR/export, then fall back to browser QR/download when native
  capability is unavailable or a native invocation fails.

## Out of scope

- Backend mToken validation, API contracts, SDK URL/version changes, and a
  login UI redesign.

## Proposed workflow

1. Keep `/auth/dga` URL-first; mark the tab as a Tang Rat handoff only after
   it reads the URL parameters.
2. Resolve `mobile`, `web`, or `native-unavailable` centrally.
3. Use native QR/export first for `mobile`; fall back to browser equivalents
   when the native capability is missing or fails.
4. Retry the native bridge when a user invokes a native action.

## Security and permission considerations

- The marker is UX-only in `sessionStorage`; authorization remains server-side.
- No mToken, app ID, QR content, or presigned URL is persisted by this work.
- Native export requests `delivery: native` only when the native save method is
  available, then downloads that same export through the BFF if the SDK fails.

## Implementation checklist

- [x] Add runtime provider and capability state.
- [x] Preserve URL-first mToken login and set handoff marker.
- [x] Refactor QR, export, and native chrome callers.
- [x] Update the export integration documentation and plan index.
- [x] Restore browser fallback after native QR/export capability or invocation
  failures while preserving native-first behavior.

## Validation checklist

- [x] TypeScript check.
- [x] File-scoped ESLint.
- [x] Production build.
- [ ] Manual Tang Rat and browser verification.

## Progress log

- 2026-07-17: Started after native QR actions fell back to the lower-quality
  HTML5 camera when the SDK bridge was unavailable.
- 2026-07-17: Added a shared runtime provider. Browser sessions retain HTML5
  camera/blob download. A URL-marked Tang Rat session with no bridge now shows
  a controlled retryable error instead of silently switching to browser APIs.
- 2026-07-17: `bunx tsc --noEmit --incremental false`, focused ESLint,
  `git diff --check`, and `bun run build` passed.
- 2026-07-20: Restored browser fallback after unavailable or failed native QR
  scanning. Native document export now falls back through the BFF using the
  same completed export record, avoiding duplicate exports and audit rows.
  `bunx tsc --noEmit --incremental false`, focused ESLint, `git diff --check`,
  and `bun run build` passed.

## Changed files

- `lib/dga-native.ts`
- `components/providers/dga-native-runtime.tsx`
- `components/providers/Providers.tsx`
- `components/providers/dga-native-chrome.tsx`
- `hooks/useNativeQrScanner.ts`
- `hooks/useLicenseDocumentExports.ts`
- `app/auth/dga/page.tsx`
- `docs/LICENSE_DOCUMENT_EXPORT.md`
- `plan/README.md`

## Open questions and risks

- Tang Rat bridge readiness still requires physical-device verification because
  it cannot be reproduced in a desktop browser.
