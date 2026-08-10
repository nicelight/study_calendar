---
description: Bounded task-planning resume state for FT-002.
status: active
---
# FT-002 Task Planning Plan

## Outcome and scope

Deliver center-bounded membership/class management and recurring lesson scheduling with independent lesson exceptions and preserved identity.

## Canonical inputs and ownership

- Feature: [.memory-bank/features/FT-002-center-and-scheduling.md](../../.memory-bank/features/FT-002-center-and-scheduling.md)
- Owner: Center & Scheduling at `src/lib/server/modules/center-scheduling/`.
- Public boundary: [.memory-bank/contracts/boundary-map.md#calendar-and-membership-query-boundary](../../.memory-bank/contracts/boundary-map.md#calendar-and-membership-query-boundary)
- Access contract: [.memory-bank/contracts/access-control.md](../../.memory-bank/contracts/access-control.md)
- Foundation prerequisite is transitive through FT-001.

## Boundary and waves

1. `TASK-005-T3-FT-002-W3` owns center membership, class modes, and provider-owned authorization facts (AC-001, AC-002).
2. `TASK-006-T2-FT-002-W4` owns recurrence, per-lesson operations, transfer identity, assignment authorization, and the Financial Ledger identity integration (AC-003, AC-004, AC-005, AC-006), after membership and the charge foundation.

Consumers query the named public boundary; they do not write scheduling state. Lesson Context composes downstream views, Collaboration and Learning Progress own their data, and Financial Ledger owns charge facts; adding dependencies on those downstream consumers would create cycles, so only TASK-007 is a prerequisite for TASK-006's charge-identity integration.

## Verification

Use project-native gates plus claim-linked paths: AC-001/002 center and class authorization; AC-003 recurrence isolation; AC-004 transfer identity and charge uniqueness; AC-005 historical access; AC-006 immediate removal denial. Each owned AC has a concrete RED/GREEN observation and artifact path in its indexed card.
