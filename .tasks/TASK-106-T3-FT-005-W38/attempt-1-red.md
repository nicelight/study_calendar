# TASK-106-T3-FT-005-W38 — Attempt 1 claim-linked RED

- attempt: 1
- claims: `FT-005-AC-001 / REQ-009`; `FT-005-AC-002 / REQ-009 / REQ-014`
- command: `node scripts/run-disposable-e2e.mjs --database tmp/ft-005-homework-grading-ui.db --spec e2e/ft-005-homework-grading-ui.spec.ts`
- cwd: `/home/serg/Projects/study_calendar`
- result: exit `1` before any UI production edit
- decisive observation: after disposable fixture seed and Admin login, the existing Lesson Context page did not expose the expected homework heading/region (`Read the homework UI chapter`), so the browser could not proceed to the required create/completion/grade controls. The current `+page.svelte` had no homework progress section or named homework forms.
- runner evidence: `test-results/ft-005-homework-grading-ui-d2c82-es-fresh-server-projections/` (Playwright screenshot, trace, and error context)
- cleanup: exact `tmp/ft-005-homework-grading-ui.db`, `-wal`, `-shm`, and `-journal` paths were absent after runner return.
- input state basis: task had already transitioned `ready -> in_progress`; task-specific source remained unchanged; unrelated dirty worktree changes were preserved.

This is the required pre-implementation behavioral RED. It is not a final task
verdict and does not replace independent `/verify` evidence.
