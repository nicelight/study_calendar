---
description: Execution context for TASK-042-T3-FT-005-W22.
status: active
---
# Context — TASK-042-T3-FT-005-W22

## Purpose
Provide the protected assigned-Teacher lesson-day attendance entry for
FT-005-AC-005.

## Execution Attempt
- attempt: 1
- started: 2026-08-18 11:49 +0500

## Inputs
- Task record: `.memory-bank/tasks/TASK-042-T3-FT-005-W22.task.json`
- Task index: `.memory-bank/tasks/index.json`
- Feature/REQ: `FT-005-AC-005`, `REQ-010`, `REQ-014`
- Direct specs: Boundary Map attendance and calendar boundaries; Access Control
  accepted permission matrix; Lifecycle Map learning and finance.

## Constraints / invariants
- Learning Progress owns batch attendance and may call Financial Ledger only
  through the accepted reconciliation boundary.
- Server-resolved actor, class, lesson, assignment, and student scope are
  authoritative; submitted IDs cannot widen scope.
- The route is a thin adapter and cannot write learning, financial, or
  scheduling tables directly.
- Only `present` and `absent` are valid; every unmarked authorized class student
  is persisted as `present` in the atomic save.

## Loaded context set
- `.memory-bank/features/FT-005-learning-progress.md`
- `.memory-bank/requirements.md#req-010--attendance-and-charge-eligibility`
- `.memory-bank/contracts/boundary-map.md`
- `.memory-bank/contracts/access-control.md`
- `.memory-bank/states/lifecycle-map.md`
- `.memory-bank/tasks/plans/IMPL-FT-005.md`

## Change surface
- Hard boundary: `src/lib/server/modules/learning-progress/`,
  `src/routes/lesson-context/`, `tests/learning-progress/`,
  `tests/lesson-context/`.
- Forbidden: Financial Ledger, Center & Scheduling, Calendar routes, center
  routes, and TASK-010/TASK-041 artifacts.

## Open questions / blockers
- None at preflight.

## Next session
- Read `context.md`, `plan.md`, `progress.md`, and `handoff.md`; independently
  verify the current task outcome without replaying executor state.
