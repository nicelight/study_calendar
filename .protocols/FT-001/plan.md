---
description: Bounded task-planning resume state for FT-001.
status: active
---
# FT-001 Task Planning Plan

## Outcome and scope

Deliver first-Admin email/password bootstrap/login, center-created role-bearing
accounts, one-time invitations, safe Telegram/Google identity binding, server
sessions, and the minimum working browser/API path for login, invite acceptance,
logout, and protected Admin participant provisioning. Out of scope: UI polish,
a dev-login bypass, self-registration/recovery/MFA, multi-Admin bootstrap, a new
authentication dependency, provider SDK selection, and unrelated scheduling or
membership behavior.

## Canonical inputs and ownership

- Feature: [.memory-bank/features/FT-001-authentication-and-binding.md](../../.memory-bank/features/FT-001-authentication-and-binding.md)
- Owner: Identity & Access at `src/lib/server/modules/identity-access/`.
- Public boundary: [.memory-bank/contracts/boundary-map.md#account-provisioning-boundary](../../.memory-bank/contracts/boundary-map.md#account-provisioning-boundary)
- Security contract: [.memory-bank/contracts/access-control.md](../../.memory-bank/contracts/access-control.md)
- Transport contract: [.memory-bank/contracts/authentication-transport.md](../../.memory-bank/contracts/authentication-transport.md)
- Provider contract: [.memory-bank/contracts/provider-adapters.md](../../.memory-bank/contracts/provider-adapters.md)
- Foundation prerequisite: `TASK-002-T3-FT-000-W1`.

## Boundary and waves

1. `TASK-003-T3-FT-001-W2` remains the failed historical attempt and is not reused as proof or a dependency.
2. `TASK-015-T3-FT-001-W2` owns the repaired authoritative provisioning command, server-side actor/own-center Admin authorization, alternate-command removal, account+invitation atomicity, and safe reuse/rejection (AC-003, AC-005), after Foundation.
3. `TASK-004-T3-FT-001-W3` owns the complete Telegram/Google invitation binding flow, confirmed second-provider binding, and callback atomicity (AC-001, AC-002, AC-004), after the repaired provisioning task.
4. W9 unmerged units are: provider verification/session primitives; browser
   login/invite callback transport; and protected Admin participant form. They
   remain separate because their owners, failure surfaces, and proof paths are
   independently completable. No merge is justified by the shared user flow.
5. `TASK-019-T3-FT-001-W9` owns provider normalization and Identity & Access
   session/invitation command primitives. `TASK-020-T3-FT-001-W9` owns the
   SvelteKit auth/invite HTTP/SSR path (AC-006, AC-007).
   `TASK-021-T3-FT-001-W9` owns the Admin page/form integration (AC-008) and
   calls the existing Center & Scheduling participant boundary.
6. The W9 advisory report
   (`PAPERCUTS/TECHDEBTS/tech-debt-wave-W9-2026-08-11.md:52-124`) leaves
   three independently verifiable W10 units:
   `TD-W9-001` browser-context binding for callback state,
   `TD-W9-002` bounded expired-state cleanup including failed provider-start
   discard, and `TD-W9-003` provider configuration wiring through the
   composition root. They remain separate because the first is a security
   proof, the second is a retention/failure proof, and the third is a
   composition-boundary proof; no shared user flow is merge evidence.
7. The W10 candidates are sequential after the completed `TASK-021` because
   the first two stabilize the shared authentication-state/transport surface
   and the third changes the same route's production dependency wiring:
   `TASK-022-T3-FT-001-W10` (TD-W9-001) ->
   `TASK-023-T3-FT-001-W10` (TD-W9-002) ->
   `TASK-024-T3-FT-001-W10` (TD-W9-003). All three retain the existing
   Identity & Access owner, one SvelteKit server, and one shared database.
8. `TASK-025-T3-FT-001-W11` is a preserved `done` prerequisite that owns only
   authenticated browser center creation. The stale unexecuted Telegram
   bootstrap TASK-027 and rejected unexecuted TASK-028 are retired from the
   index. Fresh TASK-029 owns AC-010 local password-credential bootstrap;
   sequential TASK-030 owns AC-011 browser password login/session. This is a
   `rebuild_required` replacement, not a repair.

The product tasks use the existing Identity & Access owner and do not write
membership state owned by Center & Scheduling. Center & Scheduling remains the
authorization resolver/orchestrator for provisioning; Identity & Access owns
the atomic account+invitation, identity, and session writes. Routes/hooks/UI
only adapt the public boundaries.

## W13 replacement boundary

Unmerged units and useful completions:

1. Identity & Access atomically creates the empty-database first Admin plus a
   normalized-email password credential from an interactive email prompt and a
   hidden password prompt; disposable CLI/database proof completes this unit
   without browser transport.
2. Identity & Access verifies the password and the SvelteKit login action issues
   the existing session/cookie with generic invalid-credentials behavior;
   disposable pre-created credential plus HTTP/SSR proof completes this unit
   without invoking the CLI.

Justified merges: none. Shared AC history, Identity & Access ownership,
credential shape, T3 tier, and end-to-end value are not merge evidence; the
units have distinct rollback/retry/proof surfaces. TASK-029 is now
T3/W13/done after done TASK-025 with independent functional PASS and required
semantic-pass; TASK-030 is now T3/W14/done after TASK-029 with independent
functional PASS and required semantic-pass.

No new module, provider, session type, cookie, service, dependency, or
registration/recovery lifecycle is introduced. Existing Telegram/Google flows
stay compatible. TASK-025 and TASK-026 remain unchanged.

The current task queue implements AC-001..AC-011. The fresh 2026-08-14
[feature semantic report](../../.tasks/FT-001/FT-001-S-RED-VERIFY-final-report-docs-01.md)
returned `semantic-pass` over the complete surface, and the explicit lifecycle
owner closed FT-001 and REQ-001 as `verified`. The
[final feature sync report](../../.tasks/FT-001/FT-001-S-MB-SYNC-final-report-docs-03.md)
is the current durable reconciliation; the 2026-08-11 aggregate remains
historical AC-001..AC-008 evidence.

## W10 debt remediation boundary

No material contract decision is introduced. The existing canonical contracts
already settle the patch shape and verification obligations:

- reuse [.memory-bank/contracts/authentication-transport.md#browser-bound-callback-state-and-bounded-retention](../../.memory-bank/contracts/authentication-transport.md#browser-bound-callback-state-and-bounded-retention)
  for TD-W9-001/002, including the five-minute TTL, browser cookie attributes,
  failed-start discard, issue/consume cleanup, and the explicit ban on a second
  store or background cleanup service;
- reuse [.memory-bank/contracts/provider-adapters.md#failure-and-ownership-rules](../../.memory-bank/contracts/provider-adapters.md#failure-and-ownership-rules)
  for TD-W9-003 and the server-only provider wiring rule;
- reuse [.memory-bank/architecture/system-architecture.md#main-architecture-units](../../.memory-bank/architecture/system-architecture.md#main-architecture-units),
  [.memory-bank/architecture/system-architecture.md#deployment](../../.memory-bank/architecture/system-architecture.md#deployment),
  [.memory-bank/contracts/boundary-map.md#provider-verification-boundary](../../.memory-bank/contracts/boundary-map.md#provider-verification-boundary),
  [.memory-bank/contracts/access-control.md#binding-and-session-rules](../../.memory-bank/contracts/access-control.md#binding-and-session-rules),
  and [.memory-bank/testing/strategy.md#evidence-and-ownership](../../.memory-bank/testing/strategy.md#evidence-and-ownership)
  as supporting ownership and proof routes. No canonical spec is created or
  extended.

The feature/requirement trace is deliberately retained as regression context;
the existing W9 owners keep the product AC claims:

| Debt | Exact AC locators | REQ locators | Task-owned technical result |
|---|---|---|---|
| TD-W9-001 | `FT-001-AC-006`, `FT-001-AC-007` | `REQ-001`, `REQ-002`, `REQ-014` | Callback accepts only the state plus matching browser-binding cookie, fails closed before provider completion/session issuance, and clears the one-use binding. |
| TD-W9-002 | `FT-001-AC-004`, `FT-001-AC-007` | `REQ-001`, `REQ-002`, `REQ-014` | Expired state records are removed during issue/consume and a provider-start failure removes the just-issued record, with no new persistence or background worker. |
| TD-W9-003 | `FT-001-AC-006`, `FT-001-AC-007` | `REQ-001`, `REQ-002`, `REQ-014` | Provider configuration and registry construction enter through platform/composition wiring; route transport receives dependencies and contains no provider secret/config reads or construction. |

Exact feature and requirement links are carried in each W10 card's
`source_artifacts`; they do not reassign AC ownership from TASK-020/TASK-021.

## W10 task boundary, ownership, and proof

The W10 cards were created as `T3` / `planned` and use the existing Identity &
Access authentication owner plus the SvelteKit application-shell transport
boundary. TASK-022, TASK-023, and TASK-024 now have current closure evidence
below.
The hard write boundaries below are literal project-relative paths; W9 cards,
protocols, and evidence remain forbidden and untouched.

| Task | Owner / expected change surface | Dependency | Hard write boundary | RED -> GREEN -> independent verify |
|---|---|---|---|---|
| `TASK-022-T3-FT-001-W10` | `src/lib/server/platform/auth-state.ts` and `src/routes/auth/`; route/auth tests. | `TASK-021-T3-FT-001-W9` | `src/lib/server/platform/`; `src/routes/auth/`; `tests/routes/`; `tests/adapters/` | RED: a valid state callback succeeds from a different/no-start browser context. GREEN: start sets the contract cookie, callback requires the matching cookie, rejects missing/mismatched/expired/replayed binding before provider/Identity & Access work, and clears it after attempt. Verify: disposable cross-browser HTTP/SSR matrix plus state/account/invitation/session before/after snapshots. |
| `TASK-023-T3-FT-001-W10` | `src/lib/server/platform/auth-state.ts` and `src/routes/auth/`; state/transport tests. | `TASK-022-T3-FT-001-W10` | `src/lib/server/platform/`; `src/routes/auth/`; `tests/routes/`; `tests/adapters/` | RED: expired entries remain in the Map and failed provider start leaves a live state entry. GREEN: issue/consume remove expired entries and provider `begin` failure discards only the issued state, preserving valid siblings. Verify: fake-clock retention probe, failed-start probe, safe rerun/cleanup, and project gates. |
| `TASK-024-T3-FT-001-W10` | `src/lib/server/platform/config.ts`, `src/lib/server/composition-root.ts`, `src/routes/auth/`; provider/route tests. | `TASK-023-T3-FT-001-W10` | `src/lib/server/platform/config.ts`; `src/lib/server/composition-root.ts`; `src/routes/auth/`; `tests/adapters/`; `tests/routes/` | RED: route transport reads provider env/config and constructs the registry. GREEN: platform/composition wiring supplies the registry, route transport is dependency-only, and missing config still returns the safe provider error without secret exposure. Verify: source/runtime boundary probe, isolated injected adapters, missing-config failure, and check/build/test. |

All W10 cards forbid changes to the accepted modular-monolith/SQLite target,
new auth persistence, event/background cleanup, provider protocol, dev-login
or role-selection bypasses, and every W9 task/history artifact. The W10 tasks
do not write membership state owned by Center & Scheduling.

## W10 TASK-022 completion evidence

`TASK-022-T3-FT-001-W10` is reconciled from the authoritative `done` card with
independent functional `PASS` and per-task T3 `semantic-pass`. Its bounded
result is browser-context binding for the existing AC-006/AC-007 transport:
opaque server-issued binding, fail-closed invalid/cross-browser/replayed
callbacks before provider or Identity & Access completion, exact valid
Telegram/Google behavior, and one-use cookie cleanup.

- [task card](../../.memory-bank/tasks/TASK-022-T3-FT-001-W10.task.json)
- [functional protocol](../../.protocols/TASK-022-T3-FT-001-W10/verification.md)
- [functional report](../../.tasks/TASK-022-T3-FT-001-W10/TASK-022-T3-FT-001-W10-S-VERIFY-final-report-docs-01.md)
- [semantic protocol](../../.protocols/TASK-022-T3-FT-001-W10/red-verification.md)
- [semantic report](../../.tasks/TASK-022-T3-FT-001-W10/TASK-022-T3-FT-001-W10-S-RED-VERIFY-final-report-docs-01.md)

Expiry pruning and failed-start discard are recorded as supporting observations
from the same verifier session only; no ownership, status, dependency, or
promotion decision for the separately planned `TASK-023-T3-FT-001-W10` is
inferred.

## W10 TASK-023 completion evidence

The authoritative [TASK-023-T3-FT-001-W10 card](../../.memory-bank/tasks/TASK-023-T3-FT-001-W10.task.json)
is `done` with independent functional `PASS` and required T3
`semantic-pass`. The current sources are the
[functional protocol](../../.protocols/TASK-023-T3-FT-001-W10/verification.md),
[functional report](../../.tasks/TASK-023-T3-FT-001-W10/TASK-023-T3-FT-001-W10-S-VERIFY-final-report-docs-01.md),
[semantic protocol](../../.protocols/TASK-023-T3-FT-001-W10/red-verification.md),
[semantic report](../../.tasks/TASK-023-T3-FT-001-W10/TASK-023-T3-FT-001-W10-S-RED-VERIFY-final-report-docs-01.md),
and [sync report](../../.tasks/TASK-023-T3-FT-001-W10/TASK-023-T3-FT-001-W10-S-MB-SYNC-final-report-docs-01.md).

The proven result is bounded retention and failed-start cleanup only: expired
records are pruned during issue/consume, a failed provider start discards only
its newly issued record, valid siblings remain usable, and product state stays
unchanged on safe failure. Honest pre-implementation GREEN remains supporting
evidence; independent functional and semantic verdicts are the closure basis.
TASK-004 and TASK-020 retain primary AC-004/AC-007 ownership, and no
feature/requirement lifecycle, dependency, promotion, architecture, or W9
history transition was made.

## W10 TASK-024 completion evidence

The authoritative [TASK-024-T3-FT-001-W10 card](../../.memory-bank/tasks/TASK-024-T3-FT-001-W10.task.json)
is `done` with independent functional `PASS` and required T3
`semantic-pass`. The current sources are the
[functional protocol](../../.protocols/TASK-024-T3-FT-001-W10/verification.md),
[functional report](../../.tasks/TASK-024-T3-FT-001-W10/TASK-024-T3-FT-001-W10-S-VERIFY-final-report-docs-01.md),
[semantic protocol](../../.protocols/TASK-024-T3-FT-001-W10/red-verification.md),
[semantic report](../../.tasks/TASK-024-T3-FT-001-W10/TASK-024-T3-FT-001-W10-S-RED-VERIFY-final-report-docs-01.md),
and [sync report](../../.tasks/TASK-024-T3-FT-001-W10/TASK-024-T3-FT-001-W10-S-MB-SYNC-final-report-docs-01.md).

The proven result is limited to the accepted composition boundary: platform
configuration and the single composition root own the provider registry, auth
transport receives injected dependencies, configured Telegram/Google starts
and safe missing-config failure remain intact, and provider secrets do not
reach client output. TASK-020 remains the primary AC-006/AC-007 proof owner;
no feature/requirement lifecycle, dependency, promotion, architecture, or W9
history transition was made.

## Verification

Every W10 card carries project-native `npm run check`, `npm run build`, and
`npm run test` gates, task-owned claim-linked RED/GREEN evidence, and a fresh
independent `/verify` path. Because all three are T3, each also requires a full
protocol and per-task `/red-verify` semantic pass; dependency evidence is not
reused as proof. No code execution is part of this planning run.

## Revision 2 reconciliation

Global Backbone `complete`, Planning Revision `2`; FT-001 now composes the two
new subject contracts and the W9 task set. Existing task identities, lifecycle,
evidence, dependencies, and retry history remain unchanged. Fresh task-plan
review remains required for the current global revision.

## 2026-08-11 — TASK-019 task-level completion reconciliation

The authoritative `TASK-019-T3-FT-001-W9` record is `done` with independent
functional `PASS` and T3 `semantic-pass` evidence. Its proven boundary is
limited to server-only Telegram/Google provider normalization, server-owned
opaque session issuance/revocation and cookie-option primitives, and atomic
exact-account invitation acceptance/rejection. The current sources are the
[functional protocol](../../.protocols/TASK-019-T3-FT-001-W9/verification.md),
[functional report](../../.tasks/TASK-019-T3-FT-001-W9/TASK-019-T3-FT-001-W9-S-VERIFY-final-report-docs-01.md),
[semantic protocol](../../.protocols/TASK-019-T3-FT-001-W9/red-verification.md),
and [semantic report](../../.tasks/TASK-019-T3-FT-001-W9/TASK-019-T3-FT-001-W9-S-RED-VERIFY-final-report-docs-01.md).

Attempt 1's functional failure, Attempt 2 correction, and `1/2` retry-budget
history remain preserved in the task-local artifacts. `TASK-020` and `TASK-021`
were separate owners at that boundary; this reconciliation did not promote
dependent tasks or change the accepted architecture, feature/requirement
lifecycle, or task identity/status.

## 2026-08-11 — TASK-020 task-level completion reconciliation

The authoritative [TASK-020-T3-FT-001-W9 card](../../.memory-bank/tasks/TASK-020-T3-FT-001-W9.task.json)
is `done` with independent functional `PASS` and T3 `semantic-pass` evidence.
The current sources are the
[functional protocol](../../.protocols/TASK-020-T3-FT-001-W9/verification.md),
[functional report](../../.tasks/TASK-020-T3-FT-001-W9/TASK-020-T3-FT-001-W9-S-VERIFY-final-report-docs-01.md),
[semantic protocol](../../.protocols/TASK-020-T3-FT-001-W9/red-verification.md),
[semantic report](../../.tasks/TASK-020-T3-FT-001-W9/TASK-020-T3-FT-001-W9-S-RED-VERIFY-final-report-docs-01.md),
and [sync report](../../.tasks/TASK-020-T3-FT-001-W9/TASK-020-T3-FT-001-W9-S-MB-SYNC-final-report-docs-01.md).

The proven boundary is limited to browser/API login, logout, and invitation
acceptance: exact Telegram/Google actor resolution, the existing
`foundation_session` cookie contract, revoked-session denial, server-bound
callback state, one-use exact-account acceptance, and safe non-consuming
rejection/rollback behavior. Thin route ownership and the absence of
client-trusted authorization context are also confirmed by the current
semantic evidence.

Attempt 1's missing-transport RED and failed focused gate remain preserved;
Attempt 2 contains the bounded invitation-state continuity correction. The
retry budget remains `1/2` used with `1` retry remaining. TASK-019 remains
`done`, TASK-021 remains `planned`, and FT-001 remains `status: draft` /
`lifecycle: planned`; no dependent promotion or product/requirement lifecycle
transition is implied.

## 2026-08-11 — TASK-021 task-level completion reconciliation

The authoritative [TASK-021-T3-FT-001-W9 card](../../.memory-bank/tasks/TASK-021-T3-FT-001-W9.task.json)
is `done` with independent functional `PASS` and T3 `semantic-pass` evidence.
The current sources are the
[functional protocol](../../.protocols/TASK-021-T3-FT-001-W9/verification.md),
[functional report](../../.tasks/TASK-021-T3-FT-001-W9/TASK-021-T3-FT-001-W9-S-VERIFY-final-report-docs-01.md),
[semantic protocol](../../.protocols/TASK-021-T3-FT-001-W9/red-verification.md),
[semantic report](../../.tasks/TASK-021-T3-FT-001-W9/TASK-021-T3-FT-001-W9-S-RED-VERIFY-final-report-docs-01.md),
and [sync report](../../.tasks/TASK-021-T3-FT-001-W9/TASK-021-T3-FT-001-W9-S-MB-SYNC-final-report-docs-01.md).

The proven boundary is limited to FT-001-AC-008: protected Admin
SSR/form/JSON API provisioning for an authenticated own-center Admin;
server-side rejection of unauthenticated, non-Admin, and wrong-center requests
before mutation; server-generated participant/invitation values; use of the
existing Center & Scheduling `createParticipant` boundary; and atomic
account+membership+invitation state with TASK-020 invitation handoff.

Executor Attempt 1 RED/focused failure, Attempt 2 bounded fixture/rollback
correction, and Attempt 3 route/type/framework-gate correction remain intact;
executor retry budget is `2/2` used. `TASK-019` and `TASK-020` remain `done`.
FT-001 remains `status: draft` / `lifecycle: planned`; no feature, requirement,
architecture, dependency, or promotion transition is implied.

## Feature-Level Semantic Coverage Index — 2026-08-11

Fresh `/red-verify --feature FT-001` returned `semantic-pass`. The current
claim-to-task routing is:

| Claims | Primary task | Current evidence |
|---|---|---|
| AC-001, AC-002, AC-004 | TASK-004-T3-FT-001-W3 | functional `PASS`; T3 `semantic-pass` |
| AC-003, AC-005 | TASK-015-T3-FT-001-W2 | functional `PASS`; T3 `semantic-pass` |
| AC-006, AC-007 | TASK-020-T3-FT-001-W9 | functional `PASS`; T3 `semantic-pass` |
| AC-008 | TASK-021-T3-FT-001-W9 | functional `PASS`; T3 `semantic-pass` |
| Provider/session/invitation primitives supporting the above boundaries | TASK-019-T3-FT-001-W9 | functional `PASS`; T3 `semantic-pass` |

The [feature semantic report](../../.tasks/FT-001/FT-001-S-RED-VERIFY-final-report-docs-01.md)
is the aggregate proof index. `TASK-003-T3-FT-001-W2` remains failed
historical context only; its evidence and all task histories are preserved and
not reused as current proof. No task card, retry budget, status, dependency,
architecture, feature/requirement lifecycle, or promotion field is changed by
this feature-level sync.
W10 supporting ownership is recorded by TASK-022 (AC-006/007 browser binding),
TASK-023 (AC-004/007 bounded retention/failure), and TASK-024 (AC-006/007
composition/platform wiring). The current durable reconciliation is the
[feature MB-SYNC report](../../.tasks/FT-001/FT-001-S-MB-SYNC-final-report-docs-02.md).

## W17 public home login entry

The accepted boundary is one ordinary visible `Вход` anchor from public `/` to
existing `/login`, with no session/auth/provider behavior. `TASK-033-T1-FT-001-W17`
is its single implementation/proof unit after done TASK-030; calendar fixture
replacement and every FT-003 data-backed calendar decision are excluded. The
task is now `done` with independent functional `PASS` and Reviewer `PASS`.
FT-001, REQ-001, and EP-001 remain `planned` because remaining UI/product
outcomes are outside AC-012.

- [TASK-033 card](../../.memory-bank/tasks/TASK-033-T1-FT-001-W17.task.json)
- [independent verification](../../.tasks/TASK-033-T1-FT-001-W17/TASK-033-T1-FT-001-W17-S-VERIFY-final-report-docs-01.md)
- [task-level sync](../../.tasks/TASK-033-T1-FT-001-W17/TASK-033-T1-FT-001-W17-S-MB-SYNC-final-report-docs-01.md)
