---
description: Execution plan for TASK-042-T3-FT-005-W22.
status: active
---
# Plan — TASK-042-T3-FT-005-W22

## Goal
Implement an authorized lesson-day attendance list and atomic absent-subset /
default-present save for assigned Teachers in individual and group classes.

## Non-goals
- No new attendance state or ownership change.
- No direct financial/scheduling persistence.
- No Admin payment/schedule behavior or student/parent editing.

## Inputs / source specs
- Task: `.memory-bank/tasks/TASK-042-T3-FT-005-W22.task.json`
- Feature/REQ: FT-005-AC-005, REQ-010, REQ-014
- Contracts: Boundary Map attendance, personal progress, and calendar/membership
  boundaries; Access Control; Lifecycle Map.

## Preflight-confirmed change surface
- Expected areas: Learning Progress public module, Lesson Context route, and
  focused tests in the two permitted test roots.
- Hard `write_boundary`: present and satisfied only after implementation review.
- Forbidden scope / stop conditions: clear at preflight.

## Applicable quality gates
- [ ] `npm run check` — type and SvelteKit correctness.
- [ ] `npm run build` — production build.
- [ ] `npm run test` — project regression and task-focused tests.
- [ ] `git diff --check` — whitespace/diff hygiene.

## Claim-linked RED / GREEN
- applicability: applicable
- claim locator: `FT-005-AC-005` / `REQ-010`
- planned probe: assigned Teacher individual/group saves with absent subset;
  anonymous, unassigned, cross-center, and forged scope submissions fail with
  attendance/financial state unchanged.
- RED: current code has no lesson-day attendance-list command/adapter.
- GREEN: provider-owned atomic batch save persists absent IDs and present
  remainder through the authorized route.
- T3: use disposable test database state, explicit role/scope matrix, safe
  rerun, and cleanup; no real DB mutation.

## MB-SYNC handoff / owner
- Owner: scheduler after `/verify` and `/red-verify` verdicts.
- `.memory-bank` docs: feature coverage and changelog may need boundary update
  at wave sync; `/exe` does not decide lifecycle.
- Task status/evidence: `/autopilot`.

## Definition of done
- Executor implementation evidence and handoff are durable; fresh functional
  verifier returns PASS; required semantic verifier returns semantic-pass; the
  scheduler then records final lifecycle evidence.
