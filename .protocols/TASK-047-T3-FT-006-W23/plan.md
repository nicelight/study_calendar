---
description: Execution plan for TASK-047-T3-FT-006-W23.
status: active
---
# Plan — TASK-047-T3-FT-006-W23

## Claims

- `FT-006-AC-006 / REQ-013`: marker placement uses the closest previous
  non-lesson day, preserves factual date, and keeps multiple markers visible
  across week/month boundaries.
- `FT-006-AC-006 / REQ-013`: marker projection is read-only and leaves payment,
  allocation, charge, balance, and audit facts unchanged.

## Execution shape

1. Use isolated disposable `:memory:` SQLite with distinct lesson dates,
   boundary ranges, two same-day payments, and an authorized scope.
2. Add a fresh executor probe through public payment and marker APIs with
   before/after financial-row equality and authorization denial.
3. Run task gates, then hand off to independent `/verify` and `/red-verify`.
4. Do not modify lifecycle from executor; scheduler closes only after both
   verdicts and strict doctor.
