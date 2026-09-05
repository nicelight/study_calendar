---
description: Claim-linked GREEN evidence for Attempt 2 of TASK-107-T3-FT-004-W35.
status: supporting-only
---
# TASK-107 Attempt 2 — claim-linked GREEN

- attempt: `2`
- claim: `FT-004-AC-005 / REQ-014`, Collaboration Browser Surface
  `#authorized-mutation-transport`, Access Control `#authority-and-scope`,
  and the accepted Lesson Context → Collaboration composition boundary.
- correction: `actionContext` retains the selected `studentAccountId`, the
  named action passes it to Collaboration, and Collaboration derives and
  server-checks the current personal/shared scope before comparing the stored
  target and existing UPDATE.
- command: `./node_modules/.bin/vitest run --config
  .tasks/TASK-107-T3-FT-004-W35/attempt-2-personal-scope.vitest.config.ts
  --reporter=verbose`
- cwd: `/home/serg/Projects/study_calendar`
- exit_code: `0`
- input_state_basis: repository revision
  `43780aad1b024fbbf8e89e7b2b15c55719a2368a`; Attempt 1 class/lesson
  correction and Attempt 2 student-scope correction present; task-local
  probe/config present; broad pre-existing workspace changes retained; the
  fixture uses in-memory SQLite only.
- completed_at: `2026-09-05 13:40:18 +05`
- observation: 1 file / 2 tests passed. A forged `student-one` URL editing a
  personal comment stored for `student-two` returned 403 `comment_forbidden`
  and left body and `last_changed_at` unchanged. A same-class/same-lesson
  `student-two` owner edit returned `{ collaborationSuccess: true }` and
  changed the body.
- cleanup: the in-memory database was closed in `afterEach`; no real database
  or `study-calendar.db` was targeted.
