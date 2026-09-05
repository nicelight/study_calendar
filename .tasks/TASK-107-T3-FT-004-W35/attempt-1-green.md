# TASK-107 Attempt 1 — claim-linked GREEN

- claim mapping: `FT-004-AC-005 / REQ-014`,
  `collaboration-browser-surface.md#authorized-mutation-transport`,
  `access-control.md#authority-and-scope`, plus the Day Discussion Query
  Boundary and Lesson Context composition flow.
- command: `git rev-parse HEAD && git status --short && ./node_modules/.bin/vitest run --config .tasks/TASK-107-T3-FT-004-W35/vitest.config.ts --reporter=verbose`
- cwd: `/home/serg/Projects/study_calendar`
- exit_code: `0`
- input_state_basis: repository revision `43780aad1b024fbbf8e89e7b2b15c55719a2368a`; current task correction was present in the route/public boundary; pre-existing unrelated workspace changes remained unchanged; isolated in-memory SQLite fixture only; no `study-calendar.db` access.
- completed_at: `2026-09-05 12:55:17 +05`

## Observation

The focused task-local probe passed 2/2 tests:

- forged current lesson and class routes returned 403 with
  `comment_forbidden`; stored bodies and `last_changed_at` values matched
  state captured before each denied request;
- same-context owner edit returned `{ collaborationSuccess: true }`, changed
  the body, and reached Collaboration with the current route `classId` and
  `lessonId`.

The probe uses only an in-memory SQLite fixture, closes it in `afterEach`, and
does not start or reuse a server or access `study-calendar.db`.
