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
| W6 | TASK-012-T2-FT-004-W6 | threaded branches and tabs | TASK-011-T3-FT-004-W5 |

## Controlled re-tier handoff

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
- The current `TASK-012` identity, `in_progress` lifecycle, tier, dependencies,
  and Attempt 1/2 evidence remain unchanged. No replacement task, task-index
  entry, or downstream dependency change is hidden in this reconciliation.

The rebuild must transparently reconstruct fresh T3 ownership for the
independently completable comment/reaction isolation and threaded-discussion
isolation outcomes. It must also reconcile the downstream
`TASK-014-T3-FT-003-W8` dependency before review. Concrete replacement IDs and
lifecycle disposition belong to that controlled rebuild, not to a bounded
repair of `TASK-012`.

## Gates and verification

Run `npm run check`, `npm run build`, and `npm run test`; verify AC-001/002/005 on TASK-011 and AC-003/004 on TASK-012. Use the cards’ claim-linked RED/GREEN paths for owner, visibility, reaction, depth, ordering, retention, and privacy.

The existing gates and Attempt 2 GREEN are supporting historical evidence only
for the re-tier route. Fresh replacement T3 execution requires independent
functional verification and per-task adversarial semantic verification before
any closure or feature-level semantic rerun.
