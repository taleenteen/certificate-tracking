# CI Typecheck

- Status: Verified
- Owner: repo owner (next: enable branch protection)
- Created: 2026-10-22
- Last updated: 2026-10-22

## Objective

Catch TypeScript errors in CI. `next build` skips type checking (`typescript.ignoreBuildErrors: true` in `next.config.ts`, added in `e60b422` to shorten server builds).

## Context and constraints

- Before this change the repo had no CI (`.github/` did not exist).
- The project uses bun only (AGENTS.md). The Dockerfile uses `oven/bun:1`, the local bun is 1.2.14, and Next is 16.0.7.
- `tsconfig.json` includes `.next/types/**`, which does not exist on a fresh checkout. `next typegen` creates the route types without a full build.
- Full-repo ESLint has pre-existing warnings and project debt, so lint is not part of this check.

## Scope

- `package.json`: add the `typecheck` script, `next typegen && tsc --noEmit --incremental false`.
- `.github/workflows/typecheck.yml`: run on PRs and pushes to `main` and `release/**`. Steps: setup-bun 1.2.14, `bun install --frozen-lockfile`, then `bun run typecheck`.

## Out of scope

- Re-enabling type checking inside `next build`.
- Lint, tests and build in CI.
- Branch protection, which is a repo setting the owner must enable to make the check required.

## Proposed workflow

1. Confirm a clean checkout type-checks (no `.next`).
2. Add the script and workflow, and run them locally.
3. Push and watch the first run on PR #1.

## Security and permission considerations

- The workflow token has `contents: read` only. It uses no secrets and reads no env vars.
- It runs on `pull_request`, not `pull_request_target`, so fork PRs do not get write access.

## Implementation checklist

- [x] Add the `typecheck` script
- [x] Add the GitHub Actions workflow
- [x] First CI run green on GitHub

## Validation checklist

- [x] With `.next` removed: `next typegen` then `tsc --noEmit --incremental false` passed
- [x] `bun install --frozen-lockfile` passed (no lockfile changes)
- [x] `bun run typecheck` passed (exit 0)
- [x] GitHub Actions on `f270e99`: pull_request run 39748274442 and push run 39748274275 both succeeded

## Progress log

- 2026-10-22: Found no existing CI. Verified that tsc passes on a clean checkout both with and without `next typegen`, and chose typegen so route `PageProps` types are checked too. Added the script and workflow and validated locally.
- 2026-10-22: First GitHub Actions runs on `f270e99` (push and PR #1) succeeded.
- 2026-10-22: Renamed the workflow to `.github/workflows/ci.yml` (name `CI`) and added a `lint` job (see `plan/2026-10-22-lint-cleanup.md`). For branch protection, require the `typecheck` and `lint` checks.

## Changed files

- `package.json`
- `.github/workflows/typecheck.yml` (new)
- `plan/2026-10-22-ci-typecheck.md`, `plan/README.md`

## Open questions and risks

- The check is not required until branch protection on `main` lists "Typecheck".
- `bun-version` is pinned to 1.2.14. Keep it in step with local and Docker bun when upgrading.
