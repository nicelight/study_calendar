# TASK-107 Attempt 1 — claim-linked RED

- claim mapping: `FT-004-AC-005 / REQ-014`,
  `collaboration-browser-surface.md#authorized-mutation-transport`,
  `access-control.md#authority-and-scope`, plus the Day Discussion Query
  Boundary and Lesson Context composition flow.
- command: `git rev-parse HEAD && git status --short && ./node_modules/.bin/vitest run --config .tasks/TASK-107-T3-FT-004-W35/vitest.config.ts --reporter=verbose`
- cwd: `/home/serg/Projects/study_calendar`
- exit_code: `1`
- input_state_basis: repository revision `43780aad1b024fbbf8e89e7b2b15c55719a2368a`; pre-existing tracked and untracked changes were present in the broader workspace, including the related dirty `src/routes/lesson-context/+page.server.ts`, `src/lib/server/modules/collaboration/public.ts`, and route/collaboration tests; TASK-107 production behavior was unchanged before this command; isolated in-memory SQLite fixture only; no `study-calendar.db` access.
- completed_at: `2026-09-05 12:53:36 +05`

## Observation

The focused probe failed on both task-owned expectations:

1. Forged current route `class-route / lesson-route-one` edited an owned
   comment stored under `lesson-route-two`; the action returned
   `{ collaborationSuccess: true }` instead of HTTP 403 with
   `comment_forbidden`.
2. Same-context success reached Collaboration with only
   `sessionToken`, `commentId`, and `body`; the expected current `classId` and
   `lessonId` were absent.

The failure is an honest pre-implementation RED for the protected route-scope
claim. It is not a setup, syntax, artificial, or unrelated failure.
