---
description: Attempt 1 claim-equivalent GREEN for TASK-096 Statistics composition.
status: final
---
# Attempt 1 GREEN — TASK-096-T3-FT-007-W30

- claim: `FT-007-AC-003 / REQ-014 / REQ-017`
- command: `npx vitest run tests/lesson-context/ft-007-statistics-composition.test.ts tests/routes/ft-007-statistics.test.ts`
- cwd: `/home/serg/Projects/study_calendar`
- exit code: `0`
- result: `2` test files passed; `13/13` tests passed.
- decisive observations:
  - Center & Scheduling `getRegistryFacts` is called before Identity & Access
    `getStatisticsProfiles`, using only C&S-scoped participant IDs.
  - The only composition provider methods are `getRegistryFacts`,
    `getStatisticsProfiles`, `getAttendancePercentage`, and
    `getPaymentCapability`; request actor/session and exact per-row arguments
    are asserted.
  - Complete Students, Teachers, and Classes fields are serializable; the
    Teacher result remains limited to the current Teacher while assigned-class
    teacher names remain visible.
  - anonymous, Student, Parent, cross-center Admin, removed Teacher, and
    incomplete-profile paths fail closed before enrichment or metric reads.
  - the real in-memory module graph produces the projection with every
    provider-owned source table equal before and after.
  - `/statistics` calls Lesson Context once, renders every accepted field, has
    no mutation controls, and contains no provider/table access.
- isolation and cleanup: deterministic Vitest doubles plus a real in-memory
  Composition Root closed in `finally`; no external system, real database,
  user state, or forbidden path used.
- probe strength change from RED: the same composition scenarios remain, the
  route adapter/presentation proof and real in-memory non-mutation proof were
  added to complete the accepted GREEN surface; no RED assertion was weakened.
