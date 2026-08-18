---
description: Execution plan for TASK-044-T3-FT-006-W22.
status: active
---
# Plan — TASK-044-T3-FT-006-W22

## Goal

Prove deterministic, exact, audited Financial Ledger consequences of
authorized attendance correction for individual and group lesson contexts,
including rollback on failure and isolation of unrelated students.

## Non-goals

- Attendance persistence or attendance business ownership.
- New payment commands, payment authority, marker projection, retry policy,
  route/UI changes, or Scheduling writes.

## Claim-linked RED / GREEN (T3)

- applicability: applicable
- accepted claim locator: `FT-006-AC-004 / REQ-010 / REQ-012 / REQ-015`
- planned probe: fresh in-memory SQLite state with individual/group lesson
  facts, historical price, persisted payment fixture, correction cancellation
  and reactivation, deterministic replay in a second database, audit exactness,
  failed-command count invariants, unrelated-student isolation, safe rerun,
  cleanup, and authorization boundary.
- RED: determine whether current reconciliation loses determinism/audit,
  partially mutates on failure, or crosses ownership before any production
  change; record the observed result.
- GREEN: exact charge/allocation/balance/audit history is stable and failed or
  unauthorized paths leave financial state unchanged.
- T3 isolation: disposable `:memory:` SQLite, fixed actors/scope/clock,
  direct payment rows only as isolated historical input, public reconciliation
  calls, explicit close, and source ownership scan.

## Preflight-confirmed change surface

- Expected advisory areas: `src/lib/server/modules/financial-ledger/` and
  `tests/financial-ledger/`; actual change surface is only
  `tests/financial-ledger/task-044-attendance-reconciliation.test.ts` because
  the corrected fresh probe found no production defect.
- Hard write boundary: present and satisfied.
- Forbidden scope / stop condition: clear.

## Quality gates

- [ ] `npm run check` — diagnostics.
- [ ] `npm run build` — production compilation.
- [ ] `npm run test` — project regression suite.

## Handoff

Scheduler owns lifecycle closure after fresh `/verify` and `/red-verify`.
`/mb-sync` is deferred to the W22 boundary.
