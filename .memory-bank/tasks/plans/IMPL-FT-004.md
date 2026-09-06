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
TASK-102 also performs the atomic migration of existing default-posting forms
to named actions so the route never has a broken default/named-action split.
TASK-103 consumes that stable transport for the Collaboration controls. Lesson
Context consumes actor and calendar scope boundaries and never trusts client
authority fields. Identity & Access owns participant `fullName` through the
bounded `getParticipantLabels` read, while Collaboration selects only IDs from
its authorized discussion projection.

## Ordered tasks

| Wave | Task | Outcome | Dependency |
|---|---|---|---|
| W5 | TASK-011-T3-FT-004-W5 | comments, reactions, and scope | TASK-005-T3-FT-002-W3 |
| W6 | TASK-016-T3-FT-004-W6 | T3 center-lifecycle isolation for comments and reactions | TASK-011-T3-FT-004-W5 |
| W6 | TASK-017-T3-FT-004-W6 | T3 center-lifecycle isolation for threaded messages, branches, and tabs | TASK-011-T3-FT-004-W5 |
| W35 | TASK-102-T3-FT-004-W35 | Historical failed browser transport attempt; route lesson-selector equality is accepted out of scope under clarified REQ-014, with identity/evidence/retry history preserved | TASK-016-T3-FT-004-W6, TASK-017-T3-FT-004-W6, TASK-039-T3-FT-003-W10 |
| W35 | TASK-107-T3-FT-004-W35 | Completed optional hardening for named Collaboration comment edits; current route lesson equality is not required by REQ-014 | TASK-016-T3-FT-004-W6, TASK-017-T3-FT-004-W6, TASK-039-T3-FT-003-W10 |
| W36 | TASK-103-T3-FT-004-W36 | Complete Collaboration UI in Lesson Context and disposable shared/personal browser proof on the corrected named transport | TASK-107-T3-FT-004-W35 |

`TASK-012-T2-FT-004-W6` is a preserved historical `failed` task with an
explicit `superseded` disposition; it is not an executable replacement or
dependency for downstream work.

`TASK-102-T3-FT-004-W35` remains a historical failed attempt after three
unsuccessful attempts. The operator clarified REQ-014 so its route
lesson-selector equality finding is out of scope; Attempt 1–3 evidence and
retry history remain preserved, and no retry or replacement task is required.
`TASK-107` remains completed optional hardening and is not required to satisfy
the clarified REQ-014 semantics.

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
  TASK-107 and TASK-103; affected REQ and EP-003 lifecycle values, old task
  identities, retry budgets, accepted architecture, and Planning Revision
  remain unchanged.

## Historical Browser Queue at Planning Boundary

1. `TASK-102-T3-FT-004-W35` is the preserved historical failed attempt for the
   existing Lesson Context projection and named form-action transport. Its
   Attempt 1-3 evidence, identity, exhausted retry budget, and failed status
   remain unchanged and it is not an executable prerequisite.
2. `TASK-107-T3-FT-004-W35` retains the completed optional hardening for the
   named `editFieldComment` action. Its proof covers server-side target
   authorization and forged cross-context denial before mutation, while an
   already authorized target remains valid when the URL `lessonId` differs;
   it does not replay TASK-102's projection, labels, named-action migration,
   or browser UI claims.
3. `TASK-103-T3-FT-004-W36` renders the complete Collaboration surface in the
   existing Lesson Context page on the corrected named transport. At the
   planning boundary it was blocked pending its `TASK-107` prerequisite; its
   current closure is reconciled below.

The planning-time executable sequence was therefore `TASK-107` → `TASK-103`.
Neither task adds a top-level route, mutation API, frontend state layer,
Collaboration writer, or SQLite schema. Both task outcomes are now independently
evidenced; feature-level lifecycle remains separately owned.

## Attempt 3 route-scope correction

`TASK-102-T3-FT-004-W35` failed its fresh Attempt 3 functional verification:
the forged `lesson-final-one` route edited an owned comment stored under
`lesson-final-two` because the route supplied only `sessionToken`, `commentId`,
and `body`, while Collaboration authorized the stored comment context without
checking the current route scope. The defect is fixed-semantics work inside
the accepted route/boundary contract, not a new architecture decision.

`TASK-107-T3-FT-004-W35` is the completed optional T3 hardening retained from
that planning boundary. It reuses the completed `TASK-016`, `TASK-017`, and
`TASK-039` prerequisites and keeps its focused route/public-boundary evidence;
the accepted REQ-014 semantics do not make URL `lessonId` equality a required
authorization claim. At that planning boundary, `TASK-103` remained `blocked`
with its identity and evidence preserved, and its dependency was routed to
`TASK-107` so the existing W35 → W36 sequence had a valid correction path. No
code, execution, verification, semantic review, closure, Judge, scheduler, or
Planning Revision change was part of that planning reconciliation.

## Revision 2 Acceptance-Trace Reconciliation

The prior browser queue satisfied the target-linked proof mapping:
`TASK-102` listed `FT-004-AC-005` in `verification_targets`, and `TASK-103`
listed `FT-004-AC-001` through `FT-004-AC-005`. Those exact locators and
historical RED/GREEN contracts remain preserved. The existing `TASK-107`
optional-hardening claim is reconciled to the accepted authorization rule; no
new task or fresh evidence is introduced, and `TASK-103` retains its recorded
dependency and closure evidence.

## W35 TASK-107 closure reconciliation — 2026-09-05

`TASK-107-T3-FT-004-W35` is now `done` with fresh Attempt 2 functional `PASS`,
T3 `semantic-pass`, all required native gates, and same-Judge `SUPPORT`.
Its current student-scope correction remains inside the accepted
route/Collaboration boundary and does not alter the plan, ownership, tier,
dependencies, or Planning Revision 2. The authoritative task card and W35
sync report route the current evidence.

The canonical next sequence remains `TASK-103-T3-FT-004-W36` after the
scheduler-owned W35 post-sync strict readiness and dependent-state pass.
TASK-102 remains failed and is never retried; TASK-103 is not unblocked by this
sync itself.

## W36 TASK-103 browser closure reconciliation — 2026-09-05

`TASK-103-T3-FT-004-W36` is now `done` under the scheduler-written Attempt 2
closure, backed by functional `PASS`, T3 `semantic-pass`, all required native
gates, and same-Judge `JUDGE_ASSESSMENT: SUPPORT`. Its current browser proof
covers the complete UI and privacy/persistence outcome on the corrected named
transport.

- [TASK-103 card](../../tasks/TASK-103-T3-FT-004-W36.task.json)
- [functional evidence](../../../.protocols/TASK-103-T3-FT-004-W36/verification.md)
- [functional report](../../../.tasks/TASK-103-T3-FT-004-W36/TASK-103-T3-FT-004-W36-S-VERIFY-final-report-docs-02.md)
- [semantic evidence](../../../.protocols/TASK-103-T3-FT-004-W36/red-verification.md)
- [semantic report](../../../.tasks/TASK-103-T3-FT-004-W36/TASK-103-T3-FT-004-W36-S-RED-VERIFY-final-report-docs-01.md)
- [W36 sync report](../../../.tasks/TASK-103-T3-FT-004-W36/TASK-103-T3-FT-004-W36-S-MB-SYNC-final-report-docs-01.md)

TASK-102 remains the historical `failed` W35 transport attempt and TASK-107
remains the completed W35 scope correction. FT-004 remains `active` /
`planned`; no feature/epic/requirement promotion, dependency transition, or
Planning Revision change is created by this sync.
