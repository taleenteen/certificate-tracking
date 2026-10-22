# Frontend Implementation Status

> Audience: AI coding agents (Gemini, Claude) continuing this repository.
>
> Last reviewed: 2026-06-16
>
> Operating rules: `GEMINI.md` (repo root)
> Detailed integration plan: backend repo `docs/FRONTEND_GUIDE_AI.md`
> API contract: `openapi.json` (regenerate on backend: `npm run swagger:export`)
>
> This document records what has been built, fixed, or decided in this frontend
> repo. It does not replace the integration plan. When this doc conflicts with
> `FRONTEND_GUIDE_AI.md`, the plan wins — update this doc instead.

---

## 0. Change Log

- **2026-07-08 (officer inspection report list)** — Rewired `/reports` from the
  legacy `InspectionTask` query to officer field inspection reports via
  `GET /api/officer/inspections`, added `/officer/inspections/[inspectionId]`
  detail/export UI, redirected successful officer report submission to
  `/reports`, and documented the new list contract. Verified `bunx tsc
  --noEmit` and `bun run build`; broad lint still has unrelated existing debt.

- **2026-06-17 (Build roadmap — sequenced plan to finish backend integration)** —
  Created `docs/FRONTEND_BUILD_ROADMAP.md`: the executable checklist for the remaining
  work. State: backend 100% complete; frontend foundation built; only `/licenses`
  list is wired (the reference pattern). Roadmap sequences **Phase 0** (close
  foundation gaps: session hydration never invoked, no route protection, no typed
  contract) → **Phase C** (wire 8 wireframe pages) → **Phase D** (4 new surfaces:
  profile, juristic portal, join requests, supervisor review). Implementation handed
  off to Sonnet.

- **2026-06-17 (Folder consolidation — `src/` removed, single root tree)** —
  Deleted the duplicate `src/` directory tree. All files moved to repo root:
  `src/components/auth/` → `components/auth/`, `src/components/providers/` →
  `components/providers/`, `src/hooks/` → `hooks/`, `src/lib/http.ts` →
  `lib/http.ts`, `src/server/backend.ts` → `server/backend.ts`,
  `src/stores/auth.ts` → `stores/auth.ts`. `tsconfig.json` alias simplified:
  `"@/*": ["./src/*", "./*"]` → `"@/*": ["./*"]`. `tsc --noEmit` = 0 errors.
  Canonical layout documented in `docs/FRONTEND_STRUCTURE.md`.

- **2026-06-16 (BFF — all backend traffic moves server-side under `/api/*`)** —
  Established the rule: the browser never calls the backend directly and never
  holds a token. All traffic flows **browser → same-origin `/api/<path>` → BFF
  proxy → backend**, with tokens stored in httpOnly cookies set server-side.

  **Solid function built (the foundation Gemini extends):**
  - `app/api/[...path]/route.ts` — catch-all proxy. Forwards every method/endpoint
    to `BACKEND_INTERNAL_URL/api/<path>`, injects `Authorization: Bearer` from the
    httpOnly `access_token` cookie, auto-refreshes once on 401 via the `refresh_token`
    cookie, and harvests any tokens out of auth-response bodies into httpOnly cookies
    (stripping them from the body returned to JS). One file covers all endpoints —
    no per-endpoint route handlers.
  - `server/backend.ts` — server-only core: cookie names/options, `backendUrl()`,
    `harvestTokens()`, `clearAuthCookies()`, `refreshTokens()`. Never import from a
    Client Component.
  - `lib/http.ts` — browser client (`http.get/post/put/patch/delete`). Path is
    relative to `/api` (`http.get("my/profile")` → `GET /api/my/profile`). Throws
    `ApiError` on non-2xx. Wrap in React Query hooks.

  **Config:** added `BACKEND_INTERNAL_URL` (server-only, no `NEXT_PUBLIC_`) to
  `.env.local`. The old `lib/api.ts` (direct axios) is **deleted** — use `@/lib/http`.

  **Verified end-to-end against the running backend (3001) via the dev proxy (3003):**
  - `POST /api/auth/tang-rat` (mock-public-owner) → 201, body returned to browser is
    `{"user":{…}}` with **both tokens stripped**; `access_token` (772-char JWT) and
    `refresh_token` (128-char) set as **HttpOnly** cookies.
  - `GET /api/my/profile` with **only the cookies** (no client Bearer) → 200 with the
    profile (and `citizenIdLast4` only — full ID never exposed). The proxy injected
    the Bearer server-side.
  - `npm run build` clean; `/api/[...path]` registered as a dynamic route.

- **2026-06-16 (Hydration fix — ChartContainer explicit `id`)** — Fixed a React
  hydration mismatch on `/home` that logged a tree-mismatch error in the browser
  console and caused `data-chart` values to differ between SSR and CSR.

  **Root cause:** `BackOfficeNavbar` calls `useSearchParams()`, which forces Next.js
  App Router to render the `Suspense` fallback (`NavbarFallback`) during SSR instead
  of the real navbar. On the client, the full `BackOfficeNavbar` renders — including
  `QrScannerDialog` → Radix UI `Dialog`, which calls `useId()` 3 times unconditionally
  (`contentId`, `titleId`, `descriptionId`). This shifts the React `useId` counter so
  that `ChartContainer`'s `React.useId()` lands at a different offset on the client
  than on the server, producing mismatched `data-chart` attribute values
  (`chart-_R_lpbn5rl5rlb_` vs `chart-_R_2n9bn5rl5rlb_`).

  **Fix:** Passed `id="home-inspection-trend"` to the `ChartContainer` in
  `components/back-office/home-dashboard.tsx:290`. `ChartContainer` already accepts
  `id` (inherited from `React.ComponentProps<"div">`): `chartId = \`chart-${id || uniqueId}\``,
  so an explicit `id` bypasses `useId()` entirely.

  **Rule added to `GEMINI.md`:** Every `ChartContainer` in this repo **must** receive
  an explicit `id` prop. Never rely on the `useId()` fallback — the navbar structure
  guarantees the counter will be offset on any page that includes `BackOfficeShell`.

  Verified: `npm run build` clean (14/14 static pages), SSR output contains
  `data-chart="chart-home-inspection-trend"` (stable on server and client).

---

## 1. Current State

### Phase A — Audit
- `frontend-audit.md` exists at repo root (generated by Gemini).
- Status: wireframe-only for most routes. See that file for per-route breakdown.

### Phase B — Foundation
| Piece | Status | Notes |
|---|---|---|
| **BFF proxy** (`app/api/[...path]/route.ts` + `server/backend.ts`) | **done** | Catch-all; injects auth from httpOnly cookies, refresh-on-401, token harvesting. Verified e2e. |
| **Browser client** (`lib/http.ts`) | **done** | `http.get/post/...`, same-origin `/api/*`, throws `ApiError`. |
| `lib/api.ts` (direct axios) | **deleted** | Gone; `@/lib/http` is the only HTTP client. |
| Auth + juristic context (`stores/auth.ts` + session context) | **partial** | Holds display-only user/role state for UI. Active juristic/business context is tab-isolated through `sessionStorage` via Zustand persist, not `localStorage`. URL-scoped business context should be preferred where practical. No `accessToken` field (token is a server cookie). |
| `useSwitchContext` hook | **pending** | Wrap `http.post("auth/context", { juristicId })` + `queryClient.clear()`. |
| React Query provider + tenant-scoped keys | **partial** | `Providers.tsx` has `QueryClientProvider`; keys not yet tenant-scoped; `queryClient` is module-level (fix per §2). |
| `openapi-typescript` contract types | **pending** | `npm run gen:api` not yet wired |
| `RoleGate` + `JuristicGate` | **pending** | Not yet built |
| `/dev-login` (4 auth paths) | **exists** — wireframe-only | At `/dev-login`; wire to `http.post("auth/{tang-rat,login,self}")`. |

### Phase C — Original wireframe pages
All routes remain `wireframe-only` (static mock data). Wiring not started.

### Phase D — New D5/D6/D7 surfaces
Not started. Missing pages: `/profile`, `/juristic/*`, `/juristic-requests/*`.

---

## 1a. Architecture — BFF data flow

```
  Component (client)
    └─ React Query hook (hooks/*)
         └─ http.get/post(...)            ← @/lib/http, same-origin /api/*
              │  (httpOnly cookies ride along automatically)
              ▼
  app/api/[...path]/route.ts              ← Next.js Route Handler (server)
    ├─ read access_token cookie → add Authorization: Bearer
    ├─ on 401 (non-auth): refreshTokens() via refresh_token cookie, retry once
    ├─ harvest accessToken/refreshToken out of JSON bodies → httpOnly cookies
    └─ fetch → BACKEND_INTERNAL_URL/api/<path>
                  │
                  ▼
            NestJS backend (e-license API)
```

**Invariants:**
- Browser holds **no token**. `access_token` + `refresh_token` are httpOnly cookies
  set by the proxy; JS cannot read them (XSS-safe).
- Auth endpoints need no special-casing: any response body carrying `accessToken`/
  `refreshToken` is harvested into cookies and stripped before reaching JS.
- `BACKEND_INTERNAL_URL` is server-only (no `NEXT_PUBLIC_`) — backend origin never ships.
- Adding an endpoint = call `http.<verb>("<path>")`; the proxy already covers it.

## 2. Known Constraints and Gotchas

### SSR / Hydration
- **`ChartContainer` requires explicit `id`** — see Change Log 2026-06-16 above.
  The counter offset applies to every page rendered inside `BackOfficeShell` because
  `BackOfficeNavbar` always contributes 3 extra `useId()` calls on the client.

### `Providers` module-level `queryClient`
- `components/providers/Providers.tsx` creates `queryClient` at module level.
  This is fine for the browser but leaks between requests in SSR (each request should
  get a fresh `QueryClient`). When wiring Phase B, move `queryClient` inside a
  `useState` initializer or `useRef` inside the `Providers` component.

### `BackOfficeNavbar` + `useSearchParams`
- The navbar uses `useSearchParams()` and is wrapped in `<Suspense>` in
  `BackOfficeShell`. The fallback (`NavbarFallback`) is shown during SSR.
  Do not add any hooks that depend on server/client symmetry inside `BackOfficeNavbar`
  without accounting for the Suspense dehydration on SSR.

### Auth
- There is no `/auth/me`. Session hydration = `GET /my/profile`. See `GEMINI.md`.
- Context switch (`POST /auth/context`) returns a **new** access token. The old token
  is invalidated. Swap in store AND `queryClient.clear()` before navigating.
