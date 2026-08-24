# TASK-079 Attempt 2 — claim-equivalent GREEN

## Claim

- task claim: `FT-007-AC-001 / REQ-017` disposable browser proof
- retry correction: `cleanupDisposableDatabase()` now removes the exact
  SQLite rollback-journal sidecar `<database>-journal`; the task-local forced
  failure regression creates that sidecar and asserts its removal.
- result: `GREEN_RESULT: PASS` (executor evidence only; independent `/verify`
  and required T3 `/red-verify` remain due).

## Exact commands and results

All commands ran from `/home/serg/Projects/study_calendar` on the current
Attempt 2 source basis at repository revision
`fd867181985b28fc3b1bba661e50cddbbfb38e7d`; unrelated pre-existing W27 dirty
changes were preserved and not attributed to this retry.

1. `npm run test -- tests/scripts/run-disposable-e2e.test.ts`
   → exit `0`; 1 file / 4 tests passed, including forced failure cleanup with
   the rollback journal sidecar.
2. Focused forced-failure probe:

   ```sh
   node --input-type=module -e "import { existsSync, rmSync, writeFileSync } from 'node:fs'; import { resolve } from 'node:path'; const { main } = await import('./scripts/run-disposable-e2e.mjs'); const root = process.cwd(); const db = resolve(root, 'tmp/ft-007-navigation.db'); const result = await main(['--database', 'tmp/ft-007-navigation.db', '--spec', 'e2e/ft-007-navigation.spec.ts'], root, ({ databasePath }) => { writeFileSync(databasePath, 'forced-failure-database'); writeFileSync(databasePath + '-journal', 'rollback-journal'); return 1; }); const observed = { result, database: existsSync(db), journal: existsSync(db + '-journal') }; console.log(JSON.stringify(observed)); for (const path of [db, db + '-wal', db + '-shm', db + '-journal']) rmSync(path, { force: true }); process.exitCode = observed.result === 1 && !observed.database && !observed.journal ? 0 : 1;"
   ```

   → exit `0`; observed `{"result":1,"database":false,"journal":false}`
   after a forced non-zero run.
3. `npm run check`
   → exit `0`; `svelte-check found 0 errors and 0 warnings`.
4. `npm run test`
   → exit `0`; 59 files / 188 tests passed.
5. `npm run build`
   → exit `0`; SSR and client production bundles built successfully.
6. `node scripts/run-disposable-e2e.mjs --database tmp/ft-007-navigation.db --spec e2e/ft-007-navigation.spec.ts`
   → exit `0`; owned-server Playwright 1/1 passed, including protected shell,
   existing POST logout, redirect, and old-token denial.
7. `git diff --check`
   → exit `0`.
8. `node scripts/mb-lint.mjs`
   → exit `0`; 74 files passed; only pre-existing advisory metadata warnings.
9. `node scripts/mb-doctor.mjs --strict`
   → exit `0`; 0 errors / 0 warnings / 2 informational messages.

## Fresh isolation observation

A wrapper reran the exact disposable E2E command while fingerprinting the real
`study-calendar.db` before and after. It observed exit `0`,
`realDbUnchanged=true`, `disposableDatabase=false`, and
`disposableJournal=false`; both real-database fingerprints were
`size=356352`, `mtimeMs=1787352642639.2795`,
`sha256=833a0ea4eb1f586321c70c586e0637e35bf353ab4e1b85b9ffc105a66afb1dda`.
The task tmp directory retained only `.gitkeep` after the run.

## Boundary / retry disposition

- actual implementation files changed: `scripts/run-disposable-e2e.mjs` and
  `tests/scripts/run-disposable-e2e.test.ts` only; both are inside the hard
  `runtime_context.write_boundary`.
- no forbidden scope, `study-calendar.db`, shell, logout route, or ordinary
  real-database Playwright configuration was changed.
- Attempt 1 RED/GREEN and independent `/verify` `FAIL` remain preserved;
  Attempt 1 receipts are supporting-only for this retry.
- no reusable execute receipt is proposed because the shared worktree has
  unrelated dirty/runtime-sensitive inputs.
