# Native Export Diagnostics

- Status: Implemented
- Owner: Agent
- Date created: 2026-07-16
- Last updated: 2026-07-16

## Objective

Expose the exact UAT native-export handoff data in the export modal so the Tang Rat SDK integration can be diagnosed on a physical device.

## Context and constraints

- The feature uses SDK v5 `sendFileToNativeWithUrl(url, fileName)`.
- Presigned URLs grant temporary private-file access and must never be displayed during normal use or production operation.
- The frontend must continue using the same-origin BFF route.

## Scope

- Retain safe native export response fields and the SDK arguments in a client-side diagnostic result.
- Show copyable diagnostics only when `NEXT_PUBLIC_DGA_NATIVE_DEBUG=true`.
- Include a clear UAT-only warning and expiry information.

## Out of scope

- Changing the backend export endpoint, MinIO configuration, or Tang Rat SDK version.
- Displaying mTokens or backend credentials.

## Security and permission considerations

- The full presigned URL is visible only to the authenticated exporter in explicitly enabled UAT diagnostics.
- It is not persisted in storage, logged, or shown in ordinary production UI.

## Implementation checklist

- [x] Extend the native-export result with a debug snapshot.
- [x] Add modal copy controls for backend response and SDK call.
- [x] Add a plan-index entry and validate TypeScript/lint.

## Validation checklist

- [x] `bunx tsc --noEmit --incremental false`
- [x] File-scoped ESLint
- [ ] Manual UAT device check with `NEXT_PUBLIC_DGA_NATIVE_DEBUG=true`

## Progress log

- 2026-07-16: Started after the native SDK accepted the request but Tang Rat did not confirm file saving.
- 2026-07-16: Added UAT-only response/SDK-call diagnostic output and clipboard controls.
- 2026-07-16: TypeScript and file-scoped ESLint passed.
- 2026-07-16: Retained the snapshot when the SDK throws and added a WebView clipboard fallback.

## Changed files

- `hooks/useLicenseDocumentExports.ts`
- `components/app/businesses/license-document-export-dialog.tsx`
- `plan/README.md`

## Open questions and risks

- The Tang Rat SDK does not expose download completion/error callbacks; diagnostics can prove the handoff request only.
