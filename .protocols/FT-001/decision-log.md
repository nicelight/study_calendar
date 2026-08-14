---
description: Durable decisions for FT-001 task planning.
status: active
---
# FT-001 Decision Log

## 2026-08-14 — Final FT-001 verification closure

Fresh `/red-verify --feature FT-001` returned `semantic-pass` across
AC-001..AC-011, and the explicit top-level lifecycle owner set FT-001 and
REQ-001 to `verified`. TASK-029/TASK-030 remain `done`; all task evidence,
dependencies, historical TASK-003 failure, architecture, Planning Revision,
and queue state remain unchanged. The current durable route is the fresh
feature semantic report plus `FT-001-S-MB-SYNC-final-report-docs-03.md`.

## 2026-08-13 — W14 task completion before aggregate feature gate

At that boundary TASK-030 was durably `done` with functional `PASS` and per-task T3
`semantic-pass`; together with the preserved AC-001..AC-010 task evidence, all
current FT-001 task-owned outcomes were implemented. The feature remained
`implemented`, not `verified`, because the then-current aggregate report
covered only AC-001..AC-008. No task promotion, architecture decision, or
Planning Revision change was introduced by that boundary.

## 2026-08-13 — Rebuild unexecuted first-Admin bootstrap as email/password

The operator explicitly replaced the unexecuted Telegram Bot API bootstrap with
a KISS local email/password path: an interactive email prompt plus a hidden
password prompt create the empty-database first Admin and normalized unique
credential atomically; Node built-in
`scrypt`, random salt, and `timingSafeEqual` protect password handling; browser
login reuses the existing session/cookie and generic invalid credentials.
Self-registration, reset/recovery, email verification, MFA, password history,
and a new dependency are excluded. Existing Telegram/Google flows are retained.

This changes TASK-027 identity/material scope. The feature-to-tasks hard
invariant requires `rebuild_required`; therefore the stale, never-executed,
never-reviewed TASK-027 is removed from the indexed task model rather than
silently repaired. The first replacement TASK-028 was also retired unexecuted
after formal review found two independently completable units. Fresh TASK-029
owns AC-010 CLI/account+credential atomicity, and sequential TASK-030 owns
AC-011 browser password verification/session transport. TASK-025 and TASK-026
remain `done` and unchanged; Planning Revision remains 2 because this extends
the accepted Identity & Access leaf/data/transport contract without changing
the global module graph or architecture ownership.

## 2026-08-08 — Task queue created

Accepted architecture and feature ACs fully settle provider ownership, authorization, atomicity, and task boundaries. Reused existing canonical contracts; no new feature spec or behavior example is required. Planning Revision remains `1`.

## 2026-08-08 — Bounded repair

Moved `FT-001-AC-001` to `TASK-004-T3-FT-001-W3`, making the complete provider-binding flow a single Identity & Access owner after provisioning. No canonical spec or architecture changed; tasks remain `planned` and Planning Revision remains `1`.

## 2026-08-08 — Bounded follow-up repair after TASK-003 failure

The current semantic-fail evidence proved that public `createAccount` and
`issueInvitation` remained write bypasses beside `provisionAccount`. The
accepted architecture is unchanged. Extended the existing Account Provisioning
Boundary and Access Control Contract with one authoritative provisioning
command, Center & Scheduling actor/own-center Admin authorization before the
Identity & Access write, caller-scope prohibition, account+invitation
atomicity, and the focused adversarial proof matrix.

Created `TASK-015-T3-FT-001-W2` as the fresh T3 follow-up; it depends directly on
the completed Foundation gate and does not reuse `TASK-003` evidence or
lifecycle. Updated blocked `TASK-004` to depend on the repaired follow-up.
Because that dependency changed on an existing task, the queue action is
`rebuild_required` under the feature-to-tasks reconciliation contract. Planning
Revision remains `1`.

## 2026-08-10 — Planning Revision 2 reconciliation

The accepted Learning Progress lesson-scoped grade decision does not affect
FT-001's Identity & Access boundary or task outcomes. TASK-003, TASK-004, and
TASK-015 remain untouched; their identity, lifecycle, dependencies, evidence,
and retry history are preserved. Current plan readiness is Revision 2 and fresh
task-plan review remains required.

## 2026-08-11 — W9 browser/API completion scope

The missing product-visible path is accepted as three execution-cohesive W9
outcomes: a server-only Telegram/Google provider adapter plus Identity & Access
session commands; SvelteKit login/logout and invitation callback transport; and
a protected Admin participant form that calls the existing Center & Scheduling
provisioning path. The feature now adds AC-006..AC-008 for these browser/API
outcomes while preserving AC-001..AC-005 as the underlying binding and
authorization claims.

Provider choice is settled without a material blocker: the product already
authorizes Telegram Login and Google OAuth, so W9 uses one normalized adapter
contract and the standard provider protocols. No provider SDK is selected as a
product decision; implementation may use native server HTTP/crypto or a small
compatible dependency. Real local browser smoke requires configured provider
credentials; isolated tests may inject a provider double, but no dev-login or
role-selection bypass is authorized.

The Admin UI minimum path provisions teacher/student/parent participant
accounts through the existing `createParticipant` boundary. Multi-Admin
bootstrap is not needed for the first local use path and is not added as a new
product branch. Planning Revision remains `2`; existing TASK-003, TASK-004,
TASK-015, Foundation tasks, statuses, evidence, and retry history remain
unchanged.

## 2026-08-11 — TASK-019 proven provider/session boundary

The owner-provided closure state for `TASK-019-T3-FT-001-W9` is reconciled as
`done` with functional `PASS` and T3 `semantic-pass`. Existing evidence proves
only the server-only provider/session/invitation primitives: normalized
server-verified Telegram/Google subjects without adapter persistence or secret
exposure; explicit provider/state failure; server-owned opaque sessions with
revocation and exact HTTPS/local-HTTP cookie options; and atomic exact-account
invitation acceptance with one-use and safe failure behavior.

This is an evidence-routing entry, not a new product or architecture decision.
The initial functional `FAIL`, Attempt 2 correction, and `1/2` retry history
remain preserved. At that boundary `TASK-020` and `TASK-021` were still
`planned`; no dependent promotion or lifecycle transition was implied by the
TASK-019 reconciliation.

## 2026-08-11 — TASK-020 proven browser/API transport boundary

The owner-provided closure state for `TASK-020-T3-FT-001-W9` is reconciled as
`done` with functional `PASS` and T3 `semantic-pass`. Existing evidence proves
only the task-owned browser/API surface: Telegram/Google login resolves the
exact bound actor; `foundation_session` retains the exact HTTPS/local-HTTP
cookie conditions; logout and revocation deny access; and server-issued state
keeps invitation acceptance bound through callback for valid one-use
exact-account acceptance and safe non-consuming rejection/rollback paths.

This is an evidence-routing entry, not a new product or architecture decision.
Attempt 1's missing-transport RED and failed focused gate, Attempt 2's bounded
invitation-state continuity correction, and the `1/2` retry budget with `1`
retry remaining remain preserved. `TASK-019` remains `done`, `TASK-021` remains
`planned`, and FT-001/REQ lifecycle values are unchanged.

## 2026-08-11 — TASK-021 proven protected Admin UI/provisioning boundary

The owner-provided closure state for
`TASK-021-T3-FT-001-W9` is reconciled as `done` with functional `PASS` and T3
`semantic-pass`. Existing evidence proves only FT-001-AC-008: protected Admin
SSR/form/JSON API provisioning for an authenticated own-center Admin; generic
server-side denial before mutation for unauthenticated, non-Admin, and
wrong-center requests; ignored client scope fields; server-generated
participant/invitation values; and the existing Center & Scheduling
`createParticipant` ownership path with no direct persistence or alternate
provisioning write.

The returned one-time invitation reaches TASK-020's accepted provider path,
and account+membership+invitation state is atomic, including unchanged state on
induced failure. This is an evidence-routing entry, not a new product or
architecture decision. Executor Attempt 1/2/3 history and the `2/2` retry
budget remain preserved; `TASK-019` and `TASK-020` remain `done`, while FT-001
and its requirements retain their existing lifecycle values.

## 2026-08-11 — Feature-level semantic coverage reconciliation

The fresh standalone FT-001 semantic pass returned `semantic-pass` for
AC-001..AC-008. The existing task evidence is routed as follows: TASK-004 is
the primary owner for AC-001/002/004; TASK-015 for AC-003/005; TASK-020 for
AC-006/007; and TASK-021 for AC-008. TASK-019 is retained as bounded supporting
provider/session/invitation integration coverage, not promoted to sole AC
ownership.

This entry records evidence routing only. Historical failed TASK-003 evidence,
all task-local execution/verification/retry histories, task identities/statuses,
feature and requirement lifecycle, accepted architecture, and promotion fields
remain unchanged. No new product, design, task-boundary, or lifecycle decision
is created by this reconciliation.

## 2026-08-11 — W10 bounded technical-debt tasking

The W9 advisory report identifies three independently completable patches:
`TD-W9-001` browser-context callback binding, `TD-W9-002` bounded expired-state
cleanup plus failed-start discard, and `TD-W9-003` provider configuration wiring
through platform/composition ownership. The accepted authentication transport,
provider-adapter, boundary-map, and system-architecture contracts already
settle their shape; no material contract decision or clarification is opened.

Created the sequential T3 W10 cards `TASK-022-T3-FT-001-W10`,
`TASK-023-T3-FT-001-W10`, and `TASK-024-T3-FT-001-W10` after completed
`TASK-021-T3-FT-001-W9`. Their hard boundaries exclude every W9 task/history
artifact and forbid architecture expansion, second persistence, background
cleanup, provider-protocol changes, and direct membership writes. W9 task
identity, status, evidence, dependencies, and retry history remain unchanged;
Planning Revision remains `2`.

## 2026-08-11 — TASK-022 proven browser-context binding

The owner-provided closure state for `TASK-022-T3-FT-001-W10` is reconciled as
`done` with functional `PASS` and required T3 `semantic-pass`. Existing
evidence proves the bounded AC-006/AC-007 transport hardening: a matching
opaque browser-binding cookie is required; missing, mismatched, expired,
cross-browser, and replayed callbacks fail before provider or Identity & Access
completion; valid Telegram/Google callbacks preserve exact actor/invitation/
session behavior; and the one-use binding is cleaned up.

This is an evidence-routing entry, not a new product, design, or lifecycle
decision. The Attempt 1 RED, Attempt 2 correction, verifier gate failure,
Attempt 3 fixture correction, and all retry receipts remain preserved. The
verifier also observed expiry pruning and failed-start discard, but those are
supporting observations only; `TASK-023` remains separately planned and its
ownership/dependency/status are unchanged. `TASK-021` and all W9 records remain
unchanged; FT-001 and REQ lifecycle values remain unchanged.

## 2026-08-11 — TASK-023 proven bounded auth-state retention

The owner-provided closure state for `TASK-023-T3-FT-001-W10` is reconciled as
`done` with functional `PASS` and required T3 `semantic-pass`. Existing
independent evidence proves only the bounded process-local auth-state result:
issue/consume prune expired records, failed provider start discards only its
newly issued record, valid sibling states remain usable, and the safe failure
leaves account/identity/invitation/session state unchanged. No worker, second
persistence store, capacity policy, or unrelated lifecycle was introduced.

This is an evidence-routing entry, not a new product, design, or lifecycle
decision. The honest pre-implementation GREEN is preserved as supporting
evidence; independent functional and semantic verdicts are the closure basis.
TASK-022 and every W9 task/protocol/evidence record remain unchanged, TASK-024
remains `planned`, and FT-001/REQ lifecycle values, ownership, dependencies,
architecture, and promotion state remain unchanged.

## 2026-08-11 — TASK-024 proven composition wiring

The owner-provided closure state for `TASK-024-T3-FT-001-W10` is reconciled as
`done` with functional `PASS` and required T3 `semantic-pass`. Existing
independent evidence proves only the accepted composition boundary: platform
configuration and the single composition root own the provider registry, auth
transport consumes injected dependencies, configured Telegram/Google starts and
safe missing-config failure remain intact, and provider secrets do not reach
client output.

This is an evidence-routing entry, not a new product, design, or lifecycle
decision. The executor RED/GREEN receipts, fresh functional gates, semantic
review, and all task-local evidence remain preserved. TASK-022, TASK-023, and
every W9 task/protocol/evidence record retain their identities, ownership,
dependencies, statuses, and history; FT-001/REQ lifecycle, accepted
architecture, and promotion state remain unchanged. TASK-020 remains the
primary AC-006/AC-007 proof owner; TASK-024 supplies composition-wiring
support only.

## 2026-08-11 — Feature-level W10 MB-SYNC after semantic pass

The fresh feature-level `/red-verify --feature FT-001` returned
`semantic-pass` for AC-001..AC-008. Feature-level reconciliation records
TASK-022 as supporting AC-006/AC-007 browser-binding evidence, TASK-023 as
supporting AC-004/AC-007 bounded retention/failure evidence, and TASK-024 as
supporting AC-006/AC-007 composition/platform evidence. Primary ownership stays
with TASK-004, TASK-015, TASK-020, and TASK-021; TASK-019 remains bounded
supporting integration evidence.

This entry is evidence routing only. TASK-003 remains the indexed `failed`
historical attempt; all task statuses, identities, dependencies, retry history,
FT-001 `status: draft` / `lifecycle: planned`, REQ lifecycles, architecture, and
promotion fields remain unchanged. The durable feature report is
`../../.tasks/FT-001/FT-001-S-MB-SYNC-final-report-docs-02.md`.
