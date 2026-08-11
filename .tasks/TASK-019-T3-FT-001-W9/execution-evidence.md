---
description: Execution evidence for TASK-019-T3-FT-001-W9.
status: active
---
# Execution Evidence — TASK-019-T3-FT-001-W9

## Attempt 1 — initial claim RED

- receipt_status: supporting-only after Attempt 2 retry; retained historical RED

- claim: `FT-001-AC-001`, `FT-001-AC-003`, `FT-001-AC-004`, `FT-001-AC-006`,
  `FT-001-AC-007` task-owned provider/session/invitation portions; `REQ-001`,
  `REQ-002`, `REQ-014`; provider, transport, access-control, and actor-context
  canonical obligations from the task card.
- command: `npm run test -- tests/adapters/provider-boundary.test.ts tests/identity-access/session-lifecycle.test.ts`
- cwd: `/home/serg/Projects/study_calendar`
- exit_code: `1`
- input_state_basis: current worktree after task protocol initialization and
  focused RED probes; task-owned new tests were present, no production files
  for this task had been changed, no credentials/network/production DB.
- completed_at: `2026-08-11T01:39:22+05:00`
- evidence: Vitest reported the missing `src/lib/server/adapters` import and
  absent `authenticateVerifiedIdentity`/`acceptInvitation` methods across the
  four lifecycle scenarios. This is the honest pre-implementation RED.

## Current attempt status

- Production implementation: bounded correction complete within Attempt 1;
  task remains `in_progress` for the independent T3 verification/lifecycle
  owner.
- GREEN: obtained after the correction; the original RED receipts remain
  unchanged above.

## Attempt 1 — focused gate after partial implementation

- receipt_status: supporting-only after Attempt 2 retry

- claim: same task-owned provider/session/invitation claim set as the initial
  RED; no claim is promoted to GREEN.
- command: `npm run test -- tests/adapters/provider-boundary.test.ts tests/identity-access/session-lifecycle.test.ts`
- cwd: `/home/serg/Projects/study_calendar`
- exit_code: `1`
- input_state_basis: current worktree after adding the adapter source and
  focused tests; platform auth-state/cookie and Identity & Access lifecycle
  source are still absent; no credentials/network/production DB.
- completed_at: `2026-08-11T01:41:23+05:00`
- evidence: Vitest failed the adapter suite at the missing
  `src/lib/server/platform/auth-state` import and failed all four lifecycle
  scenarios because `authenticateVerifiedIdentity` and `acceptInvitation` are
  not yet implemented. The focused GREEN gate was not reached.

## Attempt 1 — bounded correction claim GREEN

- receipt_status: supporting-only after Attempt 2 retry

- claim: same task-owned provider-verification, server-session, and
  invitation-acceptance claims as the initial RED; no claim is promoted beyond
  the focused execution evidence.
- correction: added `AuthenticationStateStore` with server-owned opaque,
  expiring, provider/callback-bound, one-use state; exact
  `foundation_session` cookie options; server-generated opaque session issue,
  resolution, and revocation; and one Identity & Access transaction for exact
  invitation account binding, identity uniqueness, invitation consumption, and
  first-session issuance. Added focused invitation rejection coverage.
- command: `npm run test -- tests/adapters/provider-boundary.test.ts tests/identity-access/session-lifecycle.test.ts`
- cwd: `/home/serg/Projects/study_calendar`
- exit_code: `0`
- completed_at: `2026-08-11T01:46:23+05:00`
- input_state_basis: current worktree after the bounded correction; fresh
  in-memory SQLite lifecycle fixtures, deterministic provider/fetch doubles,
  no credentials, network, production database, or external side effect.
- evidence: 2 focused files and 10 tests passed. The provider suite returned
  only normalized `{provider, subject}`, excluded role/center/secret data,
  rejected tampered/provider-mismatched/replayed/expired state, and matched
  the exact HTTPS/local-HTTP cookie contract. The lifecycle suite issued an
  opaque server token only for a stored provider identity, resolved the stored
  account/role, enforced revocation, bound the invitation's exact account,
  rejected unknown/duplicate/expired/revoked/reused inputs, and preserved
  invitation/identity/session state on an induced session write failure.

## Attempt 1 — required gates after bounded correction

- receipt_status: supporting-only after Attempt 2 retry

- `npm run check` → exit `0`; `svelte-check found 0 errors and 0 warnings`.
- `npm run build` → exit `0`; client and SSR bundles built. The existing
  `adapter-auto` production-platform note is informational and outside this
  task's scope.
- `npm run test` → exit `0`; 19 test files and 63 tests passed.
- `git diff --check` → exit `0`; no whitespace errors reported.

The focused GREEN and project gates used fresh test doubles/in-memory state;
no credentials, network, production database, browser routes, Admin UI, or
external side effect was used.

## Actual bounded-correction change surface

- `src/lib/server/platform/auth-state.ts`
- `src/lib/server/platform/session-cookie.ts`
- `src/lib/server/modules/identity-access/public.ts`
- `src/lib/server/adapters/` (existing normalized Telegram/Google boundary retained)
- `tests/adapters/provider-boundary.test.ts`
- `tests/identity-access/session-lifecycle.test.ts`
- `.protocols/TASK-019-T3-FT-001-W9/{progress,handoff}.md`
- `.tasks/TASK-019-T3-FT-001-W9/execution-evidence.md`

No browser route, Admin UI, provider secret, development-login bypass, or
forbidden historical task card was added or changed.

## Attempt 2 — correction retry focused RED

- attempt: 2
- receipt_status: current historical RED for the retry correction
- claim: `FT-001-AC-006` / `REQ-001` / `REQ-014` server-owned session issuance
  and `FT-001-AC-001/004` / `REQ-001` / `REQ-002` / `REQ-014` Google callback
  transport exactness.
- correction basis: independent Attempt 1 functional `FAIL` identified the
  public caller-controlled `createSession(token, accountId)` and origin-only
  Google token-exchange `redirect_uri`.
- command: `npm run test -- tests/adapters/provider-boundary.test.ts
  tests/identity-access/session-lifecycle.test.ts`
- cwd: `/home/serg/Projects/study_calendar`
- exit_code: `1`
- completed_at: `2026-08-11T02:04:04+05:00`
- input_state_basis: Attempt 2 test regressions were added, production still
  contained both Reviewer findings, no credentials/network/production DB.
- evidence: the forged-session assertion observed `createSession` still
  exported; the Google token exchange failed the exact callback assertion and
  surfaced `google-provider-outage` from the assertion.

## Attempt 2 — correction retry focused GREEN

- attempt: 2
- receipt_status: current
- claim: same task-owned provider/session/invitation claims as the retained
  Attempt 1 RED; public forgeable session issuance is absent and Google uses
  the complete canonical callback URL.
- correction: removed `IdentityAccessBoundary.createSession`; existing
  `authenticateVerifiedIdentity` and `acceptInvitation` remain the only public
  session-issuing flows and call the private server-generated issuer. Google
  token exchange now strips only callback query/hash and sends the full request
  URL path, e.g. `https://calendar.test/auth/google/callback`. Existing
  regression fixtures now obtain sessions through verified identity flow.
- command: `npm run test -- tests/adapters/provider-boundary.test.ts
  tests/identity-access/session-lifecycle.test.ts`
- cwd: `/home/serg/Projects/study_calendar`
- exit_code: `0`
- completed_at: `2026-08-11T02:07:56+05:00`
- input_state_basis: repository revision `92af3d79bdf9bd7d6f2b6160041b861f12decddf`;
  current worktree includes the task's Attempt 1 implementation plus Attempt 2
  source/test corrections and unrelated pre-existing Memory Bank changes;
  no generated/runtime input, credentials, network, production DB, or external
  side effect.
- evidence: 2 focused files and 11 tests passed, including the forged-session
  absence/state-preservation assertion and exact Google start/exchange
  `redirect_uri` assertion.
- probe changes and rationale: the two new focused security/regression tests
  are claim-equivalent coverage required by the Reviewer findings; existing
  fixture tests were migrated only because the removed public method was their
  stale setup seam.

## Attempt 2 — required gates

- attempt: 2
- receipt_status: current
- command: `npm run check`
- cwd: `/home/serg/Projects/study_calendar`
- exit_code: `0`
- evidence: `svelte-check found 0 errors and 0 warnings`.
- command: `npm run build`
- cwd: `/home/serg/Projects/study_calendar`
- exit_code: `0`
- evidence: SSR and client bundles built; adapter-auto platform message was
  informational.
- command: `npm run test`
- cwd: `/home/serg/Projects/study_calendar`
- exit_code: `0`
- evidence: 19 test files and 64 tests passed.
- command: `git diff --check`
- cwd: `/home/serg/Projects/study_calendar`
- exit_code: `0`
- evidence: no whitespace errors.

## Attempt 2 — actual correction surface and boundary

- production: `src/lib/server/modules/identity-access/public.ts` and
  `src/lib/server/adapters/google.ts`.
- focused regressions: `tests/adapters/provider-boundary.test.ts` and
  `tests/identity-access/session-lifecycle.test.ts`.
- stale fixture setup migrated to the accepted verified-identity flow in
  `tests/center-scheduling/membership-class-mode.test.ts`,
  `tests/foundation/index.test.ts`, and
  `tests/identity-access/provider-binding.test.ts`; this is required for the
  full gate after removing the insecure public method.
- task protocol/evidence: `.protocols/TASK-019-T3-FT-001-W9/{context,plan,progress,handoff}.md`
  and this file.
- hard allowed-write boundary: not set; forbidden scope untouched.
- no browser routes, Admin UI, dev bypass, secrets, architecture changes,
  provider persistence writes, or task lifecycle/scheduler mutation.
