---
description: Execution and claim-linked evidence for TASK-041-T3-FT-006-W21.
status: final
---
# Progress — TASK-041-T3-FT-006-W21

## Current status

- state: verification-complete
- accepted claim locator(s): FT-006-AC-008 / REQ-013 / REQ-016
- accepted scope: real browser payment entry, authoritative allocation, and
  Student-only paid/unpaid calendar cards.

- RED observation and evidence: Before this follow-up, the Financial Ledger
  boundary already supported pricing, charges, payment creation, allocations,
  and balance projection, but the browser had no payment form and the calendar
  did not request financial state. Lesson cards also had no personal
  paid/unpaid presentation. The gap is captured by the bounded FT-006-AC-008
  acceptance criterion and route regression.

- GREEN observation and evidence: `tests/routes/calendar-navigation.test.ts`
  proves assigned Teacher payment
  creation, payment/allocation persistence, paid/unpaid projection, rendered
  labels/classes, Student denial, and shared-role omission.
  Real Playwright `e2e/real-database-payment.spec.ts` passed 1/1 against the
  existing `study-calendar.db`: Admin created/reused the dedicated Teacher and
  Student, the Student was assigned to the existing class, Teacher recorded a
  20-unit payment, and Student saw paid and unpaid lesson cards.
  `npm test` passed 32 files / 148 tests; check, build, diff check, mb-lint,
  and strict doctor passed.

## Data safety

Existing accounts, center, class, schedule, and lessons were preserved. The
real E2E intentionally leaves the dedicated test accounts, class membership,
price/charge, payment, and allocation in the local database for inspection.
Its exact browser session tokens are removed in the test `finally`; stale
active tokens from earlier failed runs were removed only for the dedicated
test Student account.
