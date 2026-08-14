---
description: Claim-linked pre-implementation RED for TASK-032-T2-FT-002-W16.
status: supporting
---
# TASK-032 RED — AC-009 / REQ-004

## Command

`npx vitest run tests/center-scheduling/recurring-scheduling.test.ts tests/routes/admin-center-management.test.ts`

## Observation

The newly added claim-equivalent tests failed against the unchanged
implementation while all existing tests in those files passed:

- Assigned Teacher direct boundary: `cause` was `undefined`; the valid
  2026-08-03 range with weekday `[2]` returned an empty lesson list instead of
  rejecting, and the current transaction persisted a zero-lesson schedule.
- Own-center Admin action: returned `{ ok: true, message: 'schedule_created' }`
  instead of `{ status: 400, data: { error: 'invalid_schedule' } }`.
- Test files: `2 failed, 8 passed` (10 total).

This is claim-specific RED for FT-002-AC-009 / REQ-004, not setup or artificial
failure. The failed tests compare exact Schedule/Lesson state snapshots and
exercise the authorized Admin and assigned Teacher paths.
