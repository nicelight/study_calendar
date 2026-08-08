---
description: Adversarial semantic verification for bounded retry 2 / Attempt 3 of TASK-003-T3-FT-001-W2.
status: active
---
# Red Verification — TASK-003-T3-FT-001-W2

## Semantic target

- Current bounded retry 2 / Attempt 3 implementation only.
- Accepted outcome: only a server-resolved own-center Admin operation may
  create a role-bearing account and one-time invitation; Identity & Access
  owns and atomically writes that state; no alternate public command may accept
  caller-selected role or scope.
- Normative basis: the indexed task card, `FT-001-AC-003`,
  `.memory-bank/contracts/boundary-map.md#account-provisioning-boundary`, and
  `.memory-bank/contracts/access-control.md`.
- Retry 1 / Attempt 2 conclusions and receipts are explicitly excluded. The
  earlier Attempt 3 `semantic-pass` object and standalone `docs-02` report are
  also superseded because they did not inspect the alternate public write path
  proved below; neither is reused as current semantic evidence.

## Evidence and adversarial coverage

- Inspected the current Attempt 3 source and public caller surface in
  `src/lib/server/modules/identity-access/public.ts`,
  `src/lib/server/modules/center-scheduling/public.ts`, and
  `src/lib/server/composition-root.ts`. The server-issued one-time capability
  now protects `provisionAccount` and closes the specific Attempt 2 direct-call
  path.
- Treated the current Attempt 3 functional `VERDICT: PASS` in
  `.protocols/TASK-003-T3-FT-001-W2/verification.md` and its standalone
  `docs-03` report as supporting context only; `/red-verify` did not rerun
  functional `/verify` or reuse its receipts.
- Ran a fresh verifier-owned semantic probe through Vite's SSR loader against
  a new in-memory SQLite database. Starting from zero accounts and invitations,
  the probe called the typed public
  `IdentityAccessBoundary.createAccount({ role: 'admin' })` and
  `issueInvitation(...)` methods exposed by `CompositionRoot.identityAccess`.
  Without a session, center scope, membership check, or provisioning
  authorization, both calls succeeded and persisted one Admin account and one
  invitation. The probe used no cast, private-property access, route shim, or
  direct database mutation and closed the disposable database and Vite server.

## Admitted findings

- **HIGH — the protected provisioning outcome remains bypassable through an
  alternate typed public Identity & Access surface.** `createAccount` and
  `issueInvitation` are public production methods on the same boundary exposed
  by `CompositionRoot.identityAccess`, but neither performs the required
  own-center Admin authorization and their separate transactions bypass the
  protected atomic `provisionAccount` command. The fresh probe created an
  arbitrary Admin account and invitation with no authorization context. This
  materially breaks the unambiguous Account Provisioning Boundary, the rule
  that authorization is repeated at every protected public command, and the
  task anti-goal forbidding caller-selected roles and boundary bypasses.

## Operator questions

- None. The accepted authorization, public-boundary, and ownership contracts
  are unambiguous.

## Failure / Blocker

- status: semantic-fail
- where: `src/lib/server/modules/identity-access/public.ts:107-124` and the
  exported `identityAccess` surface in `src/lib/server/composition-root.ts:9-27`
- expected: account and invitation creation is reachable only through the
  server-authorized, own-center Admin, atomic provisioning command
- observed: two typed public methods created an Admin account and invitation
  without session, center scope, membership validation, or provisioning
  authorization
- likely category: authorization boundary / alternate unprotected public write
  commands
- next action: the scheduler/lifecycle owner must record this third
  unsuccessful attempt, apply the retry-exhausted task-local disposition, and
  route correction through the canonical BUG or reviewed FT-001 follow-up path;
  no fourth same-task execution attempt is permitted
- replan required: yes for any further correction after retry exhaustion; no
  product/spec interpretation change is required

## Owner handoff

- Recommended scheduler action: treat the concurrently recorded `done` state
  as untrusted, apply the retry-exhausted `failed` disposition, create the
  required BUG or normal indexed follow-up before the next strict doctor, and
  block direct dependents including `TASK-004-T3-FT-001-W3` before another
  promotion pass.
- `/red-verify` did not change scheduler lifecycle or checkpoint state. The
  indexed task became `done` concurrently while this fresh probe was running;
  that lifecycle mutation is not owned or endorsed by this review.

SEMANTIC_VERDICT: semantic-fail
