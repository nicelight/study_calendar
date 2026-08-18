---
description: Execution plan for TASK-048-T3-FT-006-W24.
status: active
---
# Plan — TASK-048-T3-FT-006-W24

## Claims

- `FT-006-AC-007 / REQ-012 / REQ-015`: repeating an identical confirmed
  payment intent returns the original Payment without duplication.
- `FT-006-AC-007 / REQ-012 / REQ-015`: an explicit new confirmation creates a
  distinct Payment while allocations and balances remain deterministic.

## Execution shape

1. Use isolated disposable `:memory:` SQLite with a distinct authorized Admin,
   charge fixture, and fixed clock.
2. Add a fresh executor probe through public `createPayment`, comparing payment,
   command, allocation, and balance facts before/after retry and new intent.
3. Run task gates, then hand off to independent `/verify` and `/red-verify`.
4. Do not modify lifecycle from executor; scheduler closes only after both
   verdicts and strict doctor.
