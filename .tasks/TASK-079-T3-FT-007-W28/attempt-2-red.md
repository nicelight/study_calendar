# TASK-079 Attempt 2 — retry claim-specific RED

## Claim

- task claim: `FT-007-AC-001 / REQ-017` disposable browser proof
- retry basis: durable independent `/verify` `FAIL` at
  `.protocols/TASK-079-T3-FT-007-W28/verification.md`; the failure was the
  exact SQLite rollback-journal sidecar left after forced cleanup.
- correction basis: `cleanupDisposableDatabase()` must remove
  `<database>-journal` and the task-local failure proof must assert that result.

## Exact command and result

- command: `node --input-type=module -e "import { existsSync, rmSync, writeFileSync } from 'node:fs'; import { resolve } from 'node:path'; const { main } = await import('./scripts/run-disposable-e2e.mjs'); const root = process.cwd(); const db = resolve(root, 'tmp/ft-007-navigation.db'); const result = await main(['--database', 'tmp/ft-007-navigation.db', '--spec', 'e2e/ft-007-navigation.spec.ts'], root, ({ databasePath }) => { writeFileSync(databasePath, 'forced-failure-database'); writeFileSync(databasePath + '-journal', 'rollback-journal'); return 1; }); const observed = { result, database: existsSync(db), journal: existsSync(db + '-journal') }; console.log(JSON.stringify(observed)); for (const path of [db, db + '-wal', db + '-shm', db + '-journal']) rmSync(path, { force: true }); process.exitCode = observed.journal ? 1 : 0;"`
- cwd: `/home/serg/Projects/study_calendar`
- exit code: `1`
- input state basis: current Attempt 2 source before correction; task status
  `in_progress`; Attempt 1 and independent verifier evidence preserved; only
  the exact disposable target and its sidecars were created transiently.

## Observation

The forced runner failure returned `result: 1`, removed the database, but left
the exact rollback journal: `{"result":1,"database":false,"journal":true}`.
The probe removed its own disposable target and sidecars after observation.
This is claim-specific retry RED bound to the independent verifier's failure,
not an artificial setup failure; the original Attempt 1 RED remains preserved.
