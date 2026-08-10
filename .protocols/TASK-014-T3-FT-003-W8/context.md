---
description: Execution context for TASK-014-T3-FT-003-W8.
status: active
---
# Context — TASK-014-T3-FT-003-W8

## Purpose

Implement the accepted Lesson Context read-composition boundary for shared and
selected-student day views, preserving navigation identity and denying guessed
or cross-student access server-side.

## Execution Attempt

- attempt: Attempt 1
- started: 2026-08-10 00:00 +05

## Execution Attempt — Attempt 2

- attempt: Attempt 2
- started: 2026-08-10 02:00 +0500
- retry: bounded correction retry after fresh independent `/verify` Attempt 1
  functional FAIL at `FT-003-AC-004 / REQ-006`.
- correction basis: `.protocols/TASK-014-T3-FT-003-W8/verification.md` and
  `.tasks/TASK-014-T3-FT-003-W8/TASK-014-T3-FT-003-W8-S-VERIFY-final-report-docs-01.md`.
- historical basis retained: Attempt 1 RED/GREEN, the independent functional
  FAIL report, and its evidence remain unchanged and supporting-only.
- preflight result: `LearningProgressBoundary.getGrade` is public and
  provider-owned, but it requires `homeworkId` and returns one `GradeView`.
  Lesson Context has no accepted `lessonId -> homeworkId` relation, no
  `homeworkId` in the current day-context request, and no existing provider
  query that enumerates or aggregates grades for a selected student/lesson.
- blocker: consuming `getGrade` for the accepted personal projection would
  require either direct Learning Progress persistence access or creating/changing
  the provider public boundary. Both are outside this retry's accepted scope;
  no production correction was started.

## Inputs (what drives this task)

- Task record: `.memory-bank/tasks/TASK-014-T3-FT-003-W8.task.json`
- Task index: `.memory-bank/tasks/index.json`
- Feature: `.memory-bank/features/FT-003-calendar-and-lesson-context.md#FT-003-AC-003`
  through `#FT-003-AC-006`
- Implementation plan: `.memory-bank/tasks/plans/IMPL-FT-003.md`
- Execution plan: `.protocols/FT-003/plan.md`

## Richer inputs

- Direct canonical specs: system architecture request data flow; Boundary Map
  actor, calendar/membership, progress, discussion, and financial projection
  boundaries; Access Control authority/privacy; Core Domain read/write flow;
  Lifecycle scheduling and lesson context.
- Normative workflow: `.memory-bank/workflows/tier-policy.md#claim-linked-red--green-for-t2t3`
  and `#hard-write-boundary`.
- Dependencies: TASK-008, TASK-009, TASK-010, TASK-016, TASK-017, TASK-013,
  all `done`; accepted as prerequisites and not re-proved.
- Verification targets: AC-003 role-based shared material; AC-004 selected
  student composition; AC-005 exact date/class/student navigation; AC-006
  server-side negative authorization and non-mutation.

## Loaded context set

- `AGENTS.md`
- `.memory-bank/roles/implementer.md`
- `.agents/skills/exe/SKILL.md`
- `.memory-bank/constitution.md`
- `.memory-bank/spec-backbone.md`
- `.memory-bank/spec-index.md`
- `.memory-bank/workflows/tier-policy.md`
- `.memory-bank/contracts/boundary-map.md`
- `.memory-bank/contracts/access-control.md`
- `.memory-bank/domains/core-domain.md`
- `.memory-bank/states/lifecycle-map.md`
- `.memory-bank/tasks/TASK-014-T3-FT-003-W8.task.json`

## Decisions / assumptions

- Decision: keep Lesson Context as the orchestration owner and consume only the
  five named provider boundaries already accepted by the graph.
- Decision: shared topic/practical-work/homework material is Lesson Context
  state; no provider-owned table or write is added.
- Decision: personal composition returns attendance, personal discussion, and
  financial projections available through existing public read methods; no
  provider boundary is extended to enumerate unrelated facts.
- Assumption: a dedicated `/lesson-context` SSR page and
  `/api/lesson-context` adapter are the minimum route surface for the accepted
  navigation and server-side denial checks.
- Attempt 2 disposition: do not guess the missing grade-to-lesson mapping or
  widen a public boundary. The exact repair requires `/spec-design` to settle
  the accepted Learning Progress projection contract, followed by
  `/feature-to-tasks FT-003` reconciliation before another implementation retry.

## Commands run / environment notes

- Read-only preflight completed before the first prospective probe.
- Source basis before first probe: repository revision
  `697f44b4b4ac6fa9f8e6e094de7844c4e95bfcbd`; existing unrelated dirty changes
  are preserved and no target Lesson Context source existed.
- Task status was `ready`; it is now `in_progress` before the first probe.

## Open questions / blockers

- `BLOCKED`: the accepted provider contract has no legal way for Lesson Context
  to obtain the selected student's grade projection for a lesson. The next
  owner must decide whether the contract is lesson-linked or exposes an
  authorized aggregate; do not implement a DB bypass or guessed identifier.

## Next session

- Resolve the recorded `/spec-design` blocker, then reconcile FT-003 task
  planning and re-run the exact task only after the accepted provider boundary
  is durable. No `/verify`, `/red-verify`, `/mb-sync`, or lifecycle closure was
  run by this retry.
