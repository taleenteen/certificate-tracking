# DGA OIDC Login Flow

Status: Verified
Owner: Codex
Date created: 2026-07-02
Last updated: 2026-07-02

## Objective

Add frontend routes for the real DGA Digital ID / Tang Rat OIDC login/logout
flow: `/auth/dga` starts login, `/auth/login-callback` receives `code` and
`state`, then calls the backend BFF endpoints. `/auth/logout-callback` completes
Digital ID logout after DGA redirects back.

## Context and constraints

- All backend calls must go through the same-origin BFF proxy under `/api/*`.
- Tokens must remain httpOnly and must not be stored in browser state.
- The backend exposes `POST /api/auth/dga/authorize` and
  `POST /api/auth/dga/callback`.
- Registered callback URL is `/auth/login-callback`.
- DGA logout is initiated by the existing `POST /api/auth/logout` endpoint. The
  frontend redirects to `endSessionUrl` only when the backend returns it.

## Scope

- Add a DGA login start page.
- Add a DGA login callback page.
- Add a DGA logout callback page.
- Add typed auth hook functions for authorize/callback.
- Extend logout hook behavior for optional DGA end-session redirect.
- Update auth login UI to provide an entry point.

## Out of scope

- Changing backend DGA OIDC behavior.
- Adding direct calls to DGA from the browser.

## Proposed workflow

1. User opens `/auth/dga` or clicks login through ทางรัฐ.
2. Frontend calls `POST /api/auth/dga/authorize`.
3. Frontend redirects to `authorizeUrl`.
4. DGA redirects back to `/auth/login-callback?code=...&state=...`.
5. Frontend validates callback params exist and calls `POST /api/auth/dga/callback`.
6. BFF harvests tokens into httpOnly cookies; auth store saves display-only user.
7. User is routed according to role.
8. On logout, frontend calls `POST /api/auth/logout`.
9. If the backend response includes `endSessionUrl`, frontend clears local state
   and redirects the browser to DGA.
10. DGA redirects back to `/auth/logout-callback`; the page shows a logged-out
   state and asks the user to login again.

## Security and permission considerations

- Frontend stores only transient `state` in `sessionStorage`.
- Frontend never stores access/refresh tokens.
- Frontend never handles `DGA_OIDC_CLIENT_SECRET`.
- Callback sends `redirectUri` matching the route URL used at authorize time.
- Logout clears app cookies/state before leaving for DGA end-session.

## Implementation checklist

- [x] Add auth hook methods for DGA authorize and callback.
- [x] Create `/auth/dga` page.
- [x] Create `/auth/login-callback` page.
- [x] Add a ทางรัฐ/DGA button to login UI.
- [x] Add frontend DGA callback URL environment variable.
- [x] Route logout through optional backend-provided `endSessionUrl`.
- [x] Create `/auth/logout-callback` page.
- [x] Update plan index.

## Validation checklist

- [x] `bunx tsc --noEmit`
- [x] `bun run build`
- [x] `GET /auth/dga` returns HTTP 200 on local dev server.
- [x] `POST /api/auth/dga/authorize` through the BFF returns `authorizeUrl`,
  `state`, and `expiresAt` from the backend.
- [ ] `bun run lint` is clean. It still fails on pre-existing unrelated project
  lint debt, including `Math.random()` in render and multiple
  `@typescript-eslint/no-explicit-any` violations outside this DGA change.

## Progress log

- 2026-07-02: Plan created.
- 2026-07-02: Added DGA authorize/callback hooks, `/auth/dga`,
  `/auth/login-callback`, login UI entry point, and frontend callback env.
- 2026-07-02: Verified TypeScript, production build, `/auth/dga` route, and BFF
  authorize request. Full lint is blocked by unrelated existing lint debt.
- 2026-07-02: Updated requested DGA scope to
  `openid citizen_id given_name family_name`.
- 2026-07-02: Hardened callback handling so the frontend requires the stored
  DGA state and redirect URI before sending `code` to the backend. Direct
  callback URLs without a matching browser session now fail locally.
- 2026-07-02: Added DGA logout handling: `useLogout` follows backend
  `endSessionUrl` when present, otherwise it returns to `/auth/login`; added
  `/auth/logout-callback`.

## Changed files

- `hooks/useAuth.ts`
- `app/auth/dga/page.tsx`
- `app/auth/login-callback/page.tsx`
- `app/auth/logout-callback/page.tsx`
- `components/auth/LoginForm.tsx`
- `.env.example`
- `.env.local`
- `plan/README.md`
- `plan/2026-07-02-dga-oidc-login-flow.md`

## Open questions and risks

- Real DGA callback can only be fully tested when the registered domain is
  reachable by DGA and backend UAT credentials are valid.
- Localhost testing will redirect back to the registered
  `NEXT_PUBLIC_DGA_REDIRECT_URI`. To complete a real local callback, DGA must
  also register a localhost callback URL or the environment variable must point
  at a reachable callback domain handled by this frontend.
