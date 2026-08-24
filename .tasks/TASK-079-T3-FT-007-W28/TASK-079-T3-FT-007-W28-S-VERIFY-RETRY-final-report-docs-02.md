---
description: Fresh retry independent verification report for TASK-079-T3-FT-007-W28.
status: active
---
# TASK-079-T3-FT-007-W28 — fresh retry verification report

## Verdict scope

- Reviewer role: `Reviewer`; command: `/verify TASK-079-T3-FT-007-W28`.
- Tier: `T3`; lifecycle observed and preserved as `in_progress`.
- Owned outcome: FT-007-AC-001 / REQ-017 protected shell, existing logout
  integration, and fail-closed disposable browser proof; REQ-014 supplies the
  server-authority/privacy constraint.
- Normative basis: the task card, FT-007 AC-001, REQ-014/REQ-017,
  Authentication Transport session revocation, Access Control authority and
  scope, Boundary Map actor context, Testing Strategy disposable browser
  proof, and T3 tier policy.
- Attempt 1's independent failure is preserved separately at
  `attempt-1-independent-verification-fail.md`. Attempt 1/2 executor RED/GREEN
  artifacts were read as supporting evidence only.

## Independent claim evidence

### Protected shell and logout

- Focused route/runner tests passed `7/7`.
- Fresh SSR probe covered protected prefixes/nested routes and canonical
  `/home`, `/classes`, `/statistics`, `/profile`: valid actors received only
  `{ role }`; public paths and anonymous `/admin` received `actor: null`.
- Two subsequent exact owned-server runs passed `1/1`. The browser observed
  no shell or actor marker on `/`, exact five controls on protected `/admin`,
  POST logout redirect to `/login`, and old-token denial with `303 /login`.
- The existing `POST /auth/logout` owner remains unchanged; the layout uses
  request-local `locals.actor` and exposes only the role projection.

### Disposable runner isolation and cleanup

- The exact runner accepted the task `tmp/ft-007-navigation.db`, supplied an
  explicit `DATABASE_URL`, used an owned server with disposable mode and
  `reuseExistingServer: false`, and cleaned the target after successful runs.
- The real `study-calendar.db` fingerprint was unchanged before/after the
  owned run: `size=356352`, `mtimeMs=1787353157734.4822`,
  `sha256=5f4da00412916211728694a518ae1daf5d71fb24df132ed9fc20e2030b61c20e`.
- A forced-failure verifier probe created the database, `-wal`, `-shm`, and
  `-journal`; after the runner returned failure, all four were absent.
- CLI path rejection independently returned exit `1` for real DB,
  `tmp/study-calendar.db`, nested tmp, outside-project, and absolute paths.
- Current native gates passed: check, full test (`59/59` files; `188/188`
  tests), build, diff check, mb-lint, and strict doctor.

## Confirmed blocking finding

The task anti-goal says not to change ordinary real-database Playwright smoke,
and the testing strategy reserves `npm run e2e` for that path. Fresh
`npm run e2e -- --list` selected three tests, including the new disposable-only
`ft-007-navigation.spec.ts` and the two existing real-database specs.
`playwright.config.ts` has a catch-all `e2e/*.spec.ts` selection, and the new
spec explicitly rejects a normal run unless `DATABASE_URL` points under
project `tmp/`. Thus the ordinary command now includes a task-local disposable
test and cannot remain the unchanged real-database smoke path.

This is an observed implementation/test-surface violation. It is not caused
by the historical rollback-journal defect: the fresh forced-failure probe
confirmed that Attempt 2 corrected all four sidecar cleanup obligations.

## Finding-adjudication co-review

- Fresh security/architecture/isolation focus (`Codex Luna`, `xhigh`): no
  candidate finding; its positive isolation conclusions agree with the fresh
  probes.
- Fresh end-to-end claim-completeness focus (`Codex Luna`, `xhigh`): identified
  the ordinary-run selection violation; the caller independently reproduced it
  with `npm run e2e -- --list` and adjudicated it as material.
- No executor receipt was reused. No lifecycle, scheduler, implementation,
  spec, or task scope transition was performed by `/verify`.

VERDICT: FAIL

The three positive task claims are independently evidenced, but ordinary
`npm run e2e` now selects the disposable-only spec, violating the task's
anti-goal and required real-database smoke boundary.
