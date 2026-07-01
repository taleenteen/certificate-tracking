# Plan: Homepage Service Layout Redesign

- Status: `Verified`
- Owner: AI Agent
- Date created: 2026-06-30
- Last updated: 2026-06-30

## Objective

Redesign the public citizen homepage service layout (`components/app/home/homepage-service.tsx`) to match the user-provided mockup design, and split it into clean, best-practice sub-components consistent with the project's current structure.

## Context and constraints

- Respect Next.js App Router rules and styling tokens of the project.
- Use current route names and features: `/licenses`, `/e-map`, `/businesses`, `/verify-officer`, `/license-search`.
- Integrate with existing `ComplaintsSheetOverlay`, `SearchSheetOverlay`, and `QrScannerDialog`.

## Proposed changes

### 1. Split Homepage Service into Sub-Components
- **[NEW] [home-hero-search.tsx](file:///components/app/home/home-hero-search.tsx)**: Hero green gradient banner with title, search input (with "ค้นหา" button), license number input, and QR scan button.
- **[NEW] [home-service-list.tsx](file:///components/app/home/home-service-list.tsx)**: "บริการของเรา" title centered with green underline, followed by 4 vertical full-width cards (e-Map, ใบอนุญาตของฉัน, ยืนยันตัวตนเจ้าหน้าที่, แจ้งร้องเรียน 1111) with customized SVG icons.

### 2. Update Main Orchestrator Component
- **[MODIFY] [homepage-service.tsx](file:///components/app/home/homepage-service.tsx)**: Render the sub-components and expose callback props (`onSearchOpen`, `onLicenseScanClick`, `onOfficerScanClick`, `onComplaintsClick`).

### 3. Wire Component to Dashboard Container
- **[MODIFY] [home-dashboard.tsx](file:///components/app/home/home-dashboard.tsx)**: Wire new props, import and render `ComplaintsSheetOverlay`, handle officer scan callbacks.

## Implementation checklist

- [x] Create `home-hero-search.tsx` sub-component.
- [x] Create `home-service-list.tsx` sub-component.
- [x] Update `homepage-service.tsx` to compose the sub-components.
- [x] Update `home-dashboard.tsx` to handle complaints sheet state and scan callbacks.
- [x] Update `plan/README.md` to reference this plan.

## Validation checklist

- [x] Compile check: `bunx tsc --noEmit` passes.
- [x] Linter check: `bunx eslint components/app/home/` passes.
- [x] Project Next.js build: `bun run build` compiles clean without issues.
- [x] Manual confirmation of layout and links (search routing, scanner activation, complaints overlay trigger).
