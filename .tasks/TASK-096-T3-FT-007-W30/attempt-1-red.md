---
description: Attempt 1 claim-linked RED for TASK-096 Statistics composition.
status: final
---
# Attempt 1 RED — TASK-096-T3-FT-007-W30

- claim: `FT-007-AC-003 / REQ-014 / REQ-017`
- command: `npx vitest run tests/lesson-context/ft-007-statistics-composition.test.ts`
- cwd: `/home/serg/Projects/study_calendar`
- exit code: `1`
- result: `1` test file failed; `8/8` claim-scoped tests failed because
  `LessonContextBoundary.getStatisticsRegistry` does not exist.
- decisive observation: the current production boundary cannot compose or
  deny the accepted Statistics registry at all; the failure is the missing
  task-owned behavior, not setup, syntax, or an artificial break.
- isolation: Vitest test doubles only; no database, external service, provider
  state, or forbidden path was read or written.
- production changes before RED: none.
