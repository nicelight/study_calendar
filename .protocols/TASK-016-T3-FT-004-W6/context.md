---
description: Execution context for TASK-016-T3-FT-004-W6.
status: active
---
# Context — TASK-016-T3-FT-004-W6

## Purpose

Establish fresh T3 implementation/evidence for center-lifecycle isolation of
Collaboration comments and reactions after supported class identity reuse.

## Execution Attempt

- attempt: Attempt 1
- started: 2026-08-09 23:43:36 +05

## Inputs (what drives this task)

- Task record: `.memory-bank/tasks/TASK-016-T3-FT-004-W6.task.json`
- Task index: `.memory-bank/tasks/index.json`
- Specs: `.memory-bank/spec-backbone.md`; `.memory-bank/spec-index.md`
- Acceptance criteria source: `.memory-bank/features/FT-004-day-collaboration.md#FT-004-AC-001`, `#FT-004-AC-002`, `#FT-004-AC-005`

## Richer inputs

- Source Artifacts: accepted modular-monolith target; Day Discussion Query Boundary; Access Control authority/scope and failure behavior; core domain relationships/persistence; Collaboration lifecycle.
- Normative Inputs: task card, tier policy claim-linked RED/GREEN, testing strategy, execute-loop task boundary.
- Constraints / Invariants: one shared database; Collaboration sole writer; actor plus server-resolved center/class/student scope; retained prior-center rows are not deleted; no cross-center existence leakage; center-scoped comment/reaction uniqueness.
- Verification Targets: task-owned AC-001/002/005 identity-reuse matrix, retained-row comparison, current-center usability, cross-center negative authorization, and standard reaction/reactor visibility.

## Fallback basis

- Historical TASK-012 T2 Attempt 1/2 evidence and FT-004 semantic-fail are correction context only, not current T3 proof.

## Loaded context set

- `AGENTS.md`
- `.memory-bank/roles/implementer.md`
- `.agents/skills/exe/SKILL.md`
- `.memory-bank/tasks/TASK-016-T3-FT-004-W6.task.json`
- `.memory-bank/workflows/tier-policy.md`
- `.memory-bank/contracts/boundary-map.md`
- `.memory-bank/contracts/access-control.md`
- `.memory-bank/domains/core-domain.md`
- `.memory-bank/states/lifecycle-map.md`

## Decisions / assumptions

- Decision: execute only TASK-016; TASK-017 threaded discussion/branch/tab outcome is out of scope.
- Decision: current source appears to satisfy the selected outcome; use honest pre-implementation GREEN if the isolated claim probe confirms it, with no invented production change.
- Assumption: the strict doctor PASS recorded in `.protocols/AUTONOMOUS-RUN/status.md` is the current readiness gate for this already-reviewed Planning Revision 1 queue.

## Commands run / environment notes

- Preflight inspection only; no prospective probe or production behavior write occurred before this execution attempt.
- Source basis before first probe: repository revision `697f44b4b4ac6fa9f8e6e094de7844c4e95bfcbd`; Collaboration/test source clean relative to the worktree.

## Open questions / blockers

- None at execution start.

## Next session

- Start by reading: `context.md`, `plan.md`, `progress.md`.
- Next action: run the smallest isolated current-source claim probe, then run applicable task gates.
