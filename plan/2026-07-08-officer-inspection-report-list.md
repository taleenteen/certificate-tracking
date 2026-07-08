# Officer Inspection Report List

Status: Verified
Owner: Codex
Date created: 2026-07-08
Last updated: 2026-07-08

## Objective

Wire the mobile `/reports` page to officer field inspection reports created by
`POST /api/officer/inspections`, instead of the legacy inspection task list.

## Context and constraints

- The submit flow already creates `OfficerInspection` records and uploads item
  evidence successfully.
- `/reports` previously read `GET /api/inspection-tasks`, so newly submitted
  officer reports could not appear.
- All frontend requests must go through the BFF via `@/lib/http`.
- Backend authorization remains the security boundary.

## Scope

- Add frontend hooks for listing and reading officer inspections.
- Point `/reports` at the officer inspection list.
- Add a mobile detail page for `/officer/inspections/[inspectionId]`.
- Redirect successful officer report submission to `/reports`.
- Document the new list endpoint contract.

## Out of scope

- Replacing the legacy task inspection workflow.
- Adding admin review UI changes.
- Full visual redesign beyond preserving the current report-list layout.

## Proposed workflow

1. Backend exposes `GET /api/officer/inspections`.
2. Frontend uses `useOfficerInspections()` for `/reports`.
3. Report cards link to `GET /api/officer/inspections/:id` detail UI.
4. Export buttons open the existing PDF export endpoint through `/api`.

## Security and permission considerations

- The officer list is scoped server-side to `currentUser.sub`.
- Frontend filters are UX only; backend applies access checks.
- Export and evidence URLs stay behind backend/BFF or presigned private MinIO URLs.

## Implementation checklist

- [x] Add `useOfficerInspections` and `useOfficerInspection`.
- [x] Switch `/reports` data source from inspection tasks to officer inspections.
- [x] Add officer inspection detail page.
- [x] Redirect submit success to `/reports`.
- [x] Update officer reporting API handoff docs.

## Validation checklist

- [x] Backend `npm run build`.
- [x] Backend `npm test -- --watchman=false`.
- [x] Backend `npm run test:e2e -- --watchman=false`.
- [x] Frontend `bunx tsc --noEmit`.
- [x] Frontend `bun run build`.
- [x] Targeted changed-file lint.
- [ ] Manual browser flow: create report, upload evidence, see it in `/reports`.

## Progress log

- 2026-07-08: Implemented the backend list route and frontend wiring.
- 2026-07-08: Verified backend build/unit/e2e and frontend typecheck/build.
  Broad backend lint is blocked by existing unsafe `any` errors in
  `test/security.e2e-spec.ts`; broad frontend lint is blocked by existing
  unrelated lint debt. Changed-file frontend lint has no errors.

## Changed files

- `hooks/useOfficer.ts`
- `app/(app)/reports/page.tsx`
- `app/(app)/officer/inspections/[inspectionId]/page.tsx`
- `app/(app)/businesses/[businessId]/inspect/page.tsx`
- `components/app/inspection-tasks/reports-page.tsx`
- `components/app-shell/app-navbar.tsx`
- `docs/FRONTEND_OFFICER_REPORTING_API.md`

## Open questions and risks

- Full browser validation still needs a running frontend and backend session.
