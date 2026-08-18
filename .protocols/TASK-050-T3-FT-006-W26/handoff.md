---
description: Execution handoff for TASK-050-T3-FT-006-W26.
status: active
---
# Handoff — TASK-050-T3-FT-006-W26

## Summary

- Task owns the complete browser payment and Student personal paid/unpaid
  projection outcome after TASK-049's adapter boundary.
- Financial Ledger remains the sole financial source of truth; Calendar is a
  read-only consumer.

## Where to look

- key files: `src/routes/calendar/`,
  `e2e/real-database-payment.spec.ts`,
  `tests/routes/calendar-navigation.test.ts`
- hard write-boundary compliance: yes

## How to run / verify

- focused gate: `npm run e2e -- e2e/real-database-payment.spec.ts`
- full gates: `npm run check`, `npm test`, `npm run build`, `git diff --check`,
  `node scripts/mb-lint.mjs`, `node scripts/mb-doctor.mjs --strict`
- claim-linked RED/GREEN evidence: `progress.md`, Attempt 1
- current-attempt reuse candidate locators: none; the real-DB E2E depends on
  external local database state and is not offered for reuse

## Known issues

- None confirmed. Real database and fixture cleanup are recorded in
  `execution-evidence.md`.

## Follow-ups

- Executor gates/evidence are complete; hand off to `/verify
  TASK-050-T3-FT-006-W26`.
