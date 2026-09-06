---
description: Durable decisions for FT-004 task planning.
status: active
---
# FT-004 Decision Log

## 2026-08-08 — Task queue created

Object ownership/scope and branch projection are distinct cohesive outcomes. Existing collaboration, access, domain, and state contracts are sufficient; no new canonical concern was created. Planning Revision remains `1`.

## 2026-08-08 — TASK-012 Attempt 2 controlled re-tier

Queue action is `rebuild_required`. The indexed identity
`TASK-012-T2-FT-004-W6` has original tier `T2`, while Attempt 2 requires `T3`
because it changes protected cross-center reads, target checks, mutations, and
uniqueness boundaries after supported class identity reuse. The harm proof is
owned by `REQ-014`/`FT-004-AC-005`; preservation crosses the existing
TASK-011 comment/reaction scope and TASK-012 threaded-discussion scope.

No product, canonical-spec, graph, or Planning Revision decision changed.
TASK-012 identity, `in_progress` lifecycle, tier, dependencies, and all Attempt
1/2 evidence are preserved; no replacement card or downstream dependency was
written. A controlled transparent T3 reconstruction must first resolve fresh
identity/claim ownership and the `TASK-014-T3-FT-003-W8` dependency, then route
fresh `/review-tasks-plan FT-004`, the applicable doctor gate, and replacement
execution. Feature semantic review, closure, sync, and promotion remain blocked
until that route completes.

## 2026-08-09 — Transparent T3 rebuild/split completed

The operator-authorized repair completes the previously recorded
`rebuild_required` route. The Attempt 2 finding remains the tier trigger:
supported center identity reuse changed protected cross-center reads, target
checks, ownership-sensitive mutations, and uniqueness boundaries, so the
existing T2 identity cannot be reused as the execution handoff under the tier
policy.

- `TASK-012-T2-FT-004-W6` remains exactly preserved as the historical
  `T2`/`W6`/`in_progress` attempt with its original dependencies, identity,
  task-owned claims, and Attempt 1/2 evidence. Its functional GREEN and the
  feature-level `semantic-fail` are rebuild inputs only, not fresh T3 proof or
  a replacement dependency.
- `TASK-016-T3-FT-004-W6` is the planned T3/W6 replacement for
  `FT-004-AC-001`, `FT-004-AC-002`, and `FT-004-AC-005`: center-lifecycle
  isolation for comments and reactions.
- `TASK-017-T3-FT-004-W6` is the planned T3/W6 replacement for
  `FT-004-AC-003`, `FT-004-AC-004`, and the `REQ-014` access-control harm path:
  center-lifecycle isolation for threaded discussions, branches, and tabs.
- The split is intentional: the two outcomes have independent implementation
  and claim-linked proof completion. Shared Collaboration ownership, database
  surface, and test root are not merge evidence. Neither replacement inherits
  TASK-012 evidence; both depend on completed `TASK-011-T3-FT-004-W5`.

The existing index, downstream `TASK-014-T3-FT-003-W8` dependency, and
`IMPL-FT-004` plan now consistently reference both replacement cards. No new
task ID, product/canonical-spec/graph decision, or Planning Revision was
introduced. Fresh `/review-tasks-plan FT-004` remains the next route; execution,
verification, closure, sync, promotion, and feature semantic rerun remain
outside this planning repair.

## 2026-08-10 — Planning Revision 2 reconciliation

The accepted Learning Progress provider decision does not change the
Collaboration graph or T3 rebuild split. At this planning boundary TASK-011,
TASK-012, TASK-016, and TASK-017 remain untouched; identity, lifecycle,
dependencies, evidence, and retry history are preserved. The downstream
TASK-014 dependency update is owned by the FT-003 reconciliation. The later
explicit TASK-012 lifecycle disposition is recorded in the next entry.

## 2026-08-10 — TASK-012 historical superseded disposition

The explicit lifecycle owner records `TASK-012-T2-FT-004-W6` as terminal
`failed` with disposition `superseded` by `TASK-016-T3-FT-004-W6` and
`TASK-017-T3-FT-004-W6`. This is the smallest allowed schema status: the
original T2 Attempt 2 behavior is functionally GREEN but its protected
cross-center correction is T3 and its independent report is
`NEEDS-CLARIFICATION`, so TASK-012 cannot close as `done`.

The current feature-level result is `semantic-pass` for FT-004-AC-001..AC-005
through the two fresh T3 replacement task paths. The old feature
`semantic-fail`, TASK-012 Attempt 1/2 evidence, and retry `1/2` history remain
preserved and are not reused as current T3 proof. No implementation, test
execution, architecture, dependency, or Planning Revision changed.

## 2026-09-03 — Browser completion boundary confirmed

The operator confirms that FT-004 is implemented only when all planned
Collaboration behavior is available through the browser UI. The audit shows
that the existing `/lesson-context` renders neither Collaboration content nor
mutation controls and that `/api/lesson-context` is GET-only. The prior
backend-boundary `semantic-pass` is therefore historical scope evidence, not
feature completion evidence; FT-004 is reconciled to `active`/`planned`.

The minimum sequential queue is two new T3 outcomes: first, the server-composed
Lesson Context projection and server-authorized form-action transport; second,
the complete shared/personal UI and disposable Playwright proof. The existing
Collaboration public module, SQLite tables, accepted boundaries, and old task
cards are reused. No new top-level route, mutation API, frontend state layer,
database abstraction, old task identity, old lifecycle, or accumulated evidence
is changed.

## 2026-09-05 — Revision 2 acceptance-trace repair

The browser task-plan review identified a missing target-linked AC mapping.
Reconciliation confirms the authoritative cards now contain the required exact
IDs in `verification_targets`: `TASK-102` owns `FT-004-AC-005`, and `TASK-103`
owns `FT-004-AC-001` through `FT-004-AC-005`. Matching feature locators and
claim-linked RED/GREEN contracts remain on the cards. No task identity, tier,
wave, dependency, lifecycle, implementation scope, or Planning Revision
changed. The next route is a fresh `/review-tasks-plan FT-004`.

## 2026-09-05 — TASK-102 Attempt 3 fixed-semantics follow-up

Fresh independent verification proved that a forged `lesson-final-one` route
could edit an owned comment stored under `lesson-final-two`: the route passed
only `sessionToken`, `commentId`, and `body`, while Collaboration authorized the
stored comment context without checking the current route class/lesson scope.
This is an implementation defect inside the accepted
`collaboration-browser-surface.md#authorized-mutation-transport` contract, not
an unresolved product or architecture decision.

The minimum follow-up is planned `TASK-107-T3-FT-004-W35`, a fresh T3 identity
with dependencies on completed TASK-016, TASK-017, and TASK-039. It owns only
current route-scope enforcement for `editFieldComment` and focused isolated
forged-context RED/GREEN proof. TASK-102 remains failed and is not a dependency
or proof source; its Attempt 1–3 evidence and retry history are preserved.
TASK-103 remains blocked with its identity and evidence preserved, and now
depends on TASK-107 for the explicit W35 → W36 correction path. No Attempt 4,
execution, verification, semantic review, Judge, scheduler closure, or sync was
run.

## 2026-09-05 — TASK-107 evidence-locator repair

Fresh task-plan review found one execution-readiness gap in the third
`TASK-107.evidence_required` item: its boundary proof described the required
RED/GREEN result but did not name a concrete artifact. The reconciliation
replaces that directory-only artifact text with the exact task-owned
`.tasks/TASK-107-T3-FT-004-W35/TASK-107-T3-FT-004-W35-S-VERIFY-final-report-docs-01.md`
and `.protocols/TASK-107-T3-FT-004-W35/verification.md` paths only.

TASK-107 remains the same planned `T3`/`W35` identity with the same
dependencies, scope, boundaries, evidence, and Planning Revision `2`;
TASK-102 remains failed, TASK-103 remains blocked, and FT-000 is untouched.
The feature-to-tasks queue action is `reconciled`; the next route is a fresh
`/review-tasks-plan FT-004`. No execution, doctor, promotion, selection, Judge,
or sync was run.

## 2026-09-06 — REQ-014 clarification reconciliation route

The operator accepted a bounded contract clarification: an already authorized
Collaboration target need not match the current URL `lessonId`; REQ-014 still
requires server-resolved role, membership, ownership, and privacy checks. The
affected feature is FT-004 only. Planning Revision remains `2`, Foundation is
unchanged, and no new task identity is needed. The existing task plan/card
requires reconciliation of its route-selector claim wording before fresh
TASK-102 functional and semantic verification.
