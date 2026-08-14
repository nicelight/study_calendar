---
description: Attempt 2 project-native gate evidence for TASK-032-T2-FT-002-W16.
status: supporting
---
# TASK-032 Attempt 2 Gate Evidence

Working directory: `/home/serg/Projects/study_calendar`.

Attempt 2 re-ran all required gates after the adapter-specific VERIFY-FAIL
correction. No production or test files changed during this retry.

## Focused claim probe

- command: `npx vitest run tests/center-scheduling/recurring-scheduling.test.ts tests/routes/admin-center-management.test.ts`
- exit_code: `0`
- result: `Test Files 2 passed (2); Tests 10 passed (10)`.
- claim: Admin adapter 400 mapping; assigned Teacher private sentinel; exact
  Schedule/Lesson state equality; valid recurrence and authorization regressions.
- evidence: `green-focused-attempt2.md`.

## `npm run check`

- exit_code: `0`
- result: `svelte-check found 0 errors and 0 warnings`.

## `npm run build`

- exit_code: `0`
- result: Vite SSR/client build completed; existing adapter-auto environment
  advisory only.

## `npm run test`

- exit_code: `0`
- result: `Test Files 29 passed (29); Tests 116 passed (116)`.

## `git diff --check`

- exit_code: `0`
- result: no whitespace errors.

These are current executor supporting evidence; `/verify` remains responsible
for independent task verdict and closure routing.
