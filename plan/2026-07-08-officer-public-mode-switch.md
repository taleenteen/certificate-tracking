# Officer/Public Mode Switch

## Status

Verified

## Owner

AI agent

## Date created and last updated

Created: 2026-07-08
Last updated: 2026-07-08

## Objective

Allow users with the `officer` role to choose between normal user features and officer features after login, and switch modes later from the profile menu.

## Context and constraints

- Frontend role gating is UX only; backend authorization remains the security boundary.
- Real user roles must not be changed when switching UI modes.
- Session state is tab-scoped through the existing Zustand sessionStorage auth store.
- Existing admin/super-admin login routing should remain unchanged.

## Scope

- Add active portal mode to frontend auth state.
- Route officer users to a role selection page after login.
- Skip selection for users without officer/admin roles and send them to normal user mode.
- Add profile-menu action to switch between normal user and officer feature modes.
- Make home/dashboard use active mode instead of raw roles for public/officer UI.

## Out of scope

- Backend role or permission changes.
- Admin back-office flow changes.
- New persistent database preferences.

## Proposed workflow

1. Login succeeds.
2. Admin tier continues to back-office.
3. Officer users go to `/role-select`.
4. Public-only users go to `/home?entry=public`.
5. Officer users can switch mode later from the navbar profile dropdown.

## Security and permission considerations

- The selected mode only changes frontend presentation.
- Officer-only API calls are still protected by backend roles.
- Public mode must not remove officer role claims from the session.

## Implementation checklist

- [x] Add active portal mode to `stores/auth.ts`.
- [x] Update login/register/DGA routing.
- [x] Add `/role-select` page.
- [x] Update navbar profile dropdown switch action.
- [x] Update dashboard data selection and UI mode.
- [x] Validate typecheck, lint, and build.

## Validation checklist

- [x] `bunx tsc --noEmit`
- [x] targeted ESLint
- [x] `bun run build`
- [ ] Manual browser verification, if available

## Progress log

- 2026-07-08: Plan created; implementation started.
- 2026-07-08: Added session-scoped portal mode, role selection page, post-login routing, profile-menu mode switch, and dashboard mode handling.
- 2026-07-08: Verified with TypeScript, targeted ESLint, and production build. Targeted ESLint still reports pre-existing unused notification warnings in `AppNavbar`.
- 2026-07-08: Corrected officer mode to reuse the normal `HomepageService` UI with officer-specific feature cards instead of showing the legacy officer dashboard layout.

## Changed files

- `stores/auth.ts`
- `hooks/useAuth.ts`
- `hooks/useDashboard.ts`
- `app/(app)/role-select/page.tsx`
- `components/app-shell/app-navbar.tsx`
- `components/app/home/home-dashboard.tsx`
- `plan/2026-07-08-officer-public-mode-switch.md`
- `plan/README.md`

## Open questions and risks

- Manual role-flow verification depends on available seeded officer/public users.
- `components/app-shell/app-navbar.tsx` has existing unused notification warnings unrelated to this feature.
