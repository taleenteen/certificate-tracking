# AI Agent Working Agreement

This file is the project entrypoint for AI agents. Read it before changing code, docs, or plans.

## Required reading order

1. `AGENTS.md` — project-level agent workflow and safety rules.
2. `docs/FRONTEND_STRUCTURE.md` — current frontend structure and architectural rules.
3. `docs/AI_AGENT_REDESIGN_GUIDE.md` — redesign and revamp rules for existing screens.
4. `plan/README.md` — active plan index and implementation progress.
5. The specific plan file linked from `plan/README.md` for the task being handled.

## Planning workflow

Before implementing a meaningful feature, redesign, refactor, or cross-file change:

1. Create or update a task plan file in `plan/`.
2. Add the plan to `plan/README.md`.
3. Keep the plan status current while working.
4. Record implementation progress, validation results, and unresolved risks.
5. At handoff, update the plan with the final status and changed files.

Small one-line fixes may skip a dedicated plan file, but the agent must still explain the change clearly in the final response.

## Plan file naming

Use this format:

```text
plan/YYYY-MM-DD-short-task-name.md
```

Examples:

```text
plan/2026-06-23-portal-role-routing.md
plan/2026-06-23-license-card-migration.md
```

## Required plan sections

Every plan file should include:

- Status: `Planned`, `In Progress`, `Blocked`, `Implemented`, or `Verified`.
- Owner: agent/user/team responsible for the next action.
- Date created and last updated.
- Objective.
- Context and constraints.
- Scope.
- Out of scope.
- Proposed workflow.
- Security and permission considerations.
- Implementation checklist.
- Validation checklist.
- Progress log.
- Changed files.
- Open questions and risks.

## Progress rules

- Update progress after each meaningful phase, not only at the end.
- Do not mark a plan as `Implemented` unless code/docs were actually changed.
- Do not mark a plan as `Verified` unless relevant validation was run or a clear reason is documented.
- If validation cannot be run, record why and what should be run next.
- If a decision changes, keep the old rationale visible in the progress log instead of silently rewriting history.

## Engineering guardrails

- Preserve existing user work. Do not overwrite unrelated changes.
- Prefer small, reviewable changes.
- Keep role checks and permission checks centralized where possible.
- Treat frontend role gating as UX only. Backend/API authorization is the security boundary.
- For Next.js work, respect server/client component boundaries and avoid unnecessary client components.
- Route all backend calls through the project BFF/API layer already used by the app.
- Do not store access tokens in browser-persisted state.
- Clear or scope cached data when user context, juristic context, or active mode changes.
- Use `bun` (not `npm`) for all frontend command-line operations, package installations, and script runs (e.g., `bun install`, `bun run build`, `bun run lint`, `bun run gen:api`).


## E-License platform naming and tenancy alignment

Use `schema.prisma` as the source of truth. DBML v0.1 naming is deprecated and must not be used for new plans, routes, code, or docs.

Strict mapping:

| Deprecated concept | Current model / target | Frontend route guidance |
| --- | --- | --- |
| `establishments` | `Business` / businesses | `/businesses`, `/businesses/[businessId]`, `/businesses/[businessId]/licenses` |
| `work_orders` | `InspectionTask` | `/inspection-tasks` |
| `scope_nodes` | `Zone` / `UserZone` | `/admin/zones` or role-specific back-office zone management |
| `officer_digital_cards` | do not replace with `AuthProviderLink`; model as officer credential/card verification when required | `/profile`, `/officer-card`, `/verify-officer`, or final route approved by product/security |
| `complaints` | removed from current Prisma schema | Do not include unless explicitly requested |

Juristic/business context switching must follow the hybrid validation approach:

- Client: do not store active juristic/business context in `localStorage`.
- Client: use `sessionStorage` for tab-isolated active juristic/business context.
- URL: reflect context where practical, e.g. `/businesses/[businessId]/licenses`.
- API/backend: never trust frontend context; revalidate `userId` against `JuristicMember` for every juristic-scoped request.

Tang Rat / `AuthProviderLink` is only for identity-provider linkage and session creation. It receives identity claims such as name, citizen id, email, or phone, then the backend creates the app session. It is not a replacement for officer-card verification.

Officer verification is a separate domain requirement: after a citizen/public user is appointed or saved as an officer, the system should support a way for the public to verify whether a person who arrives to inspect a license is a real authorized officer. Plan this as an officer credential/card verification feature, with backend-issued status and public-safe verification output.

Route architecture:

- `(entry)` is mobile-first and serves `/`, with exactly two choices: `บุคคลธรรมดา` and `เจ้าหน้าที่`.
- `(app)` is the mobile-first field portal: `/home`, `/businesses`, `/businesses/[businessId]/licenses`, `/inspection-tasks`, `/profile`.
- `(back-office)` is web-only / desktop-first: `/zone-supervisor`, `/agency-admin`, `/super-admin`.

## Handoff expectation

Every final response after implementation should include:

- What changed.
- Where to review it.
- Validation performed.
- Remaining risks or next steps.
