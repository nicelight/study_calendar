---
description: Epic for monetary charges, payments, allocation, audit, and balance projection.
status: draft
type: epic
id: EP-005
lifecycle: planned
---
# EP-005 — Financial Ledger

## Value
Центр ведёт воспроизводимый денежный баланс ученика: цена фиксируется в
начислении, платежи гасят старейшие долги, частичные суммы и аванс не теряются,
а исправления остаются проверяемыми.

## Scope
- [.memory-bank/features/FT-006-financial-ledger.md](../features/FT-006-financial-ledger.md)

## Requirements
- REQ-010, REQ-011, REQ-012, REQ-013, REQ-014, REQ-015, REQ-016.

## Success / acceptance
- Полная, частичная и избыточная оплаты дают точный детерминированный баланс.
- Историческая цена, attendance corrections, permissions, audit и payment
  marker projection соответствуют PRD.

## Source / constraints
- [.memory-bank/prd.md](../prd.md#payments-and-balance), `FR-FIN-*`,
  `NFR-FIN-*`, `NFR-QA-*`, Constitution financial correctness.
