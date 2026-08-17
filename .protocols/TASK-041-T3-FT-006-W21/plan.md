---
description: Execution plan for TASK-041-T3-FT-006-W21.
status: final
---
# Plan — TASK-041-T3-FT-006-W21

## Goal

Prove the complete real browser path from an assigned Teacher's payment entry
to a Student's paid/unpaid calendar cards.

## Implementation boundary

- Lesson Context: validate the form, re-resolve the authorized lesson scope,
  and delegate `createPayment`.
- Calendar: request the balance projection only for a Student actor and map
  fully paid charges to the minimal paid/unpaid card presentation.
- Tests: cover role denial, ledger allocation, shared-role omission, and a
  real local-database Playwright flow.

## Verification

- Focused route regression and full Vitest suite.
- Svelte check, production build, real-db payment E2E, diff check,
  Memory-Bank lint, and strict doctor.
- Independent semantic review of financial ownership, role scope, and privacy.
