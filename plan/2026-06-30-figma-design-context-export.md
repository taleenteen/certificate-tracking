# Figma design context export

- Status: Verified
- Owner: AI agent
- Date created: 2026-06-30
- Last updated: 2026-06-30

## Objective

Export token-efficient, structured Figma context from the supplied design node into `figma/` so future AI coding agents can understand reusable tokens, components, and core flows.

## Context and constraints

- Source: `https://www.figma.com/design/eEn7vxIbv5TjEVOSN5AU14/... ?node-id=853-941`
- File key: `eEn7vxIbv5TjEVOSN5AU14`
- Root node: `853:941`
- The design separates officer/system staff context on the left and citizen/public context on the right.
- Use targeted Figma MCP queries and avoid dumping the full file.
- Keep output readable for AI coding agents and aligned with current Prisma/route naming rules.

## Scope

- Create `figma/design-tokens-20260630.json`.
- Create `figma/components-20260630.md`.
- Create `figma/main-flows-20260630.md`.
- Record clear separation between officer and citizen contexts.

## Out of scope

- No application code changes.
- No Figma write changes.
- No route or component implementation.

## Proposed workflow

1. Inspect project guidance and existing plan index.
2. Query Figma root node metadata for high-level structure.
3. Query variables/styles/components with Figma MCP via targeted scripts.
4. Query relevant child frames for reusable components and main flows.
5. Write structured export files under `figma/`.
6. Validate file readability and JSON syntax.

## Security and permission considerations

- Figma context is design documentation only.
- Do not include secrets or private tokens.
- Treat frontend role gating as UX context only; backend/API authorization remains the security boundary.

## Implementation checklist

- [x] Read required project guidance.
- [x] Inspect Figma root node and pages.
- [x] Export design variables/tokens.
- [x] Identify reusable components.
- [x] Summarize main flows by officer and citizen context.
- [x] Write export files.

## Validation checklist

- [x] JSON token export parses successfully.
- [x] Markdown files are present and readable.
- [x] Outputs cite Figma node links where available.
- [x] Progress and changed files are recorded.

## Progress log

- 2026-06-30: Started export task, read project instructions, and prepared plan.
- 2026-06-30: Queried Figma metadata for root node `853:941`; direct variable/component `use_figma` query hit Figma MCP View-seat rate limit.
- 2026-06-30: Generated token export from repository `design-tokens.tokens.json` fallback with 753 flattened tokens and raw token tree preserved.
- 2026-06-30: Created reusable component catalog and main-flow summary with clear officer/citizen context split.
- 2026-06-30: Validated `figma/design-tokens-20260630.json` with `node` JSON parse and confirmed all export files exist.

## Changed files

- `plan/2026-06-30-figma-design-context-export.md`
- `plan/README.md`
- `figma/design-tokens-20260630.json`
- `figma/components-20260630.md`
- `figma/main-flows-20260630.md`

## Open questions and risks

- Direct Figma local variable/style/component API export could not complete because Figma MCP reported a View-seat rate limit.
- `design-tokens-20260630.json` is complete for the repository token source, but not independently verified against live Figma local variables in this run.
- Component descriptions are inferred from targeted node metadata, semantic layer names, and current frontend route/component structure where designer notes were not available.
