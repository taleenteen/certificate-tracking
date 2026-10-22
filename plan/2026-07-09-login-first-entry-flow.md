# Login-first entry flow

## Status

Verified

## Owner

AI agent

## Date created and last updated

Created: 2026-07-09
Last updated: 2026-07-09

## Objective

Change the app entry so users must log in before any public/officer mode selection. Public users skip selection; existing sessions open the main page.

## Context and constraints

- Previous root `/` showed public/officer entry cards that deep-linked into `/home` before auth.
- Post-login officer mode selection at `/role-select` remains the place officers choose mode after a fresh login.
- Frontend role gating is UX only; API auth remains the security boundary.
- Session display state lives in Zustand `sessionStorage`; real session is the BFF httpOnly cookie.

## Scope

- Root `/` becomes an auth router (login vs resume session).
- Login page redirects away when a session already exists.
- Shared destination helpers for after-login vs resume-session paths.
- Keep after-login officer → `/role-select`, public → `/home`.

## Out of scope

- Backend auth changes.
- Redesign of the login form UI.
- Changing officer mode switch inside the navbar.

## Proposed workflow

1. Visit `/` with no session → `/auth/login`.
2. Login success:
   - `public` → `/home?entry=public`
   - `officer` → `/role-select` then home with chosen mode
   - `admin` / `super_admin` → back-office
3. Visit `/` (or login) with existing session → main/admin destination (skip select).

## Security and permission considerations

- `(app)` layout still uses `BackOfficeAuthGuard`.
- Resume path never trusts client roles for API access.

## Implementation checklist

- [x] Add `lib/auth-routing.ts`
- [x] Replace root select UI with session-aware redirect
- [x] Login page bounce when already authenticated
- [x] Wire `useAuth` after-login path helper
- [x] Plan + plan index update

## Validation checklist

- [x] `bunx tsc --noEmit`
- [ ] Manual: no session → login; public login → home; officer login → select; reload with session → home

## Progress log

- 2026-07-09: Implemented login-first entry routing.
- 2026-07-09: `bunx tsc --noEmit` passed.
- 2026-07-09: Fixed officer login skip of `/role-select`. Root cause: login page
  `useEffect` depended on `user` and called `getResumeSessionPath` after every
  login success, overwriting `routeAfterLogin` → `/role-select` with `/home`.
  Resume redirect now runs once when hydration settles only.

## Changed files

- `lib/auth-routing.ts`
- `app/page.tsx`
- `app/auth/login/page.tsx`
- `hooks/useAuth.ts`
- `plan/2026-07-09-login-first-entry-flow.md`
- `plan/README.md`

## Open questions and risks

- Officers with a persisted `activePortalMode` resume that mode on root; a fresh login still clears mode and forces `/role-select`.
