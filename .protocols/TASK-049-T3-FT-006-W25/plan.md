---
description: Execution plan for TASK-049-T3-FT-006-W25.
status: active
---
# Plan — TASK-049-T3-FT-006-W25

## Claims

- `REQ-013`: authorized Admin and assigned Teacher submissions delegate the
  current lesson/student scope to `FinancialLedgerBoundary.createPayment`.
- `REQ-013`: Student, unassigned Teacher, cross-center, forged-scope, malformed
  fields, and direct-SQL bypass paths fail before financial mutation.

## Execution shape

1. Use an isolated in-memory Composition Root fixture with distinct Admin,
   assigned/unassigned Teacher, Student, center/class/lesson, and memberships.
2. Add a fresh route action probe through the public form action, compare
   payment state before/after denied submissions, and inspect route/module
   source for direct financial SQL.
3. Run task gates, then hand off to independent `/verify` and `/red-verify`.
4. Do not modify lifecycle from executor; scheduler closes only after both
   verdicts and strict doctor.
