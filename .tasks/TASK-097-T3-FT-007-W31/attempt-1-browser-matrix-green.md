# TASK-097 — Attempt 1 Browser Matrix GREEN

- scope: bounded completion of the current executor evidence after verifier-only `NEEDS-CLARIFICATION`; no retry, lifecycle change, or production behavior change.
- claim: `FT-007-AC-004 / REQ-017` and `statistics-projection.md#sorting-and-presentation`.
- command: `node scripts/run-disposable-e2e.mjs --database tmp/ft-007-statistics.db --spec e2e/ft-007-statistics.spec.ts`.
- result: exit `0`; one Playwright test passed on a newly owned SvelteKit server with the exact disposable database.
- matrix: `8` Students + `6` Teachers + `4` Classes controls, both directions per control, for `36` browser clicks. Every click asserts the active `aria-sort` direction. The fixture also asserts alphabetical text, chronological registration dates, numeric percentage/count ordering, and Teacher Classes ordering by the first rendered alphabetized class.
- source facts: `snapshotDatabase()` compared JSON snapshots of `15` source/provider tables before and after the complete browser matrix; equality passed.
- isolation and cleanup: the runner used only `tmp/ft-007-statistics.db`; after the command, that DB and its `-wal`, `-shm`, and `-journal` sidecars were absent. The test neither opens nor changes `study-calendar.db`.
- original RED: preserved at `.tasks/TASK-097-T3-FT-007-W31/attempt-1-red.md`; this evidence remains within Attempt 1.
