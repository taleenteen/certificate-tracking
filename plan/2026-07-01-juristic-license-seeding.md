# Plan: Juristic License Seeding

- Status: `Verified`
- Owner: AI Agent
- Date created: 2026-07-01
- Last updated: 2026-07-01

## Objective

Integrate the newly added developer endpoint `POST /api/my/dev/seed-juristic-license-demo` to seed mock juristic data for prototype testing, and show a developer seed button in the juristic tab.

## Context and constraints

- Avoid showing the button in production (prototype/development scope).
- Invalidate query cache keys properly.

## Proposed changes

### 1. Update API hooks
- **[MODIFY] [useLicenses.ts](file:///hooks/useLicenses.ts)**:
  - Add `useDevSeedJuristicLicense` mutation hook.

### 2. Update page container
- **[MODIFY] [page.tsx](file:///app/(app)/licenses/page.tsx)**:
  - Call the juristic seed hook.
  - Switch seed button rendering between tabs.

### 3. Update list view component
- **[MODIFY] [license-list-page.tsx](file:///components/app/licenses/license-list-page.tsx)**:
  - Render seed button container regardless of activeTab (parent controls content).

## Implementation checklist

- [x] Modify `useLicenses.ts` hook.
- [x] Modify `page.tsx` conditional rendering.
- [x] Modify `license-list-page.tsx` seeding container visibility.
- [x] Update `plan/README.md` to reference this plan.

## Validation checklist

- [x] Compile check: `bunx tsc --noEmit` passes.
- [x] Linter check: `bunx eslint` passes.
- [x] Production build check: `bun run build` succeeds.
