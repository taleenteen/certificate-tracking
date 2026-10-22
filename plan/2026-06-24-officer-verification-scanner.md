# Plan: Officer Verification Scanner & Premium Details Page

- Status: `Verified`
- Owner: AI Agent
- Date created: 2026-06-24
- Last updated: 2026-06-24

## Objective
Implement QR scanning for officer verification on the Home dashboard card ("ตรวจสอบเจ้าหน้าที่"). When scanned, it should redirect to a new verification details page at `/verify-officer` that renders the premium layout matching the two mockup designs (Authorized state and Not Found state).

## Context and constraints
- Next.js 16 (Turbopack) environment requires async `searchParams` and `params` in dynamic pages/routes.
- Page rendering should do an SSR feature (Server Component) with child client components or query params state.
- Include interactive switch buttons/controls so the user can easily toggle between the two states (Authorized vs Not Found) to review both mockup visual designs.
- Re-use the existing `QrScannerDialog` for the camera feed.

## Scope
- Modify [home-dashboard.tsx](file:///Users/mac/Frontend/certificate-tracking/components/app/home/home-dashboard.tsx):
  - Add state `scannerMode: 'license' | 'officer'`.
  - Update Card 2 ("ตรวจสอบเจ้าหน้าที่") click handler: instead of direct navigation, set `scannerMode = 'officer'` and open the scanner.
  - Update `handleScanMock` callback to redirect to `/verify-officer?state=success` when `scannerMode === 'officer'`.
- Create Server Page at [app/(app)/verify-officer/page.tsx](file:///Users/mac/Frontend/certificate-tracking/app/(app)/verify-officer/page.tsx) and Client Component at [components/app/officer/verify-officer-content.tsx](file:///Users/mac/Frontend/certificate-tracking/components/app/officer/verify-officer-content.tsx) (or inline Client Component) to support Next.js SSR and parameters matching:
  - **State 1: เป็นเจ้าหน้าที่ที่ได้รับอนุญาต**
    - Center check green banner.
    - Name: `นายสมชาย ใจดี`
    - Department: `กรมโรงงานอุตสาหกรรม`
    - Area: `จังหวัดสมุทรปราการ`
    - Verification date: `21/06/2569 16:45`
    - Rights: `ร.ง.4 ,วอ.8`
    - Actions: `สแกนใหม่` (resets / opens scan), `ยืนยัน` (mock success confirm).
  - **State 2: ไม่พบข้อมูลของเจ้าหน้าที่**
    - Center warning red banner.
    - Department: empty / hidden
    - Name: empty / hidden
    - Actions: `สแกนใหม่`.
  - Dev toggles to test State 1 vs State 2.

## Out of scope
- Integration with real backend verification database (everything is mocked under `/verify-officer` route).

## Proposed workflow
1. Add `scannerMode` to `home-dashboard.tsx` and wire the click action of the officer verification card.
2. Create `app/(app)/verify-officer/page.tsx` with async `searchParams` promise resolving.
3. Build the UI matching the two mockup states. Include custom Lucide icons (`CheckCircle2`, `AlertCircle`, `User`, `Building2`, `MapPin`, `Calendar`, `ShieldAlert`, `Scan`, `Check`).
4. Add dev toggle state links to switch parameters (e.g. `?state=success` vs `?state=failed`).
5. Run TypeScript compile and Next.js production builds.

## Security and permission considerations
- Verification output is public-safe as per `AGENTS.md` guidelines.

## Implementation checklist
- [x] Add the plan to `plan/README.md`.
- [x] Implement `scannerMode` state and handlers in `home-dashboard.tsx`.
- [x] Create folder `app/(app)/verify-officer/` and page `page.tsx` resolving searchParams.
- [x] Build the premium `VerifyOfficerContent` component with mockup states, icons, and buttons.
- [x] Add the visual switch controls for demo review.
- [x] Check compiler errors using `bun x tsc --noEmit`.

## Validation checklist
- [x] Clicking the dashboard "ตรวจสอบเจ้าหน้าที่" card opens the QR scanner.
- [x] Scanning redirects to `/verify-officer?state=success`.
- [x] Visual checking of State 1 (Authorized) details matches the screenshot.
- [x] Visual checking of State 2 (Not Found) details matches the screenshot.
- [x] Clicking the "สแกนใหม่" button correctly opens the scanner dialog on the home page or routes back to trigger scanning.

## Progress Log
- **2026-06-24**: Planned officer verification scanner implementation.
- **2026-06-24**: Intercepted card clicks on home dashboard and added scannerMode checks. Created Server-rendered details page at `/verify-officer` and Client-rendered content layouts supporting both mockup designs, camera scan loops, and developer toggle controllers. Verified type checking and production builds successfully.

## Changed files
- [components/app/home/home-dashboard.tsx](file:///Users/mac/Frontend/certificate-tracking/components/app/home/home-dashboard.tsx)
- [app/(app)/verify-officer/page.tsx](file:///Users/mac/Frontend/certificate-tracking/app/(app)/verify-officer/page.tsx)
- [components/app/officer/verify-officer-content.tsx](file:///Users/mac/Frontend/certificate-tracking/components/app/officer/verify-officer-content.tsx)
