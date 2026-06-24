# Frontend Build Roadmap — finishing the backend integration

> **Audience:** the implementing agent (Sonnet / Gemini). This is the executable
> checklist for wiring the remaining wireframe pages to the live backend.
> **Created:** 2026-06-17
> **Companion docs:** `GEMINI.md` (rules) · `docs/FRONTEND_STRUCTURE.md` (where code
> goes) · `docs/FRONTEND_IMPLEMENTATION_STATUS.md` (change log) · backend
> `docs/FRONTEND_GUIDE_AI.md` (master integration plan) · `openapi.json` (contract).

---

## 0. Where we are

The **backend is 100% complete** — every endpoint below already exists in
`openapi.json` (~70 routes across auth, my, business, license, dashboard, inspection,
juristic, juristic-requests, notification, user, zone, export, audit, sync).

The **frontend foundation is built and verified**: BFF proxy, `@/lib/http`, auth
store, auth hooks, guards, React Query provider, login + dev-login. **One page is
fully wired** — `/licenses` list (`app/(back-office)/licenses/page.tsx` +
`hooks/useLicenses.ts`). **Treat it as the reference pattern; copy it.**

Everything else is still **wireframe + mock data**. This roadmap finishes it.

---

## 1. The reference pattern (copy this for every page)

Proven in `app/(back-office)/licenses/page.tsx` + `hooks/useLicenses.ts`:

```ts
// hooks/useThing.ts
import { useQuery } from '@tanstack/react-query';
import { http } from '@/lib/http';
import { useAuthStore } from '@/stores/auth';

export function useThing(id: string) {
  const activeJuristicId = getActiveJuristicIdFromSessionStorage();
  return useQuery({
    queryKey: ['thing', id, activeJuristicId],   // tenant-scoped key if context-aware
    queryFn: () => http.get<ThingResponse>(`things/${id}`),
  });
}
```

Then in the page (a `'use client'` component):
1. Call the hook; destructure `{ data, isLoading, isError }`.
2. Render **all 4 states**: loading / error+retry / empty (Thai message) / success —
   reuse the existing wireframe styling (see `my-licenses/page.tsx` for the markup).
3. Map API enums to existing UI status via a single map (see the `uiStatus` mapping in
   `my-licenses/page.tsx`).
4. **Delete the mock** (`components/back-office/license-data.ts` entries,
   `services/mock-map-data.ts`) in the same commit that wires the page.

**Rules that always apply** (see `GEMINI.md`):
- All backend calls go through `@/lib/http` (BFF). No inline `fetch`, no direct axios.
- Browser holds **no token**; tokens are httpOnly cookies managed by the proxy.
- Never render a full citizen ID — only `citizenIdVerified` + `citizenIdLast4`.
- After a context switch (`POST /auth/context`), `queryClient.clear()` — already
  handled inside `useSwitchContext` (`hooks/useAuth.ts`).
- Active juristic/business context must be tab-isolated in `sessionStorage`, not
  `localStorage`; prefer URL context such as `/businesses/[businessId]/licenses`.
- Backend APIs must revalidate juristic/business requests against `JuristicMember`.
- Use Prisma-aligned names: `Business`, `InspectionTask`, `Zone`/`UserZone`.
- `ChartContainer` must always get an explicit `id` prop (hydration rule).
- One page = one commit.

---

## 2. Phase 0 — Close foundation gaps (DO FIRST — blocks everything)

These three gaps mean a logged-in session is lost on refresh and the app is unguarded.

- [ ] **0.1 Wire session hydration.** Create `components/providers/auth-bootstrap.tsx`
      (`'use client'`) that calls `useSessionHydration()` (`hooks/useSession.ts`) once
      and renders `children`. Mount it inside `components/providers/Providers.tsx`
      (inside `QueryClientProvider`, since the hook uses React Query). Result: on boot
      the app calls `GET /my/profile` and restores `user`.
- [ ] **0.2 Route protection.** Guard `app/(back-office)/layout.tsx`: while hydration
      is pending show a loading state; once settled, if there is no `user`,
      `router.replace('/auth/login')`. (A small `'use client'` `AuthGuard` wrapper
      around `BackOfficeShell` is the cleanest spot.) Avoid the redirect flash.
- [ ] **0.3 Typed contract.** Add `openapi-typescript` (dev dep) + script
      `"gen:api": "openapi-typescript ../../Backend/certificate-tracking-backend/openapi.json -o types/api.d.ts"`.
      Run `npm run gen:api`. Migrate the hand-written interfaces (e.g. `LicenseResponse`
      in `hooks/useLicenses.ts`) to the generated types incrementally as you touch each hook.

**Phase 0 verification:** log in via `/dev-login` → refresh → still logged in; hit a
back-office route while logged out → redirected to `/auth/login`; `npm run gen:api`
produces `types/api.d.ts`; `npx tsc --noEmit` = 0.

---

## 3. Phase C — Wire existing wireframe pages (build order: public → inspector → supervisor)

| # | Page (file) | Hook → endpoint | Notes |
|---|---|---|---|
| C1 | `/home` — `components/back-office/home-dashboard.tsx` | `useDashboard()` → `GET /dashboard/{inspector\|supervisor\|admin}` (pick by role) | Stats tiles + trend chart. Keep `ChartContainer id="home-inspection-trend"`. |
| C2 | `/licenses/[slug]` — `components/back-office/license-detail-page.tsx` | `useLicense(id)` → `GET /licenses/{id}` | **RNG4:** `expiresAt === null` → "ไม่มีวันหมดอายุ (ชำระค่าธรรมเนียมรายปี)", never "Invalid Date". SUSPENDED → show `suspensionReason`. Docs via presigned URL; MinIO 403 → refetch detail. |
| C3 | `/businesses` + `/businesses/[businessId]` + `/businesses/[businessId]/licenses` | `useBusinesses()` → `GET /businesses`; `useBusiness(id)` → `GET /businesses/{id}` | Context-aware list. Active context belongs in `sessionStorage` and route params where practical. |
| C4 | `/license-search` | search input + `GET /licenses/{id}/qr-verify` | Debounce 400ms. QR scan: dynamic-import `ssr:false`; scanned text = license UUID → `/licenses/{id}`; invalid → Thai toast "QR ไม่ถูกต้อง". |
| C5 | `/expired-licenses` | reuse `useLicenses` filtered `status=EXPIRED` | Thin variant of the list page. |
| C6 | `/reports` — `components/back-office/reports-page.tsx` | `useInspectionTasks()` → `GET /inspection-tasks` | Inspection history; filter by status. |
| C7 | `/licenses/[slug]/inspection` | `useInspectionTask(id)` → `GET /inspection-tasks/{id}`; submit via `PUT /inspection-reports/{id}` + `PATCH .../submit`; photos `POST .../evidence`, `DELETE .../evidence/{docId}` | Checklist rendered from `checklistTemplate.items` (never hardcode). Photo client-validate ≤10MB jpeg/png/pdf. Submit disabled until `result` chosen. RETURNED task → show `reviewComment` banner. |
| C8 | `/map` + `/e-map` | `useBusinessesMap()` → `GET /businesses/map` | Mapbox is already wired to `services/mock-map-data.ts`; swap the data source. Pin color: ACTIVE green / SUSPENDED amber / EXPIRED red / else grey. "นำทาง" → Google Maps directions URL. |

**Per-page verification:** mock deleted (grep clean), all 4 states reachable, data
matches seed incl. edge rows (RNG4 null-expiry, SUSPENDED, RETURNED w/ comment).

---

## 4. Phase D — New surfaces (create as "missing pages", follow existing conventions)

| # | Surface | Endpoints | Gate / rules |
|---|---|---|---|
| D5 | `/profile` | `GET/PATCH /my/profile`, `POST/DELETE /my/identities/tang-rat`, `POST /my/credentials` | Auth required. **Never render full citizenId** — only `citizenIdVerified` badge + `citizenIdLast4`. Unlink must keep ≥1 sign-in method (handle 422). |
| D6 | Company switcher (in `BackOfficeNavbar`) + `/juristic/[id]` + members + invites | `GET /juristic`, `POST /auth/context` (use existing `useSwitchContext`), `GET /juristic/{id}`, `GET/POST/PATCH/DELETE /juristic/{id}/members*`, `/juristic/{id}/invites*`, `POST /juristic/invites/{token}/accept` | Member management behind `JuristicGate minRole="ADMIN"` and active context must match `[id]`. Respect last-owner protection (422). |
| D7 | `/juristic-requests` + `/juristic-requests/mine` + approval queues | `GET /juristic-requests/companies`, `POST /juristic-requests`, `GET /juristic-requests/mine`, `DELETE /juristic-requests/{id}`; peer: `GET /juristic/{id}/join-requests`, `POST .../{reqId}/{approve,reject}`; staff: `GET /juristic-requests/admin/first-owner-claims`, `POST /juristic-requests/admin/{reqId}/{approve,reject}` | Submit needs verified citizenId (422). Rate limits: 3/hr, 5 pending → 409. Peer queue behind `JuristicGate minRole="ADMIN"`; staff queue behind admin role. |
| D-sup | `/supervisor/reports/[id]/review` | `PATCH /inspection-reports/{id}/approve`, `PATCH .../return` (non-empty comment), `GET .../export` | `RoleGate roles={['supervisor']}`. After approve/return → invalidate task + report + dashboard queries. |

---

## 5. Definition of done

- [ ] Phase 0 complete (session persists, routes guarded, typed contract generated).
- [ ] Every Phase C page wired; zero hardcoded mock data remains (grep the audit's
      mock locations: `components/back-office/license-data.ts`, `services/mock-map-data.ts`).
- [ ] Every Phase D surface built and reachable.
- [ ] `/dev-login` works for all 4 auth paths; role-based redirect correct.
- [ ] Context switch clears the query cache and re-scopes data; switching to `null`
      returns to personal mode.
- [ ] RoleGate/JuristicGate enforce: a non-supervisor cannot see supervisor actions.
- [ ] `npm run gen:api && npm run build` pass with zero TypeScript errors.
- [ ] BFF smoke test green: `POST /api/auth/tang-rat` → cookies set, body has no
      tokens → `GET /api/my/profile` → 200.

---

## 6. Note on app shape

The actual wireframe is being realigned into a mobile-first app plus web-only back office.
Use Prisma-aligned business routes such as `/businesses`,
`/businesses/[businessId]`, and `/businesses/[businessId]/licenses` instead of
legacy `/businesses` routes. Other existing routes include `/home`,
`/licenses`, `/license-search`, `/e-map`, `/expired-licenses`, and `/reports`.
The **endpoints are the same**; map each back-office page to its endpoint per the
tables above. When in doubt, the contract (`openapi.json`) wins.
