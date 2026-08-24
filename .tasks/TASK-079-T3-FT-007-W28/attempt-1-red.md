# TASK-079 Attempt 1 — claim-specific RED

- claim: `FT-007-AC-001 / REQ-017` protected shell plus task-owned disposable
  browser proof.
- command: `npm run test -- tests/routes/ft-007-navigation-shell.test.ts tests/scripts/run-disposable-e2e.test.ts`
- cwd: `/home/serg/Projects/study_calendar`
- result: exit code `1`; 2 test files, 6 tests failed.
- observation: the focused route assertions failed because
  `src/routes/+layout.server.ts` and `src/routes/+layout.svelte` were absent;
  runner path/cleanup imports failed because `scripts/run-disposable-e2e.mjs`
  was absent; Playwright config lacked disposable mode and
  `reuseExistingServer: false`.
- qualification: this is claim-specific RED for the missing production outcome,
  not a setup/syntax/artificial failure. No production change was made before
  this probe; the task was already durably `in_progress`.
