---
description: Execution context for TASK-018-T3-FT-005-W8.
status: active
---
# Context — TASK-018-T3-FT-005-W8

## Purpose

Implement the Learning Progress-owned authorized lesson-scoped personal grade
query over the existing `learning_homework` model. Lesson Context remains a
read-only consumer and is outside the hard write boundary.

## Execution Attempt

- attempt: Attempt 1
- started: 2026-08-10 14:19 +0500

## Inputs (what drives this task)

- Task record: `.memory-bank/tasks/TASK-018-T3-FT-005-W8.task.json`
- Task index: `.memory-bank/tasks/index.json`
- Feature/REQ: `.memory-bank/features/FT-005-learning-progress.md#FT-005-AC-002`, `REQ-009`, `REQ-014`
- Direct canonical specs: `.memory-bank/architecture/system-architecture.md#AD-007`, `.memory-bank/contracts/boundary-map.md#personal-progress-query-boundary`, `.memory-bank/contracts/access-control.md`, `.memory-bank/domains/core-domain.md`, `.memory-bank/testing/strategy.md`
- Planning approval: `.tasks/TASK-MB-REVIEW-TASKS-PLAN/TASK-MB-REVIEW-TASKS-PLAN-S-TASKS-R3-FT-005-final-report-docs-01.md`, `REVIEWED_PLANNING_REVISION: 2`, `VERDICT: APPROVE`

## Preflight findings

- Task is uniquely indexed, `T3/W8`, and was `ready`; dependencies
  `TASK-009-T3-FT-005-W5` and `TASK-006-T2-FT-002-W4` are `done`.
- Global Backbone is `complete` at Planning Revision `2`; the latest FT-005
  task-plan approval reviews revision `2`.
- The existing provider exposes only `getGrade({ homeworkId, ... })`; no
  lesson-scoped query exists. `learning_homework` is the accepted source of
  homework facts and no new relation/table is authorized.
- `src/lib/server/modules/lesson-context/` and all TASK-014 protocol/evidence
  surfaces are forbidden. Target behavior fits the Learning Progress module
  and its focused tests.
- `node scripts/mb-lint.mjs` and `node scripts/mb-doctor.mjs --strict` passed
  before execution bookkeeping.

## Decisions / assumptions

- Multiple class-scoped homework candidates fail closed by throwing the
  explicit `ambiguous-homework-selection` provider error; no grade is read or
  returned for that case.
- Authorization is derived from `resolveActor` and
  `getAuthorizedClassScope`; the selected student must be in the provider's
  server-resolved student scope.

## Next session

- Start by reading: `context.md`, `plan.md`, `progress.md`.
- Next action: run the claim-specific pre-implementation RED probe, then apply
  the smallest provider/test change and obtain claim-equivalent GREEN.
