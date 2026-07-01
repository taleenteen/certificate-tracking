# Plan: Juristic License Groups Endpoint Integration

- Status: `Verified`
- Owner: AI Agent
- Date created: 2026-07-01
- Last updated: 2026-07-01

## Objective

Update the "My Licenses" page (`app/(app)/licenses/page.tsx` and `components/app/licenses/license-list-page.tsx`) to utilize the new read-only `GET /api/my/juristic-license-groups` endpoint for the juristic tab. This eliminates session context switching during basic license listing navigation.

## Context and constraints

- Respect App Router structure.
- Align query cache key: `['my-juristic-license-groups']`.
- Provide collapsable company groups.

## Proposed changes

### 1. Update list view component
- **[MODIFY] [license-list-page.tsx](file:///components/app/licenses/license-list-page.tsx)**:
  - Add collapsible lists grouped by company for the juristic tab.
  - Remove company switch dropdown header.

### 2. Update page container
- **[MODIFY] [page.tsx](file:///app/(app)/licenses/page.tsx)**:
  - Call both queries and pass to view component.
  - Disable automatic session context switches when viewing juristic tab.

## Implementation checklist

- [x] Modify `license-list-page.tsx` to handle personal list and juristic group lists.
- [x] Modify `page.tsx` to fetch both endpoints and pass lists down.
- [x] Update `plan/README.md` to reference this plan.

## Validation checklist

- [x] Compile check: `bunx tsc --noEmit` passes.
- [x] Linter check: `bunx eslint` passes.
- [x] Production build check: `bun run build` succeeds.
