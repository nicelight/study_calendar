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
