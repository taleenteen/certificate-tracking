# Track Complaints Stepper and Form Redesign Plan

- Status: `Verified`
- Owner: Frontend implementation agent
- Date created: 2026-06-24
- Last updated: 2026-06-24

## Objective
Redesign the `/complaints/track` page to match the exact mockup layout, including:
- A header area with back link and circle complaints search icon.
- A search card with two inputs (`เลขอ้างอิงเรื่องร้องเรียน` and `ค้นหาใบอนุญาต และสถานประกอบการ`) and a primary green search button.
- A separate results area (`ผลการติดตาม`) that only displays when a search is query-active.
- A horizontal 3-step progress stepper (รับเรื่อง -> กำลังตรวจสอบ -> เสร็จสิ้น) showing active state icons (completed checkmark, active document search, pending document).
- Detail fields below the stepper using themed green icons (tag, building, question sheet, calendar).
- Mock data structure designed to support future backend wiring cleanly.

## Context and constraints
- Mobile-first layout (width `430px`, background `#f4f5f7`).
- Keep status indicator color synchronized with step stages (Step 1, Step 2, Step 3).
- Clean transitions for stepper conditional rendering.

## Proposed changes

### 1. Track Complaint Page Redesign
* **[MODIFY] [page.tsx](file:///Users/mac/Frontend/certificate-tracking/app/(app)/complaints/track/page.tsx)**:
  - Add state for both inputs: `ticketIdQuery` and `businessQuery`.
  - Design a `ComplaintStatus` mock database array containing Ticket ID lookups (`CP-2596-000128` etc.) mapping to their corresponding details and step stages.
  - Implement dynamic fallback mock result generation (so searching for a custom ticket ID generates a testable status result matching their criteria).
  - Render a horizontal stepper with lines and custom circle icons.
  - Build detail rows below the stepper mapping to the mockup.

## Implementation checklist
- [x] Create task plan file in `plan/` and update `plan/README.md`.
- [x] Implement new double-input form layout and green submit button.
- [x] Build the horizontal stepper progress components with line updates.
- [x] Re-map details rows with the custom Lucide icons.
- [x] Run Typescript check (`bun x tsc --noEmit`).
- [x] Run production build (`bun run build`).

## Validation checklist
- [x] Page renders with empty state (no stepper or results visible initially).
- [x] Entering ticket ID `CP-2596-000128` and clicking search renders Step 2 (กำลังตรวจสอบ) and correct mockup details.
- [x] Custom searches render dynamically generated results.
- [x] Buddhist Era date formats compile clean.

## Progress Log
- **2026-06-24**: Drafted plan and initiated redesign.
- **2026-06-24**: Redesigned `complaints/track` page structure with new form fields and layout. Coded custom 3-step horizontal progress stepper rendering conditionally when query is active. Integrated type interfaces for simple backend adaptation. Passed compilation checks.

