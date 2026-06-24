# Public App and Back-Office Role Workflow

## Status

Planned

## Owner

Frontend implementation agent, with product/security review from the project owner.

## Dates

- Created: 2026-06-23
- Last updated: 2026-06-23

## Objective

Define the migration plan for separating citizen/business app flows from administrative back-office flows while still allowing shared UI patterns and role-aware actions.

This plan must align with the current `schema.prisma` implementation. DBML v0.1 naming is deprecated and must not be used as the planning source of truth.

The intended model is:

- The real landing page asks the user to choose an entry type: `บุคคลธรรมดา` or `เจ้าหน้าที่`.
- Public / Business Owner uses the main app experience through the `บุคคลธรรมดา` entry.
- Inspection Officer uses the main app experience through the `เจ้าหน้าที่` entry, with additional task/action capabilities.
- Every frontend app feature that is not admin back office must be designed mobile-first.
- Zone Supervisor, Agency Admin, and SuperAdmin use a dedicated web-only back-office path with management tables and role-specific tools.
- Shared visual components such as license cards, permit frames, status chips, and detail panels should be reused across public and officer views, with actions injected by capability.

## Role model

| Role | Thai label | Primary surface | Main responsibility |
| --- | --- | --- | --- |
| `super_admin` | ผู้ดูแลระบบ / ผู้พัฒนาระบบ | Back office, web-only | System-wide administration, developer/system controls, cross-agency configuration. |
| `agency_admin` | ผู้ดูแลระบบประจำหน่วยงาน | Back office, web-only | Manage agency-level data, users, permissions, workflows, and reports. |
| `zone_supervisor` | ผู้ควบคุมงานตรวจพื้นที่ | Back office, web-only | Assign inspection work, monitor area progress, review queues, manage inspection workload. |
| `inspection_officer` | เจ้าหน้าที่ตรวจ | Main app / field portal, mobile-first | View assigned inspection tasks, inspect, submit results, and use public/business features when needed. |
| `public_user` | ประชาชน / ผู้ประกอบการ | Main app, mobile-first | View personal/business licenses, businesses, requests, statuses, and public services. |

Business Owner should normally be modeled as `public_user` plus an active juristic/business context, not as a completely separate shell. This avoids duplicating the public app for natural persons and juristic persons.

## Prisma naming alignment

Use the current Prisma schema naming in every future plan, route, component, query, and document.

| Deprecated DBML v0.1 concept | Current `schema.prisma` model / implementation | Frontend planning target |
| --- | --- | --- |
| `establishments` | `Business` / businesses | `/businesses`, `/businesses/[businessId]`, `/businesses/[businessId]/licenses` |
| `work_orders` | `InspectionTask` | `/inspection-tasks` |
| `scope_nodes` | `Zone` / `UserZone` | `/admin/zones` or role-specific back-office zone management |
| `officer_digital_cards` | do not replace with `AuthProviderLink`; officer credential/card verification remains a separate domain concept when required | `/profile`, `/officer-card`, `/verify-officer`, or final route approved by product/security |
| `complaints` | removed from current Prisma scope | Do not include unless explicitly requested |

Rules:

- Do not introduce `/businessess` in new route plans. Use `/businesses`.
- Do not introduce `workOrder` naming for new frontend or Prisma query code. Use `inspectionTask`.
- Do not introduce `scopeNode` naming. Use `zone` / `userZone`.
- Do not plan complaint features unless the user explicitly requests them.
- When generating Prisma queries in future implementation work, use `Business`, `InspectionTask`, and `Zone`/`UserZone` models, not deprecated DBML entities.
- Do not use `AuthProviderLink` as the officer-card verification model. `AuthProviderLink` is only for Tang Rat identity-provider linkage and session creation.

## Tang Rat identity vs officer-card verification

These are separate concerns and must not be merged.

### Tang Rat / `AuthProviderLink`

Tang Rat is an identity provider. It can provide identity claims such as:

- name;
- citizen id or verified identifier;
- email;
- phone number.

The backend uses those claims to create or restore the user session. `AuthProviderLink` should represent this identity-provider linkage.

### Officer card / officer credential verification

Officer verification is a product/security feature for public trust.

Example use case:

1. A public user is saved or appointed as an inspection officer by the authorized back-office workflow.
2. Later, the officer visits a business or citizen to inspect a license.
3. The citizen/business owner must be able to verify that the person is a real authorized officer before interacting with them.

Requirements for future planning:

- Keep an officer credential/card concept separate from identity-provider linkage.
- Public verification output must be safe: show only the minimum officer information required to establish authenticity.
- Verification should be backed by server-side officer status, assignment/agency relationship where applicable, and current validity.
- Do not expose sensitive personal data such as full citizen id.
- If a QR/code is used, it should be short-lived or revocable where practical.
- Officer verification should support states such as active, suspended, expired, revoked, or not found.

## Core decision

Use two primary product surfaces:

1. Main app / field portal
   - For `public_user`.
   - For `inspection_officer`.
   - Uses card-based UI and mobile/app-friendly interaction patterns.
   - Must be designed mobile-first for every feature that is not back office.
   - Shows additional menus/actions when the active user has officer capabilities.

2. Back office
   - For `zone_supervisor`, `agency_admin`, and `super_admin`.
   - Uses admin-oriented UI, tables, filters, bulk actions, dashboards, and management workflows.
   - Is a dedicated web-only path, not part of the mobile-first app shell.
   - Does not share the full shell with the citizen-facing app, but may reuse low-level display components.

Reasoning:

- Inspection Officer works closer to a field/app user than an office administrator.
- Zone Supervisor and admins need management workflows that fit tables, queues, filtering, review, and assignment.
- Public and Business Owner flows are similar enough to share routes/components when context is modeled correctly.
- Reusing card/detail components prevents visual drift while still allowing officer-only actions.
- Keeping back office separate reduces accidental permission leakage and keeps navigation simpler.
- Mobile-first is required for the main app because public users, business owners, and inspection officers are expected to use these flows as app-like frontend features.
- Back-office workflows depend on dense tables, filters, dashboards, and management actions, so they should remain web-only and not be forced into the mobile app shell.

## Proposed route ownership

Recommended route groups:

```text
app/
├── (entry)/
│   ├── page.tsx
│   └── auth/
├── (app)/
│   ├── layout.tsx
│   ├── home/
│   ├── licenses/
│   ├── licenses/[id]/
│   ├── businesses/
│   ├── businesses/[businessId]/
│   ├── businesses/[businessId]/licenses/
│   ├── inspection-tasks/
│   └── profile/
└── (back-office)/
    ├── layout.tsx
    ├── super-admin/
    ├── agency-admin/
    └── zone-supervisor/
```

Suggested URL behavior:

- `/` — landing page for selecting `บุคคลธรรมดา` or `เจ้าหน้าที่`.
- `/home` — main app landing after login.
- `/licenses` — public/business/officer-readable license list.
- `/licenses/[id]` — shared license detail page.
- `/businesses` — juristic/business context area.
- `/businesses/[businessId]` — selected business context detail.
- `/businesses/[businessId]/licenses` — licenses scoped to a specific business context.
- `/inspection-tasks` — officer-only task list inside main app shell.
- `/admin/...` or `/agency-admin/...` — agency admin tools.
- `/zone-supervisor/...` — supervisor work assignment/review tools.
- `/super-admin/...` — system-level tools.

Do not route `inspection_officer` into the back-office shell by default. Officer-only functions should appear in the main app as capability-gated menus and action buttons.

Back-office paths are desktop/web-only surfaces. They may be responsive enough to avoid breaking layout, but they are not part of the mobile-first product requirement.

## Login and entry workflow

### Landing page

The real landing page should present exactly two entry choices:

1. `บุคคลธรรมดา`
   - Entry for public users.
   - Also covers business owners after login or context selection through juristic/business context.
   - Leads to the mobile-first main app.

2. `เจ้าหน้าที่`
   - Entry for inspection officers using field/app features.
   - Leads to the mobile-first main app with officer capabilities when authorized.
   - Does not mean automatic access to the admin back office.

Back-office access should live on a dedicated web-only path, not as one of the two mobile-first landing options.

### After authentication

Resolve three separate concepts:

1. Identity — who the user is.
2. Capabilities — what the user is allowed to do.
3. Active context — personal, juristic/business, officer task mode, or back-office mode.

Rules:

- A staff user may still enter the public app if they have public-use capabilities.
- A user who selects `บุคคลธรรมดา` should land in the public/business main app flow.
- A user who selects `เจ้าหน้าที่` and has `inspection_officer` capability should land in `/home` or `/inspection-tasks` depending on final product decision.
- A user with back-office roles should enter back office only through the dedicated web-only back-office path.
- Do not auto-redirect every staff-like user to admin routes.
- If a user directly opens a back-office path but lacks back-office capability, show an unauthorized state.

## Mobile-first frontend requirement

All non-back-office frontend features must be designed mobile-first.

Applies to:

- landing entry selection;
- authentication screens used by the app flow;
- `/home`;
- `/licenses`;
- `/licenses/[id]`;
- `/businesses`;
- `/businesses/[businessId]`;
- `/businesses/[businessId]/licenses`;
- juristic/business context selection;
- `/inspection-tasks`;
- officer task detail and update flows;
- profile and notification surfaces;
- shared cards, detail frames, and empty/loading/error states.

Mobile-first rules:

- Design the smallest practical viewport first, then progressively enhance for tablet/desktop.
- Use cards, bottom navigation, stacked forms, compact filters, and progressive disclosure for app flows.
- Avoid desktop-only tables in main app routes.
- If tabular data is unavoidable in the app surface, provide a mobile card/list representation first.
- Primary actions should be reachable without horizontal scrolling.
- Officer actions must remain usable on mobile in field conditions.
- Back-office table-heavy workflows must not leak into the app shell.

Back-office exception:

- Back-office routes are dedicated web-only paths.
- Back-office may use tables, sidebars, multi-column dashboards, and dense filters.
- Back-office should still avoid broken responsive behavior, but it does not need to follow the mobile-first app pattern.

## Capability model

Avoid scattering direct role checks such as `role === 'admin'` across components. Create a centralized capability resolver.

Example capabilities:

```text
app.access
app.licenses.view
app.licenses.view_juristic
app.juristic.switch
inspection.tasks.view
inspection.tasks.update
inspection.results.submit
backoffice.access
backoffice.users.manage
backoffice.agency.manage
backoffice.inspection.assign
backoffice.inspection.review
backoffice.system.manage
```

Example mapping:

| Capability | Public / Business | Inspection Officer | Zone Supervisor | Agency Admin | SuperAdmin |
| --- | --- | --- | --- | --- | --- |
| `app.access` | Yes | Yes | Optional | Optional | Optional |
| `app.licenses.view` | Yes | Yes | Optional | Optional | Optional |
| `app.juristic.switch` | If linked to juristic context | If linked | Optional | Optional | Optional |
| `inspection.tasks.view` | No | Yes | Optional read-only | Optional | Yes |
| `inspection.results.submit` | No | Yes | No by default | No by default | No by default |
| `backoffice.access` | No | No by default | Yes | Yes | Yes |
| `backoffice.inspection.assign` | No | No | Yes | Yes | Yes |
| `backoffice.agency.manage` | No | No | No by default | Yes | Yes |
| `backoffice.system.manage` | No | No | No | No | Yes |

Frontend capability checks are for UX only. The API/backend must enforce the same permissions.

## Shared UI strategy

Use shared presentational components and inject role-specific actions.

Target shared components:

- `LicenseCard`
- `LicenseStatusChip`
- `LicenseDetailFrame`
- `PermitSummaryCard`
- `BusinessCard`
- `InspectionTaskCard`
- shared empty/loading/error states

Recommended component shape:

```tsx
<LicenseCard
  license={license}
  primaryMeta={...}
  actions={<LicenseActions license={license} capabilities={capabilities} />}
/>
```

Rules:

- Shared cards should not directly know every role.
- Cards render data and layout.
- Action components decide which buttons appear based on capabilities and record state.
- Admin table views may reuse status chips and summary display parts, but should not be forced to use the mobile/app card layout.

## State and context model

Track these separately:

- authenticated user;
- roles/capabilities;
- active app mode: `public`, `juristic`, `officer`, `backoffice`;
- active juristic/business context;
- active agency/zone context for back office, if needed.

Important rules:

- Do not store access tokens in persisted client state.
- Do not store `activeJuristicId` or active business context in `localStorage`.
- Store active juristic/business context in `sessionStorage` so each browser tab has isolated context and cannot race with another tab.
- Reflect the active business context in the URL where practical, especially for business-scoped routes such as `/businesses/[businessId]/licenses`.
- Persist only display-safe state if needed.
- When active juristic context or active mode changes, clear or scope query cache.
- Query keys must include relevant context identifiers such as user id, juristic id, mode, agency id, or role/capability scope.
- Officer mutations must include server-side authorization and audit ownership.

## Security requirements

Security boundary:

- Frontend guards improve UX only.
- Backend/API authorization is mandatory for all protected data and mutations.

Required controls:

- Back-office routes require `backoffice.access`.
- Supervisor assignment actions require assignment capability.
- Officer task updates require officer capability and assignment ownership.
- Juristic data access requires membership/representation verification.
- Every API request acting on behalf of a juristic person/business must revalidate the authenticated `userId` against `JuristicMember`.
- Public user must not access officer task data through hidden URLs.
- Officer must not gain admin table management just because they are staff.
- Cache must be invalidated or scoped after mode/context switch.
- Sensitive actions must have audit logs: actor id, role/capability used, target resource, timestamp, outcome.

## Migration workflow

### Phase 1: Audit current routing and roles

- List current route groups and identify which are public app, officer app, or back office.
- Identify the current landing page and map it to the two-entry model: `บุคคลธรรมดา` and `เจ้าหน้าที่`.
- Inventory current role strings used in code and API responses.
- Identify redirects that force staff/admin users into the wrong surface.
- Identify duplicated license/card UI.
- Identify places where role checks are embedded directly in components.
- Identify frontend pages that currently use desktop-first tables or layouts but belong to the mobile-first app surface.
- Replace deprecated route/model names from DBML v0.1 with Prisma-aligned names.

Deliverable:

- Route ownership table.
- Landing entry behavior table.
- Role string normalization map.
- Prisma naming normalization map.
- List of risky redirects.
- Mobile-first gap list for non-back-office pages.

### Phase 2: Normalize role and capability layer

- Define canonical role names.
- Define canonical domain model names based on `schema.prisma`: `Business`, `InspectionTask`, `Zone`, `UserZone`, `AuthProviderLink`, and `JuristicMember`.
- Define a separate officer credential/card verification concept if it exists in the current or upcoming backend schema.
- Create a capability resolver.
- Replace ad-hoc role checks gradually with capability checks.
- Keep existing role strings supported through a compatibility adapter while migration is in progress.

Deliverable:

- `getCapabilities(user)` or equivalent utility.
- Tests or examples for each role.
- Naming compatibility notes for any legacy frontend names that still exist.

### Phase 3: Separate surfaces

- Keep public/business/officer app routes in the main app shell.
- Keep zone supervisor, agency admin, and super admin in back-office shell.
- Remove auto-redirects that assume all staff must go to back office.
- Add explicit entry behavior for the two landing choices: `บุคคลธรรมดา` and `เจ้าหน้าที่`.
- Keep back-office entry on a dedicated web-only path.

Deliverable:

- App shell route map.
- Back-office shell route map.
- Login intent behavior.
- Mobile-first app shell behavior.

### Phase 4: Migrate shared UI components

- Extract license/status/card display components.
- Move role-specific buttons into action-slot components.
- Use the same visual language for public/business/officer cards.
- Reuse lower-level display components in admin tables where appropriate.
- Ensure shared app components are mobile-first before enhancing desktop layout.

Deliverable:

- Shared card/detail component set.
- Public action component.
- Officer action component.
- Back-office table/status display reuse.

### Phase 5: Context and cache hardening

- Ensure active juristic/business context is explicit.
- Store active juristic/business context in `sessionStorage`, not `localStorage`.
- Put business context into route params where practical, such as `/businesses/[businessId]/licenses`.
- Ensure active officer/back-office mode is explicit.
- Add context-aware query keys.
- Clear or invalidate query cache when switching context.
- Ensure APIs revalidate juristic/business membership through `JuristicMember`.

Deliverable:

- Context switching rules.
- Query key convention.
- Cache invalidation checklist.
- Juristic membership validation checklist.

### Phase 6: Validation and rollout

- Validate each role’s navigation.
- Validate direct URL access.
- Validate API authorization failures.
- Validate cache isolation after context switch.
- Validate officer-only actions on assigned vs unassigned tasks.
- Validate public/business license card rendering.

Deliverable:

- Role-based QA matrix.
- Known limitations.
- Rollout notes.

## Implementation checklist

- [ ] Audit existing route groups and redirects.
- [ ] Audit current landing page and convert the plan to two choices: `บุคคลธรรมดา` and `เจ้าหน้าที่`.
- [ ] Decide final URL names for app and back-office surfaces.
- [ ] Replace deprecated `/businessess` planning with `/businesses`.
- [ ] Replace old DBML naming with Prisma model names: `Business`, `InspectionTask`, `Zone`, `UserZone`, `AuthProviderLink`, `JuristicMember`.
- [ ] Keep Tang Rat identity linkage separate from officer-card/credential verification.
- [ ] Add officer verification route/component planning when backend contract is confirmed.
- [ ] Normalize role names from backend/user model.
- [ ] Create centralized capability resolver.
- [ ] Update login redirect behavior to use selected intent and capabilities.
- [ ] Make all non-back-office frontend features mobile-first.
- [ ] Keep Inspection Officer in main app shell by default.
- [ ] Move Zone Supervisor, Agency Admin, and SuperAdmin into back-office shell.
- [ ] Keep back-office on a dedicated web-only path.
- [ ] Extract shared card/status/detail components.
- [ ] Add action-slot pattern for public/officer actions.
- [ ] Scope or invalidate query cache on mode/context changes.
- [ ] Store active juristic/business context in `sessionStorage`, not `localStorage`.
- [ ] Reflect business context in URLs where practical.
- [ ] Ensure backend validation for juristic/business requests checks `JuristicMember`.
- [ ] Add unauthorized/forbidden states for invalid route access.
- [ ] Validate role navigation and direct URL access.

## Validation checklist

- [ ] Public user can access public app pages and cannot access officer/back-office routes.
- [ ] Landing page shows only `บุคคลธรรมดา` and `เจ้าหน้าที่` as the primary entry choices.
- [ ] Business owner can switch juristic/business context only when authorized.
- [ ] Business-scoped pages use `/businesses/[businessId]` route context where practical.
- [ ] Inspection Officer can access public app features and assigned inspection tasks.
- [ ] Inspection Officer does not see back-office management tables unless explicitly granted.
- [ ] Zone Supervisor can access back-office assignment/review workflows.
- [ ] Agency Admin can access agency management workflows.
- [ ] SuperAdmin can access system-level workflows.
- [ ] Direct URL access returns unauthorized/forbidden state where appropriate.
- [ ] Context switch clears or scopes cached data.
- [ ] Juristic/business context switching is tab-isolated via `sessionStorage`.
- [ ] No active juristic/business context is stored in `localStorage`.
- [ ] Juristic/business API calls are planned to revalidate `userId` against `JuristicMember`.
- [ ] Public officer verification does not expose full citizen id or unnecessary personal data.
- [ ] Officer verification uses backend-issued officer status, not only client-side role state.
- [ ] Shared license card renders consistently across public/business/officer contexts.
- [ ] Officer actions appear only when capability and record state allow them.
- [ ] Main app pages pass mobile-first layout review.
- [ ] Back-office remains accessible through dedicated web-only paths, not the mobile-first landing choices.

## Progress log

| Date | Status | Note |
| --- | --- | --- |
| 2026-06-23 | Planned | Corrected officer-card interpretation: `AuthProviderLink` is only for Tang Rat identity/session linkage, while officer credential/card verification remains a separate public-trust feature for verifying real authorized inspection officers. |
| 2026-06-23 | Planned | Synced plan with E-License platform naming: deprecated DBML v0.1 terms are replaced by Prisma-aligned `Business`, `InspectionTask`, `Zone`/`UserZone`; `/businessess` is replaced by `/businesses`; juristic context switching now requires `sessionStorage`, URL context where practical, and backend `JuristicMember` revalidation. |
| 2026-06-23 | Planned | Updated the plan to reflect the real landing page with two entry choices: `บุคคลธรรมดา` and `เจ้าหน้าที่`; added mobile-first requirement for all non-back-office frontend features; clarified back-office as a dedicated web-only path. |
| 2026-06-23 | Planned | Captured the agreed role/surface strategy and migration workflow for future implementation. |

## Changed files

Planning only:

- `plan/README.md`
- `plan/2026-06-23-public-app-backoffice-role-workflow.md`

No application code has been changed for this plan yet.

## Open questions and risks

- Confirm final canonical role strings from the backend before implementation.
- Confirm whether `zone_supervisor` should have any read-only app/field view or only back-office access.
- Confirm whether `agency_admin` and `super_admin` should also be allowed into the main app for testing/support scenarios, even though their normal surface is web-only back office.
- Decide whether final URLs should be role-named (`/zone-supervisor`) or domain-named (`/admin/inspection-assignments`).
- Existing code may currently use broader roles such as `admin` or `officer`; migration should keep compatibility until backend and frontend agree on canonical names.
- If permission checks remain scattered in UI components, role behavior will become hard to audit and insecure by design.
- Confirm whether the `เจ้าหน้าที่` landing choice is only for `inspection_officer` field/app users or can also route back-office users to a web-only admin login link after authentication.
- Confirm exact backend route/API contract for business-scoped license queries under `Business` and `JuristicMember`.
- Confirm the backend model/API contract for officer credential/card verification, including public lookup route, validity states, and safe response fields.
