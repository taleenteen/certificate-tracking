# Repo-wide Lint Cleanup

- Status: Implemented
- Owner: agent
- Created: 2026-10-22
- Last updated: 2026-10-22

## Objective

Make `bun run lint` (ESLint over the whole repo) pass with 0 errors and 0 warnings, then add it to the CI workflow next to Typecheck.

## Context and constraints

- Baseline (2026-10-22, `a37d03f`): 149 problems in 39 files, 78 errors and 71 warnings.
  - 66 `no-explicit-any`, 58 `no-unused-vars`, 9 `react-hooks/exhaustive-deps`, 6 `no-require-imports` (scripts/*.js), 3 `react-hooks/set-state-in-effect`, 2 `no-img-element`, 2 unused eslint-disable directives, 2 `react/no-unescaped-entities` and 1 `react-hooks/purity`.
- Rule: no behavior change. Hook-dependency and set-state-in-effect fixes are reviewed one by one, because changing dependencies can cause loops or extra fetches.
- A targeted `eslint-disable-next-line` is allowed only with a written reason, where a real fix would change behavior.

## Scope

All files reported by `eslint .`, plus `.github/workflows/typecheck.yml` (add a lint step).

## Out of scope

- Changing ESLint rules or config to hide errors. Exception: `scripts/*.js` are Node CommonJS utilities, so `require()` is valid there. They are handled with a file-scoped override, not a rule change.
- Feature or UI changes.

## Proposed workflow

1. Split the work into three disjoint file groups (map, super-admin, everything else) and fix them in parallel.
2. Review every diff, focusing on the hook and effect changes.
3. Run lint, typecheck and build.
4. Add the lint step to CI, push, and confirm it is green.

## Security and permission considerations

None expected. Code-quality changes only; auth and API paths are untouched.

## Implementation checklist

- [x] Map components
- [x] Super-admin components
- [x] Remaining files and scripts
- [x] CI lint step (`.github/workflows/ci.yml`, job `lint`, `--max-warnings 0`)

## Validation checklist

- [x] `bun run lint --max-warnings 0`: exit 0 (0 problems)
- [x] `bun run typecheck`: pass
- [x] `bun run build`: pass
- [x] `git diff --check`: clean
- [x] CI green on `0978d45` (runs 39750180027 push, 39750186500 pull_request: `typecheck` + `lint` pass)
- [ ] Manual smoke test of the areas listed under risks

## Progress log

- 2026-10-22: Measured the baseline and split the work into three groups.
- 2026-10-22: All three groups fixed and the diffs reviewed. Decisions:
  - **Real fixes**:
    - Typed `any` with mapbox/react-map-gl, GeoJSON, `types/api.d.ts` and react-query inferred `Error` types.
    - Wrapped the `?? []` deps in `useMemo` (businesses-page, inspection-form-modal).
    - Added the stable `setPolygonGeometry` (a `useCallback` over react-hook-form `setValue`) to deps in ZoneCreate/ZoneEdit/ParcelCreate.
    - ZoneCreateCard draw-control effect now reads `polygonGeometryRef` (same pattern as the existing `activeTabRef`) instead of adding the dep, which would rebuild draw on every edit.
    - search-sheet-overlay resets the query during render ("adjust state when props change") instead of in an effect.
    - complaints/track mock id suffix now comes from a lazy `useState`, so render is pure.
  - **Targeted disables (7, each with a written reason)**:
    - `Guards.tsx` ×2: post-mount hydration flag.
    - `e-map-page.tsx` ×3: these were previously masked by blanket `exhaustive-deps` disables; selection state is driven by async pins and imperative `flyTo`.
    - `admin-form-modal` / `master-data-modal` ×2: adding `agencies` would wipe form input on refetch, and its `= []` default is a new array each render.
    - officer inspection `<img>` ×2: dynamic presigned/proxy evidence URLs that need the session cookie.
  - **Dead code removed**:
    - Unused imports and state.
    - Navbar `NotificationsPanel`, `useMarkAllRead`, `unreadCount` and `LicenseListItem`. The `useNotifications()` call is kept so the existing fetch is unchanged.
    - `isMapReady` state in ZoneEdit/ParcelCreate (never read).
  - **Config**: file-scoped override for `scripts/**/*.js` (CommonJS `require`). No rules were relaxed for app code.
  - **Minor known differences**:
    - The complaints mock id is now stable per visit.
    - The PinManageCard delete toast uses the fallback text for non-`Error` throwables.
    - Up to one fewer render in the map modals and the search sheet.
- 2026-10-22: Follow-up on `onComplaintsClick`. History shows the home complaints entry has been an external link to `https://www.1111.go.th/` since `0998d80`, when the component was created. The prop was never wired, so this was not a regression. With the in-app complaints flow out of Prisma scope (AGENTS.md), the user chose to keep the 1111 link and remove the dead wiring: the `onComplaintsClick` prop in `home-service-list.tsx` / `homepage-service.tsx`, the sheet state and `ComplaintsSheetOverlay` in `home-dashboard.tsx`, and `components/shared/complaints-sheet-overlay.tsx` (no other users). The mock pages `/complaints/new` and `/complaints/track` are kept but now have no in-app entry point. Lint, typecheck and build passed.
- 2026-10-22: The user asked for the complaints pages to be removed as well. Deleted `app/(app)/complaints/{new,track}/page.tsx` and the `/complaints` branch in the navbar back-button condition. `/complaints/*` now returns 404. The map pin `ComplaintIcon` / `complaint` pin category is a separate map feature and is kept. No complaints API exists in `types/api.d.ts`.

## Changed files

- Map: `app/map/page.tsx`, `components/map/{ExistingPinsLayer,MapPopup,MapTools,ParcelCreateModal,PinManageCard,ZoneCreateCard,ZoneEditCard,ZoneInfoPanel,ZoneManageCard}.tsx`, `components/map/pin-form/{PinFormCard,PinFormMapPreview,PinFormSidebar}.tsx`, `components/map/pin-form/hooks/{submit-pin-form,useMapDrawControls}.ts`, `hooks/useExistingPins.ts`
- Admin: `components/super-admin/{admin-form-modal,connections-dashboard,master-data-modal,master-data-table,stat-card}.tsx`, `components/admin/inspection-form-modal.tsx`
- App/shared: `app/(app)/{complaints/new,complaints/track,officer-card,officer/inspections/[inspectionId],profile}/page.tsx`, `components/app-shell/app-navbar.tsx`, `components/app/businesses/businesses-page.tsx`, `components/app/home/{home-dashboard,home-service-list}.tsx`, `components/app/licenses/license-list-page.tsx`, `components/app/map/e-map-page.tsx`, `components/auth/Guards.tsx`, `components/shared/search-sheet-overlay.tsx`, `components/ui/tooltip.tsx`, `scripts/generate-pin-icons.js`, `eslint.config.mjs`
- Complaints follow-up: `components/app/home/{home-service-list,homepage-service,home-dashboard}.tsx`, `components/shared/complaints-sheet-overlay.tsx` (deleted), `app/(app)/complaints/**` (deleted), `components/app-shell/app-navbar.tsx`
- CI: `.github/workflows/typecheck.yml` renamed to `.github/workflows/ci.yml` (jobs `typecheck`, `lint`)

## Open questions and risks

- Manual smoke test recommended:
  - Zone create/edit and parcel create drawing (draw, edit, switch tabs).
  - Search sheet open/reopen with an initial query.
  - Super-admin master data create/edit for each category.
  - Inspection form modal officer/business selection.
- `master-data-table.tsx` narrows create payloads with type assertions (`as AgencyItem` etc.). A discriminated union would be stricter but is a larger refactor.
- `pin-schema.ts` still declares `points: z.array(z.any())`. ESLint does not flag it, but it is untyped.
- ~~`home-service-list.tsx` receives `onComplaintsClick` but never wires it.~~ Resolved 2026-10-22: not a missing button (see progress log).
- `useNotifications()` in the navbar fetches data that nothing displays. Remove it if the extra request is unwanted.
- e-map selection effects (3 disables) are worth a selection-state refactor later.

- Hook-dependency changes in the map drawing components (ZoneCreateCard, ZoneEditCard, ParcelCreateModal) and the auth guards can affect runtime behavior and need manual testing.
