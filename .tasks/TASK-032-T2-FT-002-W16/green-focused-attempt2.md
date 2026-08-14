---
description: Attempt 2 adapter-specific GREEN for TASK-032-T2-FT-002-W16.
status: supporting
---
# TASK-032 Attempt 2 GREEN — AC-009 / REQ-004

## Retry basis

Attempt 1's claim-specific RED and GREEN remain supporting-only. Independent
VERIFY-FAIL identified an adapter-contract presentation issue: the task must
state that only the existing Admin adapter maps HTTP 400, while the assigned
Teacher owner call remains private sentinel-only and has no HTTP transport.
The accepted correction requires no production or test-shape change.

## Command

`npx vitest run tests/center-scheduling/recurring-scheduling.test.ts tests/routes/admin-center-management.test.ts`

## Observation

`Test Files 2 passed (2); Tests 10 passed (10)`.

- Own-center Admin action receives `{ status: 400, data: { error:
  'invalid_schedule' } }` from the existing adapter.
- Assigned Teacher owner-boundary call exposes only the private
  `invalid-schedule-occurrences` sentinel; no Teacher HTTP transport is used.
- Schedule/Lesson state snapshots remain exactly equal before and after both
  failed commands.
- Existing valid-occurrence recurrence, lesson identity/exception, and
  authorization tests remain green.
