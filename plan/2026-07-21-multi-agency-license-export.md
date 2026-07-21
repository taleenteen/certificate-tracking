# Multi-Agency License Export

- Status: Verified
- Owner: Codex
- Date created: 2026-07-21
- Last updated: 2026-07-21

## Objective

Allow officers to select and export every license under one business, including
licenses belonging to different agencies.

## Context and constraints

- The export dialog disabled cross-agency checkboxes.
- The backend independently rejected multi-agency selections.
- The existing export record schema has one required `agencyId`; no schema
  change is authorized for this fix.

## Scope

- Remove the client-side agency selection gate.
- Permit multi-agency selections on the backend while retaining the one-business
  validation.
- Record every agency in the immutable snapshot and generated export output.
- Retain a deterministic primary agency only for the legacy required record
  field and its index.

## Out of scope

- Prisma schema changes.
- Changes to officer role or business authorization.

## Security and permission considerations

- The backend continues to validate all selected IDs belong to the requested
  business and remain non-deleted.
- Export records and audit events remain immutable and server-side.

## Implementation checklist

- [x] Remove the checkbox agency gate.
- [x] Remove the backend single-agency rejection.
- [x] Preserve all selected agencies in snapshots and generated files.
- [x] Validate frontend and backend checks.

## Validation checklist

- [x] Backend focused unit test.
- [x] Backend TypeScript and build.
- [x] Frontend TypeScript, focused ESLint, and build.
- [ ] Physical export test with DIW and ACFS licenses.

## Progress log

- 2026-07-21: Traced the failure to matching client and server single-agency
  guards. Implemented the multi-agency selection path; validation is pending.
- 2026-07-21: Backend focused service test now proves DIW and ACFS licenses
  load together. Backend lint, TypeScript, and Nest build passed. Frontend
  TypeScript and focused ESLint passed; the current production build emitted
  `.next/BUILD_ID` and `required-server-files.json`. Physical export remains.

## Changed files

- `components/app/businesses/license-document-export-dialog.tsx`
- `src/modules/license-document-export/license-document-export.service.ts`
- `src/modules/license-document-export/license-document-export.service.spec.ts`
- `docs/LICENSE_DOCUMENT_EXPORT.md`
- `plan/2026-07-21-multi-agency-license-export.md`

## Open questions and risks

- Existing `LicenseDocumentExport.agencyId` remains a required legacy field, so
  the backend stores a deterministic primary agency for indexing while the
  immutable snapshot records every selected agency.
- A physical export should confirm all selected source PDFs are appended as
  expected.
