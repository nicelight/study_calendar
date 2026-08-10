---
description: Execution handoff for TASK-014-T3-FT-003-W8.
status: active
---
# Handoff — TASK-014-T3-FT-003-W8

## Summary

- Attempt 2 bounded correction retry is stopped at preflight after the fresh
  independent `/verify` Attempt 1 failure at `FT-003-AC-004 / REQ-006`.
- Attempt 1 RED/GREEN and the independent failure report remain preserved as
  historical/supporting-only correction basis.
- `LearningProgressBoundary.getGrade` is already public, but it is keyed by a
  required `homeworkId`; the accepted Lesson Context boundary has no legal
  lesson-to-homework mapping or aggregate grade query to consume.
- No production, provider, route, test-behavior, task-status, or lifecycle
  change was made during Attempt 2. Fresh GREEN and gates are therefore absent.
- Exact blocker: `/spec-design` must decide the missing provider projection
  contract; then `/feature-to-tasks FT-003` must reconcile task planning before
  this task can be retried.

## Where to look

- key files:
  - `src/lib/server/modules/lesson-context/public.ts`
  - `src/lib/server/platform/database.ts`
  - `src/lib/server/composition-root.ts`
  - `src/routes/lesson-context/`
  - `src/routes/api/lesson-context/`
  - `tests/lesson-context/authorized-day-context.test.ts`
  - `.tasks/TASK-014-T3-FT-003-W8/`
  - `.protocols/TASK-014-T3-FT-003-W8/{context,plan,progress,verification}.md`
- advisory `touched_files` deviation: database schema and composition-root
  wiring are necessary same-outcome integration files; the full inventory and
  rationale are in `execution-evidence.md`.
- hard write-boundary compliance: no non-empty boundary was set; forbidden
  scope remains untouched.

## How to run / verify

- No Attempt 2 gate is runnable until the `/spec-design` and FT-003 planning
  blocker is resolved. The commands below are the required gates for the next
  legal retry, not evidence of this stopped attempt.
- gates:
  - `npm run check`
  - `npm run build`
  - `npm run test`
- claim-linked RED/GREEN evidence: `.tasks/TASK-014-T3-FT-003-W8/execution-evidence.md`
  and `progress.md`.
- local smoke observations: SSR shell HTTP `200`; guessed SSR/API access
  returned generic HTTP `403`; exact invocation receipt was not preserved.
- current-attempt reuse candidate locators: none offered.
- superseded/supporting-only receipt locators: Attempt 1 receipt and its
  claim-linked GREEN in `.tasks/TASK-014-T3-FT-003-W8/execution-evidence.md`
  are supporting-only; the independent verifier failure remains the current
  correction basis; no reuse candidate is offered.

## Known issues

- Execution blocker is recorded in
  `.tasks/TASK-014-T3-FT-003-W8/execution-evidence.md#attempt-2--boundary-preflight`:
  the existing single-homework `getGrade` contract cannot supply a
  lesson-scoped personal grade without a new/changed provider boundary or a
  forbidden persistence bypass.

## Follow-ups

- Next owner: `/spec-design`, then `/feature-to-tasks FT-003` and the required
  planning/readiness review route; only after that should the exact task be
  retried.
- `/verify`, `/red-verify`, `/mb-sync`, lifecycle closure, and another task are
  explicitly out of scope for this execution.
