# License Search Autocomplete and Animations Plan

- Status: `Verified`
- Owner: Frontend implementation agent
- Date created: 2026-06-23
- Last updated: 2026-06-23

## Objective
Redesign the `/license-search` page to render a premium dark banner search header with autocomplete suggestions, and implement a fullscreen white sheet overlay (Instagram-style) on Home page click:
- Expand navbar public brand mode to support `/license-search`.
- Build a reusable `SearchSheetOverlay` component with Framer Motion slide-up animations.
- Integrate search suggestions and direct navigation in `SearchSheetOverlay`.
- Trigger `SearchSheetOverlay` on Home page search input focus/click.
- Direct query submissions in overlay to redirect to `/license-search`.

## Context and constraints
- Frame transitions must remain smooth and not cause UI shifts.
- Retain backend filters and reuse original query hooks.
- Accessible color contrasts and readable text inputs.

## Proposed changes

### 1. App Shell & Navbar Configuration
* Modify `components/app-shell/app-navbar.tsx` to handle public navbar logo header on `/license-search`.

### 2. Fullscreen Search Overlay
* Create `components/shared/search-sheet-overlay.tsx` containing Framer Motion search drawer.
* Wire to `home-dashboard.tsx` and `license-search-page.tsx`.

## Validation checklist
- [x] Navbar brand logo shows correctly.
- [x] Clicking Home search bar triggers fullscreen overlay.
- [x] Autocomplete suggestions filter in real-time inside the overlay.
- [x] Submitting search query redirects to `/license-search?q=...`.
- [x] Clicking close returns to home page.

## Progress log
- **2026-06-23**: Updated plan with overlay sheet instructions.
- **2026-06-23**: Created `SearchSheetOverlay` using Framer Motion slide-up animations. Integrated and tested on Home page.
- **2026-06-23**: Refined search page interaction flow: clicking the search bar on `/license-search` directly allows typing inside the banner field with a clean dropdown popover instead of triggering the sheet overlay. Selecting suggestions navigates to `/licenses/[id]`. Ran full typecheck and build validation cleanly.
- **2026-06-23**: Resolved autocomplete popover layout clipping. Removed `overflow-hidden` on the banner `motion.div` and container-wrapped the background elements, allowing the popover to render on top of the page below.

## Changed files
- [app-navbar.tsx](file:///Users/mac/Frontend/certificate-tracking/components/app-shell/app-navbar.tsx)
- [license-search-page.tsx](file:///Users/mac/Frontend/certificate-tracking/components/app/licenses/license-search-page.tsx)
- [page.tsx](file:///Users/mac/Frontend/certificate-tracking/app/(app)/license-search/page.tsx)
- [home-dashboard.tsx](file:///Users/mac/Frontend/certificate-tracking/components/app/home/home-dashboard.tsx)
- [search-sheet-overlay.tsx](file:///Users/mac/Frontend/certificate-tracking/components/shared/search-sheet-overlay.tsx)


