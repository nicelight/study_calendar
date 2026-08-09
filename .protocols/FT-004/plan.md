---
description: Bounded task-planning resume state for FT-004.
status: active
---
# FT-004 Task Planning Plan

## Outcome and scope

Deliver account-owned field comments, five reactions, arbitrary-depth discussion branches, bounded recent tabs, and shared/personal visibility.

## Canonical inputs and ownership

- Feature: [.memory-bank/features/FT-004-day-collaboration.md](../../.memory-bank/features/FT-004-day-collaboration.md)
- Owner: Collaboration at `src/lib/server/modules/collaboration/`.
- Public boundary: [.memory-bank/contracts/boundary-map.md#day-discussion-query-boundary](../../.memory-bank/contracts/boundary-map.md#day-discussion-query-boundary)
- Access/state contracts: [.memory-bank/contracts/access-control.md](../../.memory-bank/contracts/access-control.md), [.memory-bank/states/lifecycle-map.md#collaboration](../../.memory-bank/states/lifecycle-map.md#collaboration)

## Boundary and waves

1. `TASK-011-T3-FT-004-W5` owns comments, reactions, attribution, and scope authorization (AC-001, AC-002, AC-005).
2. `TASK-012-T2-FT-004-W6` owns arbitrary-depth replies, recent-tab projection, and retention (AC-003, AC-004), after W5.

## TASK-012 Attempt 2 re-tier reconciliation

- Queue action: `rebuild_required`.
- Original tier: `T2`; required tier: `T3`.
- Trigger: the correction constrains protected cross-center reads, target
  checks, mutations, and uniqueness after supported class delete/recreate
  identity reuse. Tier policy classifies this as direct
  auth/permissions/security-sensitive behavior.
- Normative proof affected: `REQ-014` and `FT-004-AC-005` own the forbidden
  cross-center outcome. Preservation proof spans `FT-004-AC-001/002` for
  comments/reactions and `FT-004-AC-003/004` for messages, branches, common
  feed, retention, and recent tabs.
- Provider/consumer boundary: Collaboration remains the owner and continues to
  use Actor Context plus Calendar and Membership Query boundaries. The public
  Day Discussion Query Boundary and its Lesson Context consumer remain
  compatible; no graph edge or global architecture change is required.
- Actual Attempt 2 surface: `src/lib/server/modules/collaboration/public.ts`,
  `src/lib/server/platform/database.ts`, and
  `tests/collaboration/center-lifecycle-isolation.test.ts`.

### Boundary outline for rebuild

1. Comment/reaction center-lifecycle isolation can reach useful T3
   implementation-and-proof completion independently: no prior-center
   projection, target mutation, or uniqueness collision, with retained rows
   unchanged and current-center operations usable.
2. Message/branch/tab center-lifecycle isolation can reach useful T3
   implementation-and-proof completion independently: no prior-center message,
   branch, tab, attribution, reply, or reaction access, while arbitrary depth,
   retention, ordering, and reactivation remain intact.
3. No merge is justified. A shared Collaboration owner, `center_id` mechanism,
   database, scenario, or tier does not make the two implementation-and-proof
   completions inseparable.

Final candidates are therefore transparent fresh T3 follow-up/replacement
boundaries, not an in-place TASK-012 repair. This run assigns no replacement
IDs and changes no task card/index/dependency because `TASK-012` is still
`in_progress`, its ID embeds `T2`, historical claim/evidence ownership must be
preserved, and `TASK-014-T3-FT-003-W8` still depends on that exact identity.
The scheduler/lifecycle owner must authorize and record the controlled identity,
claim, lifecycle, and downstream dependency reconstruction before the fresh
T3 cards can be reviewed and executed.

## Verification

Run native gates with claim-linked paths: AC-001 comment ownership/attribution, AC-002 five reactions/reactor visibility, AC-003 arbitrary-depth/common feed, AC-004 ten-tab retention/reactivation, and AC-005 shared/personal privacy. Each card records RED/GREEN and artifact evidence per owned AC; hidden branches are retained, not deleted.

Current Attempt 2 GREEN and the retained feature `semantic-fail` are supporting
rebuild inputs only. Do not route feature `/red-verify`, closure, `/mb-sync`,
promotion, or execution under the T2 identity. After transparent T3
reconstruction, route `/review-tasks-plan FT-004`, the applicable doctor gate,
and fresh `/exe` for each replacement ID.
