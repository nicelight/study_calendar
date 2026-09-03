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

## 2026-09-03 browser-gap reconciliation

The W22–W26 baseline is retained as the historical owner of the already-working
Financial Ledger commands, Lesson Context payment creation, allocation/replay,
marker calculation, and personal paid/unpaid labels. Current code inspection
found three missing user-facing contours:

1. `TASK-099-T3-FT-006-W32` adds the protected Admin class-price/default and
   student-override settings surface plus deterministic append-only history,
   using the existing setting commands and one Admin-authorized history query.
   The single class amount is both lesson price and default payment value; no
   second persisted default-amount setting is introduced. The same authorized
   current value initializes the existing Lesson Context amount field; the
   existing `createPayment` action is not re-planned.
2. `TASK-100-T3-FT-006-W33` adds the own-center Admin payment journal and
   server actions for confirmed edit/cancel, reloading the existing
   allocation/balance/audit result. It does not add payment creation.
3. `TASK-101-T3-FT-006-W34` adapts the existing marker projection through
   Lesson Context into the personal Calendar, rendering factual dates,
   closest previous free-day placement, and multiple markers for Student and
   Parent-linked-child views without changing paid/unpaid labels or financial
   state.

The three tasks are sequential where the UI shell is shared and remain
separate by view model, authorization/privacy surface, and proof fixture. Each
has its own T3 RED/GREEN evidence and disposable Playwright gate using an
owned `tmp/` database. Admin, Teacher, Student, Parent, forged-scope, and
cross-center denial behavior is server-side; shared Admin/Teacher calendars do
not receive personal payment markers. No historical task is reopened, and no
new payment-creation or paid/unpaid-label task is introduced.

## Task-plan approval and decomposition closure — 2026-09-03

The fresh `/review-tasks-plan FT-006` returned `APPROVE` at Planning Revision
`2`. The repaired queue is accepted as `rebuild_required` with final planned
cards `TASK-099` → `TASK-100` → `TASK-101`. Decomposition is closed for this
revision. The cards remain `planned` until the applicable readiness/promotion
owner acts; this boundary does not claim implementation, verification, or
feature lifecycle promotion.
