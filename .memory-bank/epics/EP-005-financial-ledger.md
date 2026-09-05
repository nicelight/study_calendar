---
description: Epic for monetary charges, payments, allocation, audit, and balance projection.
status: active
type: epic
id: EP-005
lifecycle: verified
---
# EP-005 — Financial Ledger

## Value
Центр ведёт воспроизводимый денежный баланс ученика: цена фиксируется в
начислении, платежи гасят старейшие долги, частичные суммы и аванс не теряются,
а исправления остаются проверяемыми.

## Scope
- [.memory-bank/features/FT-006-financial-ledger.md](../features/FT-006-financial-ledger.md)

## Requirements
- REQ-010, REQ-011, REQ-012, REQ-013, REQ-014, REQ-015.

## Success / acceptance
- Полная, частичная и избыточная оплаты дают точный детерминированный баланс.
- Историческая цена, attendance corrections, permissions, audit и payment
  marker projection соответствуют PRD.

## Source / constraints
- [.memory-bank/prd.md](../prd.md#payments-and-balance), `FR-FIN-*`,
  `NFR-FIN-*`, `NFR-QA-*`, Constitution financial correctness.

## W32 task evidence reconciliation — 2026-09-04

The scheduler-decided `TASK-099-T3-FT-006-W32` closure adds current functional
`PASS` and required T3 `semantic-pass` evidence for the FT-006 Admin
class/default and student-override settings surface plus the existing editable
Lesson Context payment default. See the
[FT-006 W32 closure route](../features/FT-006-financial-ledger.md#w32-admin-pricing-and-payment-default-closure--2026-09-04)
and the [W32 sync report](../../.tasks/TASK-099-T3-FT-006-W32/TASK-099-T3-FT-006-W32-S-MB-SYNC-final-report-docs-01.md).

This task-scoped sync preserves the existing EP-005 lifecycle and document
status. FT-006 remains `planned` while TASK-100 and TASK-101 remain planned;
no epic or feature lifecycle decision is inferred here.

## W33 task evidence reconciliation — 2026-09-05

The scheduler-decided `TASK-100-T3-FT-006-W33` closure adds current Attempt 2
functional `PASS` and required T3 `semantic-pass` evidence for the FT-006
Admin payment journal and correction controls under `FT-006-AC-010 / REQ-012 /
REQ-013 / REQ-014 / REQ-015`. See the
[FT-006 W33 closure route](../features/FT-006-financial-ledger.md#w33-admin-payment-journal-closure--2026-09-05)
and the [W33 sync report](../../.tasks/TASK-100-T3-FT-006-W33/TASK-100-T3-FT-006-W33-S-MB-SYNC-final-report-docs-01.md).

This task-scoped sync preserves the existing EP-005 lifecycle and document
status. FT-006 remains `planned` while TASK-101 remains planned; no epic or
feature lifecycle decision is inferred here.

## W34 task evidence reconciliation — 2026-09-05

The scheduler-decided `TASK-101-T3-FT-006-W34` closure adds current Attempt 1
functional `PASS` and required T3 `semantic-pass` evidence for the FT-006
personal Calendar payment-marker consumer under `FT-006-AC-011 / REQ-013 /
REQ-014`. See the [FT-006 W34 closure route](../features/FT-006-financial-ledger.md#w34-personal-calendar-payment-marker-closure--2026-09-05)
and the [W34 sync report](../../.tasks/TASK-101-T3-FT-006-W34/TASK-101-T3-FT-006-W34-S-MB-SYNC-final-report-docs-01.md).

This task-scoped sync preserves the existing EP-005 lifecycle and document
status. FT-006 remains `planned`; REQ-013 remains `verified`, shared REQ-014
remains `planned`, and no epic or feature lifecycle decision is inferred here.
