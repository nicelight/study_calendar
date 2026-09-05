---
description: Retry RED evidence for Attempt 2 of TASK-107-T3-FT-004-W35.
status: supporting-only
---
# TASK-107 Attempt 2 — claim-linked RED

- attempt: `2`
- retry basis: `.protocols/TASK-107-T3-FT-004-W35/red-verification.md` and
  `.tasks/TASK-107-T3-FT-004-W35/semantic-personal-scope.probe.test.ts`
  independently proved that the selected personal `studentAccountId` was
  discarded before `editFieldComment` authorization.
- claim: `FT-004-AC-005 / REQ-014`, Collaboration Browser Surface
  `#authorized-mutation-transport`, Access Control `#authority-and-scope`,
  and the accepted Lesson Context → Collaboration composition boundary.
- command: `./node_modules/.bin/vitest run --config
  .tasks/TASK-107-T3-FT-004-W35/attempt-2-personal-scope.vitest.config.ts
  --reporter=verbose`
- cwd: `/home/serg/Projects/study_calendar`
- exit_code: `1`
- input_state_basis: repository revision
  `43780aad1b024fbbf8e89e7b2b15c55719a2368a`; Attempt 1 class/lesson
  correction present; Attempt 2 student-scope correction absent; task-local
  probe/config present; broad pre-existing workspace changes retained; the
  fixture uses in-memory SQLite only.
- completed_at: `2026-09-05 13:38:51 +05`
- observation: the forged `student-one` URL editing a personal comment stored
  for `student-two` returned `{ collaborationSuccess: true }`, so the desired
  403 denial assertion failed. The same-context personal owner test passed
  (`1 failed | 1 passed`), confirming the retry probe is specific to the
  missing selected-student check.
- evidence source: `.tasks/TASK-107-T3-FT-004-W35/attempt-2-personal-scope.probe.test.ts`
  and `.tasks/TASK-107-T3-FT-004-W35/attempt-2-personal-scope.vitest.config.ts`.

Attempt 1 RED remains historical supporting evidence; this fresh retry RED is
the basis for the bounded `studentAccountId` propagation/check correction.
