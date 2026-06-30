# Complaints Bottom Sheet and Flow Integration Plan

- Status: `Verified`
- Owner: Frontend implementation agent
- Date created: 2026-06-24
- Last updated: 2026-06-24

## Objective
Implement a bottom sheet overlay that slides up from the bottom of the screen when a user clicks the "แจ้งเรื่องร้องเรียน" (Megaphone/Complaints) card on the Home page.
Additionally, design and create two sub-pages corresponding to the choices in the bottom sheet:
1. **แจ้งเรื่องร้องเรียน** (Submit Complaint): A form to file complaints against businesses.
2. **ติดตามสถานะเรื่องร้องเรียน** (Track Complaint Status): A list view displaying the status and details of previous complaints with status timelines.

## Context and constraints
- Frame transitions for the bottom sheet must be smooth, using Framer Motion (`motion/react`) or a Radix drawer primitive.
- Naming matches: Use `/complaints/new` and `/complaints/track` as clean public routes.
- Mobile-first citizen portal styles (max-width `430px`, background `#f4f5f7`, custom green themed `#145b57`).

## Proposed changes

### 1. Create Bottom Sheet Component
* **[NEW] [complaints-sheet-overlay.tsx](file:///Users/mac/Frontend/certificate-tracking/components/shared/complaints-sheet-overlay.tsx)**:
  - Create a modal drawer using `<AnimatePresence>` and `<motion.div>` that slides up from the bottom (`y: "100%"` to `y: 0`).
  - Render the title, subtitle, top handle bar, and two list items with left green circle icons and right chevrons going to `/complaints/new` and `/complaints/track` respectively.

### 2. Wire Bottom Sheet to Home Dashboard
* **[MODIFY] [home-dashboard.tsx](file:///Users/mac/Frontend/certificate-tracking/components/app/home/home-dashboard.tsx)**:
  - Import `ComplaintsSheetOverlay`.
  - Add state `isComplaintsSheetOpen` and open it when the user clicks the "แจ้งเรื่องร้องเรียน" menu card.

### 3. Create Submit Complaint Page
* **[NEW] [app/(app)/complaints/new/page.tsx](file:///Users/mac/Frontend/certificate-tracking/app/(app)/complaints/new/page.tsx)**:
  - Render a clean, stylized complaint form:
    - Back button link.
    - Fields: Business name (dropdown or search selection), Category of Complaint, Detail textarea, Contact email/phone, and Attach file section.
    - Primary green submit button.
    - Success toast and redirection on submission.

### 4. Create Track Status Page
* **[NEW] [app/(app)/complaints/track/page.tsx](file:///Users/mac/Frontend/certificate-tracking/app/(app)/complaints/track/page.tsx)**:
  - Render a list of submitted complaints showing mock data (e.g. "บริษัท ศิริพัฒนา โฮเทล จำกัด", status "อยู่ระหว่างดำเนินการ" or "เสร็จสิ้น").
  - Each item expands or displays a vertical timeline detail showing the stages of verification.

## Implementation checklist
- [x] Create task plan file in `plan/` and update `plan/README.md`.
- [x] Implement `components/shared/complaints-sheet-overlay.tsx`.
- [x] Integrate and import sheet in `home-dashboard.tsx`.
- [x] Create folder and page `app/(app)/complaints/new/page.tsx` with details form.
- [x] Create folder and page `app/(app)/complaints/track/page.tsx` with tracking timeline.
- [x] Verify Typescript compile-checking passes.
- [x] Verify Next.js production build completes.

## Validation checklist
- [x] Megaphone card clicks open the complaints drawer sheet.
- [x] Drawer sheet matches mockup image (top drag handle, green titles, circle icon buttons, right chevrons).
- [x] Clicking "แจ้งเรื่องร้องเรียน" navigates to `/complaints/new`.
- [x] Form submission triggers a success state.
- [x] Clicking "ติดตามสถานะเรื่องร้องเรียน" navigates to `/complaints/track` and displays the mock timeline list.

## Progress Log
- **2026-06-24**: Created plan for complaints overlay and routes.
- **2026-06-24**: Implemented `ComplaintsSheetOverlay` bottom sheet dialog with smooth slide-up animation. Linked megaphone card on home page to trigger drawer. Created form pages at `/complaints/new` and listing tracking timelines at `/complaints/track`. Verified all compilation checks.

