---
description: Durable decisions for FT-006 task planning.
status: active
---
# FT-006 Decision Log

## 2026-08-08 — Task queue created

Charge/pricing foundations and payment/projection commands have distinct replay and authorization surfaces, so they remain sibling tasks. Existing financial, boundary, access, domain, state, and runbook specs are sufficient. Planning Revision remains `1`.

The AC-004 ownership is narrowed to attendance/charge correction replay; its
`REQ-012` ledger dependency is explicit on TASK-007. Admin payment edit/cancel
behavior is owned by AC-005 and TASK-008 with role/center authorization,
deterministic recomputation, and audit proof. No new boundary or task identity
is required.

## 2026-08-10 — Planning Revision 2 reconciliation

The accepted Learning Progress provider decision does not affect Financial
Ledger ownership, contracts, or task outcomes. TASK-007 and TASK-008 remain
untouched with identity, lifecycle, dependencies, evidence, and retry history
preserved.

## 2026-08-18 — Rebuild after FT-006 task-plan REJECT

The operator accepted a `rebuild_required` split for the rejected W4/W5/W21
surface. Fresh cards separate historical price, charge-replay consequence,
payment allocation, authority/edit-cancel, marker projection, retry safety,
browser payment adapter, and personal paid/unpaid projection. The accepted
product AC-008 remains owned end-to-end by the projection card; the adapter is
its technical prerequisite.

Learning Progress remains the attendance owner; Financial Ledger owns only the
financial consequence. The real-DB E2E is bounded to the exact
`study-calendar.db` path and dedicated fixtures on the AC-008 owner. Historical
TASK-007, TASK-008, and TASK-041 statuses/evidence remain preserved. No
canonical contract, architecture, or Planning Revision change.

## 2026-08-18 — TASK-050 review repair

TASK-050 now proves only AC-008: browser payment entry, authoritative
payment/allocation facts, student paid/unpaid projection, shared-role omission,
and authorization. AC-007 retry/idempotency remains exclusively owned by
TASK-048 and is not repeated by the real-DB E2E.

The real-DB cleanup policy is explicit: dedicated accounts, membership,
price/charge/payment/allocation fixture, and unrelated rows remain for
inspection; only exact test-created session tokens are removed. No task,
architecture, contract, or Planning Revision change.
