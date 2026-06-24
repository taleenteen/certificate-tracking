# Plan Index

This folder tracks project plans that are useful for both humans and AI agents.

The goal is to make each task understandable without reading the full chat history. Every non-trivial implementation, redesign, migration, or architectural decision should have a plan file here and an entry in this index.

## How to use this index

1. Before starting work, check whether a relevant plan already exists.
2. If not, create a new file using `YYYY-MM-DD-short-task-name.md`.
3. Add a row to the table below.
4. Keep `Status`, `Current step`, and `Last updated` accurate.
5. Link changed files from the plan file when implementation starts.

## Status definitions

| Status | Meaning |
| --- | --- |
| `Planned` | Plan exists, implementation has not started. |
| `In Progress` | Work has started but is not complete. |
| `Blocked` | Work cannot proceed without a decision, dependency, permission, or missing information. |
| `Implemented` | Planned changes were made, but validation may still be incomplete. |
| `Verified` | Implementation was completed and relevant checks were run or documented. |

## Plans

| Date | Plan | Summary | Status | Current step | Implementation |
| --- | --- | --- | --- | --- | --- |
| 2026-06-24 | [License details layout redesign](./2026-06-24-license-details-layout-redesign.md) | Redesign the license details page to match the clean white-card mockup structure with Back button, business and license detail fields, action links, and document view. | In Progress | Redesigning layout and fields in components/app/licenses/license-detail-page.tsx | In Progress |
| 2026-06-24 | [Shared SVG icons structure](./2026-06-24-shared-svg-icons-structure.md) | Define a reusable custom SVG React components structure under components/icons, refactoring hardcoded inline SVGs. | Verified | Refactored QR scanner icon, verified compilation with Bun. | Verified |
| 2026-06-23 | [License search autocomplete and animations](./2026-06-23-license-search-redesign.md) | Redesign the public license-search page with Framer Motion banner/button transitions and autocomplete suggestions popover. | Verified | Verified layout matching mockup and clean production compile. | Verified |
| 2026-06-23 | [Licenses redesign and wiring](./2026-06-23-licenses-redesign-and-wiring.md) | Redesign the public licenses page and navbar, adding personal/juristic context switching tabs, input search filters, and card detail columns layout matching the mockup. | Verified | Verified layout matching mockup and clean production compile. | Verified |
| 2026-06-23 | [Home dashboard redesign](./2026-06-23-home-dashboard-redesign.md) | Redesign and refresh the public home dashboard (landing navbar, search, hero banner, 4 grid cards, recent searches) to match the citizen UI mockup image. | Verified | Dashboard components, mock routes created, type checking completed successfully. | Verified |
| 2026-06-23 | [Folder structure and route migration](./2026-06-23-folder-structure-route-migration.md) | Physical route/component migration from legacy back-office/establishment naming to mobile-first app, businesses, and dedicated web-only admin surfaces, including import path rewrites. | Implemented | Migration implemented: app routes moved, `/businesses` adopted, `/super-admin/*` and `/agency-admin/*` created, legacy redirects added, build/typecheck passed. Not Verified because full lint has pre-existing project debt. | Implemented |
| 2026-06-23 | [Public app and back-office role workflow](./2026-06-23-public-app-backoffice-role-workflow.md) | Plan mobile-first frontend flows using Prisma-aligned naming: Business, InspectionTask, Zone/UserZone, sessionStorage juristic context, and web-only back office. | Planned | Awaiting implementation. Start with landing-entry audit, `/businesses` route migration, mobile-first app shell, role normalization, and route ownership audit. | Not started |
| 2026-06-23 | [AI agent planning workflow](./2026-06-23-ai-agent-planning-workflow.md) | Create a repeatable planning workflow so future AI work records scope, rationale, implementation progress, validation, and handoff notes. | Implemented | Initial workflow files created. Use this process for future non-trivial tasks. | Documentation only |

## Maintenance rules

- Keep the newest or most active plans easy to find.
- Do not delete completed plans unless the team explicitly decides to archive them elsewhere.
- Prefer appending progress notes over rewriting history.
- If a plan becomes obsolete, mark it as `Blocked` or `Implemented` with a note explaining why it stopped or changed direction.
