# Profile Logout Button Condition Alignment

- Status: Verified
- Owner: Antigravity
- Date created: 2026-09-23
- Last updated: 2026-09-23

## Objective

Analyze the logout button condition in the layout (`components/app-shell/app-navbar.tsx`), understand the session and capability constraints (specifically `canLogout`), and apply the same condition to the logout button on the Profile page (`app/(app)/profile/page.tsx`).

## Context and constraints

- In the application shell/layout (`components/app-shell/app-navbar.tsx`), the logout button inside `ProfilePanel` is conditionally rendered based on `canLogout` from `useAuthStore((s) => s.canLogout)`:
  ```tsx
  {canLogout && (
    <button onClick={onLogout} ...>ออกจากระบบ</button>
  )}
  ```
- `canLogout` indicates whether the active session allows user-initiated logout. For example, when running inside embedded environments (like the Tang Rat super app WebView with mToken authentication), logout from the app shell is disallowed (`canLogout: false`) because the hosting super app controls authentication lifecycle.
- In `app/(app)/profile/page.tsx`, the logout button was rendered unconditionally:
  ```tsx
  <button onClick={handleLogout} ...>ออกจากระบบ</button>
  ```
- If `canLogout` is false (and for Tang Rat users where `primaryChannel === "tang_rat"`, password change is also hidden), Card 3 should properly hide the logout button and avoid displaying an empty card if no actions are available.

## Scope

1. Document and explain the conditions governing logout in the layout.
2. Update `app/(app)/profile/page.tsx` to read `canLogout` from `useAuthStore` (and optionally `profile?.canLogout`).
3. Conditionally render the logout button using `{canLogout && ...}`.
4. Ensure the card container (Card 3) only renders if there is at least one active security/account action (`canLogout || profile?.primaryChannel !== "tang_rat"`).
5. Add `canLogout?: boolean;` to `ProfileResponse` in `hooks/useMyProfile.ts` if appropriate for type completeness.
6. Validate type checking and build with `bun`.

## Out of scope

- Redesigning the Profile page layout or changing colors/styling.
- Modifying backend `/api/auth/logout` behavior or Tang Rat OIDC end-session logic.

## Security and permission considerations

- Frontend UI gating for the logout button matches the session capability flag `canLogout`.
- Backend BFF proxy (`app/api/[...path]/route.ts`) already enforces `logoutAllowed !== false` when clearing cookies.

## Implementation checklist

- [x] Inspect and understand `canLogout` conditions in layout/navbar.
- [x] Add `canLogout?: boolean;` to `ProfileResponse` in `hooks/useMyProfile.ts`.
- [x] Update `app/(app)/profile/page.tsx` to subscribe to `canLogout` via `useAuthStore`.
- [x] Wrap the logout button in `{canLogout && ...}` on the Profile page.
- [x] Ensure Card 3 container only renders when `hasSecurityActions` is true.
- [x] Run `bun run build` / typecheck to verify no regression.

## Validation checklist

- [x] TypeScript check (`bunx tsc --noEmit`) passes cleanly.
- [x] Production build (`bun run build`) compiles cleanly.

## Progress log

- 2026-09-23: Created plan and analyzed layout condition `canLogout` from `useAuthStore` and `components/app-shell/app-navbar.tsx`.
- 2026-09-23: Implemented `canLogout` and `hasSecurityActions` gating in `app/(app)/profile/page.tsx` and updated `hooks/useMyProfile.ts`. Verified with `bunx tsc --noEmit` and `bun run build`.

## Changed files

- `plan/2026-09-23-profile-logout-condition.md`
- `plan/README.md`
- `hooks/useMyProfile.ts`
- `app/(app)/profile/page.tsx`

## Open questions and risks

- None. The condition is straightforward and directly aligns Profile with the Navbar.
