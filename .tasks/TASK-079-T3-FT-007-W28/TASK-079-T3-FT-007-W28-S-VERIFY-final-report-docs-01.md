# TASK-079-T3-FT-007-W28 — independent verification evidence

## Scope and basis

- Task: `TASK-079-T3-FT-007-W28`, tier `T3`, lifecycle observed as
  `in_progress`; exactly one index match.
- Owned claims: `FT-007-AC-001 / REQ-017` protected shell, existing logout
  integration, and task-owned disposable browser proof; `REQ-014` is the
  server-authority/privacy constraint.
- Normative basis: FT-007 AC-001, Authentication Transport `#session-issuance-and-revocation`, Access Control `#authority-and-scope`, Boundary Map `#actor-context-boundary`, and Testing Strategy `#disposable-browser-proof`.
- Executor RED/GREEN artifacts were read as supporting evidence only. The
  executor GREEN count is stale relative to the current focused test set (it
  reports six tests; the current run has seven), so it was not reused as an
  independent gate.

## Verifier-owned checks

1. `npm run test -- tests/routes/ft-007-navigation-shell.test.ts tests/scripts/run-disposable-e2e.test.ts`
   — exit `0`, 2 files / 7 tests.
2. `node scripts/run-disposable-e2e.mjs --database tmp/ft-007-navigation.db --spec e2e/ft-007-navigation.spec.ts`
   — exit `0`, owned-server Playwright 1/1. The browser observed no shell or
   actor marker on public `/`, exact Home/Classes/Statistics/Profile links and
   existing Logout form on protected `/admin`, redirect to `/login`, and old
   token denial with `303 /login`.
3. The same owned-server run was wrapped by a verifier probe. The
   `study-calendar.db` size/mtime/SHA-256 fingerprint was identical before and
   after; the disposable target was absent after cleanup.
4. Generated SSR layout probe covered all eight protected prefixes, nested
   forms, the four canonical destinations, public paths, and an anonymous
   protected request. All protected cases returned only `{ role }` for a valid
   actor; all public/anonymous cases returned `actor: null`.
5. Unsafe CLI database-path probe rejected real DB, `tmp/study-calendar.db`,
   nested tmp, outside-project, and absolute paths, each with exit `1`.
6. Failure-cleanup replacement probe created the database plus `-wal`, `-shm`,
   and SQLite rollback-journal sidecars inside a disposable `tmp/` target,
   returned failure, and observed: database absent, `-wal` absent, `-shm`
   absent, but `-journal` still present. The probe then removed its own
   disposable files.

## Required gates

- `npm run check` — exit `0`, 0 errors / 0 warnings.
- `npm run test` — exit `0`, 59 files / 188 tests.
- `npm run build` — exit `0`.
- `git diff --check` — exit `0`.
- `node scripts/mb-lint.mjs` — exit `0`; only pre-existing advisory metadata
  warnings.
- `node scripts/mb-doctor.mjs --strict` — exit `0`, 0 errors / 0 warnings.

## Boundary and non-goal review

`+layout.server.ts` consumes request-local `locals.actor` and returns only its
role; it does not accept client authorization inputs. Logout remains owned by
the existing `POST /auth/logout` transport. No forbidden capability module,
destination route directory, or `study-calendar.db` was changed by the task
surface; unrelated W27 worktree changes were preserved. Ordinary real-database
Playwright smoke was not run, consistent with the task anti-goal; its default
path and reuse configuration were inspected unchanged.

## Claim adjudication

- Protected shell claim: independently satisfied by the focused tests, owned
  browser run, and all-prefix SSR probe.
- Logout claim: independently satisfied by the owned browser redirect and
  captured old-token denial, plus the existing transport integration.
- Disposable-runner claim: the normal target cleanup, path rejection, owned
  server, explicit database, real-DB fingerprint, and WAL/SHM cleanup were
  observed; however, failure cleanup leaves a rollback journal sidecar. This
  violates the task's exact disposable cleanup proof obligation for failure
  runs and is a material T3 isolation/cleanup defect.

The final functional verdict is recorded in
`.protocols/TASK-079-T3-FT-007-W28/verification.md`.
