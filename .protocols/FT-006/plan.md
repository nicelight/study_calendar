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

The accepted rebuild keeps the Financial Ledger module and splits only the
independently completable implementation/proof surfaces:

1. Historical price application (`AC-001`) and attendance-to-financial
   correction/replay (`AC-004`) are sibling tasks. Learning Progress owns the
   attendance state and transition; Financial Ledger owns only charge,
   allocation, balance, and audit consequences.
2. Payment allocation plus partial/excess preservation (`AC-002/003`) stays
   one task because both are the same `createPayment` allocation result and
   exact-money completion boundary.
3. Payment authority/edit-cancel (`AC-005`), marker projection (`AC-006`),
   and retry/idempotency (`AC-007`) are separate tasks because they have
   distinct command/query or failure/retry surfaces.
4. The browser payment adapter and personal paid/unpaid calendar projection
   are separate tasks. The projection task owns the full product `AC-008`
   end-to-end result; the adapter task owns only the technical Lesson Context
   boundary prerequisite.

Fresh planned owners are `TASK-043` through `TASK-050`; the exact card
mapping is recorded in the implementation plan below. Historical done
`TASK-007`, `TASK-008`, and `TASK-041` remain indexed with identity, status,
dependencies, and evidence preserved, but are not current executable owners.

Financial Ledger exclusively writes financial records; Learning Progress owns
attendance; Lesson Context and Calendar remain thin consumers/adapters.

## Verification

Each fresh card has its own claim-linked RED/GREEN path. The real-DB browser
proof belongs only to the `AC-008` projection owner and explicitly allows the
exact `study-calendar.db` fixture path. It preserves dedicated accounts,
membership, price/charge/payment/allocation fixture, and unrelated rows;
cleanup removes only exact test-created session tokens. It does not repeat
AC-007 retry/idempotency proof, reset the database, or broaden product data.
The adapter task uses isolated route proof and does not inherit the real-DB
evidence.

## Revision 2 reconciliation

Global Backbone `complete`, Planning Revision `2`; FT-006 reuses the accepted
Financial Ledger contracts. The review `REJECT` is repaired as a
`rebuild_required` task-slicing change only: no module ownership, public
contract, financial scope, or Planning Revision changes. Historical
`TASK-007`, `TASK-008`, and `TASK-041` retain identity, lifecycle, evidence,
dependencies, and retry history; fresh cohesive owners are planned separately.
