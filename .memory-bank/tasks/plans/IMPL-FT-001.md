---
description: Implementation plan for FT-001 authentication and identity binding.
status: active
---
# IMPL-FT-001 — Authentication and Identity Binding

## Goal

Implement the Identity & Access account/password/invitation/provider-binding
outcome and the minimum real SvelteKit browser/API path defined by FT-001.

## Scope / non-goals

Scope is role-bearing internal accounts, local first-Admin password bootstrap,
email/password login, one-time invitation lifecycle, Telegram/Google binding,
server-issued sessions, login/logout transport, invite acceptance, and a
protected Admin participant/invitation form. The W9 Admin
form uses the existing `createParticipant` contract for teacher/student/parent
participants. Do not introduce a second service, client-trusted roles, a
dev-login bypass, self-registration/recovery/MFA, multi-Admin bootstrap, new
authentication dependency, or consumer-owned identity writes.

## Strategy and ownership

`src/lib/server/modules/identity-access/` is the sole write owner for account,
role, invitation, and identity state. `provisionAccount` is the only public
provisioning write. Center & Scheduling resolves the request actor and
own-center Admin scope before invoking it; adapters and routes may not bypass
that authorization path or write Identity & Access state directly. Center &
Scheduling remains the membership owner. Provider adapters verify external
callbacks only; Identity & Access consumes normalized identities and owns
session/invitation/identity persistence. SvelteKit routes and UI remain thin
transport adapters.

## Ordered tasks

| Wave | Task | Outcome | Dependency |
|---|---|---|---|
| W2 | TASK-015-T3-FT-001-W2 | repaired authoritative provisioning, authorization matrix, alternate-command removal, account+invitation atomicity, and safe reuse rejection | TASK-002-T3-FT-000-W1 |
| W3 | TASK-004-T3-FT-001-W3 | complete Telegram/Google invitation binding, second-provider binding, and callback atomicity | TASK-015-T3-FT-001-W2 |
| W9 | TASK-019-T3-FT-001-W9 | provider adapter boundary plus server-side identity authentication, invitation acceptance, session issuance/revocation primitives | TASK-004-T3-FT-001-W3 |
| W9 | TASK-020-T3-FT-001-W9 | browser login/logout and invite acceptance HTTP/SSR transport with secure session cookie and callback state | TASK-019-T3-FT-001-W9 |
| W9 | TASK-021-T3-FT-001-W9 | protected Admin participant form/page that creates center membership and returns one-time invitation status | TASK-020-T3-FT-001-W9; TASK-005-T3-FT-002-W3 |
| W10 | TASK-022-T3-FT-001-W10 | bind callback state to the browser context and fail closed before provider/session completion | TASK-021-T3-FT-001-W9 |
| W10 | TASK-023-T3-FT-001-W10 | bound expired auth-state retention and failed provider-start discard | TASK-022-T3-FT-001-W10 |
| W10 | TASK-024-T3-FT-001-W10 | move provider configuration/registry wiring to platform and composition root; keep route dependency-only | TASK-023-T3-FT-001-W10 |
| W11 | TASK-025-T3-FT-001-W11 | allow the authenticated bootstrap Admin to create the first center in the browser | TASK-024-T3-FT-001-W10; TASK-005-T3-FT-002-W3 |
| W13 | TASK-029-T3-FT-001-W13 | atomically bootstrap the empty-database first Admin password credential through a local hidden-input CLI | TASK-025-T3-FT-001-W11 |
| W14 | TASK-030-T3-FT-001-W14 | verify password credentials and expose browser login through the existing session/cookie | TASK-029-T3-FT-001-W13 |

## Gates and verification

Use `npm run check`, `npm run build`, and `npm run test`; verify AC-003/005 on
TASK-015, AC-001/002/004 on TASK-004, AC-006/007 on TASK-020, and AC-008 on
TASK-021. Verify AC-010 on TASK-029 and AC-011 on TASK-030; AC-009 remains
historically owned by done TASK-025. W9 HTTP/SSR checks use disposable fixtures, server-issued sessions,
state-before/state-after comparisons for failures, and one running local
SvelteKit process. Each new task has a claim-linked RED/GREEN contract and
direct canonical links.

## W13 email/password rebuild

The unexecuted `TASK-027-T3-FT-001-W13` described Telegram Bot API discovery.
The operator replaced that material outcome with email/password bootstrap and
browser login. Under the existing-queue identity rule this is
`rebuild_required`: TASK-027 and the rejected, unexecuted TASK-028 are removed
from the indexed task model. Fresh `TASK-029-T3-FT-001-W13` owns
FT-001-AC-010, and `TASK-030-T3-FT-001-W14` owns FT-001-AC-011. TASK-025 and
the FT-002 TASK-026 remain `done` and unchanged.

Unmerged grounded units remain separate: (1) first-Admin account+password-
credential bootstrap reaches useful completion through disposable database/CLI
proof without HTTP; (2) password credential verification and browser session
transport reaches useful completion through a disposable pre-created
credential without the CLI. Their failure, rollback, retry, and proof surfaces
are independent; the shared owner and credential shape do not justify a merge.
The owner is Identity & Access at
`src/lib/server/modules/identity-access/`; platform/database and SvelteKit
login/CLI adapters may wire/call that public owner but may not write credential
state or own authorization.

TASK-029 owns the Identity & Access credential creation/storage boundary, shared
database schema, local CLI under `scripts/`, `package.json`, focused CLI/data
tests, and bootstrap deployment instructions. It is T3/W13/done with
independent functional `PASS` and required per-task `semantic-pass`; its
dependency on done TASK-025 remains unchanged. TASK-030 owns password verification, `/login` server/UI
transport, existing session/cookie integration, and focused identity/route
tests. It is T3/W14/done with independent functional `PASS` and required
per-task `semantic-pass`; its dependency on TASK-029 remains unchanged. The
Foundation final gate remains transitively satisfied.

## W13 TASK-029 completion evidence

The authoritative [TASK-029-T3-FT-001-W13 card](../TASK-029-T3-FT-001-W13.task.json)
is `done` with [functional PASS](../../../.tasks/TASK-029-T3-FT-001-W13/TASK-029-T3-FT-001-W13-S-VERIFY-final-report-docs-01.md)
and [T3 semantic-pass](../../../.tasks/TASK-029-T3-FT-001-W13/TASK-029-T3-FT-001-W13-S-RED-VERIFY-final-report-docs-01.md).
The [task sync report](../../../.tasks/TASK-029-T3-FT-001-W13/TASK-029-T3-FT-001-W13-S-MB-SYNC-final-report-docs-01.md)
routes this AC-010-only closure. At the W13 boundary TASK-030 remained
`planned`; no dependent promotion or FT-001/REQ lifecycle transition was made
by that reconciliation.

## W14 TASK-030 completion evidence

The authoritative [TASK-030-T3-FT-001-W14 card](../TASK-030-T3-FT-001-W14.task.json)
is `done` with [functional PASS](../../../.tasks/TASK-030-T3-FT-001-W14/TASK-030-T3-FT-001-W14-S-VERIFY-final-report-docs-01.md)
and [T3 semantic-pass](../../../.tasks/TASK-030-T3-FT-001-W14/TASK-030-T3-FT-001-W14-S-RED-VERIFY-final-report-docs-01.md).
The [task sync report](../../../.tasks/TASK-030-T3-FT-001-W14/TASK-030-T3-FT-001-W14-S-MB-SYNC-final-report-docs-01.md)
routes this AC-011 closure. The fresh aggregate
[feature semantic report](../../../.tasks/FT-001/FT-001-S-RED-VERIFY-final-report-docs-01.md)
subsequently returned `semantic-pass` over AC-001..AC-011, and the explicit
lifecycle owner closed FT-001 and REQ-001 as `verified`. The
[final feature sync report](../../../.tasks/FT-001/FT-001-S-MB-SYNC-final-report-docs-03.md)
is the current reconciliation route.

## Planning Revision 2 reconciliation

The global backbone remains `complete` at Planning Revision 2. W9 extends the
existing Identity & Access and application-shell leaf contracts without
changing the accepted modular-monolith/one-server/one-database architecture or
Planning Revision. TASK-003, TASK-004, and TASK-015 retain their identities,
tiers, waves, dependencies, statuses, historical evidence, and retry history.

## W9 TASK-019 Boundary Evidence

- The authoritative [TASK-019-T3-FT-001-W9 card](../TASK-019-T3-FT-001-W9.task.json)
  remains `T3` / `W9` / `done`. Current closure evidence is the independent
  functional `PASS` and T3 semantic `semantic-pass` records:
  [functional report](../../../.tasks/TASK-019-T3-FT-001-W9/TASK-019-T3-FT-001-W9-S-VERIFY-final-report-docs-01.md),
  [functional protocol](../../../.protocols/TASK-019-T3-FT-001-W9/verification.md),
  [semantic report](../../../.tasks/TASK-019-T3-FT-001-W9/TASK-019-T3-FT-001-W9-S-RED-VERIFY-final-report-docs-01.md),
  and [semantic protocol](../../../.protocols/TASK-019-T3-FT-001-W9/red-verification.md).
- The proven outcome is bounded to provider/session/invitation primitives:
  normalized server-verified Telegram/Google identities with no adapter
  persistence write or secret exposure; explicit invalid-provider/state/outage
  rejection; server-owned opaque sessions with revocation and exact cookie
  options; and atomic exact-account invitation acceptance with one-use,
  duplicate/revoked/expired/reused rejection and rollback on session-write
  failure.
- Attempt 1's functional `FAIL` remains the correction basis: the public
  caller-controlled session path and Google origin-only redirect URI were
  corrected in Attempt 2. The retry budget remains `1/2` used with `1` retry
  remaining. This TASK-019 reconciliation did not promote the separate
  transport/UI owners; TASK-020 is now independently reconciled below and
  TASK-021 remains `planned`.
- No code, architecture, Planning Revision, feature/requirement lifecycle,
  task identity/status, dependency, or retry-budget decision was made by this
  reconciliation.

## W9 TASK-020 Browser/API Transport Evidence

- The authoritative [TASK-020-T3-FT-001-W9 card](../TASK-020-T3-FT-001-W9.task.json)
  is `T3` / `W9` / `done`. Current closure evidence is the independent
  functional `PASS` and T3 `semantic-pass` records:
  [functional report](../../../.tasks/TASK-020-T3-FT-001-W9/TASK-020-T3-FT-001-W9-S-VERIFY-final-report-docs-01.md),
  [functional protocol](../../../.protocols/TASK-020-T3-FT-001-W9/verification.md),
  [semantic report](../../../.tasks/TASK-020-T3-FT-001-W9/TASK-020-T3-FT-001-W9-S-RED-VERIFY-final-report-docs-01.md),
  [semantic protocol](../../../.protocols/TASK-020-T3-FT-001-W9/red-verification.md),
  and [task-level sync report](../../../.tasks/TASK-020-T3-FT-001-W9/TASK-020-T3-FT-001-W9-S-MB-SYNC-final-report-docs-01.md).
- The proven outcome is bounded to the SvelteKit browser/API transport for
  AC-006 and AC-007: Telegram/Google login resolves the exact bound actor;
  `foundation_session` has the exact HTTPS/local-HTTP cookie contract; logout
  and revocation deny access; and server-issued callback state carries the
  invitation context through valid one-use exact-account acceptance.
- The same transport rejects forged, tampered, mismatched, expired, revoked,
  reused, wrong-account, duplicate, outage, and session-write rollback cases
  with safe non-consuming behavior and no partial state. Routes/hooks/SSR loads
  remain thin adapters over TASK-019 public boundaries and do not write
  persistence or trust client role/center/account values.
- Attempt 1's missing transport RED and failed focused gate remain preserved as
  correction history. Attempt 2 applied only the server-owned invitation-state
  continuity correction; retry budget remains `1/2` used with `1` retry
  remaining. No executor receipt was reused as independent proof.
- TASK-019 remains `done`, TASK-021 remains `planned`, and FT-001/its
  requirements retain their existing lifecycle values. No code, architecture,
  Planning Revision, dependency, promotion, or lifecycle decision was made by
  this reconciliation.

## W9 TASK-021 Protected Admin UI Evidence

- The authoritative [TASK-021-T3-FT-001-W9 card](../TASK-021-T3-FT-001-W9.task.json)
  is `T3` / `W9` / `done`. Current closure evidence is the independent
  functional `PASS` and T3 semantic `semantic-pass` records:
  [functional report](../../../.tasks/TASK-021-T3-FT-001-W9/TASK-021-T3-FT-001-W9-S-VERIFY-final-report-docs-01.md),
  [functional protocol](../../../.protocols/TASK-021-T3-FT-001-W9/verification.md),
  [semantic report](../../../.tasks/TASK-021-T3-FT-001-W9/TASK-021-T3-FT-001-W9-S-RED-VERIFY-final-report-docs-01.md),
  [semantic protocol](../../../.protocols/TASK-021-T3-FT-001-W9/red-verification.md),
  and [task-level sync report](../../../.tasks/TASK-021-T3-FT-001-W9/TASK-021-T3-FT-001-W9-S-MB-SYNC-final-report-docs-01.md).
- The proven outcome is bounded to FT-001-AC-008: the protected Admin page,
  form action, and JSON API repeat server-side own-center Admin authorization,
  call only the existing Center & Scheduling `createParticipant` boundary,
  ignore client scope fields, and reject unauthorized/cross-center requests
  before mutation. No direct persistence, provider-secret, password/dev-login,
  or alternate provisioning path is exposed.
- The successful path server-generates participant identifiers and a one-time
  invitation URL/status; the invitation completes through TASK-020's accepted
  provider path. Account, membership, and invitation state commits together or
  remains unchanged on induced failure.
- Executor Attempt 1 RED and focused failure, Attempt 2 bounded fixture/
  rollback correction, and Attempt 3 route/type/framework-gate correction remain
  preserved. Executor retry budget is `2/2` used; no executor receipt was used
  as independent verification evidence.
- TASK-019 and TASK-020 remain `done`; FT-001 and its requirements retain their
  existing lifecycle values. No code, architecture, Planning Revision,
  dependency, promotion, or feature lifecycle decision was made by this sync.

## Feature-Level Coverage Index — 2026-08-11

Fresh feature-level semantic verification returned `semantic-pass` for the
current FT-001 AC-001..008 surface. The implementation plan records the
evidence routing below without changing task ownership or lifecycle.

| AC | Current proven coverage | Task evidence |
|---|---|---|
| AC-001, AC-002, AC-004 | Telegram/Google invitation binding, confirmed second-provider binding, and callback atomicity. | TASK-004 functional `PASS` + T3 `semantic-pass` |
| AC-003, AC-005 | Safe reuse/rejection plus server-resolved own-center Admin provisioning, alternate-command removal, and account/invitation atomicity. | TASK-015 functional `PASS` + T3 `semantic-pass` |
| AC-006, AC-007 | Browser/API login, exact session-cookie behavior, logout/revocation, server-bound invitation callback state, exact one-use acceptance, and safe failure/rollback. | TASK-020 functional `PASS` + T3 `semantic-pass`; TASK-019 primitives support the boundary |
| AC-008 | Protected Admin SSR/form/API provisioning, pre-mutation authorization, server-generated values, `createParticipant` ownership, and atomic account/membership/invitation state. | TASK-021 functional `PASS` + T3 `semantic-pass` |

TASK-019 is included as bounded integration coverage for verified provider
normalization, server-owned sessions, and exact-account invitation primitives;
it does not become the sole owner of AC-001, AC-003, AC-004, AC-006, or AC-007.
The [feature semantic report](../../../.tasks/FT-001/FT-001-S-RED-VERIFY-final-report-docs-01.md)
is the independent aggregate evidence for the complete AC surface. W10
supporting ownership is explicit and non-promotional: TASK-022 supports
AC-006/AC-007 browser binding, TASK-023 supports AC-004/AC-007 bounded
auth-state retention/failure, and TASK-024 supports AC-006/AC-007
composition/platform wiring. The [feature MB-SYNC report](../../../.tasks/FT-001/FT-001-S-MB-SYNC-final-report-docs-02.md)
is the current durable reconciliation record.

Historical preservation: `TASK-003-T3-FT-001-W2` remains failed, and its
semantic-fail evidence, attempts, retry history, and BUG context remain
historical only. TASK-004, TASK-015, TASK-019, TASK-020, and TASK-021 task
records and task-local histories remain authoritative and unchanged by this
feature-level routing. FT-001/REQ lifecycle, architecture, promotion, and
dependent transitions remain unchanged.

## W10 Technical-Debt Patch Plan

The W9 advisory report identifies exactly three independently verifiable units:
`TD-W9-001` (browser-context callback binding), `TD-W9-002` (bounded auth-state
cleanup), and `TD-W9-003` (provider configuration wiring). The units remain
separate because they have distinct security, retention/failure, and
composition-boundary proof obligations. They execute sequentially after the
completed `TASK-021-T3-FT-001-W9`; no W9 card, protocol, evidence, lifecycle,
retry history, or accepted architecture is changed.

The cards reuse the existing
[authentication transport contract](../../contracts/authentication-transport.md#browser-bound-callback-state-and-bounded-retention),
[provider adapter contract](../../contracts/provider-adapters.md#failure-and-ownership-rules),
[composition-root architecture](../../architecture/system-architecture.md#main-architecture-units),
[provider verification boundary](../../contracts/boundary-map.md#provider-verification-boundary),
and [testing evidence policy](../../testing/strategy.md#evidence-and-ownership).
The exact feature/requirement context is `FT-001-AC-006`/`FT-001-AC-007` and
`REQ-001`/`REQ-002`/`REQ-014`; existing W9 cards retain ownership of the
product AC claims. No new canonical spec, data store, background cleanup
service, provider protocol, or architecture decision is required.

The W10 cards were created as `T3` / `planned` and carry literal hard write
boundaries, the project-native check/build/test gates, a task-owned RED ->
equivalent GREEN -> independent `/verify` path, and a per-task `/red-verify`
semantic path. TASK-022, TASK-023, and TASK-024 now have current closure
evidence below.
The executor must stop if satisfying a patch would alter the accepted
modular-monolith + SQLite target, introduce direct persistence or membership
writes, or require changes to any W9 card/history artifact.

## 2026-08-11 — TASK-022 task-level completion reconciliation

The authoritative [TASK-022-T3-FT-001-W10 card](../TASK-022-T3-FT-001-W10.task.json)
is `done` with independent functional `PASS` and required T3
`semantic-pass` evidence. The current sources are the
[functional protocol](../../../.protocols/TASK-022-T3-FT-001-W10/verification.md),
[functional report](../../../.tasks/TASK-022-T3-FT-001-W10/TASK-022-T3-FT-001-W10-S-VERIFY-final-report-docs-01.md),
[semantic protocol](../../../.protocols/TASK-022-T3-FT-001-W10/red-verification.md),
[semantic report](../../../.tasks/TASK-022-T3-FT-001-W10/TASK-022-T3-FT-001-W10-S-RED-VERIFY-final-report-docs-01.md),
and [sync report](../../../.tasks/TASK-022-T3-FT-001-W10/TASK-022-T3-FT-001-W10-S-MB-SYNC-final-report-docs-01.md).

The proven task-owned hardening is browser-bound callback state for the
existing AC-006/AC-007 transport: opaque server-issued binding, fail-closed
cross-browser/missing/mismatched/expired/replayed callbacks before provider or
Identity & Access completion, exact valid Telegram/Google behavior, and
one-use cookie cleanup. TASK-020 remains the primary AC-006/AC-007 proof owner.

The verifier also observed expiry pruning and failed-start discard in the
shared auth-state path. This is retained as supporting evidence only and does
not close or reassign the separately planned TASK-023 retention boundary.
Attempt 1/2/3 execution history, the verifier retry basis, and all receipts
remain preserved. FT-001/REQ lifecycle, task dependencies, W9 records,
promotion fields, and accepted architecture remain unchanged.

## W10 TASK-023 completion evidence

The authoritative [TASK-023-T3-FT-001-W10 card](../TASK-023-T3-FT-001-W10.task.json)
is `done` with independent functional `PASS` and required T3
`semantic-pass`. The current sources are the
[functional protocol](../../../.protocols/TASK-023-T3-FT-001-W10/verification.md),
[functional report](../../../.tasks/TASK-023-T3-FT-001-W10/TASK-023-T3-FT-001-W10-S-VERIFY-final-report-docs-01.md),
[semantic protocol](../../../.protocols/TASK-023-T3-FT-001-W10/red-verification.md),
[semantic report](../../../.tasks/TASK-023-T3-FT-001-W10/TASK-023-T3-FT-001-W10-S-RED-VERIFY-final-report-docs-01.md),
and [sync report](../../../.tasks/TASK-023-T3-FT-001-W10/TASK-023-T3-FT-001-W10-S-MB-SYNC-final-report-docs-01.md).

The proven task-owned result is bounded retention and failed-start cleanup:
expired records are pruned during issue/consume, a failed provider start
discards only its newly issued record, valid siblings remain usable, and the
safe failure leaves product state unchanged. The executor's honest
pre-implementation GREEN remains supporting evidence only; the independent
functional and semantic verdicts are the closure basis. TASK-004 and TASK-020
retain primary ownership of AC-004 and AC-007; TASK-024 is reconciled below.
No feature/requirement lifecycle, dependency, promotion, architecture, or W9
history transition was made by this reconciliation.

## W10 TASK-024 completion evidence

The authoritative [TASK-024-T3-FT-001-W10 card](../TASK-024-T3-FT-001-W10.task.json)
is `done` with independent functional `PASS` and required T3
`semantic-pass`. The current sources are the
[functional protocol](../../../.protocols/TASK-024-T3-FT-001-W10/verification.md),
[functional report](../../../.tasks/TASK-024-T3-FT-001-W10/TASK-024-T3-FT-001-W10-S-VERIFY-final-report-docs-01.md),
[semantic protocol](../../../.protocols/TASK-024-T3-FT-001-W10/red-verification.md),
[semantic report](../../../.tasks/TASK-024-T3-FT-001-W10/TASK-024-T3-FT-001-W10-S-RED-VERIFY-final-report-docs-01.md),
and [sync report](../../../.tasks/TASK-024-T3-FT-001-W10/TASK-024-T3-FT-001-W10-S-MB-SYNC-final-report-docs-01.md).

The proven result is limited to platform/composition ownership of the existing
provider configuration and registry: route transport is dependency-only,
configured Telegram/Google starts and safe missing-config failure remain
intact, and provider secrets do not reach client output. TASK-020 retains
primary AC-006/AC-007 ownership; no feature/requirement lifecycle, dependency,
promotion, architecture, or W9 history transition was made.

## W17 public home login entry

The operator accepted one new, presentation-only FT-001 outcome: public `/`
visibly links to existing `/login` through an ordinary `Вход` anchor. The new
`TASK-033-T1-FT-001-W17` depends on done `TASK-030-T3-FT-001-W14`, owns only
`FT-001-AC-012` / `REQ-001`, and is T1 because it neither changes authentication
nor observes/mutates session state. Its hard code boundary is the existing home
component and calendar presentation test. FT-003 retains exclusive ownership of
any future replacement of the public calendar fixture with a database-backed
calendar. All prior FT-001 tasks/evidence remain unchanged.

The authoritative card is now `done` with Implementer and independent Reviewer
`PASS` evidence. The current sources are the
[verification report](../../../.tasks/TASK-033-T1-FT-001-W17/TASK-033-T1-FT-001-W17-S-VERIFY-final-report-docs-01.md),
[compact execution protocol](../../../.protocols/TASK-033-T1-FT-001-W17/run.md),
and [task-boundary sync report](../../../.tasks/TASK-033-T1-FT-001-W17/TASK-033-T1-FT-001-W17-S-MB-SYNC-final-report-docs-01.md).
FT-001, REQ-001, and EP-001 remain `planned` because remaining UI/product
outcomes are outside AC-012; no prior task identity, evidence, dependency,
implementation, or feature promotion changed.
