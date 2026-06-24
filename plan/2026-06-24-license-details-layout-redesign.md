# License Details Page Layout Redesign Plan

- Status: `Verified`
- Owner: Frontend implementation agent
- Date created: 2026-06-24
- Last updated: 2026-06-24

## Objective
Redesign the `/licenses/[id]` detail page component to match the layout and design elements shown in the user's reference mockup:
- Add a clean "ย้อนกลับ" (Back) button at the top of the content area.
- Replace the current dark green license number card, business card, and license details card layout with two simplified white cards:
  1. **Business Info Card**: Displays business name, license number, business type (hotel), location address, and two green outline action buttons ("นำทาง" and "ดูบนแผนที่").
  2. **License Details Card**: Displays license name, license number, active status badge, issue/expiry dates, and the scanned document preview image.
- Hide/remove the owner details, update status section (unless needed for staff, but mockup is public citizen-focused), and timeline checklist from public view to match the mockup exactly.

## Context and constraints
- Preserve mobile-responsive layout sizing (`max-w-md` or `max-w-[430px]`) centered inside the workspace container.
- Match standard styles: HSL colors, custom theme tokens (`#145b57` for theme green/teal), rounded corners (`rounded-3xl` or `rounded-[24px]`).
- Use standard Lucide icons: `ChevronLeft` or `ArrowLeft`, `Building2`, `MapPin`, `Navigation`, `Map`, `FileText`.
- Maintain clean React hooks dependencies (`useLicense`).

## Proposed changes

### 1. License Details View Component Redesign
* **[MODIFY] [license-detail-page.tsx](file:///Users/mac/Frontend/certificate-tracking/components/app/licenses/license-detail-page.tsx)**:
  - Import `ChevronLeft`, `Building2`, `MapPin`, `Navigation`, `Map`, `FileText` from `lucide-react`.
  - Re-structure the main content to render:
    - Back button link going back in history.
    - Business Info Card (first white box):
      - Title: `data.businessName`
      - Subtitle: `data.licenseNumber`
      - Business Type row: `ประเภทธุรกิจ : data.businessType`
      - Location row: `สถานที่ : data.address`
      - Actions row: `นำทาง` and `ดูบนแผนที่` as outline buttons.
    - License Details Card (second white box):
      - Title: `ข้อมูลใบอนุญาต` (icon + heading)
      - Detail Fields: `ชื่อใบอนุญาต`, `เลขที่ใบอนุญาต`, `สถานะ` (green active status badge), `วันที่ออกใบอนุญาต`, `วันหมดอายุ`.
      - Divider line.
      - Document box displaying the scanned license image.
  - Remove original owner details, timeline, update status panels, and the top green banner block.

### 2. Navbar Logo and User Details Layout Integration
* **[MODIFY] [app-navbar.tsx](file:///Users/mac/Frontend/certificate-tracking/components/app-shell/app-navbar.tsx)**:
  - Add `pathname.startsWith("/licenses/")` check to `isPublicHome` so that the details page displays the citizen home navbar (logo, bell icon, user selector profile).
  - Add bypass to `getDetailPageTitle` so that details page headers do not block/override the public brand navbar wrapper.

## Implementation checklist
- [x] Create/update plan file in `plan/` and append to `plan/README.md`.
- [x] Re-structure JSX in `components/app/licenses/license-detail-page.tsx` to match the exact mockup elements.
- [x] Update imports to include all required icons.
- [x] Implement outline action buttons with `#145b57` themed colors.
- [x] Run Typescript check (`bun x tsc --noEmit`) to verify no syntax/type compile errors.
- [x] Run production build compilation (`bun run build`).

## Validation checklist
- [x] Back button functions correctly.
- [x] Business card displays matching layout, address, and hotel details.
- [x] Action buttons are correctly styled as outline green links.
- [x] Status badge shows "มีผลบังคับใช้" inside the details card.
- [x] Thai Buddhist Era dates formatting resolves correctly.
- [x] Scanned document graphic renders inside Card 2.

## Progress Log
- **2026-06-24**: Created redesign plan and initiated work.
- **2026-06-24**: Replaced layout structure inside `license-detail-page.tsx`, mapped field components, and customized outline icons/buttons. Modified `app-navbar.tsx` to align details view header with home navbar layout. Completed build testing successfully.

## Changed files
- [license-detail-page.tsx](file:///Users/mac/Frontend/certificate-tracking/components/app/licenses/license-detail-page.tsx)
- [app-navbar.tsx](file:///Users/mac/Frontend/certificate-tracking/components/app-shell/app-navbar.tsx)
- [README.md](file:///Users/mac/Frontend/certificate-tracking/plan/README.md)
