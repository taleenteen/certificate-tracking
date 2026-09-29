# License Clipboard Legacy Fallback

- Status: Implemented
- Owner: Frontend implementation agent
- Date created: 2026-09-29
- Last updated: 2026-09-29

## Objective

Copy license numbers in an older Android WebView when `navigator.clipboard.writeText` rejects, and report success only when a copy method succeeds.

## Context and constraints

- Huawei Tang Rat WebView reports Chromium 114 and rejects `writeText` with `NotAllowedError: Write permission denied` despite HTTPS and user activation.
- Both license card and detail view use the shared `useLicenseCopyDiagnostics` hook.
- The existing temporary on-page diagnostics should show the outcome of both copy methods until the device check is complete.
- `document.execCommand("copy")` is deprecated and must be treated as a tested compatibility fallback, not a guaranteed fix.

## Scope

- Add a synchronous textarea selection and `execCommand("copy")` fallback in the shared copy hook.
- Attempt fallback if the Clipboard API is unavailable or rejects.
- Check the fallback's boolean result, log its outcome, and show copied state only on success.
- Preserve the current card and detail button wiring.

## Out of scope

- Native app or SDK changes.
- Removing the temporary diagnostic block before physical-device validation.
- Clipboard read permission or reading clipboard contents from JavaScript.

## Proposed workflow

1. Add the fallback helper and error handling to the shared hook.
2. Review both button paths and the diagnostic output.
3. Run proportional static validation and record the pending Huawei paste test.

## Security and permission considerations

- The fallback copies only the displayed license number and removes the temporary textarea immediately.
- Do not log the copied value or persist it in app storage.
- Do not report success if `execCommand` returns `false` or throws.

## Implementation checklist

- [x] Review the existing diagnostics and device result.
- [x] Add legacy copy fallback to the shared hook.
- [x] Record both outcomes and clear user feedback when both fail.
- [x] Update the plan and index at handoff.

## Validation checklist

- [x] `bunx tsc --noEmit --incremental false` passed.
- [x] File-scoped ESLint and `git diff --check` passed.
- [ ] Huawei Tang Rat WebView: paste the copied number after pressing the button.
- [ ] Confirm modern browser copy still succeeds through `writeText`.

## Progress log

- 2026-09-29: Started a compatibility fallback after the Huawei device log showed permission denial in Chromium WebView 114.
- 2026-09-29: Added a temporary textarea selection fallback after `writeText` failure. The helper checks `execCommand("copy")`'s boolean result, removes the textarea, and restores focus. The diagnostic block records both paths and the controls show an error if both fail. TypeScript, focused ESLint, and whitespace checks passed; physical clipboard contents remain unverified.

## Changed files

- `plan/2026-09-29-license-clipboard-legacy-fallback.md`
- `plan/README.md`
- `components/app/licenses/license-copy-diagnostics.tsx`
- `components/app/licenses/license-certificate-card.tsx`
- `components/app/licenses/license-detail-page.tsx`

## Open questions and risks

- Some WebViews may reject `execCommand` after the asynchronous Clipboard API rejects because the user gesture may no longer count; the physical-device result will decide if a synchronous old-WebView path is needed.
