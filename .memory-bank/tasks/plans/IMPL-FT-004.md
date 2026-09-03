---
description: Implementation plan for FT-004 day collaboration.
status: active
---
# IMPL-FT-004 — Day Collaboration

## Goal

Make the existing Collaboration backend behavior usable through the browser
`/lesson-context` UI, with reproducible protected mutation and privacy proof.

## Scope / non-goals

Include one editable comment per account/field, five reactions with reactor
visibility, arbitrary reply depth, common feed, ten active branch tabs with
retention/reactivation, shared/personal discussions, all contracted roles, and
disposable Playwright verification after reload. Exclude event-bus
infrastructure, a new top-level route/API mutation boundary, a frontend state
layer, a second Collaboration writer, new SQLite schema, and unrelated
FT-002/FT-005/FT-006 work.

## Strategy and ownership

Collaboration owns comments, reactions, messages, replies, and branch
visibility at `src/lib/server/modules/collaboration/`. Lesson Context owns
only the server-composed projection and `/lesson-context` form-action adapter;
it consumes actor and calendar scope boundaries and never trusts client
authority fields. Identity & Access owns participant `fullName` through the
bounded `getParticipantLabels` read, while Collaboration selects only IDs from
its authorized discussion projection.

## Ordered tasks

| Wave | Task | Outcome | Dependency |
|---|---|---|---|
| W5 | TASK-011-T3-FT-004-W5 | comments, reactions, and scope | TASK-005-T3-FT-002-W3 |
| W6 | TASK-016-T3-FT-004-W6 | T3 center-lifecycle isolation for comments and reactions | TASK-011-T3-FT-004-W5 |
| W6 | TASK-017-T3-FT-004-W6 | T3 center-lifecycle isolation for threaded messages, branches, and tabs | TASK-011-T3-FT-004-W5 |
| W35 | TASK-102-T3-FT-004-W35 | Server-composed Collaboration projection and server-authorized Lesson Context mutation transport | TASK-016-T3-FT-004-W6, TASK-017-T3-FT-004-W6, TASK-039-T3-FT-003-W10 |
| W36 | TASK-103-T3-FT-004-W36 | Complete Collaboration UI in Lesson Context and disposable shared/personal browser proof | TASK-102-T3-FT-004-W35 |

`TASK-012-T2-FT-004-W6` is a preserved historical `failed` task with an
explicit `superseded` disposition; it is not an executable replacement or
dependency for downstream work.

## Controlled re-tier rebuild

- Queue action: `rebuild_required`.
- Original indexed task/tier: `TASK-012-T2-FT-004-W6`, `T2`.
- Required tier: `T3`.
- Trigger: Attempt 2 changes protected cross-center reads, target checks,
  ownership-sensitive mutations, and uniqueness boundaries after supported
  class identity reuse. This is auth/permissions/security-sensitive behavior
  under the governing tier policy.
- Affected proof: `REQ-014` and `FT-004-AC-005` supply the cross-center harm
  claim; `FT-004-AC-001/002` and `FT-004-AC-003/004` require preservation
  coverage for comments/reactions and threaded discussions respectively.
- Affected implementation scope: Collaboration public reads/commands at
  `src/lib/server/modules/collaboration/public.ts`, Collaboration schema/index
  ownership in `src/lib/server/platform/database.ts`, and the focused
  center-lifecycle isolation proof under `tests/collaboration/`.
- At the rebuild boundary, the `TASK-012` identity, `in_progress` lifecycle,
  T2 tier, dependencies, and Attempt 1/2 evidence were preserved. The current
  lifecycle reconciliation records that historical handoff as terminal
  `failed`/`superseded`; it is not used as a fresh T3 proof or dependency.

The rebuild transparently creates fresh T3 ownership for the independently
completable comment/reaction isolation and threaded-discussion isolation
outcomes as `TASK-016-T3-FT-004-W6` and `TASK-017-T3-FT-004-W6`. Both depend on
the completed `TASK-011-T3-FT-004-W5`; neither inherits proof from `TASK-012`.
The downstream `TASK-014-T3-FT-003-W8` dependency is reconciled to both fresh
T3 tasks. The authoritative replacement cards are now `done` with their own
functional `PASS` and T3 `semantic-pass` evidence.

## Gates and verification

Run `npm run check`, `npm run build`, and `npm run test` for each fresh T3
replacement; verify AC-001/002/005 on TASK-016 and AC-003/004 plus the
REQ-014 harm path on TASK-017. Use the cards’ independent claim-linked RED/GREEN
paths for owner, visibility, reaction, depth, ordering, retention, and privacy.

The existing gates and Attempt 2 GREEN are supporting historical evidence only
for the re-tier route. Fresh replacement T3 execution requires independent
functional verification and per-task adversarial semantic verification before
any closure or feature-level semantic rerun.
Those fresh replacement obligations are now evidenced on TASK-016 and
TASK-017. TASK-014 is now `done` with the FT-004 replacement dependencies; its
separate Revision 2 provider prerequisite and current closure are reconciled in
IMPL-FT-003. The earlier planning boundary applied no
dependent unblock, closure, promotion, or feature-level semantic verdict; the
current feature-level result is reconciled below.

## Planning Revision 2 reconciliation

The global backbone remains `complete` at Planning Revision 2. The accepted
Collaboration ownership and its T3 rebuild split remain unchanged; task
identities, tiers, waves, dependencies, historical evidence, and retry history
remain preserved. The later explicit lifecycle decision records only
TASK-012's terminal historical `failed`/`superseded` disposition; no
architecture or Planning Revision changed. The FT-003 consumer dependency is
reconciled in IMPL-FT-003.

## Historical W6 Feature Boundary Reconciliation

- The historical feature-level result is `semantic-pass` for the backend
  boundary/persistence scope, backed by the authoritative T3 `done` cards and
  independent functional/semantic evidence on `TASK-016-T3-FT-004-W6` and
  `TASK-017-T3-FT-004-W6` for FT-004-AC-001..AC-005.
  The durable feature sync is recorded in
  [the FT-004 feature sync report](../../../.tasks/FT-004/FT-004-S-MB-SYNC-final-report-docs-01.md).
- `TASK-012-T2-FT-004-W6` remains historical `failed`/`superseded`; its T2/W6
  identity, dependencies, retry history, and Attempt 1/2 evidence are retained
  and are not reused as current T3 proof.
- The operator browser-completion decision makes that historical evidence
  insufficient for feature closure. FT-004 is `active` / `planned` pending
  TASK-102 and TASK-103; affected REQ and EP-003 lifecycle values, old task
  identities, retry budgets, accepted architecture, and Planning Revision
  remain unchanged.

## Current Browser Queue

1. `TASK-102-T3-FT-004-W35` extends the existing Lesson Context projection and
   named form-action transport, and wires Identity & Access `getParticipantLabels`
   through the accepted Actor Context Boundary. It owns server authorization,
   deny-before-mutation, the server-side AC-005/REQ-014 harm path,
   route/action integration tests, and a disposable shared/personal transport
   smoke.
2. `TASK-103-T3-FT-004-W36` renders the complete Collaboration surface in the
   existing Lesson Context page. It owns browser-visible AC-001..AC-005,
   shared/personal role and revocation scenarios, reload persistence,
   eleven-plus branch retention/reactivation, and failure-safe disposable
   Playwright cleanup.

The cards are sequential. Neither adds a top-level route, mutation API,
frontend state layer, Collaboration writer, or SQLite schema. FT-004 cannot
claim completion until both cards have independent claim-linked functional and
semantic evidence.
