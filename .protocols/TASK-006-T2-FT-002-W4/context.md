---
description: Execution context for TASK-006-T2-FT-002-W4.
status: active
---
# Context — TASK-006-T2-FT-002-W4

## Purpose

Implement Center & Scheduling recurrence, stable lesson exceptions, assignment
authorization, attribution preservation, and the Financial Ledger lesson-fact
integration owned by this task.

## Execution Attempt

- attempt: 1
- started: 2026-08-08 17:56:33 +05

## Inputs (what drives this task)

- Task record: `.memory-bank/tasks/TASK-006-T2-FT-002-W4.task.json`
- Task index: `.memory-bank/tasks/index.json`
- Specs: `.memory-bank/contracts/boundary-map.md#calendar-and-membership-query-boundary`, `.memory-bank/contracts/access-control.md`, `.memory-bank/domains/core-domain.md#ownership-map`, `.memory-bank/states/lifecycle-map.md#scheduling-and-lesson-context`
- Acceptance criteria source: `.memory-bank/features/FT-002-center-and-scheduling.md#ft-002-ac-003` through `#ft-002-ac-006`

## Richer inputs

- Source artifacts: feature AC-003..AC-006 and architecture storage/data-flow rules.
- Constraints / invariants: Center & Scheduling exclusively writes schedule and Lesson state; moved lessons retain identity/context; unselected repetitions remain unchanged; current assignment controls access; authored attribution remains.
- Verification targets: recurrence isolation, transfer/charge uniqueness, assignment authorization, removal denial, attribution retention.

## Loaded context set

- `AGENTS.md`
- `.memory-bank/constitution.md`
- `.memory-bank/mbb/index.md`
- `.memory-bank/spec-backbone.md`
- `.memory-bank/spec-index.md`
- `.memory-bank/workflows/tier-policy.md`
- `.memory-bank/features/FT-002-center-and-scheduling.md`
- `.memory-bank/contracts/boundary-map.md`
- `.memory-bank/contracts/access-control.md`
- `.memory-bank/domains/core-domain.md`
- `.memory-bank/states/lifecycle-map.md`
- `.memory-bank/tasks/plans/IMPL-FT-002.md`
- `.tasks/TASK-MB-REVIEW-TASKS-PLAN/TASK-MB-REVIEW-TASKS-PLAN-S-TASKS-FT-002-final-report-docs-01.md`

## Decisions / assumptions

- Execution-level recurrence representation is a weekly schedule with explicit ISO dates and weekday numbers; no unresolved product or public-contract branch is introduced.
- Lesson Context, Collaboration, and Learning Progress projections remain downstream consumer-owned and are not implemented here.
- The task has no non-empty hard write boundary; `forbidden_scope` contains only the two Foundation task records.

## Commands run / environment notes

- Read-only preflight and dependency/status inspection completed before the first prospective probe.
- Existing worktree is dirty from prior task work; unrelated changes are preserved.

## Open questions / blockers

- None at preflight.

## Current handoff

- Attempt 1 implementation and claim-equivalent GREEN are complete.
- Start by reading: `context.md`, `plan.md`, `progress.md`, `handoff.md`.
- Next action: fresh independent `/verify TASK-006-T2-FT-002-W4`.
