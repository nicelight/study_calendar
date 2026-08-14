---
description: Claim-linked post-implementation GREEN for TASK-032-T2-FT-002-W16.
status: supporting
---
# TASK-032 GREEN — AC-009 / REQ-004

## Command

`npx vitest run tests/center-scheduling/recurring-scheduling.test.ts tests/routes/admin-center-management.test.ts`

## Observation

`Test Files 2 passed (2); Tests 10 passed (10)`.

The focused tests prove:

- own-center Admin receives the existing `{ status: 400, data: { error:
  'invalid_schedule' } }` action failure for a valid date range with no
  matching weekday;
- assigned Teacher receives the owner-boundary `invalid-schedule-occurrences`
  rejection for the same command;
- Schedule and Lesson snapshots are exactly unchanged for both principals;
- existing valid recurring schedule, lesson identity/exception, authorization,
  and Admin schedule action tests remain green.
