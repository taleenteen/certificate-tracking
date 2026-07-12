# Plan: Export License Banner Redesign

- Status: `Verified`
- Owner: agent
- Date created: 2026-07-11
- Date last updated: 2026-07-11

## Objective
Redesign the officer-only license export banner on both the License Details page and the Business Details page to match the user's custom green gradient banner with the illustration and a dark-green action button.

## Context and constraints
- The app uses Next.js with Tailwind CSS.
- The illustration is already present in `assets/button/export-pdf-banner.svg`.
- The banner is only shown to staff/inspectors (`isStaff === true`).
- On the License Details page, the banner triggers direct PDF export.
- On the Business Details page, the banner triggers the `LicenseDocumentExportDialog` where officers can select multiple licenses to export.
- All styles must be mobile-first, responsive, and fit within the `max-w-[430px]` mobile view container.

## Scope
- Create a reusable `ExportBanner` component that implements the new visual design.
- Integrate the `ExportBanner` into:
  1. License Details Page: `/licenses/[id]?from=search` (rendered via `components/app/licenses/license-detail-page.tsx`)
  2. Business Details Page: `/businesses/[businessId]` (rendered via `components/app/businesses/business-detail-page.tsx`)
- Refactor `LicenseDocumentExportDialog` to accept a custom `triggerButton` prop to allow using the newly designed action button.

## Out of scope
- Modifying the backend export logic or API endpoints.
- Redesigning the interior layout of the `LicenseDocumentExportDialog` itself.

## Proposed workflow
1. Create a reusable `ExportBanner` component at `components/app/licenses/export-banner.tsx`.
2. Update `components/app/businesses/license-document-export-dialog.tsx` to support a custom `triggerButton` prop.
3. Replace the legacy inline export banner in `components/app/licenses/license-detail-page.tsx` with `ExportBanner`.
4. Replace the legacy inline export banner in `components/app/businesses/business-detail-page.tsx` with `ExportBanner` and hook it to the `LicenseDocumentExportDialog`.
5. Run verification scripts (`tsc --noEmit`, `npm run lint`, `npm run build`) to ensure there are no build errors.

## Security and permission considerations
- Ensure that the export banner remains gated by role check (`isStaff`) as originally implemented.

## Implementation checklist
- [x] Create `components/app/licenses/export-banner.tsx`
- [x] Update `components/app/businesses/license-document-export-dialog.tsx` to accept `triggerButton`
- [x] Update `components/app/licenses/license-detail-page.tsx` to use `ExportBanner`
- [x] Update `components/app/businesses/business-detail-page.tsx` to use `ExportBanner`

## Validation checklist
- [x] Verify TypeScript compiles successfully (`npx tsc --noEmit`)
- [x] Verify ESLint passes (`npm run lint` or file-scoped linting)
- [x] Verify production build compiles (`npm run build` or `bun run build`)
- [x] Manually verify layout responsiveness in browser subagent

## Progress log
- **2026-07-11**: Plan created and audit complete. Identified the existing SVG illustration at `assets/button/export-pdf-banner.svg`.
- **2026-07-11**: Created `ExportBanner` and refactored trigger interfaces. Hooked it up on both page details components. Ran typechecking, targeted ESLint, and a full production build successfully.

## Changed files
- `components/app/licenses/export-banner.tsx` [NEW]
- `components/app/businesses/license-document-export-dialog.tsx`
- `components/app/licenses/license-detail-page.tsx`
- `components/app/businesses/business-detail-page.tsx`

## Open questions and risks
- *Risk*: Text overlapping with the illustration on extremely narrow screens.
  *Mitigation*: Position the illustration as an absolute element at the bottom-left with `pointer-events-none` and use padding on the wrapper content to keep the button on the right.
