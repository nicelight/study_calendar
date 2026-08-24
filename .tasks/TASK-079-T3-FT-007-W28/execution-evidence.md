# TASK-079-T3-FT-007-W28 — execution evidence

## Attempt 2 retry correction

The independent verifier's only failure was the exact SQLite rollback-journal
sidecar left by `cleanupDisposableDatabase()` after a forced failure. Attempt 2
adds `removeExactFile(`${databasePath}-journal`)` and strengthens the existing
task-local forced-failure test to create and assert removal of that sidecar.

Attempt 2 RED is preserved at
`.tasks/TASK-079-T3-FT-007-W28/attempt-2-red.md`; it observed
`database=false, journal=true` before the correction. Attempt 2
claim-equivalent GREEN is at
`.tasks/TASK-079-T3-FT-007-W28/attempt-2-green.md`; it observed
`database=false, journal=false` after a forced failure and all indexed gates
passed. Attempt 1 artifacts remain preserved and supporting-only.

## Attempt 3 final bounded correction

The fresh independent retry verification found one separate anti-goal defect:
ordinary `npm run e2e -- --list` selected the disposable-only
`e2e/ft-007-navigation.spec.ts` alongside the two existing real-database
specs. Fresh Judge `gpt-5.6-sol/xhigh` authorized only the task-local
ordinary-vs-disposable selection correction and minimum regression proof.

Attempt 3 RED is preserved at
`.tasks/TASK-079-T3-FT-007-W28/attempt-3-red.md`; before correction both
ordinary and disposable list probes selected 3 tests in 3 files. Current
claim-equivalent GREEN is at
`.tasks/TASK-079-T3-FT-007-W28/attempt-3-green.md`; ordinary selection now
selects exactly the two real-database specs, while disposable mode accepts the
explicit task spec and its owned run remains 1/1.

The actual Attempt 3 correction surface is exactly:

- `playwright.config.ts` — ordinary `testMatch` is restricted to
  `real-database-payment.spec.ts` and `real-database-smoke.spec.ts`, while
  `DISPOSABLE_E2E=1` retains the wildcard selection needed by the explicit
  task runner.
- `tests/scripts/run-disposable-e2e.test.ts` — one subprocess regression
  checks exact ordinary selection and explicit disposable selection; the
  helper has only a local timeout/type annotation needed for project checks.

Both correction files are inside the indexed hard `runtime_context.write_boundary`.
No ordinary real-database smoke implementation, logout/session owner, or
forbidden path was changed.

The actual Attempt 2 implementation change surface is exactly:

- `scripts/run-disposable-e2e.mjs`
- `tests/scripts/run-disposable-e2e.test.ts`

Both files are inside the indexed hard `runtime_context.write_boundary`.
No forbidden scope, shell/logout implementation, ordinary real-database
Playwright configuration, or `study-calendar.db` was changed.

## Implemented outcome

The protected layout now resolves only a minimal `{ role }` projection from
request-local server actor context for recognized protected route prefixes.
The Svelte 5 runes shell owns only menu UI state and renders exact canonical
navigation links plus a form to the existing server-owned logout endpoint.

The disposable runner validates a direct project `tmp/*.db` target, rejects
`study-calendar.db` and outside/nested paths, prepares/removes the exact target,
passes explicit `DATABASE_URL`, runs Playwright on an owned non-reused server,
and cleans the target plus `-wal`, `-shm`, and rollback `-journal` sidecars in
`finally`. Normal Playwright configuration retains port `5173`, real-database
default, and reuse behavior outside disposable mode.

## Actual task change surface

All task-outcome files are inside the indexed hard `write_boundary`:

- `src/routes/+layout.server.ts`
- `src/routes/+layout.svelte`
- `playwright.config.ts`
- `scripts/run-disposable-e2e.mjs`
- `tests/routes/ft-007-navigation-shell.test.ts`
- `tests/scripts/run-disposable-e2e.test.ts`
- `e2e/ft-007-navigation.spec.ts`
- `tmp/.gitkeep`
- transient `tmp/ft-007-navigation.db` (created by gates and absent after each run)

Workflow-owned evidence/protocol files are under:

- `.protocols/TASK-079-T3-FT-007-W28/`
- `.tasks/TASK-079-T3-FT-007-W28/`

The indexed task card changed only through its `/exe`-owned lifecycle transition
`ready → in_progress`. No other task status, scheduler status, closure, or
dependent promotion was changed.

## Boundary and contract compliance

- No forbidden capability module, protected destination directory, or
  `study-calendar.db` was touched.
- Existing `/auth/logout` implementation remains the owner of revocation,
  cookie clearing, and redirect behavior.
- No client role, center, account, or session value controls shell visibility.
- No new session, role, authorization, persistence, or cross-module contract
  was introduced.
- Existing ordinary real-database Playwright mode remains configured for
  `127.0.0.1:5173`, `study-calendar.db`, and server reuse.

## Evidence index

- Initial claim-specific RED: `attempt-1-red.md`.
- Attempt 1 claim-equivalent GREEN: `attempt-1-green.md` (supporting-only after
  the retry).
- Current Attempt 2 claim-equivalent GREEN: `attempt-2-green.md`.
- Attempt 3 RED: `attempt-3-red.md`.
- Current Attempt 3 claim-equivalent GREEN: `attempt-3-green.md`.
- Protocol progress/handoff: `.protocols/TASK-079-T3-FT-007-W28/progress.md` and
  `.protocols/TASK-079-T3-FT-007-W28/handoff.md`.
- Independent next owner: `/verify TASK-079-T3-FT-007-W28`, then required T3
  `/red-verify TASK-079-T3-FT-007-W28` after functional PASS.

## Blocking condition

None. Executor work is complete; lifecycle remains `in_progress` by contract
until the independent verification and semantic owners act.
