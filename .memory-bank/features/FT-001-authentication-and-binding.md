---
description: Product feature for account authentication, center-created accounts, and external identity binding.
status: active
type: feature
id: FT-001
lifecycle: planned
epic: EP-001
requirements: [REQ-001, REQ-002, REQ-014]
last_updated: 2026-08-17
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
- The operator locally bootstraps the first Admin with normalized email and a
  hidden-prompt password; that Admin signs in by email/password and receives the
  same server session/cookie used by provider login.
- Admin creates teacher, student, and parent accounts directly with email and a
  password; a parent account is linked to a selected student before access is
  granted.
- Authenticated user adds the second provider from a confirmed profile.

## Edge / Failure Behavior
- Expired, revoked, reused, or duplicate invitations/identities reject without
  account, role, membership, or binding mutation.
- Provider callback failure does not create a partial binding.
- Provider outage returns an explicit error and does not bypass authorization.
- Invalid, missing, or revoked sessions cannot reach protected routes or Admin
  actions; logout revokes the server-side session.
- Unknown email and wrong password return the same invalid-credentials response
  without a session; bootstrap in a non-empty account set fails atomically.
- Duplicate participant email, invalid parent link, or failed credential write
  leaves the account, membership, credential, and parent link state unchanged.

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

### FT-001-AC-009 — Bootstrapped Admin enters center creation from the browser
- REQ: REQ-001, REQ-014
- Given a manually bootstrapped Admin account with an authenticated server
  session and no center membership, when the Admin opens the protected UI and
  submits the protected center form, then the server creates the center and Admin
  membership atomically and opens the center Admin surface. A second center
  creation through the bootstrap path, a non-Admin, or a forged center/role is
  rejected before mutation.
- Verification: browser/HTTP flow with empty membership, own success, atomic
  state-before/state-after, and repeated/non-Admin denial.

### FT-001-AC-010 — Operator bootstraps the first Admin password credential locally
- REQ: REQ-001, REQ-014
- Given an initialized database whose `accounts` set is empty, when the operator
  runs the local server-only bootstrap command and enters email interactively
  plus password in a hidden prompt, then exactly one `admin` account and one
  password credential commit atomically. The email is stored only in normalized
  `trim().toLowerCase()` form with database-enforced uniqueness; the password is
  never accepted from argv or logged/stored plaintext and is stored only as a
  Node built-in `scrypt` result with a cryptographically random per-credential
  salt. Any existing account, duplicate normalized email, CLI cancellation, or
  derivation/write failure leaves account and credential state unchanged.
- Verification: disposable SQLite and CLI-I/O scenarios covering email
  normalization/uniqueness, hidden password prompt and argv/log non-exposure,
  random salt plus `scrypt` storage without plaintext, and atomic empty/non-empty
  bootstrap with safe cancellation/failure rerun.

### FT-001-AC-011 — Password credential creates the existing browser session
- REQ: REQ-001, REQ-014
- Given an account with a password credential, when the user submits the same
  normalized email and password through `/login`, then Identity & Access
  verifies the credential with `timingSafeEqual`, issues the existing server
  session/cookie, and opens the permitted context, including `/admin` for the
  first Admin. Unknown email and wrong password return the same generic
  invalid-credentials response and issue no session; logout and revocation deny
  later protected access.
- Verification: disposable credential and HTTP/SSR scenarios covering
  normalized-email success, timing-safe generic invalid credentials, existing
  cookie attributes, protected Admin entry, logout/revocation, no route-owned
  credential persistence, and unchanged Telegram/Google login paths.

### FT-001-AC-012 — Public home exposes the login entry
- REQ: REQ-001
- Given an unauthenticated visitor opens the public home route `/`, then a
  visible, keyboard-accessible `Вход` link has the exact destination `/login`.
  Following it is ordinary browser navigation only: it MUST NOT create,
  inspect, revoke, or otherwise change a session, provider, account, or role.
- Verification: SSR/render and focused route-source smoke prove the visible
  accessible anchor and exact `href`, while the existing login/session/provider
  tests remain green.

### FT-001-AC-013 — Admin creates direct password participants
- REQ: REQ-001, REQ-014
- Given an authenticated own-center Admin, when the Admin submits a teacher,
  student, or parent email/password form, then the server creates the requested
  role, password credential, and center membership atomically. A parent form
  must select an existing center student and creates the corresponding
  `parent_student_links` row atomically. The user can then enter through the
  existing `/login` route; this Admin flow does not require OAuth or an
  invitation link.
- Verification: protected Admin action and SSR/UI checks for each role,
  normalized-email login, duplicate-email denial, invalid parent-link denial,
  non-Admin/cross-center denial, and state-before/state-after equality on every
  failed write.

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
| Bootstrap Admin creates the first center from the browser | FT-001-AC-009 |
| Safe local first-Admin password-credential bootstrap | FT-001-AC-010 |
| Password browser login through the existing session/cookie | FT-001-AC-011 |
| Public entry to the existing login route | FT-001-AC-012 |
| Direct Admin email/password participant creation | FT-001-AC-013 |

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

Fresh standalone `/red-verify --feature FT-001` on 2026-08-14 covered the
complete AC-001..AC-011 surface against every indexed FT-001 task and its
terminal evidence, the current implementation/diff, direct canonical specs,
the historical AC-001..AC-008 aggregate report, and a disposable operational
path from hidden-prompt first-Admin bootstrap through password session, center
creation, own-center Admin routing, and first-class creation. Provider and
password access share the same account/session ownership and remain available;
no material semantic finding or operator-owned question was evidenced.

The current aggregate evidence is the
[FT-001 red-verification report](../../.tasks/FT-001/FT-001-S-RED-VERIFY-final-report-docs-01.md).
The 2026-08-11 MB-SYNC report remains historical AC-001..AC-008 reconciliation;
the explicit lifecycle owner's verified closure is reconciled in the
[current feature MB-SYNC report](../../.tasks/FT-001/FT-001-S-MB-SYNC-final-report-docs-03.md).

SEMANTIC_VERDICT: semantic-pass

## Feature-Level Coverage Index — 2026-08-14

The fresh 2026-08-14 feature semantic pass covers AC-001..AC-011. TASK-019 is
recorded as supporting integration coverage where its primitives are used, not
as a replacement for an AC owner; the 2026-08-11 aggregate remains historical
AC-001..AC-008 evidence only.

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
| FT-001-AC-009 | A session-authenticated bootstrap Admin without membership creates the first center and Admin membership atomically; repeated, non-Admin, and forged-field paths deny before mutation. | TASK-025 (`PASS` + `semantic-pass`) | 2026-08-14 aggregate operational path |
| FT-001-AC-010 | Local hidden-input bootstrap creates exactly one normalized-email Admin plus password credential atomically without plaintext or secret transport. | TASK-029 (`PASS` + `semantic-pass`) | 2026-08-14 aggregate operational path |
| FT-001-AC-011 | Password login uses the existing session/cookie, generic timing-safe invalid denial, protected Admin entry, logout/revocation, and unchanged providers. | TASK-030 (`PASS` + `semantic-pass`) | 2026-08-14 aggregate operational path |

### Task evidence index

- [TASK-004 card](../tasks/TASK-004-T3-FT-001-W3.task.json), [functional PASS](../../.tasks/TASK-004-T3-FT-001-W3/TASK-004-T3-FT-001-W3-S-VERIFY-final-report-docs-01.md), and [semantic-pass](../../.tasks/TASK-004-T3-FT-001-W3/TASK-004-T3-FT-001-W3-S-RED-VERIFY-final-report-docs-01.md) cover AC-001, AC-002, and AC-004.
- [TASK-015 card](../tasks/TASK-015-T3-FT-001-W2.task.json), [functional PASS](../../.tasks/TASK-015-T3-FT-001-W2/TASK-015-T3-FT-001-W2-S-VERIFY-final-report-docs-02.md), and [semantic-pass](../../.tasks/TASK-015-T3-FT-001-W2/TASK-015-T3-FT-001-W2-S-RED-VERIFY-final-report-docs-02.md) cover AC-003 and AC-005.
- [TASK-019 card](../tasks/TASK-019-T3-FT-001-W9.task.json), [functional PASS](../../.tasks/TASK-019-T3-FT-001-W9/TASK-019-T3-FT-001-W9-S-VERIFY-final-report-docs-01.md), and [semantic-pass](../../.tasks/TASK-019-T3-FT-001-W9/TASK-019-T3-FT-001-W9-S-RED-VERIFY-final-report-docs-01.md) cover only the provider/session/invitation primitives listed above.
- [TASK-020 card](../tasks/TASK-020-T3-FT-001-W9.task.json), [functional PASS](../../.tasks/TASK-020-T3-FT-001-W9/TASK-020-T3-FT-001-W9-S-VERIFY-final-report-docs-01.md), and [semantic-pass](../../.tasks/TASK-020-T3-FT-001-W9/TASK-020-T3-FT-001-W9-S-RED-VERIFY-final-report-docs-01.md) cover AC-006 and AC-007.
- [TASK-021 card](../tasks/TASK-021-T3-FT-001-W9.task.json), [functional PASS](../../.tasks/TASK-021-T3-FT-001-W9/TASK-021-T3-FT-001-W9-S-VERIFY-final-report-docs-01.md), and [semantic-pass](../../.tasks/TASK-021-T3-FT-001-W9/TASK-021-T3-FT-001-W9-S-RED-VERIFY-final-report-docs-01.md) cover AC-008.
- [TASK-022 card](../tasks/TASK-022-T3-FT-001-W10.task.json), [functional PASS](../../.tasks/TASK-022-T3-FT-001-W10/TASK-022-T3-FT-001-W10-S-VERIFY-final-report-docs-01.md), and [semantic-pass](../../.tasks/TASK-022-T3-FT-001-W10/TASK-022-T3-FT-001-W10-S-RED-VERIFY-final-report-docs-01.md) provide browser-binding hardening support for AC-006/AC-007; TASK-020 remains their primary proof owner.
- [TASK-023 card](../tasks/TASK-023-T3-FT-001-W10.task.json), [functional PASS](../../.tasks/TASK-023-T3-FT-001-W10/TASK-023-T3-FT-001-W10-S-VERIFY-final-report-docs-01.md), and [semantic-pass](../../.tasks/TASK-023-T3-FT-001-W10/TASK-023-T3-FT-001-W10-S-RED-VERIFY-final-report-docs-01.md) provide bounded auth-state retention/failure support for AC-004/AC-007; TASK-004 and TASK-020 remain their primary proof owners.
- [TASK-024 card](../tasks/TASK-024-T3-FT-001-W10.task.json), [functional PASS](../../.tasks/TASK-024-T3-FT-001-W10/TASK-024-T3-FT-001-W10-S-VERIFY-final-report-docs-01.md), and [semantic-pass](../../.tasks/TASK-024-T3-FT-001-W10/TASK-024-T3-FT-001-W10-S-RED-VERIFY-final-report-docs-01.md) provide composition/platform wiring support for AC-006/AC-007; TASK-020 remains the primary proof owner.
- [TASK-025 card](../tasks/TASK-025-T3-FT-001-W11.task.json), [functional PASS](../../.tasks/TASK-025-T3-FT-001-W11/TASK-025-T3-FT-001-W11-S-VERIFY-final-report-docs-01.md), and [semantic-pass](../../.tasks/TASK-025-T3-FT-001-W11/TASK-025-T3-FT-001-W11-S-RED-VERIFY-final-report-docs-01.md) cover AC-009.
- [TASK-029 card](../tasks/TASK-029-T3-FT-001-W13.task.json), [functional PASS](../../.tasks/TASK-029-T3-FT-001-W13/TASK-029-T3-FT-001-W13-S-VERIFY-final-report-docs-01.md), and [semantic-pass](../../.tasks/TASK-029-T3-FT-001-W13/TASK-029-T3-FT-001-W13-S-RED-VERIFY-final-report-docs-01.md) cover AC-010.
- [TASK-030 card](../tasks/TASK-030-T3-FT-001-W14.task.json), [functional PASS](../../.tasks/TASK-030-T3-FT-001-W14/TASK-030-T3-FT-001-W14-S-VERIFY-final-report-docs-01.md), [semantic-pass](../../.tasks/TASK-030-T3-FT-001-W14/TASK-030-T3-FT-001-W14-S-RED-VERIFY-final-report-docs-01.md), and [task sync](../../.tasks/TASK-030-T3-FT-001-W14/TASK-030-T3-FT-001-W14-S-MB-SYNC-final-report-docs-01.md) cover AC-011 at task level.
- The [feature semantic report](../../.tasks/FT-001/FT-001-S-RED-VERIFY-final-report-docs-01.md) records the fresh independent `semantic-pass` over AC-001..011 and the current implementation surface.
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

## W13 Planning Reconciliation — 2026-08-13

The operator replaced the unexecuted Telegram-discovery bootstrap with the
email/password scope in FT-001-AC-010 and FT-001-AC-011. Historical AC-001..009
outcomes and all completed task evidence remain unchanged. Because AC-011
remains unverified, FT-001 stays at `lifecycle: planned`; its design coverage remains
`complete` through the existing Identity & Access, authentication transport,
access-control, domain, lifecycle, and boundary contracts.

The stale unexecuted `TASK-027-T3-FT-001-W13` and rejected unexecuted
`TASK-028-T3-FT-001-W13` are removed from the indexed task model. Fresh sibling
cards `TASK-029-T3-FT-001-W13` and `TASK-030-T3-FT-001-W14` separately own CLI
bootstrap and browser login/session proof. This is a `rebuild_required`
material-scope/task-boundary reconciliation, not a repair of either retired
card.

## Task Coverage at W13 — TASK-029 First-Admin Bootstrap

The authoritative [TASK-029-T3-FT-001-W13 card](../tasks/TASK-029-T3-FT-001-W13.task.json)
is `done` with independent functional `PASS` and required T3
`semantic-pass`. Its evidence covers only FT-001-AC-010: hidden local password
input with no argv/environment/output disclosure, normalized unique email,
random-salt Node built-in `scrypt` storage without plaintext, and atomic
first-Admin-plus-credential success, rollback, and safe repeat behavior under
Identity & Access ownership.

- [functional verification report](../../.tasks/TASK-029-T3-FT-001-W13/TASK-029-T3-FT-001-W13-S-VERIFY-final-report-docs-01.md)
- [functional verification protocol](../../.protocols/TASK-029-T3-FT-001-W13/verification.md)
- [semantic verification report](../../.tasks/TASK-029-T3-FT-001-W13/TASK-029-T3-FT-001-W13-S-RED-VERIFY-final-report-docs-01.md)
- [semantic verification protocol](../../.protocols/TASK-029-T3-FT-001-W13/red-verification.md)
- [task-level sync report](../../.tasks/TASK-029-T3-FT-001-W13/TASK-029-T3-FT-001-W13-S-MB-SYNC-final-report-docs-01.md)

TASK-030 remains `planned` and solely owns AC-011 browser password
verification/session proof. FT-001 remains `status: active` /
`lifecycle: planned`; REQ-001 remains `planned` while shared REQ-014 remains
`verified`; no feature, requirement, dependency, architecture, or
promotion transition is implied by this W13 task evidence.

## W14 Task Completion Reconciliation — 2026-08-13

The authoritative [TASK-030-T3-FT-001-W14 card](../tasks/TASK-030-T3-FT-001-W14.task.json)
is `done` with independent functional `PASS` and required T3
`semantic-pass`. Its evidence proves AC-011 through normalized-email password
authentication, the common built-in `scrypt` plus `timingSafeEqual` invalid
path, generic sessionless denial, the existing `foundation_session`, protected
Admin entry, logout/revocation, and unchanged Telegram/Google paths.

- [functional verification report](../../.tasks/TASK-030-T3-FT-001-W14/TASK-030-T3-FT-001-W14-S-VERIFY-final-report-docs-01.md)
- [functional verification protocol](../../.protocols/TASK-030-T3-FT-001-W14/verification.md)
- [semantic verification report](../../.tasks/TASK-030-T3-FT-001-W14/TASK-030-T3-FT-001-W14-S-RED-VERIFY-final-report-docs-01.md)
- [semantic verification protocol](../../.protocols/TASK-030-T3-FT-001-W14/red-verification.md)
- [task-level sync report](../../.tasks/TASK-030-T3-FT-001-W14/TASK-030-T3-FT-001-W14-S-MB-SYNC-final-report-docs-01.md)

At this W14 reconciliation all AC-001..AC-011 task owners were implemented and
task-verified, so FT-001 moved to `status: active` / `lifecycle: implemented`.
The feature was not yet eligible for `verified` at that boundary because the
then-existing aggregate report covered only AC-001..AC-008. The current
feature-level result is recorded in `## Semantic Verification`; no task or
queue promotion was performed by the W14 reconciliation.

## Final Lifecycle Reconciliation — 2026-08-14

The explicit top-level lifecycle owner closed FT-001 as `verified` after the
fresh feature-level `SEMANTIC_VERDICT: semantic-pass` covered AC-001..AC-011.
The authoritative feature state is `status: active` / `lifecycle: verified`;
REQ-001 is `verified` in the RTM, while shared REQ-014 and EP-001 remain
`verified`.

The current evidence is the
[fresh aggregate semantic report](../../.tasks/FT-001/FT-001-S-RED-VERIFY-final-report-docs-01.md)
and [final feature sync report](../../.tasks/FT-001/FT-001-S-MB-SYNC-final-report-docs-03.md).
TASK-029 and TASK-030 remain `done` with their task-level functional and
semantic evidence. No task status, dependency, queue promotion, architecture,
or Planning Revision changed in this reconciliation.

## W17 Task Completion Reconciliation — 2026-08-14

The explicit top-level lifecycle owner closed
`TASK-033-T1-FT-001-W17` as `done` after Implementer and independent Reviewer
`PASS` evidence for the new `FT-001-AC-012` / `REQ-001` presentation outcome.
Independent verification observed SSR `/` HTTP 200, exactly one visible
ordinary `Вход` anchor to `/login`, preserved fixture-calendar behavior,
117/117 full tests, 38/38 focused checks, passing check/build/diff gates, and no
touches to forbidden authentication paths.

This task closes only the public login entry. FT-001, REQ-001, and EP-001 remain
`planned` because remaining UI/product outcomes are not covered by AC-012. The
previous AC-001..011 evidence, every prior task identity/status/dependency,
and all existing implementation remain unchanged.

## Direct participant password reconciliation — 2026-08-17

The Admin participant surface now uses the existing password authentication
path directly: the server-owned Center & Scheduling command creates the
Identity & Access password credential, center membership, and optional
parent-to-student link in one transaction. The prior OAuth invitation
transport remains available only for existing provider-specific compatibility
paths; it is no longer the Admin's visible account-creation flow.
