---
description: Implementation plan for FT-002 center and scheduling.
status: active
---
# IMPL-FT-002 — Center, Membership, and Scheduling

## Goal

Implement center-scoped participants, class modes, assignments, recurring schedules, and stable lesson identity.

## Scope / non-goals

Include admin membership operations, individual/group class representation, schedule exceptions, transfer/cancel behavior, and assignment-based history access. Exclude authentication provider internals and financial writes.

## Strategy and ownership

`src/lib/server/modules/center-scheduling/` owns all mutable center, membership, assignment, schedule, and lesson state. Identity & Access is consumed only through Account Provisioning Boundary.

## Ordered tasks

| Wave | Task | Outcome | Dependency |
|---|---|---|---|
| W3 | TASK-005-T3-FT-002-W3 | membership, class modes, and provider-owned authorization facts | TASK-004-T3-FT-001-W3 |
| W4 | TASK-006-T2-FT-002-W4 | schedule lifecycle, lesson identity, assignment authorization, and financial identity integration | TASK-005-T3-FT-002-W3; TASK-007-T3-FT-006-W4 |

## Gates and verification

Run `npm run check`, `npm run build`, and `npm run test`; verify AC-001/002 on TASK-005 and AC-003/004/005/006 on TASK-006. The cards define RED/GREEN probes for center authorization, both modes, unaffected repetitions, transfer identity, assignment authorization, attribution, and Financial Ledger charge uniqueness. Lesson Context, Collaboration, and Learning Progress projections remain downstream consumer-owned outcomes; adding dependencies on those consumers would create cycles.

## Planning Revision 2 reconciliation

The global backbone remains `complete` at Planning Revision 2. The accepted
Center & Scheduling boundary and its downstream consumer topology are
unchanged; TASK-005 and TASK-006 retain their identities, tiers, waves,
dependencies, statuses, historical evidence, and retry history. No FT-002 task
record was changed.
