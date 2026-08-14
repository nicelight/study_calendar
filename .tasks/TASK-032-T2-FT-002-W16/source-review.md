---
description: Source and transaction review for TASK-032-T2-FT-002-W16.
status: supporting
---
# TASK-032 Source Review

- `src/lib/server/modules/center-scheduling/public.ts`: after actor/scope
  authorization, weekday/date normalization, and inclusive recurrence
  computation, `dates.length === 0` throws the private
  `invalid-schedule-occurrences` sentinel before `createdAt`, Schedule insert,
  or Lesson insert. The existing database transaction therefore rolls back any
  earlier mutation (none occurs before this decision).
- `src/routes/admin/center-dashboard.server.ts`: maps only that private
  sentinel into the existing `fail(400, { error: 'invalid_schedule' })`
  envelope alongside existing schedule-input failures.
- No schema, persistence model, authorization scope, browser draft, package
  manifest, or valid-occurrence recurrence code changed.
- Focused tests prove exact Schedule/Lesson state equality before and after for
  own-center Admin and assigned Teacher; existing valid-occurrence and
  authorization tests remain green.
