# Native Entry Reliability

- Status: In Progress
- Owner: Codex
- Date created: 2026-07-19
- Last updated: 2026-07-19

## Objective

Ensure a Tang Rat mToken handoff that opens the legacy root URL reaches
`/auth/dga` without waiting for the external SDK, and ensure SDK credential
reads cannot keep the login UI pending indefinitely.

## Context and constraints

- The root page is server-rendered as a green loading screen and only redirects
  after client hydration.
- The DGA SDK is currently global with `beforeInteractive`, so an external SDK
  delay can prevent the root redirect from running.
- Legacy root handoffs use URL parameters; SDK-only handoffs must use the DGA
  landing URL `/auth/dga` because an ordinary root visit cannot safely be
  distinguished from a native SDK-only visit.
- Tokens must not be logged or persisted in browser storage.

## Scope

- Load the global DGA SDK after the page becomes interactive so it cannot block
  root-route hydration while remaining available to native features.
- Use a full-document replacement for root URL handoffs.
- Bound SDK credential reads and present a retryable missing-credential state.

## Out of scope

- DGA app-console landing URL registration.
- Backend mToken validation and OIDC.

## Security and permission considerations

- Preserve URL-first mToken handling and never log the mToken.
- Keep tokens in memory only until the BFF exchanges them.

## Implementation checklist

- [x] Change global DGA SDK loading to run after the page becomes interactive.
- [x] Make root URL handoffs use parameter-aware hard navigation.
- [x] Add bounded SDK credential polling and retry UI.

## Validation checklist

- [ ] TypeScript check.
- [ ] File-scoped ESLint.
- [ ] Production build.

## Progress log

- 2026-07-19: Identified the root-screen failure path: global
  `beforeInteractive` SDK loading can delay hydration, while the root redirect
  only recognizes URL-based handoffs.

## Changed files

- Pending implementation.

## Open questions and risks

- DGA must register `/auth/dga` as the landing URL for SDK-only launches; a
  no-parameter root request is intentionally treated as a normal browser visit.
