---
description: Implementation plan for FT-004 day collaboration.
status: active
---
# IMPL-FT-004 — Day Collaboration

## Goal

Implement scoped comments/reactions and durable threaded day discussions.

## Scope / non-goals

Include one editable comment per account/field, five reactions, arbitrary reply depth, ten active branch tabs, retention, and shared/personal authorization. Exclude event-bus infrastructure and unrelated lesson/progress writes.

## Strategy and ownership

Collaboration owns comments, reactions, messages, replies, and branch visibility at `src/lib/server/modules/collaboration/`. It consumes actor and calendar scope boundaries.

## Ordered tasks

| Wave | Task | Outcome | Dependency |
|---|---|---|---|
| W5 | TASK-011-T3-FT-004-W5 | comments, reactions, and scope | TASK-005-T3-FT-002-W3 |
| W6 | TASK-016-T3-FT-004-W6 | T3 center-lifecycle isolation for comments and reactions | TASK-011-T3-FT-004-W5 |
| W6 | TASK-017-T3-FT-004-W6 | T3 center-lifecycle isolation for threaded messages, branches, and tabs | TASK-011-T3-FT-004-W5 |

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
TASK-017. At the planning/rebuild boundary TASK-014 was `in_progress` with the
FT-004 replacement dependencies; its separate Revision 2 provider prerequisite
and current closure are reconciled in IMPL-FT-003. That boundary applied no
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

## W6 Feature Boundary Reconciliation

- The current feature-level result is `semantic-pass`, backed only by the
  authoritative T3 `done` cards and independent functional/semantic evidence
  on `TASK-016-T3-FT-004-W6` and `TASK-017-T3-FT-004-W6` for FT-004-AC-001..AC-005.
  The durable feature sync is recorded in
  [the FT-004 feature sync report](../../../.tasks/FT-004/FT-004-S-MB-SYNC-final-report-docs-01.md).
- `TASK-012-T2-FT-004-W6` remains historical `failed`/`superseded`; its T2/W6
  identity, dependencies, retry history, and Attempt 1/2 evidence are retained
  and are not reused as current T3 proof.
- FT-004 remains document `draft` / entity `planned`; affected REQ and EP-003
  lifecycle values, task identities, retry budgets, accepted architecture, and
  Planning Revision remain unchanged.
