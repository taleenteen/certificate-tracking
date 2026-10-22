# Licenses Redesign and Wiring Plan

- Status: `Verified`
- Owner: Frontend implementation agent
- Date created: 2026-06-23
- Last updated: 2026-06-23

## Objective
Redesign the `/licenses` page and its navbar to align with the provided mockup image:
- Top-level brand navbar for citizen users.
- Search input with QR scan button moved inside the page.
- Stylized backdrop title banner.
- Personal and Juristic context switching tabs.
- Filter results count and status dropdown.
- Redesigned two-column license cards with full-width action button.

## Context and constraints
- Mobile-first citizen portal view.
- All requests routed via the BFF proxy.
- Cache cleared on context switch to prevent data leakage.
- Tab-isolated context stored in `sessionStorage` via `useAuthStore`.

## Scope
- Update navbar routes logic to render landing header for `/licenses` when `entry === "public"`.
- Implement `useJuristicMemberships` hook.
- Redesign `/licenses` list page view component and card layout.
- Integrate context switching logic on tab change.

## Proposed workflow
1. **Navbar Customization**: Adjust `AppNavbar` to render brand logo and profile badge on `/licenses` when entry is public.
2. **Hook Addition**: Add `useJuristicMemberships` in `useLicenses.ts`.
3. **Licenses List View Redesign**: Rebuild `components/app/licenses/license-list-page.tsx` with search, banner, context tabs, filter counts, and status selection.
4. **Card Component Redesign**: Rebuild `components/app/licenses/license-certificate-card.tsx` to render preview thumbnail, details columns, status badges, and CTA button.
5. **Parent Page Integration**: Wire the tab toggle actions and company selector to `useSwitchContext` mutations inside `app/(app)/licenses/page.tsx`.

## Security and permission considerations
- Role gates and juristic contexts switched securely server-side via BFF endpoints.

## Implementation checklist
- [x] Add `useJuristicMemberships` hook to `hooks/useLicenses.ts`.
- [x] Update `AppNavbar` routing condition for public licenses.
- [x] Redesign `components/app/licenses/license-list-page.tsx`.
- [x] Redesign `components/app/licenses/license-certificate-card.tsx`.
- [x] Wire switching hooks in `app/(app)/licenses/page.tsx`.
- [x] Validate typechecking and build compiles.

## Validation checklist
- [x] Navbar elements check (brand logo, bell, profile selector with "บุคคลทั่วไป" check circle).
- [x] Search input functions.
- [x] Tab switching clears query client cache and toggles between personal/juristic licenses.
- [x] License cards display correctly matching the mockup design.

## Progress log
- **2026-06-23**: Plan created and approved. Completed AppNavbar changes, hook implementations, UI components redesign, controller logic wiring, backward-compatibility adjustments for expired licenses, and successfully ran typecheck/compilation and bundle builds.

## Changed files
- [app-navbar.tsx](file:///Users/mac/Frontend/certificate-tracking/components/app-shell/app-navbar.tsx)
- [useLicenses.ts](file:///Users/mac/Frontend/certificate-tracking/hooks/useLicenses.ts)
- [page.tsx](file:///Users/mac/Frontend/certificate-tracking/app/(app)/licenses/page.tsx)
- [page.tsx](file:///Users/mac/Frontend/certificate-tracking/app/(app)/expired-licenses/page.tsx)
- [license-list-page.tsx](file:///Users/mac/Frontend/certificate-tracking/components/app/licenses/license-list-page.tsx)
- [license-certificate-card.tsx](file:///Users/mac/Frontend/certificate-tracking/components/app/licenses/license-certificate-card.tsx)

