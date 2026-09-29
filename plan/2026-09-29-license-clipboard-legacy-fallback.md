# License Clipboard Legacy Fallback

- Status: Implemented
- Owner: Frontend implementation agent
- Date created: 2026-09-29
- Last updated: 2026-09-29

## Objective

Copy license numbers in an older Android WebView when `navigator.clipboard.writeText` rejects, and report success only when a copy method succeeds.

## Context and constraints

- Huawei Tang Rat WebView reports Chromium 114 and rejects `writeText` with `NotAllowedError: Write permission denied` despite HTTPS and user activation.
- Both license card and detail view originally used the shared `useLicenseCopyDiagnostics` hook. After diagnosis, the copy behavior lives in `useLicenseCopy`.
- The temporary on-page diagnostics showed the outcome of both copy methods until the user confirmed the Huawei copy worked; the block has since been removed.
- `document.execCommand("copy")` is deprecated and must be treated as a tested compatibility fallback, not a guaranteed fix.

## Scope

- Add a synchronous textarea selection and `execCommand("copy")` fallback in the shared copy hook.
- Attempt fallback if the Clipboard API is unavailable or rejects.
- Check the fallback's boolean result, log its outcome, and show copied state only on success.
- Preserve the current card and detail button wiring.
- After the user confirmed copying works on Huawei, remove the temporary diagnostic UI and event log while keeping the shared fallback and user-facing failure message.
- Route the observed pre-fix Chromium Android WebView to the synchronous selection copy path during the click handler, while leaving the modern Clipboard API first for other engines.

## Out of scope

- Native app or SDK changes.
- Removing the temporary diagnostic block before physical-device validation (original scope; validation has since been reported by the user).
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
- [x] Remove temporary diagnostic UI and logging, retaining the working fallback.
- [x] Handle the older Android WebView before awaiting `writeText` and recheck the copy path statically.

## Validation checklist

- [x] `bunx tsc --noEmit --incremental false` passed.
- [x] File-scoped ESLint and `git diff --check` passed.
- [x] User confirmed copying works in the Huawei Tang Rat WebView with the fallback before log removal.
- [ ] Recheck copying and paste on Huawei Tang Rat WebView after the synchronous legacy path change.
- [ ] Confirm modern browser copy still succeeds through `writeText`.

## Progress log

- 2026-09-29: Started a compatibility fallback after the Huawei device log showed permission denial in Chromium WebView 114.
- 2026-09-29: Added a temporary textarea selection fallback after `writeText` failure. The helper checks `execCommand("copy")`'s boolean result, removes the textarea, and restores focus. The diagnostic block records both paths and the controls show an error if both fail. TypeScript, focused ESLint, and whitespace checks passed; physical clipboard contents remain unverified.
- 2026-09-29: User reported the Huawei WebView copy works with the fallback and requested removal of all temporary logging. Cleanup is in progress; preserve the original diagnostic rationale above as history.
- 2026-09-29: Removed the diagnostic component, event capture, user agent display, pending timer, and log output. Moved the unchanged textarea copy method into `hooks/useLicenseCopy.ts`; both buttons still use `writeText` first and `execCommand("copy")` after failure. Kept the user-facing error only when both methods fail. TypeScript, focused ESLint, and whitespace checks passed after cleanup.
- 2026-09-29: User reported that copying fails again in the no-log build. Git history shows the no-log version on `log/huawei-copy` still attempts `execCommand` after awaiting the denied `writeText` call, while the earlier diagnostic build copied successfully. This disproves the prior assumption that removing diagnostics left the device behavior unchanged. The exact timing mechanism is unconfirmed; move the known old WebView path into the synchronous click phase and preserve the failed attempt as a fallback for other engines.
- 2026-09-29: On `log/huawei-copy`, added a WebView and Chromium-major check in `hooks/useLicenseCopy.ts`. WebView versions before 118 attempt `execCommand("copy")` synchronously during the tap, then try `writeText` if that fails. Other engines still try `writeText` first and selection copy after failure. No diagnostic UI was reintroduced. TypeScript, focused ESLint, and `git diff --check` passed; device paste is pending.

## Changed files

- `plan/2026-09-29-license-clipboard-legacy-fallback.md`
- `plan/README.md`
- `components/app/licenses/license-copy-diagnostics.tsx` (fallback implementation first added here, then file removed during cleanup)
- `components/app/licenses/license-certificate-card.tsx`
- `components/app/licenses/license-detail-page.tsx`
- `hooks/useLicenseCopy.ts` (added during cleanup)

## Open questions and risks

- `execCommand` remains a deprecated compatibility path. The user confirmed copying worked in the diagnostic build but reported failure after the no-log refactor; other older WebViews may differ.
- The modern browser path has not been manually retested after diagnostic cleanup; the hook still calls `writeText` first.
- The device report after this synchronous path has not yet been collected; do not call the regression resolved until the user confirms pasted text.
