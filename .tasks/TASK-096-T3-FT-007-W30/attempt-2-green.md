# TASK-096 Attempt 2 — Claim-linked GREEN

- task: `TASK-096-T3-FT-007-W30`
- attempt: `2`
- receipt_status: `current supporting-only`
- claim: `FT-007-AC-003 / REQ-014 / REQ-017` — one Student row per authorized
  student/class relation, distinct Teacher `studentCount`, Teacher-only
  Teachers collection for Teacher viewers, permitted serializable rows, safe
  denials, thin route, and non-mutation.
- command: `npx vitest run tests/lesson-context/ft-007-statistics-composition.test.ts tests/routes/ft-007-statistics.test.ts`
- cwd: `/home/serg/Projects/study_calendar`
- result: exit `0`; `2` files and `14/14` tests passed.
- correction basis: `LessonContextBoundary.getStatisticsRegistry` now counts
  the `Set` of `studentAccountIds` across the Teacher's assigned returned
  classes.
- isolation: Vitest test doubles and the existing in-memory Composition Root;
  deterministic cleanup; no external state or forbidden path.

This is executor self-attested supporting evidence, not an independent
functional or semantic verdict and not a reuse candidate.
