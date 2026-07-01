# Main Flows Export 2026-06-30

Source Figma file: https://www.figma.com/design/eEn7vxIbv5TjEVOSN5AU14?node-id=853-941  
Root node: `853:941` / `เจ้าหน้าที่ตรวจสอบ`

> Figma structure note: The supplied node separates context spatially. The left side is officer/system staff oriented, and the right side is citizen/public oriented. The metadata also includes shared mobile screens named `Homepage Service` with `440px` width and reusable search/card patterns.

## Flow Map

| # | Flow | Context | Primary routes |
| --- | --- | --- | --- |
| 1 | Entry Role Selection | Shared | `/` |
| 2 | Citizen Home Dashboard | Citizen / Public | `/home` |
| 3 | License Search + QR Verify | Citizen / Public | `/license-search`, `/licenses/[id]` |
| 4 | Business Search + Result Cards | Citizen / Public | `/businesses`, `/businesses/[businessId]` |
| 5 | My Licenses Summary | Citizen / Juristic member | `/licenses`, `/businesses/[businessId]/licenses` |
| 6 | e-Map / Navigate To Business | Citizen + Officer shared | `/e-map` |
| 7 | Verify Officer Credential | Citizen / Public safety | `/verify-officer` |
| 8 | Officer Inspection Task Workflow | Officer / Field portal | `/inspection-tasks` |
| 9 | Back-office Supervision | Officer / Admin desktop | `/zone-supervisor`, `/agency-admin`, `/super-admin` |

## 1. Entry Role Selection

- **Context:** Shared
- **Goal:** Split users into two clear paths: `บุคคลธรรมดา` and `เจ้าหน้าที่`.
- **Layout structure:** Minimal mobile-first entry screen with two role choices.
- **Key components:** Role selection card/button, app logo/header, optional auth handoff.
- **Important interactions:** Selecting citizen enters public/citizen app; selecting officer enters officer login or field portal depending on session.
- **Notes:** Keep exactly two choices at `/` per project route architecture.

## 2. Citizen Home Dashboard

- **Context:** Right / Citizen-public
- **Figma anchors:** `Homepage Service` https://www.figma.com/design/eEn7vxIbv5TjEVOSN5AU14?node-id=867-653
- **Goal:** Give a citizen quick access to license search, personal licenses, map, businesses, and license status summary.
- **Layout structure:** Mobile shell -> status/header -> search bar -> hero banner -> service shortcuts grid -> license status summary card.
- **Key components:** App Mobile Shell, Header Greeting Bar, License Search Field, Hero / Informational Banner, Service Shortcut Card, License Status Summary Card.
- **Important interactions:** Search opens license lookup; QR scan opens scanner; shortcuts navigate to `/licenses`, `/e-map`, `/businesses`; status summary links to reports or license list.
- **Implementation notes:** Current implementation is concentrated in `components/app/home/home-dashboard.tsx`; extract reusable header/search/shortcut components if repeated.

## 3. License Search + QR Verify

- **Context:** Citizen-public, also reusable for officer lookup
- **Figma anchors:** Search field/card nodes https://www.figma.com/design/eEn7vxIbv5TjEVOSN5AU14?node-id=1772-23280 and variants https://www.figma.com/design/eEn7vxIbv5TjEVOSN5AU14?node-id=1772-23737
- **Goal:** Search by license number or business name, or verify via QR scan.
- **Layout structure:** Mobile search page -> hero/search input -> autocomplete suggestions -> result list or empty/not-found state -> detail page after selection.
- **Key components:** License Search Field, Search Form Card, QR Scan Action, License Certificate Card, result/empty state.
- **Important interactions:** Empty input shows QR scan action; typing shows search action and autocomplete; scan validates via BFF and routes to `/licenses/[id]?hideVerify=true`.
- **Implementation notes:** Browser calls must stay same-origin through `/api/*`; code path currently uses `http.get("licenses/${cleanValue}/qr-verify")`.

## 4. Business Search + Result Cards

- **Context:** Right / Citizen-public, reusable by officer lookup
- **Figma anchors:** Empty state https://www.figma.com/design/eEn7vxIbv5TjEVOSN5AU14?node-id=853-1480; results https://www.figma.com/design/eEn7vxIbv5TjEVOSN5AU14?node-id=853-1518
- **Goal:** Find businesses/สถานประกอบการ by name or filters, then navigate or view details.
- **Layout structure:** Search/empty prompt -> filter/search params -> result count -> vertical list of business result cards.
- **Key components:** Business Search Empty State, Business Result Card, filter sheet/panel, Skeleton loading card.
- **Important interactions:** Query/filter state lives in URL; result card supports `นำทาง` and `ดูรายละเอียด`; details route uses `/businesses/[businessId]`.
- **Implementation notes:** Use Prisma-aligned `Business` terminology. Do not use deprecated `establishments` naming in new docs or code.

## 5. My Licenses Summary

- **Context:** Citizen / juristic member
- **Figma anchors:** Shortcut and status summary nodes under https://www.figma.com/design/eEn7vxIbv5TjEVOSN5AU14?node-id=867-785 and https://www.figma.com/design/eEn7vxIbv5TjEVOSN5AU14?node-id=867-836
- **Goal:** Let a user see their own licenses and license status distribution.
- **Layout structure:** Shortcut card entry -> license list -> license detail/certificate preview.
- **Key components:** Service Shortcut Card, License Status Summary Card, License Certificate Card, Status Badge.
- **Important interactions:** Selecting a license opens detail; status filters should use semantic states: active/stable, expiring/warning, expired/danger, suspended/neutral or danger depending backend status.
- **Implementation notes:** Juristic/business scoped licenses should reflect context in `/businesses/[businessId]/licenses` and backend must validate `JuristicMember`.

## 6. e-Map / Navigate To Business

- **Context:** Citizen + Officer shared
- **Goal:** Show business/license location and support navigation to a target.
- **Layout structure:** Map page -> pins/layers -> selected business popup -> navigate/details actions.
- **Key components:** Service Shortcut Card, MapContainer, SmartCityMap, MapPopup, FilterPins.
- **Important interactions:** From business result card, `นำทาง` opens external map direction if coordinates exist; otherwise internal `/e-map`.
- **Implementation notes:** Map context should not infer authorization; location display must respect backend visibility rules.

## 7. Verify Officer Credential

- **Context:** Right / Citizen-public safety flow
- **Goal:** Allow public users to verify whether an arriving inspector/officer is authorized.
- **Layout structure:** Scan entry -> scanner dialog -> verification result card -> success or failed state.
- **Key components:** QR Scan Action, QrScannerDialog, Officer Verification Result Card, detail row component.
- **Important interactions:** Successful scan shows authorized officer name, agency, zone, checked timestamp, and permissions; failed scan shows not-found warning and retry.
- **Implementation notes:** Do not model this as `AuthProviderLink`. Officer credential/card verification is a separate domain feature with backend-issued public-safe output.

## 8. Officer Inspection Task Workflow

- **Context:** Left / Officer field portal
- **Goal:** Officer receives and processes inspection tasks for businesses/licenses in assigned zones.
- **Layout structure:** Officer home/task list -> task card -> detail -> report/form -> submit/update status.
- **Key components:** App Mobile Shell, InspectionTaskCard, StatusBadge, form controls, document/license summary card.
- **Important interactions:** Filter assigned tasks, open task detail, inspect license/business, submit inspection report.
- **Implementation notes:** Use `InspectionTask`, not `work_orders`. Frontend gating is UX only; BFF/backend must authorize by officer role/zone.

## 9. Back-office Supervision

- **Context:** Left / Officer/admin desktop
- **Goal:** Supervisors and admins manage zones, agencies, users, reports, and audit surfaces.
- **Layout structure:** Desktop sidebar/header -> dashboard stats -> data tables -> modal forms.
- **Key components:** AdminHeader, AdminSidebar, SuperAdminSidebar, StatCard, tables, modal forms.
- **Important interactions:** Zone supervisor reviews zone activity; agency admin manages agency users/data; super admin manages master data and audit logs.
- **Implementation notes:** Back-office is web-only/desktop-first. Use `/zone-supervisor`, `/agency-admin`, `/super-admin`.

## Cross-flow Design Rules

- Mobile portal screens use `max-width` around `430-440px`, Thai-first labels, and dense but clear cards.
- Use semantic tokens from `figma/design-tokens-20260630.json`; avoid hard-coded page colors in new implementation.
- Prefer icons from `lucide-react` or existing `components/icons/*`.
- Keep scanner flows reusable: license QR verification and officer credential verification share scanner mechanics but different backend validation and result screens.
- Cache must be cleared or scoped when user, business, juristic context, or active mode changes.
