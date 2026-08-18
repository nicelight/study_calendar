---
description: Execution plan for TASK-043-T3-FT-006-W22.
status: active
---
# Plan — TASK-043-T3-FT-006-W22

## Goal

Prove and, only if required, implement immutable exact applied prices for
Financial Ledger charges across a later default and student-specific price
change.

## Non-goals

- Payment allocation, payment authority, markers, retry/idempotency, or route
  integration.
- Attendance ownership or Center & Scheduling writes.
- Any change to `src/routes/`, `center-scheduling`, or the real database.

## Claim-linked RED / GREEN (T3)

- applicability: applicable
- accepted claim locator: `FT-006-AC-001 / REQ-011`
- planned probe: fresh in-memory SQLite Financial Ledger harness with default
  and student override settings, charges before and after a setting change,
  exact persisted-value comparison, safe rerun, and explicit close.
- RED: determine whether the current claim path loses or rewrites an applied
  historical price before any production change; record the observable result.
- GREEN: exact early values remain unchanged and later values use only the
  applicable future settings.
- T3 isolation: disposable `:memory:` database, fixed actor/scope/clock,
  no network or real credentials, per-test cleanup, and public Financial Ledger
  command/query access with source ownership inspection.

## Preflight-confirmed change surface

- Expected advisory areas: `src/lib/server/modules/financial-ledger/` and
  `tests/financial-ledger/`; actual change surface is only
  `tests/financial-ledger/task-043-historical-applied-price.test.ts` because
  the production path already satisfies the accepted outcome.
- Hard write boundary: present and satisfied.
- Forbidden scope / stop condition: clear.

## Quality gates

- [ ] `npm run check` — Svelte/TypeScript diagnostics.
- [ ] `npm run build` — production compilation.
- [ ] `npm run test` — project regression suite.

## Handoff

`/exe` records execution evidence only. Scheduler owns lifecycle closure after
fresh `/verify` and `/red-verify`; `/mb-sync` is deferred to the W22 boundary.
