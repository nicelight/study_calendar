---
description: Execution context for TASK-050-T3-FT-006-W26.
status: active
---
# Context — TASK-050-T3-FT-006-W26

## Purpose

Complete the accepted FT-006-AC-008 browser contour: the Student personal
calendar consumes authoritative paid/unpaid projection, while shared roles do
not receive guessed student payment state and the real local database E2E
proves the end-to-end payment path.

## Execution Attempt

- attempt: 1
- started: 2026-08-18 16:48 +0500

## Inputs

- Task record: `.memory-bank/tasks/TASK-050-T3-FT-006-W26.task.json`
- Task index: `.memory-bank/tasks/index.json`
- Feature / REQ: `.memory-bank/features/FT-006-financial-ledger.md#FT-006-AC-008`,
  `.memory-bank/requirements.md#REQ-013`
- Direct contracts: `.memory-bank/contracts/boundary-map.md#financial-projection-query-boundary`,
  `.memory-bank/contracts/financial-ledger.md#public-commands-and-queries`,
  `.memory-bank/contracts/access-control.md#authority-and-scope`
- Architecture / runbook: `.memory-bank/architecture/system-architecture.md#composition-and-request-data-flow`,
  `.memory-bank/runbooks/mvp-verification.md#required-pre-real-data-checks`

## Constraints / invariants

- Calendar reads named Financial Ledger projections and never writes financial
  tables or reconstructs balances.
- Fully covered Student lesson days are `paid`; uncovered days are `unpaid`.
- Shared Admin/Teacher calendar data contains no guessed per-student payment
  state.
- Real-DB E2E uses the existing local `study-calendar.db`; no reset or temp DB;
  only dedicated test fixture/session cleanup is allowed.

## Loaded context set

- `AGENTS.md`
- `.memory-bank/constitution.md`
- `.memory-bank/spec-backbone.md`
- `.memory-bank/spec-index.md`
- `.memory-bank/features/FT-006-financial-ledger.md`
- `.memory-bank/features/FT-003-calendar-and-lesson-context.md`
- `.memory-bank/contracts/boundary-map.md`
- `.memory-bank/contracts/financial-ledger.md`
- `.memory-bank/contracts/access-control.md`
- `.memory-bank/architecture/system-architecture.md`
- `.memory-bank/runbooks/mvp-verification.md`

## Decisions / assumptions

- The existing browser implementation is the accepted task surface; execute
  and verify it without widening Financial Ledger or Lesson Context ownership.
- Existing dedicated E2E accounts/fixture are authoritative local data and are
  not reset.

## Commands run / environment notes

- Task preflight and dependency resolution → OK; all dependencies are `done`,
  Planning Revision `2` is approved, and the task is now `in_progress`.

## Open questions / blockers

- None at preflight.

## Next session

- Start by reading: `context.md`, `plan.md`, `progress.md`.
- Next action: run the focused real-database payment E2E and capture its
  cleanup/fixture evidence.
