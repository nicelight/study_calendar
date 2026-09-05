# TASK-105-T3-FT-005-W37 — Attempt 2 claim-linked GREEN

- task: `TASK-105-T3-FT-005-W37`
- attempt: `2`
- role: `Implementer`
- claims: `FT-005-AC-001 / REQ-009` class-visible completion through the
  Lesson Context transport; Learning Progress Browser Surface
  `#server-composed-homework-projection`
- retained RED basis: Attempt 1 semantic verification found that
  `getHomeworkProgressForLesson` passed Student-specific
  `scope.studentAccountIds` into its completion projection, so Student B did
  not receive Student A's completion. Evidence is retained in
  `.tasks/TASK-105-T3-FT-005-W37/TASK-105-T3-FT-005-W37-S-RED-VERIFY-final-report-docs-01.md`.
- correction: the provider projection now delegates completion retrieval to the
  existing authorized `getHomeworkCompletions` class-view boundary. Grade
  retrieval remains restricted to the actor-resolved student scope.
- command: `npx vitest run tests/routes/lesson-context-homework-actions.test.ts --reporter verbose`
- cwd: `/home/serg/Projects/study_calendar`
- repository_revision: `43780aad1b024fbbf8e89e7b2b15c55719a2368a`
- completed_at: `2026-09-05T04:03:43+05:00`
- exit_code: `0`
- result: `1` file and `4` tests passed. The regression now completes Student A
  through the named Lesson Context action, loads the shared Lesson Context as
  Student B, and observes Student A `completed: true` alongside Student B's
  class entry. Shared completion entries contain no grade field.
- isolation: every fixture uses `createCompositionRoot({ databaseFilename:
  ':memory:' })`; the test compares progress state before and after denied and
  repeated actions and closes the database in `afterEach`.
- changed-surface_sha256: `397d41d5a05aca699b35afe0f6e414377506d09d42dfba56106c3e48e304bb19`
- receipt_status: `supporting-only` for independent `/verify`; this is fresh
  executor evidence for Attempt 2, not a final task verdict.
