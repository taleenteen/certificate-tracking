# License Clipboard WebView Diagnostics

- Status: Implemented
- Owner: Frontend implementation agent
- Date created: 2026-09-29
- Last updated: 2026-09-29

## Objective

Show an on-page diagnostic log for license-number copy actions so a tester can distinguish an unreceived tap from an unavailable, rejected, or stalled Clipboard API call inside the Tang Rat WebView on Huawei.

## Context and constraints

- License cards and the detail view currently call `navigator.clipboard.writeText` and silently discard failures.
- The same site copies correctly in a Huawei browser; failure occurs inside the Tang Rat WebView.
- Physical-device diagnosis is unavailable in this workspace.
- Keep ordinary copy behavior and avoid logging license numbers, tokens, or user identity.

## Scope

- Add an on-page diagnostic block to license copy controls that is visible during the diagnostic deployment.
- Record tap arrival, Clipboard API presence, relevant browser context, call progress, success, and error.
- Make diagnostics readable in a device screenshot.

## Out of scope

- Changing the copy mechanism or adding a fallback before the failure mode is known.
- Changing Tang Rat native app code or SDK integration.
- Sending diagnostics to a server.

## Proposed workflow

1. Add a shared client-side copy diagnostic hook and display block.
2. Connect the shared behavior to the card and detail copy buttons.
3. Review the diff and document how to use it on a Huawei device.

## Security and permission considerations

- Only environmental flags and error text appear in the block; no license number or auth material is included.
- Diagnostics are local to the page. Remove the temporary block after the device result is captured.

## Implementation checklist

- [x] Read required project guidance and trace the existing copy path.
- [x] Add shared clipboard diagnostic behavior and display.
- [x] Wire the card and detail buttons.
- [x] Update this plan and index at handoff.

## Validation checklist

- [x] Inspected the diff for unexpected changes and sensitive output; `git diff --check` found no whitespace errors.
- [ ] Physical Huawei Tang Rat WebView test: verify tap receipt and record the API result.

## Progress log

- 2026-09-29: Confirmed that both copy controls catch and hide Clipboard API failures. Started an opt-in on-page diagnostic implementation; physical-device reproduction remains pending.
- 2026-09-29: Added a shared diagnostic block to both copy controls. It reports tap arrival, browser context, API availability, pending calls, success, and redacted errors. Reviewed the diff and checked whitespace. Did not run tests because this change is diagnostic and device behavior must be checked in Tang Rat.
- 2026-09-29: Initially planned URL opt-in with `?clipboardDebug=1`. Changed to an always-visible temporary block because testers may be unable to edit the URL inside Tang Rat WebView; otherwise the diagnostic would be inaccessible through the normal app flow.

## Changed files

- `plan/2026-09-29-license-clipboard-webview-diagnostics.md`
- `plan/README.md`
- `components/app/licenses/license-copy-diagnostics.tsx`
- `components/app/licenses/license-certificate-card.tsx`
- `components/app/licenses/license-detail-page.tsx`

## Open questions and risks

- The host WebView may omit `navigator.clipboard`, reject its promise, or never settle it; the device log will separate these cases.
- The WebView must load the updated web deployment for the diagnostic block to appear.
- The temporary block is visible on every rendered license card and detail view until removed after diagnosis.
