# mToken SDK Readiness

- Status: Implemented
- Owner: Agent
- Date created: 2026-07-17
- Last updated: 2026-07-17

## Objective

Prevent Tang Rat UAT login from failing or remaining pending on slower/older WebViews when the SDK object loads before native mToken/appId values are available.

## Context and constraints

- mTokens are one-time credentials and must never be submitted twice automatically.
- The official SDK can expose `window.czpSdk` before `getToken()` and `getAppId()` return values.
- URL-provided mToken/appId remain the preferred source when both are present.

## Scope

- Poll for complete mToken credentials for a bounded period before showing a missing-input error.
- Add retry only before a token has been submitted.
- Extend UAT diagnostics with readiness wait duration.
- Measure BFF/API exchange duration while preserving DGA's required early SDK load order.

## Out of scope

- Backend mToken validation, user provisioning, or DGA application registration.

## Security and permission considerations

- mToken is kept in memory only and remains absent from diagnostics.
- No automatic retry after a backend submission, avoiding one-time-token replay.

## Implementation checklist

- [x] Add complete-credential readiness helper.
- [x] Update mToken landing retry/state handling.
- [x] Update plan index and validate TypeScript/lint.

## Validation checklist

- [x] `bunx tsc --noEmit --incremental false`
- [x] File-scoped ESLint
- [ ] UAT test on an affected and unaffected Tang Rat device

## Progress log

- 2026-07-17: Audit identified an SDK-native-bridge race caused by single-read credential retrieval.
- 2026-07-17: Added bounded complete-credential readiness polling, pre-submit retry, and UAT wait-duration diagnostics. TypeScript, focused ESLint, and whitespace validation passed.
- 2026-07-17: Added client/BFF exchange timing; preserved DGA's `beforeInteractive` SDK load order after production runtime review.
- 2026-07-17: Guarded optional Tang Rat native title/back/capture bridge calls so an incompatible UAT chrome method cannot crash the client application.
- 2026-07-17: Re-ran frontend TypeScript, focused ESLint, and whitespace validation after performance changes. Backend provider unit test passed.

## Changed files

- `lib/dga-native.ts`
- `app/auth/dga/page.tsx`
- `app/api/[...path]/route.ts`
- `app/layout.tsx`
- `components/providers/dga-native-chrome.tsx`
- `plan/README.md`

## Open questions and risks

- An outdated Tang Rat app without SDK v5 support cannot be repaired by web code; diagnostics will identify it as SDK unavailable.
