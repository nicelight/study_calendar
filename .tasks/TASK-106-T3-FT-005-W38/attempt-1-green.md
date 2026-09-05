# TASK-106-T3-FT-005-W38 — Attempt 1 claim-linked GREEN

- task: `TASK-106-T3-FT-005-W38`
- attempt: `1`
- role: `Implementer`
- tier / wave / feature: `T3` / `W38` / `FT-005`
- Planning Revision: `2`
- claims: `FT-005-AC-001 / REQ-009`; `FT-005-AC-002 / REQ-009 / REQ-014`
- RED retained: `.tasks/TASK-106-T3-FT-005-W38/attempt-1-red.md`
- command: `node scripts/run-disposable-e2e.mjs --database tmp/ft-005-homework-grading-ui.db --spec e2e/ft-005-homework-grading-ui.spec.ts`
- cwd: `/home/serg/Projects/study_calendar`
- repository_revision: `43780aad1b024fbbf8e89e7b2b15c55719a2368a`
- completed_at: `2026-09-05T05:19:07+0500`
- exit_code: `0`
- result: `1` Playwright test passed using the runner-owned server and disposable database.

## Observable claim-equivalent result

- Admin created the missing class-scoped homework item through the existing
  Lesson Context named action.
- Student One saw the server-projected item, marked it complete, reloaded, and
  saw `Выполнено`; Teacher saw Student One completed and Student Two not
  completed in the class-visible status list.
- Teacher recorded each accepted value `α`, `β`, `γ`, and `F`; each value was
  reloaded from the server projection, and the final `F` was visible to the
  corresponding Student and linked Parent in personal context.
- Shared class status rows contain completion state only; the flow asserts no
  grade form/value is exposed to Student One personal context.
- Student Two's forged grade POST returned the server action error
  `homework_forbidden` and preserved the full progress snapshot. Student Two's
  guessed Student One personal URL returned HTTP `403` with unchanged state.
  An unlinked Parent's guessed personal URL likewise returned HTTP `403` with
  unchanged state.
- Final database assertions observed one homework, one completion for Student
  One, and the persisted final grade `F`.

## Boundary

- Production change: `src/routes/lesson-context/+page.svelte` only.
- Browser proof: `e2e/ft-005-homework-grading-ui.spec.ts` only.
- Workflow evidence is under `.protocols/TASK-106-T3-FT-005-W38/` and this
  task artifact. No server/provider/API/database/runner/config file was edited.
- Changed-surface SHA-256:
  `src/routes/lesson-context/+page.svelte`
  `4c383d5f338c409b8d404f9021efb42de83f97525fbe0a2a41ebedb4de76209b`;
  `e2e/ft-005-homework-grading-ui.spec.ts`
  `0b155aa0e778a098c11bd1ddc64e7357bc549145da3c4ca8696740b7f2fee32c`.
- `study-calendar.db` was not opened by this disposable flow; the separate
  required full test gate's observed mutation is recorded as a papercut.

This is supporting executor GREEN evidence, not an independent `/verify`
verdict or lifecycle closure.
