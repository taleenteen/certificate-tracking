# Frontend Directory Structure

> **Canonical reference** — all AI agents (Gemini, Claude) must follow this layout.
> Last updated: 2026-06-17 (de-dup consolidation; `src/` removed).

---

## Directory map

```
certificate-tracking/           ← repo root (single tree, no src/)
├── app/                        ← Next.js App Router: pages, layouts, route handlers
│   └── api/[...path]/          ← BFF catch-all proxy (server-side only)
├── components/
│   ├── ui/                     ← shadcn/ui primitives (Button, Card, Dialog…)
│   ├── back-office/            ← back-office feature components
│   ├── map/                    ← map/geo feature components
│   ├── shared/                 ← cross-feature shared components
│   ├── icons/                  ← icon wrappers
│   ├── auth/                   ← auth UI: Guards, LoginForm, RegisterForm
│   └── providers/              ← root React providers (QueryClient, ThemeProvider)
├── hooks/                      ← React hooks (data-fetching, auth, domain logic)
├── lib/                        ← pure utilities: utils.ts, dayjs.ts, http.ts
├── server/                     ← server-only BFF code (never imported by Client Components)
│   └── backend.ts              ← cookie helpers, token harvest, refresh logic
├── stores/                     ← Zustand client state (display-only, no tokens)
│   ├── auth.ts                 ← user, activeJuristicId, juristicRole
│   └── useMapStore.ts
├── services/                   ← typed API service functions (thin wrappers over http)
├── types/                      ← shared TypeScript interfaces / enums
├── utils/                      ← standalone utility functions
├── constants/                  ← app-wide constants
├── assets/                     ← static assets (images, fonts)
├── styles/                     ← global CSS / Tailwind layers
└── packages/                   ← local packages / shared code
```

---

## Where does X go?

| What you're building | Directory |
|---|---|
| A route / page | `app/<route>/page.tsx` |
| A layout | `app/<route>/layout.tsx` |
| A BFF Route Handler (server ↔ backend proxy) | `app/api/<path>/route.ts` |
| A shadcn/ui primitive | `components/ui/` |
| A feature-specific component | `components/<feature>/` |
| A cross-feature shared component | `components/shared/` |
| An auth UI component (forms, guards) | `components/auth/` |
| A root provider wrapping `<html>` | `components/providers/` |
| A React data-fetching or domain hook | `hooks/` |
| A pure utility / formatter / helper | `lib/` |
| **Server-only** BFF code (cookies, tokens) | `server/` |
| Zustand store | `stores/` |
| Typed API contract / interface | `types/` |

---

## Hard rules

### 1. Single root tree — never create `src/`
There is **no** `src/` directory. Everything lives directly under the repo root. Any
tool (Gemini, Claude, scaffolders) that creates a `src/` directory is creating a
duplicate tree. Move those files to root immediately.

### 2. Always use the `@/` alias — never deep relative imports
```ts
// ✅ correct
import { http } from '@/lib/http';
import { useAuthStore } from '@/stores/auth';

// ❌ wrong — breaks when files move
import { http } from '../../../lib/http';
```

The alias resolves `@/* → ./*` (repo root). Configured in `tsconfig.json`.

### 3. `server/` is server-only
Files in `server/` use Node.js APIs (`cookies()`, `headers()`) and must **never** be
imported by a Client Component (`'use client'`). The catch-all BFF proxy at
`app/api/[...path]/route.ts` is the only consumer.

### 4. All backend calls go through the BFF proxy
No component or hook calls the backend directly. Every backend request flows through
`/api/<path>` (a Next.js Route Handler in `app/api/`). The browser client `lib/http.ts`
calls same-origin `/api/*`; the server-side proxy (`server/backend.ts`) forwards to
`BACKEND_INTERNAL_URL` and manages `access_token` / `refresh_token` httpOnly cookies.

### 5. Tokens never touch the client
`accessToken` and `refreshToken` are **not** stored in Zustand or localStorage. The
BFF proxy harvests them from the backend JSON response and sets them as httpOnly
cookies. The auth store holds display-only state: `user`, `activeJuristicId`,
`juristicRole`.

### 6. Mandatory cache clear on context switch
After `POST /auth/context` (tenant switch), call `queryClient.clear()` before any
new queries. All cached data is tenant-scoped; mixing caches causes data leakage.

---

## Key files quick-reference

| File | Purpose |
|---|---|
| `app/api/[...path]/route.ts` | BFF catch-all proxy — handles GET/POST/PUT/PATCH/DELETE |
| `server/backend.ts` | Cookie helpers, token harvest, auto-refresh on 401 |
| `lib/http.ts` | Browser HTTP client — calls same-origin `/api/*` |
| `stores/auth.ts` | Zustand auth state (display-only) |
| `hooks/useAuth.ts` | `useLogin`, `useRegister`, `useLogout`, `useSwitchContext` |
| `hooks/useSession.ts` | `useSessionHydration` — restores session on mount |
| `components/auth/Guards.tsx` | Route protection wrappers |
| `components/providers/Providers.tsx` | Root provider tree |
