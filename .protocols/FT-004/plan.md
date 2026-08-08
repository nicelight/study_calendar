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

## Verification

Run native gates with claim-linked paths: AC-001 comment ownership/attribution, AC-002 five reactions/reactor visibility, AC-003 arbitrary-depth/common feed, AC-004 ten-tab retention/reactivation, and AC-005 shared/personal privacy. Each card records RED/GREEN and artifact evidence per owned AC; hidden branches are retained, not deleted.
