---
description: Execution plan for TASK-010-T3-FT-005-W6.
status: active
---
# Plan — TASK-010-T3-FT-005-W6

## Goal

Make authorized `present`/`absent` attendance transitions the Learning
Progress-owned state change and route financial consequences through the
accepted Financial Ledger reconciliation boundary.

## Non-goals

- No third attendance state such as late or partial presence.
- No direct Learning Progress writes to charge, allocation, balance, or audit rows.
- No changes to homework/grade behavior, payment commands, routes/UI, or the accepted module graph.
- No edits to the forbidden Foundation task records.

## Inputs / source specs

- Task record: `.memory-bank/tasks/TASK-010-T3-FT-005-W6.task.json`
- Task index: `.memory-bank/tasks/index.json`
- Feature: `.memory-bank/features/FT-005-learning-progress.md`
- REQ IDs: `REQ-010`, `REQ-014`, `REQ-015`
- Review: `.tasks/TASK-MB-REVIEW-TASKS-PLAN/TASK-MB-REVIEW-TASKS-PLAN-S-TASKS-FT-005-final-report-docs-01.md`, `REVIEWED_PLANNING_REVISION: 1`, `VERDICT: APPROVE`

## Richer execution inputs

- Source Artifacts: `FT-005-AC-003`, `FT-005-AC-004`, Attendance Charge Reconciliation Boundary.
- Normative Inputs: Boundary Map, Financial Ledger Contract, Lifecycle Map, MVP Verification Runbook.
- Verification Targets: individual/group absent and present flows; historical-price correction, deterministic balance, atomic failure, financial audit, and unrelated-student isolation.

## Constraints / invariants (MUST / NEVER)

- MUST: resolve actor, class, lesson, and target-student scope server-side.
- MUST: keep attendance writes in Learning Progress and financial writes in Financial Ledger.
- MUST: commit attendance and its financial consequence together when a financial transition is required.
- MUST: preserve charge historical pricing and deterministic financial recalculation.
- NEVER: trust caller-provided role/scope or add late/partial attendance.
- NEVER: write financial tables from Learning Progress.

## Scope

### In scope

- Learning Progress attendance public boundary and durable attendance schema.
- Composition-root wiring of the existing Financial Ledger boundary into the Learning Progress orchestrator.
- Minimal same-transaction support in the existing reconciliation command so the accepted cross-slice operation can roll back together.
- Claim-scoped tests under `tests/learning-progress/` and `tests/financial-ledger/` only where needed for AC-003/004 evidence.

### Out of scope

- Routes/UI and personal-day composition.
- Payment/marker behavior already owned by FT-006.
- New migrations, deployment changes, or external systems.
- `.memory-bank/tasks/TASK-001-T3-FT-000-W0.task.json` and `.memory-bank/tasks/TASK-002-T3-FT-000-W1.task.json`.

## Proposed changes

### Touched areas (hypotheses OK)

- `src/lib/server/modules/learning-progress/public.ts` — attendance state, authorization, and cross-slice orchestration.
- `src/lib/server/platform/database.ts` — durable Learning Progress attendance table in the existing shared schema.
- `src/lib/server/modules/financial-ledger/public.ts` — preserve direct transaction behavior while allowing the accepted orchestrator transaction to remain single/atomic.
- `src/lib/server/composition-root.ts` — wire the existing Financial Ledger provider to Learning Progress.
- `tests/learning-progress/attendance.test.ts` — disposable individual/group AC-003/004 integration evidence.

### Preflight-confirmed change surface

- Expected hints kept: Learning Progress, Financial Ledger, and their test areas.
- Additional same-outcome files/areas and rationale: shared schema, composition root, and Financial Ledger transaction wrapper are required integration infrastructure for the accepted boundary and atomicity; no unrelated behavior is intended.
- Hard `write_boundary` present and satisfied: not set.
- `forbidden_scope` / stop-condition check: clear; both Foundation task paths are untouched and no new edge/ownership decision is required.

## Applicable quality gates

- [x] `node_modules/.bin/vitest run tests/learning-progress/attendance-red-probe.test.ts --reporter=verbose` — focused AC-003/004 claim probe; RED before implementation, GREEN after implementation.
- [x] `npm run check` — TypeScript/SvelteKit correctness; 0 errors and 0 warnings.
- [x] `npm run build` — production build compatibility; successful, adapter-auto informational notice only.
- [x] `npm run test` — full project regression suite; 10 files / 35 tests passed.
- [x] `git diff --check` — actual change-surface hygiene; clean.

## Claim-linked RED / GREEN (T2/T3)

- applicability: applicable
- accepted claim locator(s): `FT-005-AC-003` / `REQ-010`, `REQ-015`; `FT-005-AC-004` / `REQ-010`, `REQ-015`; Attendance Charge Reconciliation Boundary; Financial Ledger Contract.
- planned test/probe and environment: one disposable in-memory shared database with individual and group classes, two students, authorized Admin/Teacher actors, lessons, historical prices, payment history, and an unrelated student; public Learning Progress commands and scoped projections only.
- observable RED: before implementation, no Learning Progress attendance boundary/schema exists, so the selected both-mode attendance and atomic reconciliation outcomes cannot be observed.
- corresponding GREEN: absent produces no charge in both modes; present uses the applicable historical price; authorized absent→present commits attendance plus charge/recalculation/audit; failed correction rolls back; unrelated student remains unchanged.
- accepted not-applicable reason and alternative proof: none.
- T3 isolation, safe rerun, cleanup, and permission boundary: each probe uses fresh `:memory:` SQLite state, deterministic fixtures, explicit close, no network/credentials/production DB, and public-boundary calls with server-side authorization.

## Fan-out plan (if needed)

- None; no delegated agents.

## MB-SYNC handoff / owner

Scheduler or explicit standalone owner performs sync after verification/status
decision. `/exe` records handoff notes only.

- Owner identified: scheduler/next workflow owner; user explicitly prohibits `/verify`, `/red-verify`, and `/mb-sync` in this execution.
- `.memory-bank/` docs needing update: feature/task navigation and changelog only if the lifecycle owner requests them during sync; no normative spec change is expected.
- `.memory-bank/index.md` router update needed: no.
- RTM update in `.memory-bank/requirements.md` needed: no.
- Task registry/status update owner: lifecycle owner after independent gates; this execution leaves `in_progress`.
- Changelog update owner: sync/lifecycle owner.

## Definition of done

- AC-003 and AC-004 implementation and claim-linked RED/GREEN evidence are durable.
- Required check/build/test gates pass or any failure is honestly handed off.
- Actual files, scope compliance, transaction/boundary rules, and next owner are recorded.
- Task remains `in_progress`; `/verify`, `/red-verify`, `/mb-sync`, closure, and dependent promotion are not run.
