---
description: Bounded task-planning resume state for FT-004.
status: active
---
# FT-004 Task Planning Plan

## Outcome and bounded scope

Deliver account-owned field comments, five reactions, arbitrary-depth
discussion branches, bounded recent tabs, retained hidden messages, and
shared/personal visibility inside the server-resolved center/class/student
scope, with the complete Collaboration surface available through the existing
browser Lesson Context UI. The current planning reconciliation adds only the
missing browser projection, server-authorized form transport, UI controls, and
disposable Playwright proof; it does not execute implementation or
verification.

Non-goals are event-bus infrastructure, a second Collaboration writer,
deletion of retained rows, a reply-depth cap, direct neighbor-slice writes, or
any change to the accepted modular-monolith graph and shared-database target.

## Readiness, canonical inputs, and ownership

- Feature: [.memory-bank/features/FT-004-day-collaboration.md](../../.memory-bank/features/FT-004-day-collaboration.md)
- Global readiness: [.memory-bank/spec-backbone.md](../../.memory-bank/spec-backbone.md), `Global Backbone Status: complete`, `Planning Revision: 2`.
- Registry: [.memory-bank/spec-index.md](../../.memory-bank/spec-index.md). The
  browser projection and mutation transport are recorded in the new subject
  contract [Collaboration Browser Surface](../../.memory-bank/contracts/collaboration-browser-surface.md).
- Foundation prerequisite: `TASK-002-T3-FT-000-W1` is the completed final gate, reached transitively through the existing FT-004 dependency chain.
- Semantic owner: Collaboration at `src/lib/server/modules/collaboration/`;
  Lesson Context owns only the scoped composition and browser adapter.
- Existing Collaboration persistence and public boundary are reused; no new
  SQLite schema or second backend writer is planned.
- Public provider contract: [Day Discussion Query Boundary](../../.memory-bank/contracts/boundary-map.md#day-discussion-query-boundary).
- Consumed boundaries: [Actor Context Boundary](../../.memory-bank/contracts/boundary-map.md#actor-context-boundary) and [Calendar and Membership Query Boundary](../../.memory-bank/contracts/boundary-map.md#calendar-and-membership-query-boundary).
- Direct behavior/spec basis: [Access Control — Authority and scope](../../.memory-bank/contracts/access-control.md#authority-and-scope), [Access Control — Data minimization and failure behavior](../../.memory-bank/contracts/access-control.md#data-minimization-and-failure-behavior), [Core Domain — Domain relationships](../../.memory-bank/domains/core-domain.md#domain-relationships), [Core Domain — Persistence and transaction rules](../../.memory-bank/domains/core-domain.md#persistence-and-transaction-rules), and [Lifecycle — Collaboration](../../.memory-bank/states/lifecycle-map.md#collaboration).

The accepted graph remains `Collaboration -> Identity & Access` through Actor
Context and `Collaboration -> Center & Scheduling` through Calendar and
Membership Query. Collaboration remains the sole writer for comments,
reactions, messages, replies, and branch/tab projection; Lesson Context remains
a scoped read consumer. No architecture/spec identity or Planning Revision is
changed.

## Browser surface reconciliation — 2026-09-03

The operator decision is authoritative: FT-004 is implemented only when the
planned Collaboration behavior is usable through the browser UI. Existing
`TASK-011`, `TASK-016`, and `TASK-017` done cards and their reports prove
backend boundary, persistence, and isolation outcomes only; their identity,
lifecycle, dependencies, and accumulated evidence are preserved and are not
reclassified as browser proof. `TASK-012` remains the historical failed/
superseded under-tiered card and is not a dependency.

The browser audit found that `/lesson-context` currently exposes neither the
Collaboration content nor its mutations: it shows only a personal message
count, has no field-comment/reaction/day-chat/branch controls, and
`/api/lesson-context` is GET-only. The accepted minimal route is therefore the
existing `/lesson-context` composition plus its SvelteKit form actions; no new
top-level route, mutation API, frontend state layer, Collaboration store, or
database abstraction is introduced.

The unmerged outcomes were reconciled into two execution-cohesive candidates:

1. **Server-composed browser projection and authorized transport** — extend the
   existing Lesson Context projection and route actions to expose shared and
   personal Collaboration data and delegate all mutations through the existing
   Collaboration public boundary. Server session, role, center/class/lesson/
   student scope, target ownership, and membership/assignment state remain the
   authority; client role, center, author, and scope fields are never trusted.
2. **Complete Lesson Context Collaboration UI and browser proof** — render
   field comments, own edit controls, author/time, five reactions and reactor
   participants, common feed, arbitrary-depth replies, branch tabs, shared and
   personal discussions, and the role/privacy matrix. Prove persistence after
   reload and hidden-branch reactivation with a disposable SQLite database and
   the project-owned runner, including cleanup on failure.

The candidates are sequential: the UI cannot be verified against a stable
projection/action contract before candidate 1, while the transport is
independently reviewable without merging the independently testable visual
surface. Both are T3 because they cross protected browser mutations and
privacy/authority boundaries. Tentative waves are W35 and W36 after the
existing W6 isolation cards and the accepted shared Lesson Context navigation
outcome `TASK-039-T3-FT-003-W10`; IDs were assigned after this boundary
confirmation.

## Current executable queue

| Wave | Task | Owns | Dependencies |
|---|---|---|---|
| W35 | [TASK-102-T3-FT-004-W35](../../.memory-bank/tasks/TASK-102-T3-FT-004-W35.task.json) | Server-composed shared/personal Collaboration projection, Identity & Access `getParticipantLabels`, and five named, server-authorized `/lesson-context` form actions; owns server-side AC-005/REQ-014 transport proof | `TASK-016-T3-FT-004-W6`, `TASK-017-T3-FT-004-W6`, `TASK-039-T3-FT-003-W10` |
| W36 | [TASK-103-T3-FT-004-W36](../../.memory-bank/tasks/TASK-103-T3-FT-004-W36.task.json) | Complete Lesson Context Collaboration UI and shared/personal disposable Playwright proof; owns browser-visible AC-001..AC-005 and UI-side AC-005 privacy proof | `TASK-102-T3-FT-004-W35` |

Both cards are new `planned` IDs. `TASK-016`, `TASK-017`, and `TASK-039` are
completed dependencies; `TASK-012` is intentionally excluded. The first card
must finish before the second starts. No production-only acceptance card is
needed because the required browser surface and disposable verification are
repository/runtime outcomes.

## Bounded shared-contract reconciliation — 2026-09-03

The accepted KISS decision extends the existing `Collaboration -> Identity &
Access` Actor Context Boundary with one named read-only
`getParticipantLabels` projection. Identity & Access owns `fullName`; the
resource-owning Collaboration boundary first resolves the current discussion
scope and selects author/reactor IDs; Lesson Context only composes the returned
labels. The projection returns `{accountId, fullName}` and grants no authority.

Impact is `bounded`: the accepted module graph, existing edge, Architecture
Spine, Foundation path, and Planning Revision `2` remain unchanged. The
affected canonical consumers are `boundary-map.md`, `access-control.md`, and
`collaboration-browser-surface.md`; only FT-004 required the bounded planning
reconciliation. Existing task statuses, completed evidence, and protocols
remain preserved. The mechanical review corrections
are incorporated in TASK-102/TASK-103 and require a fresh
`/review-tasks-plan FT-004`.

## Controlled re-tier rebuild and preserved history

Queue action: `rebuild_required`. Attempt 2 changed protected cross-center
reads, target checks, ownership-sensitive mutations, and uniqueness boundaries
after supported class identity reuse. The tier policy therefore requires fresh
T3 ownership for the security-sensitive correction.

At the rebuild boundary, `TASK-012-T2-FT-004-W6` remained exactly `T2`, `W6`,
`in_progress`, with its dependencies, identity, task-owned AC-003/AC-004
basis, and all Attempt 1/2 evidence preserved. Its functional GREEN and the
feature-level `semantic-fail` were supporting rebuild inputs only; neither was
fresh T3 proof nor a replacement dependency. The current lifecycle decision is
recorded separately as historical `failed`/`superseded`.

The rebuild has two independently completable and verifiable sibling outcomes:
comment/reaction center-lifecycle isolation and threaded-discussion
center-lifecycle isolation. Shared ownership, database, or test root is not
merge evidence, so no merge is justified. Canonical execution remains
sequential.

## Exact claim ownership and task handoff

| Task | Fresh task-owned claims | REQs | Dependency | Advisory scope | Functional and semantic paths |
|---|---|---|---|---|---|
| `TASK-016-T3-FT-004-W6` | `FT-004-AC-001`, `FT-004-AC-002`, `FT-004-AC-005`: attributable one-per-account field comments; five reactions/reactor visibility; shared/personal and cross-center comment/reaction privacy | `REQ-006`, `REQ-007`, `REQ-014` | `TASK-011-T3-FT-004-W5` (`done`); Foundation is transitive | `src/lib/server/modules/collaboration/`, `src/lib/server/platform/database.ts`, `tests/collaboration/` | Fresh `/verify`: `.protocols/TASK-016-T3-FT-004-W6/verification.md`, artifacts under `.tasks/TASK-016-T3-FT-004-W6/`. Fresh `/red-verify`: `.protocols/TASK-016-T3-FT-004-W6/red-verification.md`, artifacts under `.tasks/TASK-016-T3-FT-004-W6/`. |
| `TASK-017-T3-FT-004-W6` | `FT-004-AC-003`, `FT-004-AC-004`, plus the T3 harm claim `REQ-014` / access-control authority: arbitrary-depth/common-feed behavior; first-reply branch activation; ten-tab ordering, retention, reactivation; threaded cross-center denial without existence leakage | `REQ-006`, `REQ-008`, `REQ-014` | `TASK-011-T3-FT-004-W5` (`done`); Foundation is transitive | `src/lib/server/modules/collaboration/`, `src/lib/server/platform/database.ts`, `tests/collaboration/` | Fresh `/verify`: `.protocols/TASK-017-T3-FT-004-W6/verification.md`, artifacts under `.tasks/TASK-017-T3-FT-004-W6/`. Fresh `/red-verify`: `.protocols/TASK-017-T3-FT-004-W6/red-verification.md`, artifacts under `.tasks/TASK-017-T3-FT-004-W6/`. |

Each row owns only its exact AC/REQ outcome and current implementation delta;
dependency proof, historical TASK-012 proof, and TASK-011 evidence are not
inherited. At the planning boundary the two replacement cards were indexed
once as `planned`; at the current W6 boundary both authoritative cards are
`done` with independent functional `PASS` and T3 `semantic-pass` evidence.
Their IDs, T3 tier, W6 wave, direct canonical links, forbidden scope, stop
conditions, RED/GREEN evidence contracts, and advisory change surface remain
unchanged.

## Gates, acceptance, and downstream routing

Each replacement card carries the native gates `npm run check`, `npm run
build`, and `npm run test`, plus isolated disposable-state, safe-rerun,
state-before/state-after, and cleanup proof for its claim-linked T3 paths. The
functional path must prove the row's exact claims; the semantic path must
independently challenge the row's security-sensitive harm surface. No evidence
is created by this planning repair.

`TASK-014-T3-FT-003-W8` depends on both replacement cards and its current
authoritative status is `done`. The planning-time routing was the approved
`/review-tasks-plan FT-004` at `Planning Revision: 1`; the current fresh review
must use `Planning Revision: 2`, followed by the
applicable readiness gate and sequential execution/verification of the two
replacement IDs. This plan does not apply dependent unblock, closure,
promotion, or a feature-level semantic verdict.

## Governing constraints

- KISS: retain the accepted Collaboration ownership and graph; introduce only
  the minimum fresh T3 task boundaries required by the evidenced tier change.
- Privacy and access: every protected read, target check, and mutation combines
  the authenticated actor with server-resolved center/class/student scope.
- Persistence: retained prior-center rows remain unchanged; hidden branches are
  retained and tabs remain a projection.
- Evidence before done: each T3 task requires independent claim-linked
  functional verification and `SEMANTIC_VERDICT: semantic-pass`; lifecycle
  ownership remains outside this planning repair.
- No hard `runtime_context.write_boundary` is added; `touched_files` remain
  advisory, while each card's `forbidden_scope` and stop conditions remain hard.

## Revision 2 reconciliation

The accepted Learning Progress provider decision did not alter Collaboration
ownership or the controlled T3 split. At that Planning Revision 2 planning
boundary, TASK-011, TASK-012, TASK-016, and TASK-017 were preserved with their
identity, lifecycle, evidence, dependencies, and retry history; the downstream
TASK-014 dependency reconciliation is recorded in FT-003. The later explicit
TASK-012 historical `failed`/`superseded` disposition is recorded below.

## Current lifecycle reconciliation

The historical feature result is `semantic-pass` only for the backend
boundary/persistence scope proved by TASK-016 and TASK-017. The operator's
browser-completion decision makes that evidence insufficient for feature
closure: FT-004 is currently `active`/`planned` pending the two new browser
tasks and their independent functional and semantic evidence for AC-001..AC-005.
TASK-012 remains explicitly terminal `failed`/`superseded`; its identity, tier,
dependencies, Attempt 1/2 evidence, and retry history are preserved. No
architecture, Planning Revision, REQ/epic lifecycle, old task status, or old
evidence is changed by this reconciliation.
