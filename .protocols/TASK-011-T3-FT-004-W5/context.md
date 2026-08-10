---
description: Execution context for TASK-011-T3-FT-004-W5.
status: active
---
# Context — TASK-011-T3-FT-004-W5

## Purpose

Implement the Collaboration-owned comments, reactions, and shared/personal
scope boundary for FT-004 AC-001, AC-002, and AC-005.

## Execution Attempt

- attempt: 1
- started: 2026-08-08 20:56:25 +0500

## Inputs (what drives this task)

- Task record: `.memory-bank/tasks/TASK-011-T3-FT-004-W5.task.json`
- Task index: `.memory-bank/tasks/index.json`
- Feature: `.memory-bank/features/FT-004-day-collaboration.md`
- Acceptance criteria: `FT-004-AC-001`, `FT-004-AC-002`, `FT-004-AC-005`
- Requirements: `REQ-006`, `REQ-007`, `REQ-014`

## Richer inputs

- Source Artifacts: FT-004 AC-001/002/005, Day Discussion Query Boundary,
  Access Control Contract.
- Normative Inputs: Day Discussion Query Boundary, Access Control Contract,
  Core Domain relationships, Collaboration lifecycle.
- Constraints / Invariants: Collaboration exclusively writes comments and
  reactions; actor and class/student scope are resolved server-side; one
  editable account-owned comment per field; shared/personal visibility never
  crosses scope.
- Verification Targets: comment uniqueness/attribution, five reactions and
  permitted-reactor projection, shared/personal and cross-student read/write
  denial.

## Loaded context set

- `AGENTS.md`
- `.memory-bank/constitution.md`
- `.memory-bank/mbb/index.md`
- `.memory-bank/spec-backbone.md`
- `.memory-bank/spec-index.md`
- `.memory-bank/roles/implementer.md`
- `.memory-bank/workflows/tier-policy.md`
- `.memory-bank/features/FT-004-day-collaboration.md`
- `.memory-bank/tasks/plans/IMPL-FT-004.md`
- `.memory-bank/contracts/boundary-map.md`
- `.memory-bank/contracts/access-control.md`
- `.memory-bank/domains/core-domain.md`
- `.memory-bank/states/lifecycle-map.md`
- `.tasks/TASK-MB-REVIEW-TASKS-PLAN/TASK-MB-REVIEW-TASKS-PLAN-S-TASKS-FT-004-final-report-docs-01.md`

## Decisions / assumptions

- Decision: follow the indexed task's authoritative Collaboration claims. The
  user wording about attendance/correction does not match this task's card or
  direct specs; attendance remains Learning Progress-owned and out of scope.
- Decision: use Identity & Access and Center & Scheduling public boundaries for
  actor and class/student scope; schema wiring and composition-root exposure
  are same-outcome infrastructure, not new public ownership.
- Assumption (needs verification): concrete Collaboration method, table, and
  object-target names are implementation details because the accepted public
  contract specifies behavior and ownership rather than a fixed HTTP shape.

## Commands run / environment notes

- Read-only task, dependency, planning approval, spec, source, and test
  preflight completed before this Execution Attempt.
- Selected source/test areas were absent and had no dirty overlap; the
  workspace contains unrelated user changes that must be preserved.
- No prospective task probe or production change occurred before this
  Execution Attempt block.

## Open questions / blockers

- None within the accepted Collaboration outcome. No event bus or new privacy
  boundary is needed by the selected implementation.

## Next session

- Start by reading: `context.md`, `plan.md`, `progress.md`.
- Next action: run the claim-scoped pre-implementation RED probe, then add the
  minimal Collaboration boundary and durable schema.
