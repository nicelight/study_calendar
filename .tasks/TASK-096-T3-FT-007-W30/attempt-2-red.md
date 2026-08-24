# TASK-096 Attempt 2 — Claim-linked RED

- task: `TASK-096-T3-FT-007-W30`
- attempt: `2`
- receipt_status: `current supporting-only`
- claim: `FT-007-AC-003 / REQ-014 / REQ-017` — Teacher `studentCount` is the
  number of distinct Student accounts across assigned classes.
- command: `npx vitest run tests/lesson-context/ft-007-statistics-composition.test.ts`
- cwd: `/home/serg/Projects/study_calendar`
- result: exit `1`; the new isolated probe retained two Student relationship
  rows for one Student in two assigned classes and observed Teacher One
  `studentCount: 2` rather than `1`.
- timing: before the Attempt 2 production correction.
- isolation: Vitest test doubles only; no provider implementation, real
  database, external system, or forbidden path was used.

This is fresh execution evidence only. It does not determine functional or
semantic verification verdicts.
