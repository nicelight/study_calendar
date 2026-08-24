# TASK-079 Attempt 1 — claim-equivalent GREEN

## Claim

- task claim: `FT-007-AC-001 / REQ-017`
- supporting task proof: existing server logout revocation plus fail-closed
  disposable browser runner from the task `verify` targets.
- result: `GREEN_RESULT: PASS` (executor evidence only; independent `/verify`
  and T3 `/red-verify` remain required).

## Exact commands and results

All commands ran from `/home/serg/Projects/study_calendar` during Attempt 1.

1. `npm run test -- tests/routes/ft-007-navigation-shell.test.ts tests/scripts/run-disposable-e2e.test.ts`
   → exit `0`; 2 files / 6 tests passed.
2. `npm run check`
   → exit `0`; `svelte-check found 0 errors and 0 warnings`.
3. `npm run test`
   → exit `0`; 59 files / 188 tests passed.
4. `npm run build`
   → exit `0`; SSR and client production bundles built successfully.
5. `node scripts/run-disposable-e2e.mjs --database tmp/ft-007-navigation.db --spec e2e/ft-007-navigation.spec.ts`
   → exit `0`; owned-server Playwright 1/1 passed.
6. `npm run test -- tests/scripts/run-disposable-e2e.test.ts`
   → exit `0`; 4/4 runner tests passed, including forced non-zero execution
   cleanup of the exact task database.
7. `git diff --check`
   → exit `0`.
8. `node scripts/mb-lint.mjs`
   → exit `0`; 74 files passed, only pre-existing advisory metadata warnings.
9. `node scripts/mb-doctor.mjs --strict`
   → exit `0`; 0 errors, 0 warnings, 2 informational messages.

## Focused browser observations

- Public `/` with a valid session received no protected shell or actor marker.
- Protected `/admin` received the server-filtered shell; opening the hamburger
  exposed exact `/home`, `/classes`, `/statistics`, `/profile` links and the
  existing POST `/auth/logout` form.
- Logout redirected to `/login`; a request carrying the captured old token
  returned `303 /login`.
- Runner used its owned Playwright server on port `5174` and explicit absolute
  `DATABASE_URL` for the validated `tmp/ft-007-navigation.db` path.
- Final fingerprint probe after the final segment-prefix correction:
  `study-calendar.db` before and after both `356352:1787351376:265994`;
  `real_db_unchanged=1` and
  `disposable_target_absent=1`.

## Isolation / cleanup

- Accepted only direct project `tmp/*.db`; rejected real DB, outside, absolute,
  nested, and `tmp/study-calendar.db` paths.
- Prepared the parent and removed stale exact target before execution.
- Cleanup removed the exact DB and SQLite `-wal`/`-shm` sidecars in `finally`.
- No existing server was reused (`reuseExistingServer: !disposable`; disposable
  mode is false for reuse).
- No forbidden path or `study-calendar.db` write occurred.

## Receipt policy

No reusable execute receipt is proposed: the shared worktree contains
unrelated W27 dirty/generated/runtime-sensitive inputs. This artifact is
current Attempt 1 supporting evidence for the independent verifier.
