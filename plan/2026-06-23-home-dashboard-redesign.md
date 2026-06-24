# Public Home Dashboard Redesign

## Status

Verified

## Owner

Frontend implementation agent

## Dates

- Created: 2026-06-23
- Last updated: 2026-06-23

## Objective

Redesign and refresh the public home dashboard to match the provided citizen UI mockup image:
- Custom global AppNavbar for `/home` under citizen entry mode: E-License Verification Platform logo on the left, bell icon, and user profile card with check badge ("บุคคลทั่วไป") on the right.
- Search input with placeholder "ระบุเลขที่ใบอนุญาต หรือชื่อสถานประกอบการ" and QR scanner button.
- Custom Hero Banner: Refactored to a Shadcn Carousel component with 3 slides and dynamic slide dots indicating the active slide.
- 4 Grid Menu Cards:
  - **ใบอนุญาตของฉัน** (My Licenses) - folder icon (white card).
  - **ตรวจสอบเจ้าหน้าที่** (Officer Verification) - ID card check icon (white card by default, active/hover transitions to teal-green style).
  - **e-Map** - location pointer (white card).
  - **แจ้งเรื่องร้องเรียน** (Submit complaints) - megaphone/alert icon (white card).
- Recent searches section:
  - Heading: "ผลการค้นหาล่าสุด"
  - Display cards for "บริษัท ศิริพัฒนา โฮเทล แอนด์ เซอร์วิส จำกัด" and "บริษัท บิซ่า เอ็นเตอร์ไพรส์ จำกัด".
  - Include navigation and details button.

## Context and constraints

- Mobile-first app portal layout wrapper.
- Do not affect officer dashboards when in officer entry mode.
- Use Tailwind and semantic design tokens from `styles/tokens.css`.
- Missing colored icons should use mock Google/Lucide icons, listed for future assets updates.
- Centralized auth context via `useAuthStore` and BFF `/api` proxies.
- No direct backend calls from browser.
- Clean Next.js compilation, no hydration warnings.

## Scope

- Redesign citizen home dashboard in `components/app/home/home-dashboard.tsx`.
- Update `components/app-shell/app-navbar.tsx` to handle the new `/home` navbar.
- Add mock/fallback pages/dialogs for "ตรวจสอบเจ้าหน้าที่" (`/verify-officer`) and "แจ้งเรื่องร้องเรียน" (alert toast).

## Out of scope

- Backend Prisma schema updates for complaints.
- Backend DB integration for real-time recent searches tracking (use local state/mock).

## Proposed workflow

1. **Plan & Audit**: Audit existing home dashboard structure, styles, and data hooks.
2. **Navbar Customization**: Update `AppNavbar` to render the brand logo and profile dropdown with role check circle badge when active route is `/home` in citizen mode.
3. **Hero Banner & Search Bar**: Update the home dashboard search and banner sections.
4. **Grid Menu**: Replace current 3-card layout with 4-card layout (including "ตรวจสอบเจ้าหน้าที่" and "แจ้งเรื่องร้องเรียน").
5. **Recent Searches Card**: Create the stylized recent search cards with business icons and navigation/detail action buttons.
6. **Testing & Validation**: Run local build, linting, and check responsive display.

## Security and permission considerations

- No tokens exposed.
- All detail page links require valid backend verification.

## Implementation checklist

- [x] Create task plan file in `plan/` and update `plan/README.md`.
- [x] Implement new home page header in `components/app-shell/app-navbar.tsx` with logo, bell, and dropdown showing name + check badge "บุคคลทั่วไป".
- [x] Move search bar from navbar into `components/app/home/home-dashboard.tsx` with QR scan button inside.
- [x] Build Hero Banner with Shadcn Carousel, 3 custom slides, and active dots indicator.
- [x] Build grid menu with 4 custom cards (My Licenses, Officer Verification, e-Map, Complaints) with custom SVGs/mock icons.
- [x] Link "ตรวจสอบเจ้าหน้าที่" to a placeholder page or scanner.
- [x] Link "แจ้งเรื่องร้องเรียน" to a toast or mock dialog.
- [x] Build "ผลการค้นหาล่าสุด" (Recent Searches) section with 2 mockup company cards, hotel type icon, shield check icon for license counts, "นำทาง" and "ดูรายละเอียด" buttons.
- [x] Verify types and imports.
- [x] Run `npm run build` or `bun dev` checks to ensure compilation.

## Validation checklist

- [x] Citizen user view matches mockup image.
- [x] Logo displays properly.
- [x] User profile selector dropdown displays correctly with name and "บุคคลทั่วไป" status.
- [x] Search input functions.
- [x] Grid cards navigate correctly (My Licenses to `/licenses`, e-Map to `/e-map`, complaints showing development info, officer verification showing verification mockup page).
- [x] Recent search cards show correct icons and metadata.
- [x] Officer mode is unaffected or accessible via `?entry=officer` query parameters.

## Progress log

| Date | Status | Note |
| --- | --- | --- |
| 2026-06-23 | In Progress | Drafted plan for Home dashboard redesign. |
| 2026-06-23 | Verified | Completed code edits. Project type checking passed successfully (`tsc` compiled clean). |
| 2026-06-23 | Verified | Refactored banner to use shadcn Carousel with active dots indicator, and updated "ตรวจสอบเจ้าหน้าที่" button to be white by default, transitioning on hover. |

## Changed files

- `components/app-shell/app-navbar.tsx` (custom header logo, notifications, user dropdown check badge)
- `components/app/home/home-dashboard.tsx` (search bar form, Carousel banner layout, grid buttons with hover transitions, recent searches list)
- `app/(app)/verify-officer/page.tsx` (new verify officer lookup mockup)
