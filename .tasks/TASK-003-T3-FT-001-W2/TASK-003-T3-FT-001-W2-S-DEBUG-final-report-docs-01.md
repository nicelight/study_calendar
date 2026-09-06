---
description: Read-only diagnosis of the terminal failure of TASK-003.
status: final
---
# Debug — TASK-003-T3-FT-001-W2

## Symptom and reproduction

The current execution attempt was bounded retry 2 / Attempt 3. Functional
checks passed, but the fresh semantic probe reproduced a high-severity
provisioning bypass: starting from an empty disposable database, the typed
public `CompositionRoot.identityAccess.createAccount` and
`issueInvitation` methods created an Admin account and invitation without a
session, center scope, membership check, or provisioning capability.

Evidence:

- `.protocols/TASK-003-T3-FT-001-W2/red-verification.md`
- `.tasks/TASK-003-T3-FT-001-W2/TASK-003-T3-FT-001-W2-S-RED-VERIFY-final-report-docs-03.md`
- `.tasks/TASK-003-T3-FT-001-W2/execution-evidence.md#attempt-3--bounded-retry-2-current-claim-red`

## Attempt and change surface

- Current attempt: bounded retry 2 / Attempt 3; retry budget was exhausted.
- Production surface inspected: `src/lib/server/modules/identity-access/public.ts`,
  `src/lib/server/modules/center-scheduling/public.ts`, and
  `src/lib/server/composition-root.ts`.
- Task probe surface: `tests/identity-access/task-003.test.ts`.
- The diagnosis is read-only; no implementation, lifecycle, or scheduler state
  was changed.

## Root cause and first violated invariant

Root cause: Attempt 3 protected the new orchestration path, but left the old
Identity & Access write methods publicly callable beside it. The public
`IdentityAccessBoundary` therefore still offered an alternate account/invite
write path that bypassed Center & Scheduling authorization and the atomic
protected command.

The first violated invariant is the Account Provisioning Boundary: before any
Identity & Access write, the server must resolve the actor and verify own-center
Admin authority, and `createAccount`/`issueInvitation` must not be alternate
public provisioning commands. This is explicit in
`.memory-bank/contracts/access-control.md:48-57` and
`.memory-bank/contracts/boundary-map.md:64-104`.

The normal functional and boundary probes did not contradict this finding: they
covered the authorized Center & Scheduling path, while the verifier-owned
semantic probe covered the full exported public surface. The earlier retry
correction protected `provisionAccount`, but did not remove the alternate
methods, so it did not prevent recurrence of the same boundary-level failure.

## Minimum correction

Remove `createAccount` and `issueInvitation` from the public
`IdentityAccessBoundary`; keep the account-plus-invitation writer internal and
reachable only through the server-authorized Center & Scheduling flow. Retain
the atomic transaction and the existing own-center Admin checks.

This correction was already completed and independently verified by
`TASK-015-T3-FT-001-W2`; no additional production fix is currently required:

- `.tasks/TASK-015-T3-FT-001-W2/TASK-015-T3-FT-001-W2-S-VERIFY-final-report-docs-02.md`
- `.tasks/TASK-015-T3-FT-001-W2/TASK-015-T3-FT-001-W2-S-RED-VERIFY-final-report-docs-02.md`

## Regression check

The sufficient regression is the T3 provisioning matrix in
`tests/identity-access/provisioning.test.ts`: public alternate methods are
absent, unauthenticated/non-Admin/cross-center/caller-forged requests leave
state unchanged, and a valid own-center Admin succeeds atomically. TASK-015
also recorded passing `npm run check`, `npm run build`, and `npm run test`.

## Recurrence

`repeated_confirmed` — inspected TASK-003 Attempts 2 and 3, their semantic
reports, execution evidence, and the TASK-003 bug note. The exact exported
method differed, but the same causal mechanism recurred: a public Identity &
Access write could bypass the upstream actor/own-center authorization, violating
the same first boundary invariant. The previous correction protected only
`provisionAccount`; it failed to remove the older alternate methods. The
durable guardrail is the provisioning public-surface test owned by Identity &
Access and verified in TASK-015; adoption is evidenced by its 5/5 focused probe
and absence assertions.

## Residual uncertainty and next owner

No material uncertainty remains about the historical failure or its correction.
TASK-003 must remain historical `failed`; TASK-015 is the accepted correction
and current proof owner. The scheduler/lifecycle owner, not this diagnosis,
retains status authority.

DIAGNOSIS: CONFIRMED
