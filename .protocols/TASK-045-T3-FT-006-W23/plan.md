---
description: Execution plan for TASK-045-T3-FT-006-W23.
status: active
---
# Plan — TASK-045-T3-FT-006-W23

## Goal

Prove exact deterministic payment allocation from persisted historical charges
and payments, including oldest-first order, partial remainder, excess advance,
paid/overdue labels, stable balance, and fresh-database replay.

## Non-goals

- Payment role authority/edit/cancel, marker projection, retry/idempotency,
  Lesson Context/browser integration, or real database state.
- Consumer-derived financial state or changes outside Financial Ledger.

## Claim-linked RED / GREEN (T3)

- applicability: applicable
- accepted claim locators: `FT-006-AC-002 / REQ-012 / REQ-015` and
  `FT-006-AC-003 / REQ-012 / REQ-015`
- planned probe: fresh in-memory SQLite fixture with two historical charges,
  public `createPayment`, exact oldest-first allocation, partial and excess
  payments, balance/state assertions, second-database replay, safe rerun,
  cleanup, and source ownership inspection.
- RED: determine whether allocation order, exact remainder/advance, or state
  labels fail before any production behavior change.
- GREEN: both claims retain exact values and identical factual input replays
  identically.
- T3 isolation: disposable `:memory:` SQLite, fixed admin actor/scope/clock,
  public Financial Ledger commands/queries, explicit close, no network or real
  credentials, and no consumer writes.

## Preflight-confirmed change surface

- Expected advisory areas: `src/lib/server/modules/financial-ledger/` and
  `tests/financial-ledger/`; actual change surface is only
  `tests/financial-ledger/task-045-payment-allocation.test.ts` because the
  fresh probe found no production defect.
- Hard write boundary: present and satisfied.
- Forbidden scope / stop condition: clear.

## Quality gates

- [ ] `npm run check` — diagnostics.
- [ ] `npm run build` — production compilation.
- [ ] `npm run test` — project regression suite.

## Handoff

Scheduler owns lifecycle closure after fresh `/verify` and `/red-verify`.
`/mb-sync` is deferred to the W23 boundary.
