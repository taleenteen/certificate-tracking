# AI Agent Planning Workflow

## Status

Implemented

## Owner

AI agent, with human review by project maintainers.

## Dates

- Created: 2026-06-23
- Last updated: 2026-06-23

## Objective

Create a durable workflow for recording project plans in the repository so humans and AI agents can understand:

- why a task exists;
- what scope was agreed;
- what implementation path was chosen;
- how far the implementation progressed;
- what validation was performed;
- what risks or follow-up work remain.

## Context and constraints

The project is being actively redesigned and refactored. Several decisions happen in chat before implementation. Without a repository-level planning trail, later agents and humans may lose the context behind code changes.

The plan system must be:

- easy for AI agents to discover;
- readable by humans without chat history;
- lightweight enough to keep updated;
- explicit about implementation and validation status;
- useful for feature work, redesign work, migration work, and architecture decisions.

## Best-practice basis

This workflow combines these practices:

- Architecture Decision Record style documentation: record context, decision, status, and consequences.
- Issue/task template discipline: define objective, scope, relevant artifacts, and validation before implementation.
- Progress log discipline: preserve a short chronological trail so future readers can understand what happened.
- Documentation structure discipline: separate entrypoint documentation, how-to workflow, and task-specific records.

## Scope

Included:

- Create a root AI entrypoint file.
- Create a `plan/` folder.
- Create a plan index.
- Create a task-specific plan file for this workflow.
- Define how future plans should be named, written, updated, and handed off.

Out of scope:

- Changing application behavior.
- Refactoring existing routes or roles.
- Creating issue templates or pull request templates.
- Integrating with external project management tools.

## Proposed workflow for future tasks

### 1. Intake

Before touching implementation, capture:

- user request;
- business goal;
- affected user roles;
- affected routes/components/APIs;
- constraints, assumptions, and security concerns;
- expected deliverables.

### 2. Classification

Classify the task as one or more of:

- redesign;
- feature implementation;
- refactor;
- bug fix;
- migration;
- documentation;
- architecture decision.

This determines how much planning and validation are required.

### 3. Plan creation

For non-trivial work, create:

```text
plan/YYYY-MM-DD-short-task-name.md
```

Then add the file to `plan/README.md`.

### 4. Implementation tracking

Update the plan as work progresses:

- `Planned` before implementation starts.
- `In Progress` when files are being changed.
- `Blocked` when progress requires missing information or permission.
- `Implemented` when files are changed.
- `Verified` when checks are run or validation is documented.

### 5. Handoff

At the end of work, the agent should update:

- status;
- current step;
- progress log;
- changed files;
- validation results;
- remaining risks and next steps.

The final chat response should point to the plan file.

## Security and permission considerations

- A plan is not a substitute for authorization checks.
- For role-based features, record which checks happen on frontend UX and which must happen on backend/API.
- For context switching, record cache invalidation requirements.
- For sensitive workflows, record audit logging and mutation ownership requirements.
- Do not store secrets, tokens, credentials, private API responses, or personal data in plan files.

## Implementation checklist

- [x] Add root `AGENTS.md`.
- [x] Add `plan/README.md`.
- [x] Add this plan file.
- [x] Link this plan from the index.
- [x] Define statuses and required sections.
- [x] Define handoff expectations.

## Validation checklist

- [x] Files are plain Markdown.
- [x] Plan index links to the task plan.
- [x] Root agent entrypoint points to the plan index.
- [ ] Team has reviewed and accepted the workflow.
- [ ] Future implementation tasks use this workflow.

## Progress log

| Date | Status | Note |
| --- | --- | --- |
| 2026-06-23 | Implemented | Created the initial AI planning workflow, root agent entrypoint, plan index, and task-specific plan file. |

## Changed files

- `AGENTS.md`
- `plan/README.md`
- `plan/2026-06-23-ai-agent-planning-workflow.md`

## Open questions and risks

- The team should decide whether every feature requires a plan file or only non-trivial work.
- The team may later add PR/issue templates to enforce the same fields outside chat.
- If agents forget to update the index, the plan folder can drift. `AGENTS.md` now makes the index update a required step.

