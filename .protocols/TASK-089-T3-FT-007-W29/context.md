---
description: Execution context for TASK-089-T3-FT-007-W29.
status: active
---
# Context — TASK-089-T3-FT-007-W29

## Purpose

Implement the Learning Progress attendance-percentage query owned by
FT-007-AC-006, using the existing Actor Context and Calendar and Membership
public boundaries and preserving attendance source facts.

## Execution Attempt

- attempt: 1
- started: 2026-08-22 08:31:14 +0500

## Inputs (what drives this task)

- Task record: `.memory-bank/tasks/TASK-089-T3-FT-007-W29.task.json`
- Task index: `.memory-bank/tasks/index.json`
- Feature/plan: `.memory-bank/features/FT-007-navigation-and-statistics.md`, `.memory-bank/tasks/plans/IMPL-FT-007.md`, `.protocols/FT-007/plan.md`
- Acceptance criteria: `FT-007-AC-006 / REQ-014 / REQ-017`

## Richer inputs

- Source artifacts: Statistics Projection attendance contract; Actor Context,
  Calendar and Membership, and Personal Progress boundaries; Access Control
  authority/scope; Learning and finance lifecycle.
- Constraints: Learning Progress owns the aggregate; C&S supplies lesson and
  current class/assignment scope; tests use isolated disposable state.
- Invariants: no conducted slots is numeric `0`; corrections are reflected on
  read; denied/unassigned/cross-center requests do not leak or mutate state.
- Verification target: conducted/no-slot/default-present/absence/correction and
  student/Teacher scope matrix through the accepted provider seams.

## Loaded context set

- `AGENTS.md`
- `.memory-bank/constitution.md`
- `.memory-bank/mbb/index.md`
- `.memory-bank/spec-backbone.md`
- `.memory-bank/spec-index.md`
- `.memory-bank/roles/implementer.md`
- `.memory-bank/contracts/statistics-projection.md`
- `.memory-bank/contracts/boundary-map.md`
- `.memory-bank/contracts/access-control.md`
- `.memory-bank/states/lifecycle-map.md`
- `.memory-bank/workflows/tier-policy.md`
- `.memory-bank/workflows/execute-loop.md`
- `.memory-bank/workflows/autonomy-policy.md`
- `.memory-bank/workflows/mb-sync.md`

## Decisions / assumptions

- The existing accepted public seams are sufficient: actor resolution remains
  request-scoped, C&S remains the authority for class/lesson/assignment scope,
  and Learning Progress reads only its own attendance facts.
- No new source of truth, graph edge, route, persistence, or attendance
  transition is introduced.

## Commands run / environment notes

- Read-only preflight inspected the exact indexed card, dependencies, current
  scheduler checkpoint, direct specs, source seams, templates, and dirty-file
  overlap before task start.
- Task status is now `in_progress`; no scheduler checkpoint, queue selection,
  dependent, lifecycle closure, or verification command was changed here.

## Open questions / blockers

- None at task start.

## Next session

- Start by reading `context.md`, `plan.md`, `progress.md`.
- Next action: run the task-scoped RED probe before changing production code.
