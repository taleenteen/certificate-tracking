# Plan: Business License Export Page Redesign

- Status: `Verified`
- Owner: agent
- Date created: 2026-07-12
- Date last updated: 2026-07-12

## Objective
Redesign the business license export page at `/businesses/[businessId]/exports` to match the provided mockup design. This includes combining the business info card and the collapsible license list into a single white card container, and rendering the first page of each license's PDF certificate alongside its respective status stamp in the collapsible list view.

## Context and constraints
- The app uses Next.js with Tailwind CSS.
- Styling should fit nicely within the responsive app shell constraints.
- Keep the existing export logic, button actions, and hooks intact.
- Re-use the existing `CertificatePreview` component (which renders PDF page 1 using pdf.js) to display certificate previews.
- Use `bun` for any commands.

## Scope
- Modify `components/app/businesses/business-detail-page.tsx`:
  - Add optional `businessType` and `registrationId` fields to `BusinessDetailData` typescript definition.
- Modify `app/(app)/businesses/[businessId]/exports/page.tsx`:
  - Pass the dynamic `businessType` and `registrationId` from the fetched `businessQuery.data` to the `BusinessDetailData` object.
- Modify `components/app/businesses/business-license-export-page.tsx`:
  - Merge the business details card and collapsible licenses list into a single parent card.
  - Update the business detail rows with green icons (`Building2` and `MapPin` from `lucide-react`).
  - Make the "ส่งออกใบอนุญาตทั้งหมด" action button span full width.
  - Position the collapsible trigger (`ซ่อนรายการ` / `แสดงรายการ`) centered below the main action button.
  - Redesign each item in the collapsible list as a card showing:
    - License title and bold blue license number.
    - Grey background preview box container containing the `CertificatePreview` component and the corresponding status stamp overlay (`approvedIcon`, `almostExpireIcon`, etc.).
    - An outline "ส่งออกใบอนุญาต" button that spans full width.

## Out of scope
- Modifying backend export API endpoints or export logic.
- Redesigning pages other than the business exports screen.

## Proposed workflow
1. Edit `components/app/businesses/business-detail-page.tsx` to extend `BusinessDetailData`.
2. Edit `app/(app)/businesses/[businessId]/exports/page.tsx` to supply the fields.
3. Edit `components/app/businesses/business-license-export-page.tsx` to implement the new mockup-matched UI design.
4. Verify TypeScript and ESLint, and compile production build using `bun run build`.

## Security and permission considerations
- Page access remains gated by the existing `isStaff` check.

## Implementation checklist
- [x] Add `businessType` and `registrationId` to `BusinessDetailData` in `components/app/businesses/business-detail-page.tsx`
- [x] Populate `businessType` and `registrationId` in `app/(app)/businesses/[businessId]/exports/page.tsx`
- [x] Implement combined collapsible layout and PDF previews in `components/app/businesses/business-license-export-page.tsx`

## Validation checklist
- [x] Type check passes (`bunx tsc --noEmit`)
- [x] Production build succeeds (`bun run build`)
- [x] Visual layout verified using browser subagent

## Progress log
- **2026-07-12**: Plan created.
- **2026-07-12**: Implemented single collapsible card layout, integrated `CertificatePreview` component with status stamp overlays, mapped correct `licenseNo` property, changed buttons icon to `Download`, and successfully verified compilation & build.

## Changed files
- `components/app/businesses/business-detail-page.tsx`
- `app/(app)/businesses/[businessId]/exports/page.tsx`
- `components/app/businesses/business-license-export-page.tsx`

## Open questions and risks
- *Risk*: Slow rendering if there are many licenses.
  *Mitigation*: The `CertificatePreview` component only renders page 1 using a canvas and runs asynchronously once the element mounts. The container remains highly responsive.
