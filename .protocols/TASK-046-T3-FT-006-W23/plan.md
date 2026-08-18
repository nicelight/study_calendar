---
description: Execution plan for TASK-046-T3-FT-006-W23.
status: active
---
# Plan — TASK-046-T3-FT-006-W23

## Claims

- `FT-006-AC-005 / REQ-012 / REQ-013 / REQ-014 / REQ-015`: Admin own-center
  create/edit/cancel and assigned-Teacher create-only authority.
- `FT-006-AC-005 / REQ-012 / REQ-013 / REQ-014 / REQ-015`: denied commands
  are non-mutating; accepted edit/cancel recompute allocations, balances, and
  audit facts deterministically.

## Execution shape

1. Use isolated disposable `:memory:` SQLite with distinct Admin, Teacher,
   Student, center, class, and scope fixtures.
2. Add a fresh executor probe through public Financial Ledger commands covering
   role/center/class matrix, forged values, before/after counts, replay, and
   audit.
3. Run task gates, then hand off to independent `/verify` and `/red-verify`.
4. Do not modify lifecycle from executor; scheduler closes only after both
   verdicts and strict doctor.
