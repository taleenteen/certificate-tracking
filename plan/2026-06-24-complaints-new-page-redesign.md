# Plan: New Complaints Page Redesign

- Status: `Verified`
- Owner: AI Agent
- Date created: 2026-06-24
- Last updated: 2026-06-24

## Objective
Redesign the "แจ้งเรื่องร้องเรียน" (Submit Complaint) page at `/complaints/new` (located in [page.tsx](file:///Users/mac/Frontend/certificate-tracking/app/(app)/complaints/new/page.tsx)) to match the modern mockup design.

## Context and constraints
- Must follow the provided mockup layout, styling, and colors (using dark emerald/green colors `#0c604c` or `#145b57`).
- Keep components focused and responsive (max-width `430px` for mobile compatibility).
- Use Lucide icons matching the icons in the design mockup.
- Retain existing submission features (mock validation, Success state card showing Ticket ID, and redirect to tracking).

## Scope
- Implement a green/emerald banner header at the top under the back button with a female student/officer illustration on the right (reusing `@/assets/hero/hero-right.png`).
- Implement the premium form fields inside a card:
  1. **ชื่อสถานประกอบการ / เลขใบอนุญาต** (with building icon and simple text input).
  2. **ตำแหน่ง/ที่อยู่เกิดเหตุ** (with map pin icon and a button styled with map icon `ปักหมุดบนแผนที่` and chevron right).
  3. **สิ่งที่พบ** (with checklist/document icon and 5 selectable chips: `กลิ่น/ควันผิดปกติ`, `เสียงดัง`, `สงสัยไม่มีใบอนุญาต`, `วัตถุอันตราย`, `อื่น ๆ` with icons and selected indicators/checkmarks).
  4. **รายละเอียดเพิ่มเติม** (with document/pen icon, a text area, and dynamic character counter `X/500`).
  5. **รูปภาพประกอบ** (with image/photo icon and a dashed upload dropzone container).
- Implement a primary green submit button with a diagonal send icon.

## Out of scope
- Real backend API integration (the form uses mock submissions and redirects to mock tracking as per guidelines).
- Real map rendering when clicking `ปักหมุดบนแผนที่` (this will open a mock success toast or dummy dialog action).

## Proposed workflow
1. Modify [page.tsx](file:///Users/mac/Frontend/certificate-tracking/app/(app)/complaints/new/page.tsx) to build the redesigned UI components and styling.
2. Setup React state hooks for handling:
   - Name/license input value.
   - Selected chips array (allowing multi-select for the issues, or single select, but multi-select matches the checkboxes).
   - Additional details textarea value and character count.
   - Mock file uploads.
3. Keep the success state intact and clean.
4. Verify TypeScript compilation and runtime rendering.

## Security and permission considerations
- Frontend validation only (no secret keys or tokens needed).

## Implementation checklist
- [x] Create plan `plan/2026-06-24-complaints-new-page-redesign.md` and add to index.
- [x] Implement the UI structure and styling in `app/(app)/complaints/new/page.tsx`.
- [x] Add states for the selectable chips and character count.
- [x] Connect existing success modal/handling to the new form submit event.
- [x] Check compiler errors using `bun x tsc --noEmit`.

## Validation checklist
- [x] Visual verification of the new complaints page against mockup.
- [x] Clicking on chips toggles their selection state and displays checkmarks.
- [x] Typing in textarea updates the character counter.
- [x] Submit button triggers the success state.

## Progress Log
- **2026-06-24**: Planned redesign of `/complaints/new` page.
- **2026-06-24**: Implemented redesigned page layout. Setup visual states including: selection chips, textarea character counter, map location address display, and photo selector upload box. Ran TypeScript checks and completed Next.js build compilation successfully.

## Changed files
- [app/(app)/complaints/new/page.tsx](file:///Users/mac/Frontend/certificate-tracking/app/(app)/complaints/new/page.tsx)
