# TASK-097 — Execution Evidence (Attempt 1)

## Scope and boundary

- Actual production/test paths: `src/routes/statistics/+page.svelte`, `tests/routes/ft-007-statistics-sorting.test.ts`, `e2e/ft-007-statistics.spec.ts`.
- Task lifecycle bookkeeping: `.memory-bank/tasks/TASK-097-T3-FT-007-W31.task.json` changed only from `ready` to `in_progress`; T3 protocol/evidence paths are skill-owned.
- Hard boundary: satisfied. No forbidden provider module, Lesson Context module, runner/config, `playwright.config.ts`, `study-calendar.db`, or TASK-098 path was touched.
- Semantics: local `$state` presentation sorting copies TASK-096's serializable result. It does not call a provider, change server-side scope, query semantics, cardinality, Teacher viewer scope, or source facts.

## Claim evidence

- Honest pre-change RED: `.tasks/TASK-097-T3-FT-007-W31/attempt-1-red.md`.
- Original claim-equivalent GREEN: `.tasks/TASK-097-T3-FT-007-W31/attempt-1-green.md`.
- Current bounded browser GREEN: `.tasks/TASK-097-T3-FT-007-W31/attempt-1-browser-matrix-green.md`.

## Bounded evidence completion after verifier clarification

- The verifier identified a proof gap only: `18` controls were present but the previous browser flow had `12` clicks. No task lifecycle, task claim, production behavior, dependency, or retry eligibility changed.
- The task-owned browser spec now executes `36` clicks: ascending and descending for every `8` Students, `6` Teachers, and `4` Classes column. Each click asserts the selected `th[aria-sort]` active direction.
- The same fresh flow proves alphabetical text, chronological dates, numeric percentage/count sorting, and Teacher Classes based on the first rendered ordered class. All Institution values intentionally belong to the one authorized Center; those stable ties still prove their two visible active directions.
- It snapshots exactly `15` source/provider tables before and after the entire interaction matrix and compares them byte-for-byte through the existing `snapshotDatabase` JSON representation. The runner starts its own supplied-DB server; after success, `tmp/ft-007-statistics.db`, `-wal`, `-shm`, and `-journal` are absent.

## Required gates

| Gate | Command | Result |
| --- | --- | --- |
| check | `npm run check` | PASS — 0 errors, 0 warnings |
| focused route | `npx vitest run tests/routes/ft-007-statistics-sorting.test.ts tests/routes/ft-007-statistics.test.ts` | PASS — 2 files / 5 tests (Attempt 1 original focused proof) |
| test | `npm run test` | PASS — 67 files / 225 tests |
| build | `npm run build` | PASS — production build completed; adapter-auto notice non-failing |
| e2e-statistics | `node scripts/run-disposable-e2e.mjs --database tmp/ft-007-statistics.db --spec e2e/ft-007-statistics.spec.ts` | PASS — 1 owned-server Playwright test; full 36-click matrix |
| e2e cleanup | `test ! -e tmp/ft-007-statistics.db && test ! -e tmp/ft-007-statistics.db-wal && test ! -e tmp/ft-007-statistics.db-shm && test ! -e tmp/ft-007-statistics.db-journal` | PASS — exact disposable DB and all SQLite sidecars absent after runner `finally` cleanup |
| diff | `git diff --check` | PASS |
| mb-lint | `node scripts/mb-lint.mjs` | PASS — 74 files; existing advisory metadata warnings only |
| strict-doctor | `node scripts/mb-doctor.mjs --strict` | PASS — 0 errors, 0 warnings, 2 info |

All results are supporting executor evidence, not independent verification and not reuse candidates: the pre-command repository state includes unrelated tracked and untracked work outside this task, so no bounded read-surface receipt is credible.

## Next owner

Fresh `/verify TASK-097-T3-FT-007-W31`; if functional `PASS`, then required per-task `/red-verify TASK-097-T3-FT-007-W31`. Scheduler retains lifecycle closure, promotion, and wave synchronization.
