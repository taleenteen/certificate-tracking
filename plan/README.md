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
| 2026-07-19 | [Native Entry Reliability](./2026-07-19-native-entry-reliability.md) | Prevent Tang Rat root handoffs from waiting on the global SDK and bound native credential reads. | In Progress | Moving SDK loading to `/auth/dga`; validation pending. | In progress |
| 2026-07-17 | [Native Runtime Capability Gate](./2026-07-17-native-runtime-capability-gate.md) | Centralize Tang Rat SDK capability checks while preserving URL-first mToken login. | Implemented | Automated checks passed; Tang Rat device verification pending. | Implemented |
| 2026-07-16 | [Native QR Scanner Routing](./2026-07-16-native-qr-scanner-routing.md) | Route all QR actions through Tang Rat native SDK with browser-camera fallback. | Implemented | TypeScript and focused ESLint passed; device verification pending. | Implemented |
| 2026-07-16 | [Native Export Diagnostics](./2026-07-16-native-export-diagnostics.md) | Show UAT-only backend response and Tang Rat SDK handoff diagnostics for native file export. | Implemented | TypeScript and file-scoped ESLint passed; physical UAT device test pending. | Implemented |
| 2026-07-12 | [Business License Export Redesign](./2026-07-12-business-export-redesign.md) | Redesign the business license export page to match mockup layout and display PDF page previews. | Verified | Verified build and mapped licenseNo correctly. | Verified |
| 2026-07-11 | [Export License Banner Redesign](./2026-07-11-export-banner-redesign.md) | Redesign the export license banner on the details pages with custom gradient and download button. | Verified | Created component, wired triggers, and verified build. | Verified |
| 2026-07-09 | [Login-first entry flow](./2026-07-09-login-first-entry-flow.md) | Root requires login first; public skips mode select; existing session opens main page; officers still select mode after fresh login. | Verified | `bunx tsc --noEmit` passed; manual browser flow optional. | Verified |
| 2026-07-08 | [Officer/Public Mode Switch](./2026-07-08-officer-public-mode-switch.md) | Add post-login role-mode selection for officer users and a profile-menu switch between normal user and officer feature modes. | Verified | TypeScript, targeted ESLint, and production build passed; manual seeded-user browser flow remains. | Verified |
| 2026-07-08 | [Officer Inspection Report List](./2026-07-08-officer-inspection-report-list.md) | Wire `/reports` to officer field inspections created by `/api/officer/inspections`, add detail route, and document the list contract. | Verified | Backend build/unit/e2e and frontend typecheck/build passed; manual browser flow remains. | Verified |
| 2026-07-02 | [DGA OIDC Login Flow](./2026-07-02-dga-oidc-login-flow.md) | Add `/auth/dga`, `/auth/login-callback`, and `/auth/logout-callback` for DGA Digital ID OIDC login/logout through the BFF. | Verified | Hooks, route pages, login/logout entry points, env, typecheck, build, and BFF authorize route verified. Full lint still has unrelated existing debt. | Verified |
| 2026-07-01 | [Nested Juristic Business & Details Integration](./2026-07-01-nested-juristic-business-integration.md) | Support nested company > business > license lists and fallbacks on business details. | Verified | Type checking and production build compile verified successfully | Verified |
| 2026-07-01 | [Juristic License Seeding](./2026-07-01-juristic-license-seeding.md) | Integrate POST /api/my/dev/seed-juristic-license-demo for prototype testing in the juristic tab. | Verified | useDevSeedJuristicLicense hook created, conditional button rendered, cache keys invalidated | Verified |
| 2026-07-01 | [Juristic License Groups Integration](./2026-07-01-juristic-license-groups-endpoint.md) | Integrate GET /api/my/juristic-license-groups for grouped collapsible company list view in licenses page. | Verified | API query groups integrated, collapsible UI sections created, local activeTab state wired | Verified |
| 2026-07-01 | [License Ownership API Alignment](./2026-07-01-license-ownership-api-alignment.md) | Align frontend endpoints and keys with FRONTEND_LICENSE_OWNERSHIP_API.md guidelines. | Verified | API query keys updated, legacy params removed, 403 context reset interceptor added | Verified |
| 2026-06-30 | [Homepage Service layout redesign](./2026-06-30-homepage-service-redesign.md) | Redesign the homepage service layout to match the design mockup and split it into clean sub-components. | Verified | Components created, wired, verified with TypeCheck, ESLint, and Next.js build | Verified |
| 2026-06-30 | [Homepage Service component migration](./2026-06-30-homepage-service-component.md) | Create a new reusable public/citizen Homepage Service component from the Figma export and replace the legacy inline public branch in `HomeDashboard`. | Verified | Component created, wired, and validated with TypeScript plus file-scoped ESLint. Full project lint has unrelated existing failures. | Verified |
| 2026-06-30 | [Figma design context export](./2026-06-30-figma-design-context-export.md) | Export structured design tokens, reusable components, and main officer/citizen flows from the supplied Figma node into `figma/`. | Verified | Export files created; JSON parse and file presence validated. Figma variable API hit MCP rate limit, documented in export and plan. | Verified |
| 2026-06-24 | [Unified search field strategy](./2026-06-24-unified-search-field-strategy.md) | Plan a best-practice smart search approach for one search field that can search license numbers and business names without mixing domain logic in the UI component. | Planned | Feature proposal only; do not implement yet. | Not started |
| 2026-06-24 | [Officer verification scanner](./2026-06-24-officer-verification-scanner.md) | Implement QR scanner mode for officer verification card on Home page, routing to a new details page `/verify-officer` supporting success/error states matching mockup. | Verified | Completed home page interceptor, SSR page, client-side mockup layouts, camera scanner local flow, and verified with production build checks | Verified |
| 2026-06-24 | [New complaints page redesign](./2026-06-24-complaints-new-page-redesign.md) | Redesign `/complaints/new` page with green illustration banner, custom input icons, selectable issue chips, character counter, and dashed upload zone matching mockup. | Verified | Implemented custom inputs, interactive selection chips, textarea limit counter, and verified with clean production build compilation | Verified |
| 2026-06-24 | [Track complaints stepper and form redesign](./2026-06-24-track-stepper-redesign.md) | Redesign track page with search card, horizontal 3-step progress stepper (รับเรื่อง -> กำลังตรวจสอบ -> เสร็จสิ้น), and details card matching mockup. | In Progress | Redesigning page layout in app/(app)/complaints/track/page.tsx | In Progress |
| 2026-06-24 | [Complaints bottom sheet and flow](./2026-06-24-complaints-flow.md) | Implement bottom sheet complaints selector drawer on Home page, creating /complaints/new report form and /complaints/track status timeline lookup page. | Verified | Implemented ComplaintsSheetOverlay bottom sheet drawer on Home page and form/tracking routes | Verified |
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
