---
description: Bounded task-planning resume state for FT-004.
status: active
---
# FT-004 Task Planning Plan

## Outcome and bounded scope

Deliver account-owned field comments, five reactions, arbitrary-depth
discussion branches, bounded recent tabs, retained hidden messages, and
shared/personal visibility inside the server-resolved center/class/student
scope. The current planning repair covers only the controlled T3 rebuild after
the TASK-012 Attempt 2 tier finding; it does not execute implementation or
verification and does not change product lifecycle state.

Non-goals are event-bus infrastructure, a second Collaboration writer,
deletion of retained rows, a reply-depth cap, direct neighbor-slice writes, or
any change to the accepted modular-monolith graph and shared-database target.

## Readiness, canonical inputs, and ownership

- Feature: [.memory-bank/features/FT-004-day-collaboration.md](../../.memory-bank/features/FT-004-day-collaboration.md)
- Global readiness: [.memory-bank/spec-backbone.md](../../.memory-bank/spec-backbone.md), `Global Backbone Status: complete`, `Planning Revision: 1`.
- Registry: [.memory-bank/spec-index.md](../../.memory-bank/spec-index.md); no new canonical concern is required.
- Foundation prerequisite: `TASK-002-T3-FT-000-W1` is the completed final gate, reached transitively through the existing FT-004 dependency chain.
- Primary owner: Collaboration at `src/lib/server/modules/collaboration/`.
- Expected affected persistence surface: `src/lib/server/platform/database.ts`.
- Public provider contract: [Day Discussion Query Boundary](../../.memory-bank/contracts/boundary-map.md#day-discussion-query-boundary).
- Consumed boundaries: [Actor Context Boundary](../../.memory-bank/contracts/boundary-map.md#actor-context-boundary) and [Calendar and Membership Query Boundary](../../.memory-bank/contracts/boundary-map.md#calendar-and-membership-query-boundary).
- Direct behavior/spec basis: [Access Control — Authority and scope](../../.memory-bank/contracts/access-control.md#authority-and-scope), [Access Control — Data minimization and failure behavior](../../.memory-bank/contracts/access-control.md#data-minimization-and-failure-behavior), [Core Domain — Domain relationships](../../.memory-bank/domains/core-domain.md#domain-relationships), [Core Domain — Persistence and transaction rules](../../.memory-bank/domains/core-domain.md#persistence-and-transaction-rules), and [Lifecycle — Collaboration](../../.memory-bank/states/lifecycle-map.md#collaboration).

The accepted graph remains `Collaboration -> Identity & Access` through Actor
Context and `Collaboration -> Center & Scheduling` through Calendar and
Membership Query. Collaboration remains the sole writer for comments,
reactions, messages, replies, and branch/tab projection; Lesson Context remains
a scoped read consumer. No architecture/spec identity or Planning Revision is
changed.

## Controlled re-tier rebuild and preserved history

Queue action: `rebuild_required`. Attempt 2 changed protected cross-center
reads, target checks, ownership-sensitive mutations, and uniqueness boundaries
after supported class identity reuse. The tier policy therefore requires fresh
T3 ownership for the security-sensitive correction.

`TASK-012-T2-FT-004-W6` remains exactly `T2`, `W6`, `in_progress`, with its
dependencies, identity, task-owned AC-003/AC-004 basis, and all Attempt 1/2
evidence preserved. Its functional GREEN and the feature-level
`semantic-fail` are supporting rebuild inputs only; neither is fresh T3 proof
and neither is used as a replacement dependency.

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

`TASK-014-T3-FT-003-W8` depends on both replacement cards and retains its
authoritative `blocked` status. The planning-time routing was the approved
`/review-tasks-plan FT-004` at `Planning Revision: 1`, followed by the
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
