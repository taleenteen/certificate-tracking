# Plan: Nested Juristic Business & Details Integration

- Status: `Verified`
- Owner: agent
- Date created: 2026-07-01
- Date last updated: 2026-07-01

## Objective
Support the updated juristic license group shape and nested collapsible rendering in `/licenses`, enable business detail page context switching by falling back to public business details, and integrate the dynamic officer QR profile generation and scanning validation features.

## Proposed Changes

### Types & Hooks
- Modify `JuristicLicenseGroupResponse` in [hooks/useLicenses.ts](file:///Users/mac/Frontend/certificate-tracking/hooks/useLicenses.ts) to nest `licenses` array inside `businesses`.
- Add `useJuristicBusiness` query hook in [hooks/useBusinesses.ts](file:///Users/mac/Frontend/certificate-tracking/hooks/useBusinesses.ts).
- Created [hooks/useOfficer.ts](file:///Users/mac/Frontend/certificate-tracking/hooks/useOfficer.ts) containing:
  - `useOfficerQrProfile(officerId, enabled)` to fetch dynamic officer profile tokens (fetches every 50 seconds automatically to avoid expiration).
  - `useVerifyOfficer(token)` to verify the scanned officer token.

### Collapsible View
- Implement three-level collapsible structure in [components/app/licenses/license-list-page.tsx](file:///Users/mac/Frontend/certificate-tracking/components/app/licenses/license-list-page.tsx):
  1. Company Group
  2. Business Item
  3. License Card

### Mockup Layout Redesign & Shared Components
- Create a shared [components/shared/app-breadcrumb.tsx](file:///Users/mac/Frontend/certificate-tracking/components/shared/app-breadcrumb.tsx) utilizing shadcn primitive, supporting both `light` and `dark` text colors.
- Redesign the title banner in [components/app/licenses/license-list-page.tsx](file:///Users/mac/Frontend/certificate-tracking/components/app/licenses/license-list-page.tsx) with solid green gradient backgrounds, no outer padding, and integration of breadcrumbs.
- Removed the search bar completely per the rework requirements.
- Redesigned the segment tabs to use transparent background matching the page, removing card borders and shadow, while preserving the active bottom line indicator.
- Redesigned the layout of `LicenseCertificateCard` in [components/app/licenses/license-certificate-card.tsx](file:///Users/mac/Frontend/certificate-tracking/components/app/licenses/license-certificate-card.tsx) with status seal watermarks and full-width green buttons to match the mockup design.
- Mapped the license status to circular stamp SVG files in the project.

### Status Stamp Data Dictionary

| Status Key | UI Label (TH) | SVG Asset Path | Description |
| --- | --- | --- | --- |
| `active` | มีผลบังคับใช้ | `/assets/icon/approved.svg` | License is active and fully verified |
| `expiringSoon` | ใกล้หมดอายุ | `/assets/icon/almost-expire.svg` | License expires within 30 days |
| `expired` | หมดอายุ | `/assets/icon/expired.svg` | License has expired |
| `suspended` | ถูกระงับ | `/assets/icon/suspended.svg` | License has been suspended/revoked |

### Business Detail Page Integration
- Update [app/(app)/businesses/[businessId]/page.tsx](file:///Users/mac/Frontend/certificate-tracking/app/(app)/businesses/[businessId]/page.tsx) to check for juristic business details first, falling back to public business details.
- Redesigned `/businesses/[businessId]` detail page to align with mockup:
  - Removed back button from navbar and added dark variant breadcrumbs (`หน้าแรก > ใบอนุญาตของฉัน > [ชื่อนิติบุคคล]`).
  - Added centered company title on the page background.
  - Enabled rendering of full-width `LicenseCertificateCard` elements instead of list rows.
  - Re-enabled global `AppNavbar` rendering for the route by setting dynamic back titles to `null` and including the path in `isPublicHome`.

### License Detail Page Integration
- Redesigned `/licenses/[id]` page to align with the same pattern:
  - Removed the back button.
  - Integrated the global branding `AppNavbar` header (by verifying `pathname.startsWith("/licenses/")` in public home state).
  - Added dark variant breadcrumbs at the top (`หน้าแรก > ใบอนุญาตของฉัน > [ชื่อใบอนุญาต]`).
  - Added centered license title before the details cards.
  - Passed status watermarks to `LicensePreview` overlay inside `license-detail-page.tsx`.

### Navbar Roles Configuration
- Configured [app-navbar.tsx](file:///Users/mac/Frontend/certificate-tracking/components/app-shell/app-navbar.tsx) to display dynamic user labels:
  - Role `officer` displays "เจ้าหน้าที่" on the profile button and "เจ้าหน้าที่ผู้มีอำนาจตรวจสอบ" inside the clicked profile details panel.
  - Public/citizen roles display "บุคคลธรรมดา" on both the button and dropdown panel.

### Officer QR Profile & Scanner Verification
- Integrated QR profile generator button inside [app/(app)/profile/page.tsx](file:///Users/mac/Frontend/certificate-tracking/app/(app)/profile/page.tsx) rendering exclusively for `officer` roles. Opens a dialog showing a real-time QR code (updated dynamically) with remaining seconds count-down.
- Updated `handleScanMock` in [components/app/home/home-dashboard.tsx](file:///Users/mac/Frontend/certificate-tracking/components/app/home/home-dashboard.tsx) to parse scanned officer profile verification URLs, extracting the opaque token and redirecting public users to `/verify-officer?token=token`.
- Updated [components/app/officer/verify-officer-content.tsx](file:///Users/mac/Frontend/certificate-tracking/components/app/officer/verify-officer-content.tsx) to check for `token` parameters and call the verify API:
  - Valid tokens display the officer profile details (Name, Agency, nationwide scope, verification timestamp, and license permissions).
  - Invalid/expired tokens show corresponding errors mapped according to backend response reason codes (`INVALID_TOKEN`, `EXPIRED_TOKEN`, `NOT_OFFICER`, `OFFICER_NOT_ACTIVE`).
  - Loading screens are displayed during real-time queries.
  - The manual dev state buttons are preserved for reviewing mockup state fallbacks.

## Validation Checklist
- [x] Run `bunx tsc --noEmit` to verify type safety.
- [x] Run `bun run build` to confirm production build compilation.
- [ ] Verify collapsible states visually.

## Progress Log
- **2026-07-01**: Updated type interfaces and query hooks.
- **2026-07-01**: Refactored `license-list-page.tsx` to handle collapsible businesses.
- **2026-07-01**: Updated `businesses/[businessId]/page.tsx` with fallback query strategy.
- **2026-07-01**: Created `AppBreadcrumb` component and integrated it into the new green header banner.
- **2026-07-01**: Redesigned `LicenseCertificateCard` to match the exact mockup elements.
- **2026-07-01**: Removed search bar and redesigned tabs style (flat, page background, active bottom line).
- **2026-07-01**: Added link navigation from business detail list items to license details.
- **2026-07-01**: Map status keys to circular stamp SVG icons.
- **2026-07-01**: Redesigned `/businesses/[businessId]` layout, enabled full navbar, added breadcrumbs, and swapped rows with certificate cards.
- **2026-07-01**: Redesigned `/licenses/[id]` layout, enabled full navbar, added breadcrumbs, and centered the page title.
- **2026-07-01**: Configured navbar roles strings dynamically (officer details and citizen/บุคคลธรรมดา labels).
- **2026-07-01**: Implemented officer QR Profile generator modal, countdown timer, scan parser, and real-time verification screen with error mapping.
- **2026-07-01**: Successfully typechecked and built the workspace.
