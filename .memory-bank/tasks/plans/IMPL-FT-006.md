---
description: Implementation plan for FT-006 financial ledger.
status: active
---
# IMPL-FT-006 — Financial Ledger

## Goal

Implement exact, historical, deterministic financial records and authorized payment projections.

## Scope / non-goals

Include price snapshots, charges, payment allocation, balances, audit, correction/cancel, authority, idempotency, and calendar markers. Exclude lesson/membership writes and payment-derived mutation from read projections.

## Strategy and ownership

Financial Ledger owns `src/lib/server/modules/financial-ledger/`; it consumes actor and lesson facts through named boundaries and persists exact financial state in the shared database.

## Ordered tasks

| Wave | Task | Outcome | Dependency |
|---|---|---|---|
| W4 | TASK-007-T3-FT-006-W4 | price snapshots, charge correction/replay foundations (AC-001, AC-004; REQ-010/011/012/014/015) | TASK-005-T3-FT-002-W3 |
| W5 | TASK-008-T3-FT-006-W5 | payment commands including Admin edit/cancel, allocation, audit, markers (AC-002, AC-003, AC-005, AC-006, AC-007) | TASK-007-T3-FT-006-W4 |

## Gates and verification

Run `npm run check`, `npm run build`, and `npm run test`; verify AC-001/004 on TASK-007 and AC-002/003/005/006/007 on TASK-008. TASK-007 owns attendance/charge correction replay; TASK-008 owns Admin payment edit/cancel behavior and its role/center authorization. Each claim has a concrete RED/GREEN path for deterministic replay, exact amounts, authority, projection non-mutation, and safe retry using isolated disposable fixtures.

## Planning Revision 2 reconciliation

The global backbone remains `complete` at Planning Revision 2. The accepted
Financial Ledger boundaries do not change under the Learning Progress query
decision; TASK-007 and TASK-008 retain their identities, tiers, waves,
dependencies, statuses, historical evidence, and retry history. No FT-006 task
record was changed.
