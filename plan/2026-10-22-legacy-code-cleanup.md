# Legacy Code Cleanup

- Status: Verified
- Owner: agent (next decision: user/team)
- Created: 2026-10-22
- Last updated: 2026-10-22

## Objective

Remove legacy code with no remaining consumers, and move the expired-license list view out of `license-list-page.tsx` under a non-legacy name.

## Context and constraints

An audit of `legacy` names and old fallback code (2026-10-22) found:

- `axios` was declared in `package.json`, but nothing imported it.
- `NEXT_PUBLIC_API_URL` was set in `.env.example`, `Dockerfile` and both compose files, but nothing read it. Its comment described it as "only for the axios call sites".
- `package-lock.json` sat beside `bun.lock`, but the project uses bun only (AGENTS.md).
- `LegacyLicenseListPageView` and `EXPIRED_LICENSE_TABS` sat in a "Legacy ... for compatibility" block at the end of `license-list-page.tsx`, with an `import` placed mid-file. Their only consumer is `/expired-licenses`.

## Scope

Phase 2 (decided 2026-10-22, see progress log):

- Delete `/expired-licenses` (page, `expired-license-list-view.tsx`, navbar title entry). `/licenses` already filters expired / suspended (incl. `REVOKED`).
- Delete the whole `app/(legacy)` route group (11 redirect-only pages). Old URLs now return 404.

Phase 1:

- Remove `axios` (`bun remove axios`) and `package-lock.json`.
- Remove `NEXT_PUBLIC_API_URL` from `.env.example`, `Dockerfile`, `docker-compose.yml` and `docker-compose.example.yml`.
- Move the view to `components/app/licenses/expired-license-list-view.tsx` as `ExpiredLicenseListView`, with no change to its behavior.

## Out of scope

- ~~Whether `/expired-licenses` should be kept~~ and ~~the `app/(legacy)/*` redirect routes~~: both were decided and removed in phase 2.
- The legacy Tang Rat handoff redirects in `app/page.tsx` and `app/auth/login/page.tsx`. Keep them until DGA registration URLs are confirmed.
- The legacy WebView path in `hooks/useLicenseCopy.ts`. It is still needed, and the Huawei check is pending.
- Sharing the clipboard fallback with `license-document-export-dialog.tsx` `copyDiagnostic`.
- The pre-existing unused `toast` and `router` in `license-list-page.tsx`.

## Proposed workflow

1. Confirm there are no consumers with `git grep`.
2. Remove the dependency, env and lockfile.
3. Move the view and update the page import.
4. Run tsc, focused ESLint and the production build.

## Security and permission considerations

None. No auth, role or API paths changed. Removing an unused public env var reduces build-time surface.

## Implementation checklist

- [x] Remove `axios` and refresh `bun.lock`
- [x] Delete `package-lock.json`
- [x] Remove `NEXT_PUBLIC_API_URL` from env and Docker files
- [x] Move and rename the expired-license list view

## Validation checklist

- [x] `bunx tsc --noEmit`: pass
- [x] `bunx eslint` on the changed TSX files: 0 errors (2 pre-existing unused-var warnings in `license-list-page.tsx`)
- [x] `bun run build`: pass
- [ ] Deployment env: remove `NEXT_PUBLIC_API_URL` from server `.env` / CI variables (harmless if left in)

## Progress log

- 2026-10-22: Audit completed, then the phase-1 cleanup was implemented and validated on `release/v1`. Nothing has been committed yet. (Committed later in `e3001e4`, `0fb9253`, `b352c0a`.)
- 2026-10-22: Docs aligned. Removed `NEXT_PUBLIC_API_URL` from the README env samples (README.th now shows `BACKEND_INTERNAL_URL`) and pointed the component reference at `ExpiredLicenseListView`. Older plan files were left unchanged because they are history.
- 2026-10-22: Phase 2. Options considered: keep the redirects, move them to `next.config` `redirects()`, or delete them. The user chose deletion and said they do not want a `(legacy)` group kept. A repo-wide check found no references in links, navigation, middleware/proxy, `next.config.ts`, tests or `public/`. Tang Rat entry (`/`, `/auth/login`) is outside `(legacy)` and unchanged. The user was asked to check for external links (QR, email, DGA registration) and confirmed the deletion. Deleted `app/(legacy)` and `/expired-licenses`, then updated the navbar and docs. `bun run build` (no removed routes in output), `bunx tsc --noEmit` and ESLint on `app-navbar.tsx` (0 errors, 4 pre-existing warnings) passed.

## Changed files

- `package.json`, `bun.lock`, `package-lock.json` (deleted)
- `.env.example`, `Dockerfile`, `docker-compose.yml`, `docker-compose.example.yml`
- `components/app/licenses/license-list-page.tsx`
- `components/app/licenses/expired-license-list-view.tsx` (new)
- `app/(app)/expired-licenses/page.tsx`
- `README.md`, `README.th.md`, `docs/AI_PROJECT_SURFACE_COMPONENT_REFERENCE.md`
- Phase 2: `app/(legacy)/**` (deleted), `app/(app)/expired-licenses/page.tsx` (deleted), `components/app/licenses/expired-license-list-view.tsx` (deleted), `components/app-shell/app-navbar.tsx`, `docs/FRONTEND_BUILD_ROADMAP.md`

## Open questions and risks

- Bookmarks of prototype-era URLs (`/dashboard`, `/my-licenses`, `/establishment`, etc.) now 404. The user accepted this; if one is needed again, add it to `next.config.ts` `redirects()` rather than restoring a route group.

- If an external build pipeline passes `--build-arg NEXT_PUBLIC_API_URL`, Docker prints an unused-arg warning but does not fail.
- `bun.lock` re-hoisted `https-proxy-agent` (5.0.1 → 7.0.6, previously nested under `@redocly/openapi-core`). The build passed, but `bun run gen:api` was not run.
