---
description: Execution context for TASK-041-T3-FT-006-W21.
status: final
---
# Context — TASK-041-T3-FT-006-W21

## Purpose

Connect the existing Financial Ledger to a minimal browser payment form and a
student-only paid/unpaid lesson-day projection.

## Loaded context

- `AGENTS.md`
- `.memory-bank/constitution.md`
- `.memory-bank/features/FT-006-financial-ledger.md`
- `.memory-bank/features/FT-003-calendar-and-lesson-context.md`
- `.memory-bank/contracts/financial-ledger.md`
- `.memory-bank/contracts/boundary-map.md`
- `.memory-bank/contracts/access-control.md`
- `.memory-bank/testing/strategy.md`
- `.memory-bank/tasks/TASK-041-T3-FT-006-W21.task.json`

## Scope decisions

- Admin and assigned Teacher use the existing Lesson Context route to record a
  payment for an authorized student.
- The route delegates to `FinancialLedgerBoundary.createPayment`; it does not
  read or write SQLite directly.
- The student's calendar derives paid/unpaid state from the ledger projection.
- Admin and Teacher shared calendars keep payment state out of their payload.
- Real Playwright uses the existing `study-calendar.db`, creates/reuses only
  the named E2E Teacher and Student, and retains the resulting test payment
  for manual inspection.

## Ownership check

Financial Ledger owns payment, allocation, charge, and balance facts. Center &
Scheduling owns class/teacher/student scope. Lesson Context and Calendar are
thin request/presentation adapters; they do not become financial stores.
