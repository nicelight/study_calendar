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
| W22 | TASK-043-T3-FT-006-W22 | historical price application (AC-001) | TASK-005-T3-FT-002-W3 |
| W22 | TASK-044-T3-FT-006-W22 | attendance-to-financial charge correction/replay and audit consequence (AC-004) | TASK-010-T3-FT-005-W6; TASK-043-T3-FT-006-W22 |
| W23 | TASK-045-T3-FT-006-W23 | deterministic payment allocation and exact partial/excess states (AC-002, AC-003) | TASK-043-T3-FT-006-W22 |
| W23 | TASK-046-T3-FT-006-W23 | role-scoped payment authority and Admin edit/cancel recomputation (AC-005) | TASK-005-T3-FT-002-W3; TASK-006-T2-FT-002-W4; TASK-045-T3-FT-006-W23 |
| W23 | TASK-047-T3-FT-006-W23 | non-financial payment-marker projection (AC-006) | TASK-045-T3-FT-006-W23 |
| W24 | TASK-048-T3-FT-006-W24 | repeated-payment retry and explicit-confirmation idempotency (AC-007) | TASK-045-T3-FT-006-W23 |
| W25 | TASK-049-T3-FT-006-W25 | protected Lesson Context payment adapter | TASK-046-T3-FT-006-W23; TASK-039-T3-FT-003-W10; TASK-040-T3-FT-001-W20 |
| W26 | TASK-050-T3-FT-006-W26 | personal paid/unpaid calendar projection and full browser outcome (AC-008) | TASK-045-T3-FT-006-W23; TASK-049-T3-FT-006-W25; TASK-039-T3-FT-003-W10; TASK-040-T3-FT-001-W20 |

## Gates and verification

Run `npm run check`, `npm run build`, and `npm run test`; each fresh card
verifies only its owned result: AC-001 on TASK-043, AC-004 on TASK-044,
AC-002/003 on TASK-045, AC-005 on TASK-046, AC-006 on TASK-047, AC-007 on
TASK-048, the adapter boundary on TASK-049, and the complete AC-008 browser /
personal projection outcome on TASK-050. The real-DB E2E is exclusive to
TASK-050 and uses an explicit scoped write boundary for `study-calendar.db`.

## Planning Revision 2 reconciliation

The global backbone remains `complete` at Planning Revision 2. The accepted
Financial Ledger boundaries do not change. `TASK-007`, `TASK-008`, and
`TASK-041` remain historical done records with their identities, dependencies,
statuses, and evidence preserved; the current executable decomposition is the
fresh `TASK-043`..`TASK-050` rebuild. No financial scope or Planning Revision
changes.

## FT-006 rebuild after rejected task-plan review

Queue action is `rebuild_required`. The rejected W4/W5/W21 cards grouped
independently completable price, replay, payment-command, projection, retry,
and browser-consumer outcomes. The fresh cards split those surfaces without
changing the accepted Financial Ledger/Attendance ownership graph. Historical
done evidence remains supporting context only; fresh planned cards require
their own claim-linked RED/GREEN and T3 semantic verification.

The real-DB E2E is assigned to TASK-050, whose hard write boundary includes
the exact `study-calendar.db` fixture. It may create/reuse only the dedicated
test accounts, membership, price/charge/payment/allocation fixture, and
automation sessions; dedicated accounts and financial fixture remain for
inspection, unrelated rows remain untouched, and cleanup removes only exact
test-created session tokens. TASK-049 has no real-DB gate and cannot inherit
TASK-050 evidence.
