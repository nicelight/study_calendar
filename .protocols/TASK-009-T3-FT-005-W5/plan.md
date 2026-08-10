---
description: Execution plan for TASK-009-T3-FT-005-W5.
status: active
---
# Plan — TASK-009-T3-FT-005-W5

## Goal

Persist assigned homework completion, expose it only through authorized class
context, and persist/read only accepted private grades with server-side scope.

## Non-goals

- No attendance or financial reconciliation.
- No late/partial attendance states.
- No class-wide grade exposure.
- No changes to the accepted access-control contract.

## Inputs / source specs

- Task record: `.memory-bank/tasks/TASK-009-T3-FT-005-W5.task.json`
- Task index: `.memory-bank/tasks/index.json`
- Feature: `.memory-bank/features/FT-005-learning-progress.md`
- REQ IDs: `REQ-009`, `REQ-014`
- Review: `.tasks/TASK-MB-REVIEW-TASKS-PLAN/TASK-MB-REVIEW-TASKS-PLAN-S-TASKS-FT-005-final-report-docs-01.md`, `REVIEWED_PLANNING_REVISION: 1`, `VERDICT: APPROVE`

## Richer execution inputs

- Source Artifacts: `FT-005-AC-001`, `FT-005-AC-002`, Personal Progress Query Boundary, Access Control Contract.
- Normative Inputs: boundary map, access-control, core-domain ownership, lifecycle learning rules.
- Verification Targets: completion class visibility; accepted grade scale; positive and negative privacy matrix.

## Constraints / invariants (MUST / NEVER)

- MUST: resolve actor/session and class/student scope server-side at every public boundary.
- MUST: keep Learning Progress as the sole writer of homework and grade state.
- MUST: allow grade reads only for the selected student, linked parent, assigned teacher, or own-center admin.
- NEVER: include grades in class-wide completion views.
- NEVER: trust caller-provided role or authorization scope.

## Scope

### In scope

- Learning Progress public boundary and its shared-database schema.
- Composition-root wiring.
- Claim-scoped tests under `tests/learning-progress/`.

### Out of scope

- Routes/UI, attendance, Financial Ledger writes, and unrelated module changes.
- The forbidden task records listed in `runtime_context.forbidden_scope`.

## Proposed changes

### Touched areas (hypotheses OK)

- `src/lib/server/modules/learning-progress/public.ts` — owner-side completion/grade commands and scoped queries.
- `src/lib/server/platform/database.ts` — durable Learning Progress tables in the existing shared schema.
- `src/lib/server/composition-root.ts` — expose the Learning Progress boundary to consumers/tests.
- `tests/learning-progress/homework-grades.test.ts` — isolated AC-001/002 RED/GREEN probes.

### Preflight-confirmed change surface

- Expected hints kept: `src/lib/server/modules/learning-progress/`, `tests/learning-progress/`.
- Additional same-outcome files/areas: shared schema and composition root are required to persist and expose the owned boundary; no unrelated behavior is changed.
- Hard `write_boundary` present and satisfied: not set.
- `forbidden_scope` / stop-condition check: clear; accepted grade visibility contract is sufficient and unchanged.

## Applicable quality gates

- [ ] `npm run check` — type/syntax correctness for the SvelteKit/TypeScript project.
- [ ] `npm run build` — production build compatibility.
- [ ] `npm run test` — full project regression suite plus task claims.
- [ ] `git diff --check` — whitespace/diff hygiene for the actual change surface.

## Claim-linked RED / GREEN (T2/T3)

- applicability: applicable
- accepted claim locator(s): `FT-005-AC-001` / `REQ-009`; `FT-005-AC-002` / `REQ-009`, `REQ-014`; Personal Progress Query Boundary; Access Control Contract.
- planned test/probe and environment: one disposable in-memory shared database with isolated center, class, assigned teacher, two students, linked parent, own-center admin, and outsider actors; invoke only public boundaries.
- observable RED: before implementation, the selected public Learning Progress boundary and durable records are absent, so completion/grade behavior cannot be observed as required.
- corresponding GREEN: completion persists and appears in an authorized class completion projection; accepted grades persist and positive viewers read the selected student's grade while invalid grades and cross-student/parent reads are denied.
- accepted not-applicable reason and alternative proof: none.
- T3 isolation, safe rerun, cleanup, and permission boundary: each test creates an in-memory database, uses deterministic IDs, closes it in `afterEach`, performs no network/credential/production-DB operation, and exercises server-side public boundaries.

## Fan-out plan (if needed)

- None; no delegated agents.

## MB-SYNC handoff / owner

Scheduler or explicit standalone owner performs sync after verification/status
decision. `/exe` records handoff notes only.

- Owner identified: scheduler / next workflow owner; current user explicitly prohibits `/mb-sync`.
- `.memory-bank/` docs needing update: task outcome navigation/changelog only if lifecycle owner requests during sync; no normative spec change is expected.
- `.memory-bank/index.md` router update needed: no.
- RTM update in `.memory-bank/requirements.md` needed: no; existing REQ coverage is implemented here.
- Task registry/status update owner: `/exe` for `in_progress`, later lifecycle owner for closure.
- Changelog update owner: sync/lifecycle owner.

## Definition of done

- AC-001 and AC-002 implementation and claim-scoped evidence are recorded.
- Required check/build/test gates pass or their failure is honestly handed off.
- Actual files, scope compliance, RED/GREEN evidence, and next owner are durable in protocol and task artifacts.
- Task remains `in_progress`; `/verify`, `/red-verify`, `/mb-sync`, and closure are not run here.
