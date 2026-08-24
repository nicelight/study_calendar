# TASK-079 Attempt 3 — claim-equivalent GREEN

## Claim

- task claim: `FT-007-AC-001 / REQ-017` disposable browser proof must remain
  disposable-only while ordinary real-database Playwright smoke selection
  remains unchanged.
- retry correction: ordinary Playwright config now selects exactly the two
  existing real-database specs; disposable mode retains wildcard selection for
  the explicit task spec. A task-local regression executes both selection
  modes.
- result: `GREEN_RESULT: PASS` (executor evidence only; fresh independent
  `/verify` and required T3 `/red-verify` remain due).

## Exact selection evidence

1. `npm run e2e -- --list`
   - exit code: `0`
   - selected exactly `real-database-payment.spec.ts` and
     `real-database-smoke.spec.ts`
   - output: `Total: 2 tests in 2 files`
   - `ft-007-navigation.spec.ts` was absent.
2. `DISPOSABLE_E2E=1 DATABASE_URL="$PWD/tmp/ft-007-navigation.db" PLAYWRIGHT_PORT=5174 npm run e2e -- --list e2e/ft-007-navigation.spec.ts`
   - exit code: `0`
   - selected exactly `ft-007-navigation.spec.ts`
   - output: `Total: 1 test in 1 file`

## Disposable isolation and cleanup

- `node scripts/run-disposable-e2e.mjs --database tmp/ft-007-navigation.db --spec e2e/ft-007-navigation.spec.ts`
  → exit `0`; owned-server Playwright `1 passed`.
- Real DB before/after was identical:
  `size=356352`, `mtimeMs=1787353343584.7817`,
  `sha256=ae1f1b9d2b5f87fce77f5b7dea4a30b5635fe80e56080df461aff390246ec494`.
- After success cleanup, database, `-wal`, `-shm`, and `-journal` were all
  absent.
- Forced failure materialized all four exact paths and returned
  `{"result":1,"cleanup":{"database":false,"-wal":false,"-shm":false,"-journal":false}}`.

## Required gates

- `npm run test -- tests/scripts/run-disposable-e2e.test.ts` → exit `0`,
  `1 file / 5 tests`.
- `npm run check` → exit `0`, 0 errors / 0 warnings.
- `npm run test` → exit `0`, `59 files / 189 tests`.
- `npm run build` → exit `0`.
- `git diff --check` → exit `0`.
- `node scripts/mb-lint.mjs` → exit `0`, 74 files; only pre-existing
  metadata warnings.
- `node scripts/mb-doctor.mjs --strict` → exit `0`, 0 errors / 0 warnings / 2
  info.

## Boundary and retry disposition

- Attempt 3 changed only `playwright.config.ts` and
  `tests/scripts/run-disposable-e2e.test.ts`, both inside the indexed hard
  `runtime_context.write_boundary`; workflow evidence/protocol artifacts are
  task-owned.
- No forbidden scope, `study-calendar.db`, existing logout/session owner, or
  ordinary real-database smoke behavior was changed.
- Attempt 1 and Attempt 2 RED/GREEN and independent Attempt 1/2 FAIL evidence
  remain preserved and supporting-only; the Attempt 3 RED is at
  `.tasks/TASK-079-T3-FT-007-W28/attempt-3-red.md`.
- No reusable execute receipt is proposed because the shared worktree has
  unrelated dirty/runtime-sensitive inputs.
