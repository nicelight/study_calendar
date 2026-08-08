---
description: Fresh current-attempt functional verification for TASK-015-T3-FT-001-W2.
status: active
---
# Verification — TASK-015-T3-FT-001-W2

## Current attempt

- Fresh independent `/verify` after bounded retry 2.
- Task lifecycle remains `in_progress`; verifier did not change task status,
  scheduler state, implementation, or execution handoff.
- Prior verification/red-verification reports were not reused as proof.

## Verification basis

- Task outcome: one server-authorized `provisionAccount` path creates account
  and invitation atomically; unauthorized, alternate, duplicate, reuse, and
  rollback paths leave state unchanged.
- Owned claims: `FT-001-AC-003` and `FT-001-AC-005`; `REQ-001`, `REQ-002`,
  `REQ-014`.
- Direct canonical basis: `FT-001` AC-003/AC-005, Account Provisioning
  Boundary, Access Control Contract, system architecture request flow, core
  domain transaction rules, lifecycle access rules, testing evidence policy,
  and T3 tier policy.

## Executor claim path

- Retry attempt 2 RED/GREEN and gate evidence in
  `.protocols/TASK-015-T3-FT-001-W2/progress.md` and
  `.tasks/TASK-015-T3-FT-001-W2/execution-evidence.md` were supporting context
  only. The retry RED identifies the former public direct bypass; its GREEN
  identifies the bounded correction.

## Reused execute evidence

- None reused as independent proof. Current checks were repeated because this
  is a T3 task and the prior durable reports were stale/contradictory.

## Repeated checks

- `npm run check` — exit 0; 0 errors and 0 warnings.
- `npm run build` — exit 0; build completed; adapter-auto informational
  environment warning only.
- `npm run test` — exit 0; 2 files and 9 tests passed.
- `git diff --check` — exit 0; no whitespace errors.

## New targeted probes

- `npm run test -- tests/identity-access/provisioning.test.ts` — exit 0; 1
  file and 5 tests passed. The current verifier-observed matrix covers
  unauthenticated/non-Admin/cross-center denial with unchanged snapshots,
  valid own-center Admin commit, caller center-scope rejection, duplicate
  invitation rollback, reused/expired binding rejection, absence of
  `createAccount`/`issueInvitation`, and absence of callable
  `root.identityAccess.provisionAccount` with unchanged state.
- Current source/diff inspection confirms that C&S resolves actor and
  own-center Admin scope before invoking the injected writer; the public
  Identity & Access boundary has no provisioning method; the internal writer
  performs the account-plus-invitation transaction; and composition wiring
  supplies that writer only to C&S.
- The full current test run also covers provider failure/duplicate identity
  rollback in the Foundation regression suite. Tests use per-test in-memory
  SQLite and close the database after each test.

## Task-scoped checklist

- [x] `FT-001-AC-005` / `REQ-001`, `REQ-002`, `REQ-014`: server-resolved actor
  and own-center Admin authorization precede the Identity & Access write;
  unauthorized and alternate public paths preserve state.
- [x] `FT-001-AC-005`: valid own-center Admin creates the requested role-bearing
  account and one invitation; duplicate invitation failure rolls both back.
- [x] `FT-001-AC-003`: reused/expired provider-binding paths preserve account,
  invitation, and identity state; the full regression run covers duplicate
  identity/provider failure rollback.
- [x] Architecture/ownership and hard-scope inspection: C&S orchestrates,
  Identity & Access writes its owned state, no public direct provisioning
  bypass is exposed, and no forbidden task record was changed by this review.

## Verdict

VERDICT: PASS

## Handoff

- Recommended owner/action: run the required T3 `/red-verify
  TASK-015-T3-FT-001-W2`; lifecycle owner remains responsible for any closure
  decision.
- Task lifecycle changed by verifier: no.
