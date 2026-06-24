# Folder Structure and Route Migration

## Status

Implemented

## Owner

Frontend implementation agent, with review by project owner.

## Dates

- Created: 2026-06-23
- Last updated: 2026-06-23

## Objective

Plan the physical migration of files and folders so the repository matches the target product architecture:

- `(entry)` mobile-first landing with exactly two choices: `บุคคลธรรมดา` and `เจ้าหน้าที่`.
- `(app)` mobile-first field portal for public/business users and inspection officers.
- `(back-office)` web-only / desktop-first admin surfaces for zone supervisor, agency admin, and super admin.
- Prisma-aligned naming: `Business`, `InspectionTask`, `Zone`/`UserZone`, not deprecated DBML v0.1 names.

This plan covers file moves, route renames, component folder split, import rewrites, URL string rewrites, and validation.

## Current structure problems

The current repo has a legacy naming mismatch:

- `app/(back-office)` previously contained many app/field/public-style routes such as `/home`, `/my-licenses`, `/license-search`, `/e-map`, `/profile`, and `/establishment`.
- `components/back-office` contains both real back-office shell pieces and mobile-first app feature views.
- Establishment naming still exists in routes and components, but the target schema/route language is `Business` / `/businesses`.
- `activeJuristicId` exists in the auth store shape and is persisted through `sessionStorage`, which satisfies the tab-isolated storage requirement. URL context is still preferred where practical for business-scoped routes.

## Target structure

Recommended target tree:

```text
app/
├── (entry)/
│   ├── page.tsx
│   └── auth/
├── (app)/
│   ├── layout.tsx
│   ├── home/
│   ├── businesses/
│   │   ├── page.tsx
│   │   └── [businessId]/
│   │       ├── page.tsx
│   │       └── licenses/
│   │           └── page.tsx
│   ├── licenses/
│   ├── licenses/[id]/
│   ├── inspection-tasks/
│   └── profile/
├── (back-office)/
│   ├── layout.tsx
│   ├── zone-supervisor/
│   ├── agency-admin/
│   └── super-admin/
├── api/
└── layout.tsx
```

Recommended component folders:

```text
components/
├── app-shell/
│   ├── app-shell.tsx
│   ├── app-navbar.tsx
│   └── app-bottom-nav.tsx
├── app/
│   ├── home/
│   ├── businesses/
│   ├── licenses/
│   ├── inspection-tasks/
│   └── profile/
├── back-office/
│   ├── shell/
│   ├── zone-supervisor/
│   ├── agency-admin/
│   └── super-admin/
├── shared/
└── ui/
```

The exact component folder names can be adjusted during implementation, but the split must be by product surface, not by legacy route name.

## Rename and move map

### Route folders

| Current | Target | Notes |
| --- | --- | --- |
| `app/page.tsx` | `app/(entry)/page.tsx` or keep as `app/page.tsx` if simpler | Must render the two entry choices: `บุคคลธรรมดา`, `เจ้าหน้าที่`. |
| `app/(back-office)/home/page.tsx` | `app/(app)/home/page.tsx` | Mobile-first app surface. |
| `app/(back-office)/profile/page.tsx` | `app/(app)/profile/page.tsx` | Mobile-first app surface. |
| `app/(back-office)/establishment/page.tsx` | `app/(app)/businesses/page.tsx` | Rename route and terminology. |
| `app/(back-office)/establishment/[slug]/page.tsx` | `app/(app)/businesses/[businessId]/page.tsx` | Rename param from `slug` to `businessId`. |
| `app/(back-office)/my-licenses/page.tsx` | `app/(app)/licenses/page.tsx` | Implemented as `/licenses`. |
| `app/(back-office)/my-licenses/[slug]/page.tsx` | `app/(app)/licenses/[id]/page.tsx` | Rename param from `slug` to `id`. |
| `app/(back-office)/my-licenses/[slug]/inspection/page.tsx` | `app/(app)/inspection-tasks/[taskId]/page.tsx` | Aligns route with `InspectionTask`. |
| `app/(back-office)/license-search/page.tsx` | `app/(app)/license-search/page.tsx` or fold into `/licenses` | Product decision required. |
| `app/(back-office)/e-map/page.tsx` | `app/(app)/map/page.tsx` or keep `/e-map` alias | Product decision required. |
| `app/(back-office)/reports/page.tsx` | likely `app/(app)/inspection-tasks/page.tsx` for officer history, or back-office report route if admin-only | Must classify by user and workflow. |
| `app/(admin)/admin/inspections/page.tsx` | `app/(back-office)/agency-admin/inspections/page.tsx` | Implemented with legacy redirect from `/admin/inspections`. |
| `app/(super-admin)/*` | `app/(back-office)/super-admin/*` | Implemented with legacy redirects from old root-level super-admin URLs. |

### Component folders

| Current | Target | Notes |
| --- | --- | --- |
| `components/back-office/back-office-shell.tsx` | `components/back-office/shell/back-office-shell.tsx` | Keep for true web-only back office only. |
| `components/back-office/back-office-navbar.tsx` | split into `components/app-shell/app-navbar.tsx` and/or `components/back-office/shell/back-office-navbar.tsx` | Current navbar serves app-style routes and must be separated. |
| `components/back-office/home-dashboard.tsx` | `components/app/home/home-dashboard.tsx` or app dashboard name | Mobile-first app route. |
| `components/back-office/establishment-page.tsx` | `components/app/businesses/businesses-page.tsx` | Rename Establishment → Business. |
| `components/back-office/establishment-detail-page.tsx` | `components/app/businesses/business-detail-page.tsx` | Rename types and props. |
| `components/back-office/license-list-page.tsx` | `components/app/licenses/license-list-page.tsx` | Shared mobile-first app page. |
| `components/back-office/license-detail-page.tsx` | `components/app/licenses/license-detail-page.tsx` | Shared public/business/officer detail. |
| `components/back-office/license-inspection-page.tsx` | `components/app/inspection-tasks/inspection-task-detail-page.tsx` | Align to `InspectionTask`. |
| `components/back-office/reports-page.tsx` | `components/app/inspection-tasks/inspection-task-history-page.tsx` or true back-office reports folder | Classify first. |
| `components/back-office/e-map-page.tsx` | `components/app/map/e-map-page.tsx` or `components/app/map/map-page.tsx` | Update links from `/businesses/*` to `/businesses/*`. |
| `components/back-office/business-filter-panel.tsx` | `components/app/businesses/business-filter-panel.tsx` or `components/shared/business-filter-panel.tsx` | Shared if used by multiple surfaces. |
| `components/shared/inspection-task-card.tsx` | keep or rename to `components/shared/InspectionTaskCard.tsx` | Already aligned conceptually. |

## Import and reference rewrite rule

Yes: moving files requires updating every import path and every route string reference.

Because this repo uses the `@/` alias, many imports are easy to update mechanically, but they still must be changed. Example:

```ts
// Before
import { EstablishmentPageView } from "@/components/back-office/establishment-page";

// After
import { BusinessesPageView } from "@/components/app/businesses/businesses-page";
```

This migration must update:

- static imports;
- dynamic imports;
- type imports;
- relative imports inside moved components;
- route constants;
- `href` values;
- `router.push` / `router.replace`;
- navbar search/title config maps;
- test/mock links;
- docs and plans when they point to old paths.

Use `rg` after every move:

```bash
rg "components/back-office|/establishment|establishment|Establishment|my-licenses|activeJuristicId"
```

Do not rely only on TypeScript compile errors; string route references can remain broken without type errors.

## Migration workflow

### Phase 1: Inventory and dependency graph

- List routes under `app/(back-office)`, `app/(admin)`, and `app/(super-admin)`.
- Classify each route as `(entry)`, `(app)`, or true `(back-office)`.
- Find imports and links with `rg`.
- Record compatibility routes that must temporarily redirect.

### Phase 2: Create target folders without moving everything at once

- Create new route groups and component folders.
- Move one route family at a time.
- Start with `/businesses` because it resolves the deprecated `/establishment` naming.

### Phase 3: Migrate business routes

- Move `establishment` route files to `businesses`.
- Rename components and exported types from `Establishment*` to `Business*`.
- Update links from `/establishment/${id}` to `/businesses/${businessId}`.
- Update `e-map` details links.
- Keep temporary redirects from old `/establishment` paths if existing users/bookmarks need compatibility.

### Phase 4: Migrate app shell

- Split the current `BackOfficeShell`/`BackOfficeNavbar` responsibilities.
- Create a mobile-first app shell for `(app)`.
- Keep a separate back-office shell for true admin routes.
- Do not let admin table navigation leak into the mobile app shell.

### Phase 5: Migrate license and inspection routes

- Move public/business/officer license routes into `(app)`.
- Align inspection workflow names with `InspectionTask`.
- Rename `license-inspection-page` if it actually represents an inspection task.

### Phase 6: Migrate admin surfaces

- Move or map `app/(super-admin)` into the dedicated web-only back-office structure.
- Decide exact ownership for current `app/(admin)` routes: `agency-admin` vs `zone-supervisor`.
- Keep admin components under `components/back-office/*` or role-specific subfolders.

### Phase 7: Session context validation

- Ensure active juristic/business context is not stored in `localStorage`.
- Keep active juristic/business context tab-isolated through `sessionStorage`.
- Include `businessId` route params in business-scoped query keys.
- Keep `queryClient.clear()` on context switch.

### Phase 8: Validation

- Run `rg` for old names and paths.
- Run TypeScript.
- Run lint/build if available.
- Manually verify navigation paths for both entry choices and each role surface.

## Implementation checklist

- [x] Create route/component inventory.
- [x] Create target folders.
- [x] Migrate `/establishment` → `/businesses`.
- [x] Rename `Establishment*` exports/types to `Business*`.
- [x] Update all imports from moved components.
- [x] Update all string links from `/establishment` to `/businesses`.
- [x] Split app shell from back-office shell.
- [x] Move app routes out of legacy `app/(back-office)`.
- [x] Move or map admin/super-admin routes into web-only back-office structure.
- [x] Verify active juristic context uses `sessionStorage`, not `localStorage`.
- [x] Update docs after physical migration.
- [x] Run `rg`, typecheck, and relevant build checks.

## Validation checklist

- [x] `rg "@/components/back-office|components/back-office|/establishment|Establishment|my-licenses"` returns no source-code matches.
- [x] `rg "components/back-office"` shows no app source imports.
- [x] `rg "localStorage"` shows no active juristic/business context storage in source code.
- [x] `/` renders exactly two entry choices.
- [x] `/businesses` and `/businesses/[businessId]/licenses` exist in the route tree.
- [x] `/inspection-tasks` uses `InspectionTask` route terminology.
- [x] App shell is separated from the legacy back-office layout.
- [x] `/super-admin/*` routes exist for SuperAdmin web-only back-office.
- [x] `/agency-admin/inspections` exists for Agency Admin web-only back-office.
- [x] Legacy root-level admin/super-admin URLs redirect to the new paths.
- [x] `bunx tsc --noEmit` passes.
- [x] `npm run build` passes with network access for `next/font`.
- [ ] Full `npm run lint` passes. It currently fails on pre-existing map/admin/super-admin/script lint debt outside this migration.
- [x] Targeted lint on migrated app files passes with warnings only.

## Progress log

| Date | Status | Note |
| --- | --- | --- |
| 2026-06-23 | Implemented | Validated juristic context storage rule: active juristic context is persisted through Zustand using `createJSONStorage(() => sessionStorage)`, not `localStorage`; `/businesses/[businessId]/licenses` exists for URL-context business-scoped navigation. |
| 2026-06-23 | Implemented | Completed Phase 2 migration: moved `app/(super-admin)` routes under `/super-admin/*`, moved admin inspections under `/agency-admin/inspections`, updated login/sidebar redirects, and added legacy redirects for old admin and public route URLs. |
| 2026-06-23 | Implemented | Completed Phase 1 migration: created `(app)` layout and `components/app-shell`, moved app routes/components out of legacy `(back-office)`, renamed establishment route/components to businesses, added `/businesses/[businessId]/licenses`, updated imports/links, and validated build/typecheck. Full plan remains in progress because admin route consolidation and juristic session-context cleanup are not done yet. |
| 2026-06-23 | In Progress | Started implementation: moving mobile-first app routes/components out of legacy `back-office`, renaming establishment routes/components to businesses, and updating imports/links. |
| 2026-06-23 | Planned | Created migration plan for physical route/component folder moves, naming updates, import rewrites, and validation. |

## Changed files

Implementation:

- `app/page.tsx`
- `app/(app)/**`
- `app/(back-office)/layout.tsx`
- `app/(back-office)/agency-admin/**`
- `app/(back-office)/super-admin/**`
- `app/(back-office)/zone-supervisor/page.tsx`
- `app/(legacy)/**`
- `components/app-shell/**`
- `components/app/**`
- `components/admin/admin-sidebar.tsx`
- `components/super-admin/super-admin-sidebar.tsx`
- `hooks/useAuth.ts`
- `assets/businesses/holding.png`
- `constants/mock-businesses.ts`
- `next.config.ts`
- `tsconfig.json`
- `docs/FRONTEND_BUILD_ROADMAP.md`
- `docs/FRONTEND_IMPLEMENTATION_STATUS.md`
- `docs/FRONTEND_STRUCTURE.md`
- `plan/README.md`
- `plan/2026-06-23-folder-structure-route-migration.md`

## Open questions and risks

- Decide whether old routes such as `/establishment` and `/my-licenses` need redirects or can be removed immediately.
- Decide whether `/e-map` remains product naming or becomes `/map`.
- Decide whether current `/reports` belongs to officer app history or admin back-office reports.
- Confirm final API contracts for business-scoped license routes.
- A pure file move without import and string-route rewrite will break the app.
