---
description: Bounded task-planning resume state for FT-006.
status: active
---
# FT-006 Task Planning Plan

## Outcome and scope

Deliver historical pricing/charges and deterministic payments, allocations, balances, audit, role-scoped commands, and non-financial calendar markers.

## Canonical inputs and ownership

- Feature: [.memory-bank/features/FT-006-financial-ledger.md](../../.memory-bank/features/FT-006-financial-ledger.md)
- Owner: Financial Ledger at `src/lib/server/modules/financial-ledger/`.
- Contract: [.memory-bank/contracts/financial-ledger.md](../../.memory-bank/contracts/financial-ledger.md)
- Boundaries: [Financial Projection](../../.memory-bank/contracts/boundary-map.md#financial-projection-query-boundary) and [Financial Scope and Lesson Fact](../../.memory-bank/contracts/boundary-map.md#financial-scope-and-lesson-fact-boundary).

## Boundary and waves

1. `TASK-007-T3-FT-006-W4` owns historical price snapshots, charge state, and attendance/charge correction replay foundations (AC-001, AC-004; REQ-010/011/012/014/015).
2. `TASK-008-T3-FT-006-W5` owns payment authority, including Admin edit/cancel behavior, deterministic allocation, exact remainder/advance, idempotent commands, and marker projection (AC-002, AC-003, AC-005, AC-006, AC-007), after W4.

Financial Ledger exclusively writes financial records; Lesson Context only consumes projection data.

## Verification

Run native gates with claim-linked paths: AC-001 historical price, AC-002 oldest-debt replay, AC-003 exact partial/excess states, AC-004 correction/audit replay, AC-005 authority, AC-006 non-financial marker projection, and AC-007 retry safety. Each card records separate RED/GREEN observations and artifacts for its owned ACs.

## Revision 2 reconciliation

Global Backbone `complete`, Planning Revision `2`; FT-006 reuses the accepted
Financial Ledger contracts and has no task-level impact. TASK-007 and TASK-008
remain untouched with identity, status, evidence, dependencies, and retry
history preserved.
