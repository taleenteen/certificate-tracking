# Homepage Service component migration

- Status: Verified
- Owner: AI agent
- Date created: 2026-06-30
- Last updated: 2026-06-30

## Objective

Create a new reusable `HomepageService` component for the public/citizen homepage service screen, replace the legacy inline public branch in `HomeDashboard`, and preserve existing interactions.

## Context and constraints

- Source design context comes from `figma/components-20260630.md` and `figma/main-flows-20260630.md`.
- The homepage has split behavior: public/citizen entry and officer/admin dashboard.
- Replace only the public `entry=public` homepage service surface.
- Keep existing scanner, search sheet, complaints sheet, and navigation behavior.
- Use current route naming: `/licenses`, `/e-map`, `/businesses`, `/verify-officer`, `/license-search`.

## Scope

- Add a new component under `components/app/home/`.
- Wire `HomeDashboard` to use the new component for `entry=public`.
- Remove duplicated public-homepage markup from `HomeDashboard`.
- Keep officer dashboard logic in place.

## Out of scope

- No backend/API changes.
- No route migration.
- No Figma write changes.
- No deletion of officer/admin dashboard code.

## Proposed workflow

1. Inspect current `HomeDashboard` public branch and dependencies.
2. Add a typed `HomepageService` component.
3. Replace inline public branch with the new component.
4. Run TypeScript validation.
5. Update plan with changed files and validation results.

## Security and permission considerations

- Frontend role split remains UX only.
- Existing QR verification still calls the BFF/API layer through `http`.
- Officer verification remains separate from `AuthProviderLink`.

## Implementation checklist

- [x] Inspect current homepage implementation.
- [x] Create new Homepage Service component.
- [x] Replace legacy public branch.
- [x] Remove now-unused imports/state from `HomeDashboard`.
- [x] Validate TypeScript.

## Validation checklist

- [x] `bunx tsc --noEmit` passes or result is documented.
- [x] Public homepage interactions remain wired.
- [x] Plan and README are updated.

## Progress log

- 2026-06-30: Started migration and inspected `HomeDashboard` public and officer branches.
- 2026-06-30: Added `HomepageService` component for the public/citizen homepage service UI.
- 2026-06-30: Replaced the legacy inline `entry=public` branch in `HomeDashboard` with the new component while keeping existing scanner/search/complaint overlays in the container.
- 2026-06-30: Removed unused public-only carousel/search imports and dead graphic components from `HomeDashboard`.
- 2026-06-30: Validation passed: `bunx tsc --noEmit` and `bunx eslint components/app/home/home-dashboard.tsx components/app/home/homepage-service.tsx`.
- 2026-06-30: Full `bun run lint` still fails from pre-existing project issues outside this change, including `complaints/track`, auth guards, map components, and super-admin files.
- 2026-06-30: User reported the component still did not match Figma node `1668:13698`. Figma MCP remained rate-limited for the new node, so the implementation was corrected against the previously retrieved `Homepage Service` metadata: single search row, single hero banner, 3 service shortcuts, and license status summary. Removed carousel, officer verification tile, complaints tile, and recent search cards from this component.
- 2026-06-30: Re-ran validation after the mismatch fix: `bunx tsc --noEmit` passed and file-scoped ESLint passed.
- 2026-06-30: Tried to reach `http://localhost:3003/home?entry=public` for rendered verification, but sandbox curl could not connect. User indicated a dev server is already running, so no new server was started.
- 2026-06-30: User clarified the correct Figma selection is node `1668:13696`: top hero section is the search section itself, followed by `บริการของเรา` and selectable service cards. Updated `HomepageService` to this structure and removed the license status summary from the public service component.
- 2026-06-30: Re-ran validation after the corrected selection update: `bunx tsc --noEmit` passed and file-scoped ESLint passed.

## Changed files

- `plan/2026-06-30-homepage-service-component.md`
- `plan/README.md`
- `components/app/home/homepage-service.tsx`
- `components/app/home/home-dashboard.tsx`

## Open questions and risks

- Visual verification in the already-running dev server is still recommended for `/home?entry=public`, using the actual port visible to the user's browser.
- Full project lint remains blocked by unrelated pre-existing lint errors.
- Figma MCP access to node `1668:13698` is still blocked by View-seat rate limit, so exact screenshot parity needs either rate-limit recovery or a screenshot from the user.
- Figma MCP access to node `1668:13696` is also blocked by the same View-seat rate limit; this pass follows the user's explicit description of that selected design.
