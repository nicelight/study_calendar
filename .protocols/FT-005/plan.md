---
description: Bounded task-planning resume state for FT-005.
status: active
---
# FT-005 Task Planning Plan

## Outcome and scope

Deliver class-visible homework completion, private accepted-scale grades, and attendance with financially correct absent-to-present reconciliation.

## Canonical inputs and ownership

- Feature: [.memory-bank/features/FT-005-learning-progress.md](../../.memory-bank/features/FT-005-learning-progress.md)
- Primary owner: Learning Progress at `src/lib/server/modules/learning-progress/`.
- Boundaries: [Personal Progress Query](../../.memory-bank/contracts/boundary-map.md#personal-progress-query-boundary) and [Attendance Charge Reconciliation](../../.memory-bank/contracts/boundary-map.md#attendance-charge-reconciliation-boundary).
- Financial rules: [.memory-bank/contracts/financial-ledger.md#financial-facts-and-invariants](../../.memory-bank/contracts/financial-ledger.md#financial-facts-and-invariants)

## Boundary and waves

1. `TASK-009-T3-FT-005-W5` owns homework completion and grade scale/privacy (AC-001, AC-002).
2. `TASK-010-T3-FT-005-W6` owns attendance eligibility and atomic reconciliation (AC-003, AC-004), after scheduling and ledger charge foundations.

Learning Progress owns attendance; Financial Ledger owns charge, allocation, balance, and audit writes.

## Verification

Run native gates with claim-linked paths: AC-001 class-visible completion, AC-002 accepted grade scale/privacy, AC-003 both-mode charge eligibility, and AC-004 atomic historical-price reconciliation/audit/isolation. Each card records separate RED/GREEN observations and artifacts for its owned ACs.
