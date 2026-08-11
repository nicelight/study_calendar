---
description: Product feature for center-created accounts and external identity binding.
status: active
type: feature
id: FT-001
lifecycle: verified
epic: EP-001
requirements: [REQ-001, REQ-002, REQ-014]
last_updated: 2026-08-11
source_of_truth:
  - .memory-bank/features/FT-001-authentication-and-binding.md
spec_design_status: complete
spec_design_links:
  - .memory-bank/architecture/system-architecture.md#accepted-target
  - .memory-bank/contracts/access-control.md
  - .memory-bank/contracts/authentication-transport.md
  - .memory-bank/contracts/boundary-map.md#account-provisioning-boundary
  - .memory-bank/contracts/provider-adapters.md
  - .memory-bank/domains/core-domain.md#ownership-map
  - .memory-bank/states/lifecycle-map.md#access-and-membership
---
# FT-001 — Authentication and Identity Binding

## Use Cases
- Admin creates an internal account with role and membership and issues a
  one-time invitation.
- User chooses Telegram or Google from the invitation and enters the permitted
  context.
- User with a previously bound provider signs in through the browser and gets a
  server session; an Admin uses the protected Admin page to create a participant
  account and receive its invitation link.
- Authenticated user adds the second provider from a confirmed profile.

## Edge / Failure Behavior
- Expired, revoked, reused, or duplicate invitations/identities reject without
  account, role, membership, or binding mutation.
- Provider callback failure does not create a partial binding.
- Provider outage returns an explicit error and does not bypass authorization.
- Invalid, missing, or revoked sessions cannot reach protected routes or Admin
  actions; logout revokes the server-side session.

## Acceptance Criteria

### FT-001-AC-001 — Invitation binds one role-bearing account
- REQ: REQ-001, REQ-014
- Given a valid one-time invitation, when the user confirms Telegram or Google,
  then exactly the pre-created account is bound, its invitation-defined role and
  membership are retained, and no user role selection is accepted.
- Verification: integration scenario for each provider plus negative role-choice
  and cross-center access checks.

### FT-001-AC-002 — Second provider requires confirmed profile
- REQ: REQ-001
- Given an authenticated account, when its owner re-confirms the current session
  and adds the other provider, then both providers resolve to the same account;
  an unauthenticated add attempt is rejected.
- Verification: provider-binding integration scenario and session negative case.

### FT-001-AC-003 — Invitation and identity reuse are rejected safely
- REQ: REQ-001, REQ-002
- Given an expired, revoked, or already-used invitation, or an identity already
  bound elsewhere, then binding is rejected with no new account, merge, role,
  membership, or existing-binding mutation.
- Verification: negative integration scenarios with state-before/state-after
  assertions.

### FT-001-AC-004 — Provider callback failure is atomic
- REQ: REQ-002
- Given a provider outage or failed callback, then the user receives an explicit
  failure and no partial account or identity binding is persisted.
- Verification: provider failure simulation with persistence inspection.

### FT-001-AC-005 — Provisioning is server-authorized and atomic
- REQ: REQ-001, REQ-002, REQ-014
- Given an unauthenticated actor, a non-Admin actor, or an Admin from another
  center, when account provisioning is requested, then it is rejected before
  any Identity & Access write. Given an Admin in the target's own center, then
  the single authoritative `provisionAccount` command creates the requested
  role-bearing account and invitation using server-resolved actor/scope; caller
  role or center values are not trusted. Duplicate or failed provisioning rolls
  back account and invitation together, and public `createAccount`/
  `issueInvitation` write bypasses are unavailable.
- Verification: focused adversarial boundary tests with state-before/state-after
  assertions for unauthenticated, non-Admin, cross-center, valid own-center
  Admin, duplicate, reuse, rollback, and alternate-command absence cases.

### FT-001-AC-006 — Bound provider creates a browser session
- REQ: REQ-001, REQ-002, REQ-014
- Given an internal account with a bound Telegram or Google identity, when the
  user starts login through the application and the verified provider callback
  succeeds, then the server resolves the exact account, issues a server-owned
  session cookie, and opens the permitted application context. Missing,
  invalid, or revoked sessions and logout cannot reach a protected route; no
  client role or center value is trusted.
- Verification: HTTP/SSR flow for both providers, cookie-attribute inspection,
  logout, and unauthenticated/invalid/revoked negative requests.

### FT-001-AC-007 — Invitation acceptance is a real browser/API path
- REQ: REQ-001, REQ-002, REQ-014
- Given an invitation link issued by the center, when the user opens it,
  chooses Telegram or Google, and the provider callback verifies, then the
  exact pre-created account is bound, the invitation is consumed once, and a
  session opens the permitted context. Expired, revoked, reused, duplicate, or
  failed callbacks return an explicit safe error without partial state.
- Verification: disposable HTTP flow for both providers with invitation,
  identity, session, role/membership, and state-before/state-after assertions.

### FT-001-AC-008 — Protected Admin UI provisions a participant invitation
- REQ: REQ-001, REQ-002, REQ-014
- Given an authenticated Admin in the target center, when the Admin submits the
  protected participant form, then the server rechecks the actor and own-center
  scope, uses the existing authorized Center & Scheduling provisioning path,
  creates the requested participant account/membership and one-time invitation
  atomically, and returns the invitation URL/status. Unauthenticated,
  non-Admin, and cross-center submissions are rejected before state changes.
- Verification: running SvelteKit page/form or HTTP action smoke with own-center
  success and negative authorization/state-before/state-after assertions.

## Acceptance Closure
| Material outcome | Coverage |
|---|---|
| Provider unavailable without auth bypass | FT-001-AC-004 |
| Reused/revoked/expired invitation | FT-001-AC-003 |
| Duplicate provider identity without merge | FT-001-AC-003 |
| Failed callback without partial state | FT-001-AC-004 |
| Provisioning authorization and account/invitation atomicity | FT-001-AC-005 |
| Browser login/session and logout | FT-001-AC-006 |
| Browser invitation acceptance/binding | FT-001-AC-007 |
| Protected Admin participant/invitation form | FT-001-AC-008 |

## Task Coverage at W9 — TASK-019 Boundary

- The authoritative [TASK-019-T3-FT-001-W9 card](../tasks/TASK-019-T3-FT-001-W9.task.json)
  is `done`; its current functional verification is `PASS` and its required T3
  semantic verification is `semantic-pass`:
  - [functional verification report](../../.tasks/TASK-019-T3-FT-001-W9/TASK-019-T3-FT-001-W9-S-VERIFY-final-report-docs-01.md)
  - [functional verification protocol](../../.protocols/TASK-019-T3-FT-001-W9/verification.md)
  - [semantic verification report](../../.tasks/TASK-019-T3-FT-001-W9/TASK-019-T3-FT-001-W9-S-RED-VERIFY-final-report-docs-01.md)
  - [semantic verification protocol](../../.protocols/TASK-019-T3-FT-001-W9/red-verification.md)
  - [task-level sync report](../../.tasks/TASK-019-T3-FT-001-W9/TASK-019-T3-FT-001-W9-S-MB-SYNC-final-report-docs-01.md)
- The current evidence proves only the TASK-019 primitives: server-only
  Telegram/Google normalization to verified `{provider, subject}`, explicit
  provider/state failure without persistence mutation, server-owned opaque
  session issuance/revocation with exact HTTPS/local-HTTP cookie options, and
  exact-account one-use invitation acceptance with safe rejection and rollback.
- The Attempt 1 functional failure and bounded Attempt 2 correction remain
  historical evidence in the task-local artifacts; `1/2` retries are used and
  `1` remains. No claim is broadened to browser transport or Admin UI by the
  TASK-019 evidence.
- `TASK-020-T3-FT-001-W9` is covered independently below; `TASK-021-T3-FT-001-W9`
  remains `planned`. FT-001 remains `status: draft` / `lifecycle: planned`.
  No feature promotion, dependent transition, architecture, or requirement
  lifecycle change was applied by the TASK-019 reconciliation.

## Task Coverage at W9 — TASK-020 Browser/API Transport

- The authoritative [TASK-020-T3-FT-001-W9 card](../tasks/TASK-020-T3-FT-001-W9.task.json)
  is `done`; its current functional verification is `PASS` and its required T3
  semantic verification is `semantic-pass`:
  - [functional verification report](../../.tasks/TASK-020-T3-FT-001-W9/TASK-020-T3-FT-001-W9-S-VERIFY-final-report-docs-01.md)
  - [functional verification protocol](../../.protocols/TASK-020-T3-FT-001-W9/verification.md)
  - [semantic verification report](../../.tasks/TASK-020-T3-FT-001-W9/TASK-020-T3-FT-001-W9-S-RED-VERIFY-final-report-docs-01.md)
  - [semantic verification protocol](../../.protocols/TASK-020-T3-FT-001-W9/red-verification.md)
  - [task-level sync report](../../.tasks/TASK-020-T3-FT-001-W9/TASK-020-T3-FT-001-W9-S-MB-SYNC-final-report-docs-01.md)
- Proven claims are limited to FT-001-AC-006 and FT-001-AC-007: both Telegram
  and Google browser/API login paths resolve the exact actor; the existing
  `foundation_session` is `HttpOnly`, `Path=/`, `SameSite=Lax`, with `Secure`
  required for HTTPS and relaxed for local HTTP; logout and revoked sessions
  deny subsequent protected access.
- Invitation acceptance remains bound to server-issued state from invite page
  through callback. Valid Telegram and Google callbacks bind and consume the
  exact pre-created account once; forged, tampered, mismatched, expired,
  revoked, reused, wrong-account, duplicate, outage, and rollback paths return
  safe denial without consuming a still-valid invitation or leaving partial
  state. Routes remain thin adapters with no direct persistence write or
  client-trusted authorization context.
- Attempt 1's missing-transport RED and subsequent focused-gate failure remain
  preserved as historical evidence. Attempt 2 applied the bounded
  `invitationToken` state-continuity correction; the retry budget remains `1/2`
  used with `1` retry remaining. No executor receipt was promoted to independent
  proof.
- `TASK-019-T3-FT-001-W9` remains `done` and `TASK-021-T3-FT-001-W9` remains
  `planned`; FT-001 remains `status: draft` / `lifecycle: planned`. No feature,
  requirement, architecture, or dependent-task lifecycle transition was made.

## SDD Design Gate
Global authentication, security, storage, provider, and runtime contracts are
owned by `/spec-design` and composed here through:

- [.memory-bank/architecture/system-architecture.md](../architecture/system-architecture.md#accepted-target)
- [.memory-bank/contracts/access-control.md](../contracts/access-control.md)
- [.memory-bank/contracts/authentication-transport.md](../contracts/authentication-transport.md)
- [.memory-bank/contracts/boundary-map.md](../contracts/boundary-map.md#account-provisioning-boundary)
- [.memory-bank/contracts/provider-adapters.md](../contracts/provider-adapters.md)
- [.memory-bank/domains/core-domain.md](../domains/core-domain.md#ownership-map)
- [.memory-bank/states/lifecycle-map.md](../states/lifecycle-map.md#access-and-membership)

Feature-level contract detail remains downstream task-design work.

## Task Coverage at W9 — TASK-021 Protected Admin UI

- The authoritative [TASK-021-T3-FT-001-W9 card](../tasks/TASK-021-T3-FT-001-W9.task.json)
  is `done`; its current functional verification is `PASS` and its required T3
  semantic verification is `semantic-pass`:
  - [functional verification report](../../.tasks/TASK-021-T3-FT-001-W9/TASK-021-T3-FT-001-W9-S-VERIFY-final-report-docs-01.md)
  - [functional verification protocol](../../.protocols/TASK-021-T3-FT-001-W9/verification.md)
  - [semantic verification report](../../.tasks/TASK-021-T3-FT-001-W9/TASK-021-T3-FT-001-W9-S-RED-VERIFY-final-report-docs-01.md)
  - [semantic verification protocol](../../.protocols/TASK-021-T3-FT-001-W9/red-verification.md)
  - [task-level sync report](../../.tasks/TASK-021-T3-FT-001-W9/TASK-021-T3-FT-001-W9-S-MB-SYNC-final-report-docs-01.md)
- Proven claims are limited to FT-001-AC-008: protected Admin SSR, form, and
  JSON API provisioning allow only an authenticated own-center Admin; server
  checks reject unauthenticated, non-Admin, and wrong-center requests before
  mutation. Submitted center/account/admin values are ignored, the existing
  Center & Scheduling `createParticipant` boundary owns provisioning, and the
  route exposes no direct persistence, provider-secret, password, dev-login,
  or alternate provisioning path.
- The participant account, membership, and one-time invitation are atomic;
  identifiers and invitation values are server-generated. The returned
  invitation enters TASK-020's accepted provider path and retains the exact
  generated account role/membership with safe duplicate, replay, revoked, and
  expired handling.
- Executor Attempt 1's honest RED, failed focused gate, bounded Attempt 2
  correction, and Attempt 3 project-native gate correction remain preserved in
  task-local history. Executor retry budget is `2/2` used; the independent
  verifier used no retries. No TASK-019/020 artifact, feature product
  lifecycle, requirement lifecycle, architecture, or promotion state changed.
- FT-001 remains `status: draft` / `lifecycle: planned`; this task-level
  evidence routing does not promote the feature or change dependent lifecycle.

## Task Coverage at W10 — TASK-022 Browser-bound Callback State

- The authoritative [TASK-022-T3-FT-001-W10 card](../tasks/TASK-022-T3-FT-001-W10.task.json)
  is `done`; its current functional verification is `PASS` and its required T3
  semantic verification is `semantic-pass`:
  - [functional verification report](../../.tasks/TASK-022-T3-FT-001-W10/TASK-022-T3-FT-001-W10-S-VERIFY-final-report-docs-01.md)
  - [functional verification protocol](../../.protocols/TASK-022-T3-FT-001-W10/verification.md)
  - [semantic verification report](../../.tasks/TASK-022-T3-FT-001-W10/TASK-022-T3-FT-001-W10-S-RED-VERIFY-final-report-docs-01.md)
  - [semantic verification protocol](../../.protocols/TASK-022-T3-FT-001-W10/red-verification.md)
  - [task-level sync report](../../.tasks/TASK-022-T3-FT-001-W10/TASK-022-T3-FT-001-W10-S-MB-SYNC-final-report-docs-01.md)
- Proven TASK-022 hardening is limited to the existing AC-006/AC-007 browser
  transport: the start flow issues an opaque server-owned binding cookie;
  missing, mismatched, expired, cross-browser, and replayed callbacks fail
  before provider or Identity & Access completion; valid Telegram/Google flows
  preserve exact actor/invitation/session behavior; and one-use binding cleanup
  follows the accepted cookie contract. This evidence supports, but does not
  replace, TASK-020's primary AC-006/AC-007 ownership.
- The fresh verifier also observed expiry pruning and failed-provider-start
  discard in the shared auth-state path. Those observations remain supporting
  evidence only: they do not close, reassign, or promote `TASK-023-T3-FT-001-W10`,
  whose planned retention/failed-start boundary remains separately indexed.
- Attempt 1 RED, Attempt 2 correction RED/GREEN, the pre-Attempt 3 verifier gate
  failure, Attempt 3 fixture correction, and all task-local receipts remain
  preserved. `TASK-021` remains `done`, `TASK-023`/`TASK-024` remain unchanged,
  and FT-001 remains `status: draft` / `lifecycle: planned`; no requirement
  lifecycle, dependency, promotion, or architecture transition was applied.

## Task Coverage at W10 — TASK-023 Bounded Auth-State Retention

- The authoritative [TASK-023-T3-FT-001-W10 card](../tasks/TASK-023-T3-FT-001-W10.task.json)
  is `done`; its current functional verification is `PASS` and its required T3
  semantic verification is `semantic-pass`:
  - [functional verification report](../../.tasks/TASK-023-T3-FT-001-W10/TASK-023-T3-FT-001-W10-S-VERIFY-final-report-docs-01.md)
  - [functional verification protocol](../../.protocols/TASK-023-T3-FT-001-W10/verification.md)
  - [semantic verification report](../../.tasks/TASK-023-T3-FT-001-W10/TASK-023-T3-FT-001-W10-S-RED-VERIFY-final-report-docs-01.md)
  - [semantic verification protocol](../../.protocols/TASK-023-T3-FT-001-W10/red-verification.md)
  - [task-level sync report](../../.tasks/TASK-023-T3-FT-001-W10/TASK-023-T3-FT-001-W10-S-MB-SYNC-final-report-docs-01.md)
- Proven TASK-023 hardening is limited to the existing process-local auth-state
  boundary: issue/consume prune expired records, failed provider start removes
  only its newly issued record, valid sibling states remain usable, and the
  safe failure leaves account/identity/invitation/session state unchanged.
  No worker, second persistence store, capacity policy, or unrelated lifecycle
  was introduced. The honest pre-implementation GREEN is retained as
  supporting evidence; independent functional and semantic verdicts are the
  closure basis.
- TASK-004 remains the primary AC-004 owner and TASK-020 remains the primary
  AC-007 owner; TASK-023 supplies bounded retention/failure support only.
  TASK-022 and all W9 records remain preserved, TASK-024 remains `planned`, and
  FT-001 remains `status: draft` / `lifecycle: planned`. No requirement
  lifecycle, dependency, promotion, or architecture transition was applied.

## Task Coverage at W10 — TASK-024 Composition Wiring

- The authoritative [TASK-024-T3-FT-001-W10 card](../tasks/TASK-024-T3-FT-001-W10.task.json)
  is `done`; its current functional verification is `PASS` and its required T3
  semantic verification is `semantic-pass`:
  - [functional verification report](../../.tasks/TASK-024-T3-FT-001-W10/TASK-024-T3-FT-001-W10-S-VERIFY-final-report-docs-01.md)
  - [functional verification protocol](../../.protocols/TASK-024-T3-FT-001-W10/verification.md)
  - [semantic verification report](../../.tasks/TASK-024-T3-FT-001-W10/TASK-024-T3-FT-001-W10-S-RED-VERIFY-final-report-docs-01.md)
  - [semantic verification protocol](../../.protocols/TASK-024-T3-FT-001-W10/red-verification.md)
  - [task-level sync report](../../.tasks/TASK-024-T3-FT-001-W10/TASK-024-T3-FT-001-W10-S-MB-SYNC-final-report-docs-01.md)
- Proven TASK-024 result is limited to the accepted composition boundary:
  platform configuration and the single composition root own the provider
  registry, auth transport receives injected dependencies, configured
  Telegram/Google starts and safe missing-config failure remain intact, and
  provider secrets do not reach client output. TASK-020 remains the primary
  AC-006/AC-007 proof owner; TASK-024 supplies composition-wiring support only.
- TASK-022, TASK-023, every W9 record, and all task-local retry/evidence history
  remain preserved. FT-001 remains `status: draft` / `lifecycle: planned`, and
  REQ-001/REQ-002/REQ-014 remain `planned`; no dependency, promotion,
  architecture, or ownership transition was applied.

## Semantic Verification

Standalone feature-level `/red-verify --feature FT-001` was independently
rerun after TASK-022/023/024 closure evidence was present, against the current
implementation, all W9/W10 task evidence, the repaired TASK-015 coverage, the
full FT-001 AC-001…008 surface, fresh adversarial probes, and current project
gates. No material semantic finding or operator-owned question was evidenced.
The feature report is
[FT-001 red-verification report](../../.tasks/FT-001/FT-001-S-RED-VERIFY-final-report-docs-01.md).
The current feature-level reconciliation is recorded in the
[FT-001 MB-SYNC report](../../.tasks/FT-001/FT-001-S-MB-SYNC-final-report-docs-02.md).

SEMANTIC_VERDICT: semantic-pass

## Feature-Level Coverage Index — 2026-08-11

The fresh feature semantic pass is the current evidence basis for the complete
FT-001 acceptance surface. This index routes only the claims proven by the
independent task evidence; TASK-019 is recorded as supporting integration
coverage where its primitives are used, not as a replacement for an AC owner.

| AC | Proven claim | Primary proof owner | Supporting boundary |
|---|---|---|---|
| FT-001-AC-001 | Telegram and Google invitation binding resolves the exact pre-created account and retains role/membership; caller role choice is not accepted. | TASK-004 (`PASS` + `semantic-pass`) | TASK-019 verified provider normalization |
| FT-001-AC-002 | Second-provider binding requires active-session owner reconfirmation and resolves both providers to one account. | TASK-004 (`PASS` + `semantic-pass`) | — |
| FT-001-AC-003 | Expired, revoked, reused, duplicate, and invalid identity/invitation paths reject without account, role, membership, invitation, or binding mutation. | TASK-015 (`PASS` + `semantic-pass`) | TASK-019 exact-account invitation rejection/rollback |
| FT-001-AC-004 | Provider outage and failed callback return explicit failure with no partial identity state. | TASK-004 (`PASS` + `semantic-pass`) | TASK-019 provider/state failure safety; TASK-023 bounded auth-state retention/failure |
| FT-001-AC-005 | Only a server-resolved own-center Admin can provision through the authoritative path; alternate public writes are unavailable and account/invitation writes are atomic. | TASK-015 (`PASS` + `semantic-pass`) | — |
| FT-001-AC-006 | Browser/API login resolves the exact bound actor, issues the defined server session cookie, and logout/revocation deny later protected access. | TASK-020 (`PASS` + `semantic-pass`) | TASK-019 session primitives; TASK-022 browser binding; TASK-024 composition wiring |
| FT-001-AC-007 | Server-bound invitation state survives the browser callback; valid Telegram/Google acceptance binds and consumes the exact account once, while rejected/failed paths are safe and non-consuming. | TASK-020 (`PASS` + `semantic-pass`) | TASK-019 acceptance/rollback; TASK-022 browser binding; TASK-023 retention/failure; TASK-024 composition wiring |
| FT-001-AC-008 | Protected Admin SSR/form/API provisioning enforces own-center Admin authorization before mutation, ignores client scope, uses `createParticipant`, and commits account/membership/invitation atomically. | TASK-021 (`PASS` + `semantic-pass`) | TASK-020 accepted invitation path |

### Task evidence index

- [TASK-004 card](../tasks/TASK-004-T3-FT-001-W3.task.json), [functional PASS](../../.tasks/TASK-004-T3-FT-001-W3/TASK-004-T3-FT-001-W3-S-VERIFY-final-report-docs-01.md), and [semantic-pass](../../.tasks/TASK-004-T3-FT-001-W3/TASK-004-T3-FT-001-W3-S-RED-VERIFY-final-report-docs-01.md) cover AC-001, AC-002, and AC-004.
- [TASK-015 card](../tasks/TASK-015-T3-FT-001-W2.task.json), [functional PASS](../../.tasks/TASK-015-T3-FT-001-W2/TASK-015-T3-FT-001-W2-S-VERIFY-final-report-docs-02.md), and [semantic-pass](../../.tasks/TASK-015-T3-FT-001-W2/TASK-015-T3-FT-001-W2-S-RED-VERIFY-final-report-docs-02.md) cover AC-003 and AC-005.
- [TASK-019 card](../tasks/TASK-019-T3-FT-001-W9.task.json), [functional PASS](../../.tasks/TASK-019-T3-FT-001-W9/TASK-019-T3-FT-001-W9-S-VERIFY-final-report-docs-01.md), and [semantic-pass](../../.tasks/TASK-019-T3-FT-001-W9/TASK-019-T3-FT-001-W9-S-RED-VERIFY-final-report-docs-01.md) cover only the provider/session/invitation primitives listed above.
- [TASK-020 card](../tasks/TASK-020-T3-FT-001-W9.task.json), [functional PASS](../../.tasks/TASK-020-T3-FT-001-W9/TASK-020-T3-FT-001-W9-S-VERIFY-final-report-docs-01.md), and [semantic-pass](../../.tasks/TASK-020-T3-FT-001-W9/TASK-020-T3-FT-001-W9-S-RED-VERIFY-final-report-docs-01.md) cover AC-006 and AC-007.
- [TASK-021 card](../tasks/TASK-021-T3-FT-001-W9.task.json), [functional PASS](../../.tasks/TASK-021-T3-FT-001-W9/TASK-021-T3-FT-001-W9-S-VERIFY-final-report-docs-01.md), and [semantic-pass](../../.tasks/TASK-021-T3-FT-001-W9/TASK-021-T3-FT-001-W9-S-RED-VERIFY-final-report-docs-01.md) cover AC-008.
- [TASK-022 card](../tasks/TASK-022-T3-FT-001-W10.task.json), [functional PASS](../../.tasks/TASK-022-T3-FT-001-W10/TASK-022-T3-FT-001-W10-S-VERIFY-final-report-docs-01.md), and [semantic-pass](../../.tasks/TASK-022-T3-FT-001-W10/TASK-022-T3-FT-001-W10-S-RED-VERIFY-final-report-docs-01.md) provide browser-binding hardening support for AC-006/AC-007; TASK-020 remains their primary proof owner.
- [TASK-023 card](../tasks/TASK-023-T3-FT-001-W10.task.json), [functional PASS](../../.tasks/TASK-023-T3-FT-001-W10/TASK-023-T3-FT-001-W10-S-VERIFY-final-report-docs-01.md), and [semantic-pass](../../.tasks/TASK-023-T3-FT-001-W10/TASK-023-T3-FT-001-W10-S-RED-VERIFY-final-report-docs-01.md) provide bounded auth-state retention/failure support for AC-004/AC-007; TASK-004 and TASK-020 remain their primary proof owners.
- [TASK-024 card](../tasks/TASK-024-T3-FT-001-W10.task.json), [functional PASS](../../.tasks/TASK-024-T3-FT-001-W10/TASK-024-T3-FT-001-W10-S-VERIFY-final-report-docs-01.md), and [semantic-pass](../../.tasks/TASK-024-T3-FT-001-W10/TASK-024-T3-FT-001-W10-S-RED-VERIFY-final-report-docs-01.md) provide composition/platform wiring support for AC-006/AC-007; TASK-020 remains the primary proof owner.
- The [feature semantic report](../../.tasks/FT-001/FT-001-S-RED-VERIFY-final-report-docs-01.md) records the independent `semantic-pass` over AC-001..008 and the combined current implementation surface.
- The [feature MB-SYNC report](../../.tasks/FT-001/FT-001-S-MB-SYNC-final-report-docs-02.md) records the aggregate AC-001..008 reconciliation and the W10 supporting ownership without changing primary task claims.

`TASK-003-T3-FT-001-W2` remains the indexed `failed` historical attempt. Its
semantic-fail evidence, executor attempts, and task-local history are preserved
and are not reused as proof or dependency; the current AC-003/AC-005 proof is
TASK-015. No task-card, retry-budget, dependency, architecture, or dependent
transition is implied by this index.

## Lifecycle Reconciliation — 2026-08-11

The explicit top-level operator decision authorizes closing FT-001 as verified
after the already completed gates. The authoritative feature state is now
document `status: active` and entity `lifecycle: verified`.

The decision is grounded in the terminal product queue, TASK-019 through
TASK-024 current functional `PASS` plus required per-task T3 `semantic-pass`,
the aggregate FT-001 feature-level `SEMANTIC_VERDICT: semantic-pass`, the
current Planning Revision 2 task-plan `APPROVE`, strict doctor `PASS`, and the
W10 advisory result with no material findings. The transition changes only the
FT-001 feature lifecycle/document status; AC/spec content, task records,
dependencies, tiers, and verification history remain unchanged.

RTM routing is reconciled in [requirements.md](../requirements.md): REQ-001 and
REQ-002 are `verified`; shared REQ-014 remains `planned` because its other
feature mappings are not part of this decision.

Evidence: [feature semantic report](../../.tasks/FT-001/FT-001-S-RED-VERIFY-final-report-docs-01.md),
[feature MB-SYNC report](../../.tasks/FT-001/FT-001-S-MB-SYNC-final-report-docs-02.md),
and [W10 tech-debt report](../../PAPERCUTS/TECHDEBTS/tech-debt-wave-W10-2026-08-11.md).
