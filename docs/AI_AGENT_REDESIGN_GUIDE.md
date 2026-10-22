# AI Agent Guide: Redesigning the Existing Web Application

> **Audience:** AI agents and developers implementing the UI redesign.
> **Purpose:** provide a safe, repeatable process for migrating the existing application to the new design without losing behavior, accessibility, or project conventions.
> **Important:** this is a redesign of an existing application, not a greenfield rebuild. Preserve working behavior unless a requirement explicitly changes it.

---

## 1. Required reading

Before editing code, read:

1. `GEMINI.md` for repository-wide rules.
2. `docs/FRONTEND_STRUCTURE.md` for file placement and architecture.
3. `docs/FRONTEND_IMPLEMENTATION_STATUS.md` for current implementation state.
4. `docs/FRONTEND_BUILD_ROADMAP.md` when the page uses backend data.
5. `packages/gov-ui-tokens/README.md` and the token CSS files before changing visual values.

The repository uses a single root tree. Do not create `src/`. Use the `@/` import alias and preserve the existing BFF, authentication, authorization, and data-fetching patterns.

---

## 2. Non-negotiable principles

1. **Inspect before editing.** Trace the route, page, child components, data hooks, permissions, and all UI states.
2. **Preserve behavior by default.** A visual redesign does not authorize changes to business logic, validation, navigation, API contracts, or access control.
3. **Reuse before creating.** Prefer existing tokens and components. Extend a shared component only when the change is valid for all consumers.
4. **Migrate complete states.** Loading, empty, error, success, disabled, validation, permission, and responsive states are part of the page.
5. **Keep changes reviewable.** Work page-by-page or component-family-by-component-family. Do not mix unrelated cleanup into redesign work.
6. **Verify with evidence.** Do not claim completion based only on compilation. Compare the rendered UI and test the affected behavior.
7. **Do not hide uncertainty.** Record missing requirements, ambiguous design decisions, and legacy behavior that cannot be safely inferred.

---

## 3. Where to start

Do not open design tools or change code until the following discovery steps are complete.

### Step 1: Restate the task

Record:

- Target route or component
- Intended user and primary task
- Whether the request is visual, behavioral, or both
- Supplied design source and relevant viewport sizes
- Explicitly unchanged behavior
- Acceptance criteria

If a missing decision would materially change behavior or scope, ask for clarification. For minor visual gaps, follow the established design system and document the assumption.

### Step 2: Establish the current baseline

Inspect and record:

- Route entry and layout
- All child components
- Hooks, services, stores, and API dependencies
- Role and permission gates
- Query parameters and navigation behavior
- Current desktop and mobile appearance
- Loading, empty, error, populated, read-only, and permission states
- Dialogs, drawers, dropdowns, tooltips, notifications, and destructive actions

Capture before screenshots when browser tooling is available. Never rely only on the main success state.

### Step 3: Classify the change

Assign exactly one primary category:

| Category | Meaning | Expected approach |
|---|---|---|
| Retain | No meaningful design change | Regression verification only |
| Refresh | Same structure and behavior | Update tokens, typography, spacing, and styling |
| Refactor | Same workflow, different composition | Rework layout and replace components |
| Redesign | Workflow or information hierarchy changes | Validate UX, behavior, and acceptance criteria first |
| Retire | Page or component is obsolete | Confirm replacement, redirects, and dependency removal |

Do not treat a `Refresh` as permission to rewrite the page. Do not treat a `Redesign` as purely cosmetic.

### Step 4: Build a migration map

For the affected surface, list:

| Existing item | Target item | Action | Risk |
|---|---|---|---|
| Legacy component or style | Existing or new design-system item | Keep, configure, adapt, replace, or remove | Low, medium, or high |

Search the repository before creating anything. Check `components/ui/`, feature component folders, `components/shared/`, and `packages/gov-ui-tokens/`.

### Step 5: Define the verification plan

Before implementation, identify:

- Commands that must pass
- Viewports to inspect
- Roles and data states to exercise
- Critical interactions to test
- Accessibility checks
- Expected before/after differences

---

## 4. Redesign workflow

### Phase A: Foundations

Use this order when new shared design decisions are required:

1. Semantic design tokens
2. Typography and icons
3. Primitive UI controls
4. Form controls
5. Navigation and overlays
6. Data-display components
7. Reusable feature patterns
8. Page composition

Prefer semantic tokens such as `text-primary`, `surface-muted`, and `border-danger` over page-specific colors. Do not introduce hard-coded colors, spacing, radii, or shadows when an appropriate token exists.

If a required token does not exist:

1. Confirm that no semantic equivalent exists.
2. Add it to the canonical token source.
3. Regenerate derived token output using the repository script.
4. Document why the new semantic role is reusable.

### Phase B: Shared component migration

For each component:

1. Find every consumer with `rg`.
2. Identify its public API and behavioral contract.
3. Enumerate variants, sizes, and interaction states.
4. Decide whether to configure, extend, adapt, or replace it.
5. Preserve compatibility or migrate all consumers in a controlled change.
6. Test representative consumers, not only the component in isolation.
7. Remove the legacy implementation only when no consumers remain.

Use a temporary adapter when direct replacement would create a risky, application-wide change. Mark adapters and deprecated components clearly, and create an explicit removal condition.

### Phase C1: Refresh or refactor a page

1. Preserve the current data and behavior contract.
2. Replace legacy visual values with semantic tokens.
3. Replace mapped legacy components.
4. Update layout, hierarchy, and responsive behavior.
5. Reconnect every existing state.
6. Verify navigation, forms, dialogs, filters, tables, and mutations.
7. Compare the result against both the old baseline and new design.

### Phase C2: Fully redesign a page

1. Confirm the user goal and changed workflow.
2. Map old steps to new steps; flag removed or added capabilities.
3. Confirm changes to validation, permissions, analytics, and navigation.
4. Implement the structural flow before decorative polish.
5. Compose the page from approved tokens and shared components.
6. Implement all states and responsive transformations.
7. Test the full task from entry to completion.
8. Use a feature flag or staged rollout when behavior or information architecture changes significantly.

### Phase D: Validation

Run validation proportional to the change. At minimum:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Also verify:

- No new TypeScript or lint errors
- No unintended console errors or hydration warnings
- Loading, error, empty, and success states
- Keyboard navigation and visible focus
- Form labels, validation messages, and error association
- Color contrast and non-color status cues
- Mobile, intermediate, and desktop layouts
- Long text, missing text, and Thai content behavior
- Role and permission boundaries
- Analytics and existing side effects when applicable
- No direct backend calls or client-side token handling

Compilation is necessary but is not sufficient visual verification.

### Phase E: Handoff and cleanup

Before marking the task complete:

1. Update the migration/status document.
2. Record assumptions and deliberate deviations from the design.
3. List newly added or changed tokens and components.
4. Confirm that obsolete components and styles have no consumers before deletion.
5. Record deferred work as explicit follow-up items.
6. Provide validation results and remaining risks.

---

## 5. Design consistency manual

### Tokens

- Use semantic rather than raw color names at consumption sites.
- Do not duplicate token values locally.
- Do not use opacity to simulate a missing disabled or muted token without checking contrast.
- Keep status meanings consistent: success, warning, danger, and information must not change meaning between pages.

### Typography

- Use the established type scale and font weights.
- Preserve readable line length and line height.
- Use semantic HTML headings in logical order; visual size does not determine heading level.
- Do not use placeholder text as a form label.

### Spacing and layout

- Use the established spacing scale.
- Prefer layout primitives and normal document flow over arbitrary positioning.
- Define what wraps, collapses, scrolls, moves to overflow, or remains fixed at each breakpoint.
- Test boundary widths, not only ideal mobile and desktop screenshots.

### Components

- A visual difference alone does not always justify a new component.
- A shared component must have a coherent responsibility and reusable API.
- Avoid excessive boolean props; prefer explicit variants when states are mutually exclusive.
- Keep business rules in feature logic, not inside generic UI primitives.
- Preserve native semantics and use Radix/shadcn primitives where already established.

### Content and localization

- Preserve the product's language and terminology.
- Do not invent user-facing copy when approved copy is required.
- Test long Thai labels, numbers, dates, identifiers, and empty values.
- Never truncate critical information without a way to access the complete value.

---

## 6. Legacy state manual

For every affected component or page, evaluate these states:

- Initial and populated
- Loading and delayed loading
- Empty and first-use
- Partial data
- Validation error
- API or system error with retry
- Success and partial success
- Hover, focus, pressed, selected, and disabled
- Read-only
- Permission denied or hidden action
- Offline or stale data, when applicable
- Destructive confirmation
- Long, missing, or localized content

Rules:

1. Do not remove a state because it is absent from the new mockup.
2. Confirm that a legacy state is obsolete before deleting it.
3. Preserve the user's recovery path for errors.
4. Do not convert authorization failures into generic empty states.
5. Avoid layout shifts between loading and populated content where practical.
6. Skeletons should approximate the final structure and must not imply false data.

---

## 7. Project-specific engineering rules

- Keep application code in the repository root tree; never create `src/`.
- Use `@/` imports instead of deep relative imports.
- Keep `server/` code out of Client Components.
- Send backend requests through `@/lib/http` and the `/api/*` BFF proxy.
- Never expose access or refresh tokens to client code.
- Preserve tenant-scoped query keys and clear the query cache after context switches.
- Never display a full citizen ID; use only the approved verification and last-four fields.
- Keep data access in hooks/services rather than embedding request logic in visual components.
- Use existing feature directories and naming conventions.
- Preserve Server Component boundaries unless browser-only behavior requires `'use client'`.
- Keep client components as small as practical; do not make an entire route client-rendered for one interactive control.
- Use `next/image`, Next.js font handling, metadata conventions, and route-level loading/error boundaries where appropriate.
- Do not replace working domain behavior with mock data during a redesign.

### E-License naming and route alignment

Use `schema.prisma` naming as the source of truth. Do not use deprecated DBML v0.1 terms in new work.

Required mapping:

- `establishments` → `Business` / `/businesses`.
- `work_orders` → `InspectionTask` / `/inspection-tasks`.
- `scope_nodes` → `Zone` or `UserZone` / `/admin/zones` or role-specific back-office zone routes.
- `officer_digital_cards` → do not replace with `AuthProviderLink`. Treat officer card/credential verification as a separate domain feature when required.
- `complaints` → removed from the current Prisma scope; do not plan or implement unless explicitly requested.

Tang Rat / `AuthProviderLink` rule:

- Tang Rat provides identity claims such as name, citizen id, email, and phone.
- The backend uses those claims to create or restore the application session.
- `AuthProviderLink` represents identity-provider linkage only.
- It must not be used as the officer-card verification model.

Officer verification rule:

- The product should support public verification that a person who comes to inspect a license is a real authorized officer.
- Plan this as an officer credential/card verification feature with public-safe output.
- Do not expose sensitive officer personal data beyond what is required for verification.

Juristic/business context rules:

- Do not store `activeJuristicId` or active business context in `localStorage`.
- Use `sessionStorage` for active juristic/business context so multiple browser tabs can hold isolated context.
- Prefer URL context where practical, for example `/businesses/[businessId]/licenses`.
- Backend APIs must revalidate every juristic-scoped request against `JuristicMember`; the frontend is not trusted.

Frontend route architecture:

- `(entry)` mobile-first `/`: exactly two choices, `บุคคลธรรมดา` and `เจ้าหน้าที่`.
- `(app)` mobile-first field portal: `/home`, `/businesses`, `/businesses/[businessId]/licenses`, `/inspection-tasks`, `/profile`.
- `(back-office)` web-only / desktop-first: `/zone-supervisor`, `/agency-admin`, `/super-admin`.

---

## 8. Anti-patterns

Do not:

- Rewrite a working page solely to make the code look cleaner.
- Create a second design system inside a feature folder.
- Copy a shared component and rename it for one page.
- Hard-code values copied from a design when tokens exist.
- Change API types or business rules to accommodate visual markup.
- Remove error, empty, or permission states during layout work.
- Add `'use client'` at a high level without a concrete need.
- Introduce unrelated dependency upgrades or broad formatting changes.
- Delete legacy code based only on its filename; verify consumers first.
- Claim pixel accuracy without rendering and comparing the page.
- Claim completion while required validation is failing.

---

## 9. Required agent output for each migrated page

Use this template in the implementation record or handoff:

```md
## <Route or component>

- Migration category: Refresh | Refactor | Redesign | Retire
- User goal:
- Scope:
- Behavior preserved:
- Behavior changed:
- Components reused:
- Components added or changed:
- Tokens added or changed:
- States verified:
- Viewports verified:
- Accessibility checks:
- Commands run and results:
- Design deviations or assumptions:
- Remaining risks or follow-up:
```

---

## 10. Definition of done

A redesign task is complete only when:

- [ ] The page was classified and scoped before implementation.
- [ ] Existing behavior and dependencies were inspected.
- [ ] Existing tokens and components were reused where appropriate.
- [ ] New shared primitives have clear reusable semantics.
- [ ] Loading, empty, error, success, validation, and permission states are handled.
- [ ] Responsive behavior was verified at relevant boundary widths.
- [ ] Keyboard, focus, labeling, contrast, and reduced-motion concerns were checked.
- [ ] Roles, permissions, navigation, forms, and data mutations still work.
- [ ] `npm run lint`, `npx tsc --noEmit`, and `npm run build` pass, or pre-existing failures are documented with evidence.
- [ ] The rendered result was compared with the target design.
- [ ] No unused legacy component, adapter, or style was left without a tracked reason.
- [ ] Documentation and implementation status were updated.
- [ ] Assumptions, deviations, validation results, and remaining risks were handed off.

---

## 11. Recommended migration tracker

Maintain a table for the full redesign:

| Route/surface | Category | Priority | Design status | Code status | State coverage | Validation | Owner | Legacy removal |
|---|---|---|---|---|---|---|---|---|

Suggested status values are `Not started`, `Auditing`, `Ready`, `In progress`, `Review`, `Blocked`, and `Complete`. A route is not `Complete` until its state coverage and validation are complete.
