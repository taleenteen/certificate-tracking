# License Clipboard Legacy Fallback

- Status: Implemented
- Owner: Frontend implementation agent
- Date created: 2026-09-29
- Last updated: 2026-10-22

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
- Check the fallback's boolean result and show copied state only on success. (Original scope also logged the outcome; that logging was removed in `a92c0e6`, so the shipped hook does no logging.)
- Preserve the current card and detail button wiring.
- After the user confirmed copying works on Huawei, remove the temporary diagnostic UI and event log while keeping the shared fallback and user-facing failure message.
- Route the observed pre-fix Chromium Android WebView to the synchronous selection copy path during the click handler, while leaving the modern Clipboard API first for other engines.

## Out of scope

- Native app or SDK changes.
- Removing the temporary diagnostic block before physical-device validation (original scope; validation has since been reported by the user).
- Clipboard read permission or reading clipboard contents from JavaScript.

## Proposed workflow

1. Add the fallback helper and error handling to the shared hook.
2. Review both button paths. (Originally also reviewed the on-page diagnostic output; that output no longer exists, so device rechecks rely on the user's paste result.)
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
- [x] Legacy retry and reset-timer fix: tsc, ESLint and build passed (2026-10-22).

## Progress log

- 2026-09-29: Started a compatibility fallback after the Huawei device log showed permission denial in Chromium WebView 114.
- 2026-09-29: Added a temporary textarea selection fallback after `writeText` failure. The helper checks `execCommand("copy")`'s boolean result, removes the textarea, and restores focus. The diagnostic block records both paths and the controls show an error if both fail. TypeScript, focused ESLint, and whitespace checks passed; physical clipboard contents remain unverified.
- 2026-09-29: User reported the Huawei WebView copy works with the fallback and requested removal of all temporary logging. Cleanup is in progress; preserve the original diagnostic rationale above as history.
- 2026-09-29: Removed the diagnostic component, event capture, user agent display, pending timer, and log output. Moved the unchanged textarea copy method into `hooks/useLicenseCopy.ts`; both buttons still use `writeText` first and `execCommand("copy")` after failure. Kept the user-facing error only when both methods fail. TypeScript, focused ESLint, and whitespace checks passed after cleanup.
- 2026-09-29: User reported that copying fails again in the no-log build. Git history shows the no-log version on `log/huawei-copy` still attempts `execCommand` after awaiting the denied `writeText` call, while the earlier diagnostic build copied successfully. This disproves the prior assumption that removing diagnostics left the device behavior unchanged. The exact timing mechanism is unconfirmed; move the known old WebView path into the synchronous click phase and preserve the failed attempt as a fallback for other engines.
- 2026-09-29: On `log/huawei-copy`, added a WebView and Chromium-major check in `hooks/useLicenseCopy.ts`. WebView versions before 118 attempt `execCommand("copy")` synchronously during the tap, then try `writeText` if that fails. Other engines still try `writeText` first and selection copy after failure. No diagnostic UI was reintroduced. TypeScript, focused ESLint, and `git diff --check` passed; device paste is pending.
- 2026-09-29: Fast-forwarded `release/v1` from `a02833c` to `fdd55bf` to include the fallback, diagnostic cleanup, and synchronous legacy WebView fix. Device paste validation remains pending.
- 2026-10-22: Correction to the 2026-09-29 regression entry. Git history shows the diagnostic build (`8a1b67c`, `license-copy-diagnostics.tsx`) also awaited the denied `writeText` before calling `execCommand("copy")`. The no-log build (`a92c0e6`, `hooks/useLicenseCopy.ts`) used the same order. "Awaited `writeText` before `execCommand`" therefore does not explain why one build copied and the other did not. The real cause is **unknown**. Differences between the two builds include the diagnostic `setEntries` calls, the 3-second pending timer, reads of `navigator.userActivation` / `document.hasFocus()`, the rendered diagnostic block, and possibly a different app session or cache on the device. The synchronous legacy path in `fdd55bf` is a hypothesis, not a confirmed root-cause fix. If the Huawei paste check fails, revisit these differences instead of assuming the timing explanation.
- 2026-10-22: Static validation on `release/v1` itself: `bunx tsc --noEmit` and `bun run build` passed during the legacy code cleanup (`plan/2026-10-22-legacy-code-cleanup.md`). `hooks/useLicenseCopy.ts` was unchanged by that cleanup. Earlier tsc/ESLint runs were recorded on `log/huawei-copy`.
- 2026-10-22: Addressed two review risks in `hooks/useLicenseCopy.ts`. (1) On the legacy path, if the synchronous `execCommand` fails, the hook now retries selection copy after the awaited `writeText`, which was the order that copied in the diagnostic build. The `!legacyWebView` guard was removed. (2) The `isCopied` reset timer is now held in a ref, cleared before each new copy, and cleared on unmount. `bunx tsc --noEmit`, file-scoped ESLint and `bun run build` passed on `release/v1`. Huawei paste check still pending.

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
- The root cause of the no-log regression is unconfirmed (see the 2026-10-22 correction). The current fix may not address it.
- `isLegacyAndroidWebView()` requires `; wv)` in the user agent. If Tang Rat/CitizenPortal sets a custom UA without this token, the Huawei device takes the modern path (`writeText` first). Capture the real UA from the device to confirm.
- ~~On the legacy path, a failed synchronous `execCommand` is not retried after awaiting `writeText`.~~ Fixed 2026-10-22: the legacy path now retries.
- ~~The `isCopied` reset timer is not stored or cleared.~~ Fixed 2026-10-22: it is held in a ref, cleared on each copy and on unmount.
