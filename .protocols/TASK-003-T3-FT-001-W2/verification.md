---
description: Independent Reviewer verification for bounded retry 2 / Attempt 3 of TASK-003-T3-FT-001-W2.
status: active
---
# Verification — TASK-003-T3-FT-001-W2

## Reviewer summary

- Review disposition: APPROVE.
- Findings: none.
- Evidence checked: current Attempt 3 source, task-linked normative inputs,
  Attempt 3 executor claim path, fresh verifier-owned probes, required gates,
  ownership/boundary assertions, and diff/scope checks.
- Risks or questions affecting the verdict: none.
- Retry-1 verification report and receipts were not reused.

## What was verified

- Task outcome: a valid own-center Admin flow provisions one role-bearing
  account and one-time invitation through the accepted
  Center & Scheduling -> Identity & Access boundary.
- Task-owned failure outcome: forged/caller-supplied center scope, expired,
  revoked, reused, and duplicate binding attempts are rejected without
  account, role, membership, invitation, or binding mutation.
- Task-scoped basis: `FT-001-AC-003`, `REQ-001`, `REQ-002`, and the
  server-side role/context constraint from `REQ-014`.
- Execution handoff/evidence:
  `.protocols/TASK-003-T3-FT-001-W2/{context,plan,progress,handoff}.md` and
  `.tasks/TASK-003-T3-FT-001-W2/execution-evidence.md`, limited to Attempt 3.
- Isolation: task tests use a new SQLite `:memory:` database per test, close
  it in `afterEach`, and use no credentials, network, production database, or
  external side effects.

## Verification basis

- Task card: `.memory-bank/tasks/TASK-003-T3-FT-001-W2.task.json`; the index
  contains exactly one matching row, tier is `T3`, status is
  `in_progress`, and dependency `TASK-002-T3-FT-000-W1` is `done`.
- Direct canonical inputs:
  `.memory-bank/contracts/boundary-map.md#account-provisioning-boundary` and
  `.memory-bank/contracts/access-control.md`.
- Accepted graph row:
  `Center & Scheduling -> Identity & Access -> Account Provisioning Boundary`.
- Applicable ownership/state inputs:
  `.memory-bank/domains/core-domain.md#ownership-map`,
  `.memory-bank/domains/core-domain.md#persistence-and-transaction-rules`, and
  `.memory-bank/states/lifecycle-map.md#access-and-membership`.
- Purpose/success constraints: Identity & Access exclusively owns account,
  role, invitation, external identity, and session writes; Center & Scheduling
  owns center membership and the own-center Admin orchestration; no client role
  or caller-supplied scope may authorize the protected command; failure paths
  are atomic.
- No non-empty hard write boundary exists. The two task cards in
  `forbidden_scope` retained their pre-verification hashes.

## Executor claim path

- Current attempt only: bounded retry 2 / Attempt 3.
- Honest current-claim RED:
  `.tasks/TASK-003-T3-FT-001-W2/execution-evidence.md#attempt-3--bounded-retry-2-current-claim-red`.
  Before correction, the direct valid-`center-2` Admin / claimed-`center-1`
  call returned normally and mutated persisted state.
- Claim-equivalent GREEN:
  `.tasks/TASK-003-T3-FT-001-W2/execution-evidence.md#attempt-3--bounded-retry-2-correction-and-claim-equivalent-green`.
  Attempt 3 introduced the server-issued opaque capability and fresh 8-test
  GREEN.
- These executor observations are supporting evidence only. The verdict relies
  on the independent checks below.

## Task-scoped checklist

- [x] Server-issued one-time authorization capability.
  - Method: fresh runtime probe through the project Vite SSR loader.
  - Observation: the issued capability and actor were frozen; a structurally
    forged object was rejected; the genuine object was accepted once; reuse was
    rejected.
- [x] Direct forged/caller-supplied center scope rejection with no mutation.
  - Method: focused Vitest integration probe.
  - Observation: 1 targeted test passed and 7 non-target tests were skipped;
    the valid `center-2` Admin / claimed `center-1` direct call threw
    `forbidden`, and the full persistence snapshot stayed equal.
- [x] Center & Scheduling own-center Admin orchestration.
  - Method: full task integration probe plus boundary source assertion.
  - Observation: absent session, non-Admin, and cross-center calls were denied;
    an own-center Admin succeeded. Session resolution and current
    membership/Admin scope precede capability issuance.
- [x] Valid provisioning and role/membership retention.
  - Method: full task integration probe.
  - Observation: the account retained the pre-created `student` role,
    Center & Scheduling membership remained present, the provider identity
    bound to that account, and the invitation became `consumed`.
- [x] Atomic account + invitation rollback.
  - Method: duplicate invitation-token integration branch.
  - Observation: the invitation uniqueness failure rolled back the account
    insert; the attempted second account count remained zero.
- [x] Expired, revoked, reused, and duplicate identity binding safety.
  - Method: state-before/state-after integration branches.
  - Observation: every rejection threw and preserved the complete account,
    membership, invitation, and external-identity snapshot.
- [x] Ownership and public-boundary constraints.
  - Method: fresh 11-assertion read-only source probe and manual source
    inspection.
  - Observation: the private composition channel wires issuer only to Center &
    Scheduling and consumer only to Identity & Access; authorization is
    consumed before the account/invitation transaction; Identity & Access does
    not access `center_memberships`; routes/hooks/composition contain no
    business persistence SQL; ProviderBinding accepts no role/center selector.

The valid binding scenario is task-level integration evidence for retained
state. It does not claim `FT-001-AC-001`, `AC-002`, or `AC-004`, which
remain owned by `TASK-004-T3-FT-001-W3`.

## Reused execute evidence

- Accepted candidates: none.
- Retry-1 verification report/receipts: explicitly excluded.
- Reason: no current-attempt reusable receipt was offered; the workspace has a
  broad dirty/untracked input surface, and T3 requires fresh verifier-owned
  functional proof.

## Repeated checks

All commands ran from `/home/serg/Projects/study_calendar`.

- `node_modules/.bin/vitest run tests/identity-access/task-003.test.ts --testNamePattern="rejects caller-supplied cross-center scope at the direct Identity and Access boundary"`
  -> exit 0; 1 passed, 7 skipped.
- `npm exec vitest run tests/identity-access/task-003.test.ts`
  -> exit 0; 1 file, 8 tests passed.
- `npm run check`
  -> exit 0; 0 errors and 0 warnings.
- `npm run build`
  -> exit 0; client and SSR bundles built. The adapter-auto platform message
  was informational.
- `npm run test`
  -> exit 0; 2 files, 12 tests passed.
- `git diff --check`
  -> exit 0.
- Separate trailing-whitespace check for the current task source/test surface
  -> exit 0; no matches. This supplements `git diff --check` because those
  paths are currently untracked in the broad workspace.

## New targeted probes

- Capability runtime probe:
  - Command family: Vite `createServer(...).ssrLoadModule(...)`, then issue,
    forge, consume, and reuse assertions against
    `createProvisioningAuthorizationChannel`.
  - Claim mapping: server-issued, opaque, immutable, one-time authorization.
  - Result: exit 0 —
    `capability-probe: frozen server-issued identity accepted once; forged and reused objects rejected`.
- Boundary/ownership probe:
  - Method: read-only source assertions over Identity & Access, Center &
    Scheduling, composition root, hooks, and the foundation route.
  - Claim mapping: accepted graph edge, authorization order, atomic transaction,
    membership ownership, private wiring, and absence of adapter bypass.
  - Result: exit 0 —
    `boundary-probe: 11/11 ownership and authorization assertions passed`.

## Regression / non-goals

- Provider callback outage and confirmed second-provider behavior were not
  adopted; they remain outside this task.
- No route/UI behavior or client-selected role path was added.
- `src/lib/server/platform/database.ts` remains earlier task-owned current
  source for invitation expiry and transaction-backed persistence; Attempt 3
  changed the Identity & Access boundary, Center & Scheduling caller, private
  composition wiring, and task probe.
- Advisory `touched_files` deviation remains same-outcome architecture work;
  no higher-tier trigger or boundary change was observed.

## Verdict

VERDICT: PASS

## Handoff

- Recommended owner/action: return this functional PASS to the scheduler/outer
  workflow; because this is T3, run a fresh separate
  `/red-verify TASK-003-T3-FT-001-W2`.
- Tier escalation or planning repair: none.
- BUG/follow-up recommendation: none.
- Task lifecycle changed by verifier: no; status remains `in_progress`.
- Closure eligibility: not yet; T3 also requires per-task semantic PASS and the
  lifecycle owner retains the transition.
