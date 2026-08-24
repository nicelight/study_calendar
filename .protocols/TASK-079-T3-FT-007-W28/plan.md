---
description: Execution plan for TASK-079-T3-FT-007-W28.
status: active
---
# Plan — TASK-079-T3-FT-007-W28

## Goal

Deliver one reusable protected navigation shell with exact Home, Classes,
Statistics, Profile, and Logout controls, preserving existing server logout
revocation, and deliver an owned-server disposable Playwright runner with
focused browser proof and exact cleanup.

## Non-goals

- Do not reimplement logout/session lifecycle.
- Do not implement Home, Classes, Statistics, or Profile page behavior.
- Do not change ordinary real-database Playwright smoke.
- Do not touch capability modules, protected destination directories, or
  `study-calendar.db`.

## Inputs / source specs

- Task card: `.memory-bank/tasks/TASK-079-T3-FT-007-W28.task.json`
- Feature/REQ: `FT-007-AC-001`, `REQ-014`, `REQ-017`
- Contracts: authentication transport session revocation, access-control
  authority/scope, boundary-map actor context, testing disposable browser
  proof.
- Planning: `.memory-bank/tasks/plans/IMPL-FT-007.md`, `.protocols/FT-007/plan.md`

## Scope

### In scope

- `src/routes/+layout.server.ts`
- `src/routes/+layout.svelte`
- `playwright.config.ts`
- `scripts/run-disposable-e2e.mjs`
- Task-owned route/runner tests and `e2e/ft-007-navigation.spec.ts`
- `tmp/.gitkeep` and exact disposable test target as needed by the runner
- T3 protocol and task evidence artifacts

### Out of scope

Everything in the task card `forbidden_scope`, including capability modules,
future protected destination route directories, and `study-calendar.db`.

## Preflight-confirmed change surface

- Expected advisory hints: retained and checked.
- Additional same-outcome files: only task-local evidence/protocol files and
  any exact `tmp/` disposable target created by the required gate.
- Hard `write_boundary`: present and satisfied.
- `forbidden_scope` / stop conditions: clear.

## Applicable quality gates

- [x] `npm run check` — SvelteKit/type correctness.
- [x] `npm run test` — project regression and task route/runner tests.
- [x] `npm run build` — production compilation.
- [x] `node scripts/run-disposable-e2e.mjs --database tmp/ft-007-navigation.db --spec e2e/ft-007-navigation.spec.ts` — owned-server browser shell/logout/isolation proof.
- [x] `git diff --check` — whitespace integrity.
- [x] `node scripts/mb-lint.mjs` — Memory Bank consistency gate required by card.
- [x] `node scripts/mb-doctor.mjs --strict` — strict queue readiness gate required by card.

## Claim-linked RED / GREEN (T2/T3)

- applicability: applicable.
- accepted claim locator: `FT-007-AC-001 / REQ-017` plus task-owned disposable
  proof in `verification_targets`.
- planned probe: route source/SSR tests plus focused Playwright against a fresh
  task-local `tmp/ft-007-navigation.db` and a server started by the runner with
  explicit `DATABASE_URL`; runner unit tests cover rejection and cleanup.
- initial RED: focused claim-specific tests must fail because the shell/runner
  and proof do not yet exist; setup/import-only failures are not accepted as
  RED evidence.
- GREEN: exact five controls, server-owned actor visibility, existing logout
  revocation/old-token denial, runner path rejection/parent preparation,
  owned-server/no-reuse behavior, and success/failure cleanup.
- T3 isolation: only disposable `tmp/*.db`; real `study-calendar.db` metadata
  is observed and remained unchanged; no existing server is reused.

## MB-SYNC handoff / owner

- Owner: scheduler/lifecycle owner after `/verify` and `/red-verify`.
- `/exe` leaves final lifecycle and feature sync unchanged.

## Definition of done

Implementation, task-scoped RED/GREEN evidence, all indexed gates, and a
durable `/verify` handoff are recorded. Task remains `in_progress` for the
outer scheduler and later verification.
