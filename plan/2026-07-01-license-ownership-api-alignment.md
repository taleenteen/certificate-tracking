# Plan: License Ownership API Alignment

- Status: `Verified`
- Owner: AI Agent
- Date created: 2026-07-01
- Last updated: 2026-07-01

## Objective

Align the Next.js frontend API calls and React Query caching keys with the updated specifications in `docs/FRONTEND_LICENSE_OWNERSHIP_API.md`.

## Context and constraints

- Avoid legacy query parameter paths on `my/licenses`.
- Enforce strict query keys: `['my-licenses', activeJuristicId ?? 'personal']`.
- Handle 403 context reset gracefully.

## Proposed changes

### 1. Update useLicenses Hook
- **[MODIFY] [useLicenses.ts](file:///hooks/useLicenses.ts)**:
  - Update `queryKey` to `['my-licenses', activeJuristicId ?? 'personal']`.
  - Remove `?mode=...` from `my/licenses` fetch.

### 2. Update Navbar Fallback Scanner Fetch
- **[MODIFY] [app-navbar.tsx](file:///components/app-shell/app-navbar.tsx)**:
  - Remove `?mode=...` from `my/licenses` fetch in scanner callback.

### 3. Handle 403 Context Reset
- **[MODIFY] [http.ts](file:///lib/http.ts)**:
  - Add 403 API response interception to clear active juristic context and redirect to `/home`.

## Implementation checklist

- [x] Modify `useLicenses.ts` hook.
- [x] Modify `app-navbar.tsx` scanner fallback query.
- [x] Modify `http.ts` request wrapper with 403 handler.
- [x] Update `plan/README.md` to reference this plan.

## Validation checklist

- [x] Compile check: `bunx tsc --noEmit` passes.
- [x] Linter check: `bunx eslint` passes on modified files.
- [x] Project Next.js build: `bun run build` compiles clean without issues.
