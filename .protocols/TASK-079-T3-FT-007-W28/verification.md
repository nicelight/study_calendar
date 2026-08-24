---
description: Attempt 3 independent verification evidence for TASK-079-T3-FT-007-W28.
status: active
---
# Verification — TASK-079-T3-FT-007-W28

## Scope and normative basis

- Target: `TASK-079-T3-FT-007-W28`, tier `T3`, lifecycle observed and left
  `in_progress`; exactly one indexed task record matched.
- Current attempt: Attempt 3, after the prior independent failures. Attempt 1
  and Attempt 2 executor evidence, Attempt 3 RED/GREEN, and both prior
  independent FAIL reports were read as supporting/history only; no executor
  receipt was reused.
- Owned claims: `FT-007-AC-001 / REQ-017` protected shell and existing logout
  integration, plus the task-owned disposable browser proof; `REQ-014` is the
  server-authority/privacy constraint.
- Normative basis: task card; FT-007-AC-001; REQ-014/REQ-017;
  Authentication Transport `#session-issuance-and-revocation`; Access Control
  `#authority-and-scope`; Boundary Map `#actor-context-boundary`; Testing
  Strategy `#disposable-browser-proof`; and T3 hard-boundary, claim-linked
  RED/GREEN, tier-obligation, and closure-authority rules.

## Executor claim path

- Attempt 1 RED/GREEN remain at
  `.tasks/TASK-079-T3-FT-007-W28/attempt-1-red.md` and `attempt-1-green.md`.
- Attempt 2 retry RED/GREEN remain at
  `.tasks/TASK-079-T3-FT-007-W28/attempt-2-red.md` and `attempt-2-green.md`.
- Attempt 3 retry RED/GREEN remain at
  `.tasks/TASK-079-T3-FT-007-W28/attempt-3-red.md` and `attempt-3-green.md`.
- The retry path is honest and claim-linked: Attempt 3 RED recorded ordinary
  selection of the disposable-only spec before the correction; GREEN records
  exact ordinary/disposable selection and the required gates after it.

## Fresh verifier-owned outcome evidence

1. `npx vite-node --config vite.config.ts
   .tasks/TASK-079-T3-FT-007-W28/verifier-attempt-3-probe.ts` passed with
   `VERIFIER_PROBE_PASS`. It covered all 9 protected route prefixes (including
   nested paths), anonymous protected requests, 3 public paths, exact Home /
   Classes / Statistics / Profile / Logout controls, runes-only local shell
   state, unchanged existing logout owner, five rejected database paths,
   parent preparation, stale-target removal, and forced-failure cleanup of
   database, `-wal`, `-shm`, and `-journal`.
2. `node
   .tasks/TASK-079-T3-FT-007-W28/verifier-logout-cookie-probe.mjs` passed
   with `VERIFIER_LOGOUT_COOKIE_PROBE_PASS`: owned server protected request
   `200`; `POST /auth/logout` returned `303 /login`; the response cleared
   `foundation_session` (`Max-Age=0`); the captured old token returned
   `303 /login`; and the persisted session had `revoked_at` set.
3. Focused regression rerun
   `npm run test -- tests/routes/ft-007-navigation-shell.test.ts
   tests/scripts/run-disposable-e2e.test.ts` passed `2 files / 8 tests`.
4. Fresh selection probes passed:
   `NO_COLOR=1 FORCE_COLOR=0 npm run e2e -- --list` selected exactly
   `real-database-payment.spec.ts` and `real-database-smoke.spec.ts` (`2
   tests in 2 files`); explicit
   `DISPOSABLE_E2E=1 ... npm run e2e -- --list
   e2e/ft-007-navigation.spec.ts` selected exactly the task spec (`1 test in
   1 file`).
5. Four sequential fresh invocations of the exact indexed owned runner
   command all passed `1/1`:
   `node scripts/run-disposable-e2e.mjs --database
   tmp/ft-007-navigation.db --spec e2e/ft-007-navigation.spec.ts`.
   The browser proof observed public shell/data absence, exact protected
   controls, logout redirect, and captured old-token denial.
6. A verifier wrapper around an owned run observed `result: 0`, real
   `study-calendar.db` fingerprint equality before/after
   (`size=356352`, `mtimeMs=1787354379102.003`,
   `sha256=4226fec3c756d406f6b1e5779082995a1cd24c358ff2b22f4197ccb3dac53a09`),
   and all four disposable paths absent after success. The forced-failure
   probe independently returned `result: 1` with all four paths absent.

## Required native gates

- `npm run check`: PASS, 0 errors / 0 warnings.
- `npm run test`: PASS, 59 files / 189 tests.
- `npm run build`: PASS, production SSR and client bundles built.
- `git diff --check`: PASS.
- `node scripts/mb-lint.mjs`: PASS, 74 files; only pre-existing advisory
  metadata warnings.
- `node scripts/mb-doctor.mjs --strict`: PASS, 0 errors / 0 warnings / 2 info.

## Architecture, scope, and anti-goal adjudication

- `+layout.server.ts` consumes only request-local `locals.actor` and returns
  only `{ role }` for recognized protected prefixes; public and anonymous
  paths return `actor: null`. The Svelte shell owns only menu UI state and
  does not accept client role, scope, account, or session inputs.
- Logout remains the existing `POST /auth/logout` owner. The fresh HTTP probe
  independently proved revocation, cookie clearing, redirect, and old-token
  denial.
- The runner validates only direct project `tmp/*.db`, rejects
  `study-calendar.db` and outside/nested paths, prepares the parent, passes an
  explicit `DATABASE_URL`, and runs with an owned non-reused server. Ordinary
  mode retains port `5173`, default `study-calendar.db`, real-database
  selection, and server reuse; disposable mode is conditional on
  `DISPOSABLE_E2E=1` and accepts the explicit task spec.
- Attempt 3 correction files are exactly
  `playwright.config.ts` and
  `tests/scripts/run-disposable-e2e.test.ts`; both are inside the indexed
  literal hard boundary and outside `forbidden_scope`. No task correction
  touched the existing logout/session owner, forbidden capability or route
  directories, or `study-calendar.db`. The current worktree's unrelated W27
  dirty changes remain preserved and are not attributed to this task.
- The E2E/selection co-review returned one candidate about a first failing
  runner invocation followed by an immediate pass. The caller adjudicated it
  as not admitted: the failure was not reproducible in the current verifier
  context, had no current artifact available here, and four serial exact
  runner invocations passed; the co-review ran in a shared workspace using
  the fixed disposable port, so a workspace race could not be separated from
  the implementation. The security/isolation co-review found no candidate
  finding. This adjudication does not replace the four fresh verifier-owned
  passes above.

## Historical evidence distinction

- Attempt 1 historical independent FAIL remains at
  `.tasks/TASK-079-T3-FT-007-W28/attempt-1-independent-verification-fail.md`
  and report-01: it found the leftover SQLite `-journal` sidecar.
- The prior retry independent FAIL remains at
  `.tasks/TASK-079-T3-FT-007-W28/TASK-079-T3-FT-007-W28-S-VERIFY-RETRY-final-report-docs-02.md`:
  it found ordinary Playwright selection included the disposable-only spec.
- Neither historical result was erased, relabeled, or reused as current PASS
  evidence. Attempt 2 corrected the first defect; Attempt 3 corrected the
  second.

## Handoff

- No `/exe`, `/red-verify`, `/mb-sync`, `/debug`, scheduler transition, or
  lifecycle change was performed.
- Exact next owner: `/red-verify TASK-079-T3-FT-007-W28` for the required T3
  semantic review. The task remains `in_progress`.

VERDICT: PASS
