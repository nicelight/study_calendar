---
description: Bounded task-planning resume state for FT-005.
status: active
---
# FT-005 Task Planning Plan

## Outcome and scope

Deliver class-visible homework completion, private accepted-scale grades, the
authorized lesson-scoped personal grade query, and attendance with financially
correct absent-to-present reconciliation.

## Canonical inputs and ownership

- Feature: [.memory-bank/features/FT-005-learning-progress.md](../../.memory-bank/features/FT-005-learning-progress.md)
- Primary owner: Learning Progress at `src/lib/server/modules/learning-progress/`.
- Boundaries: [Personal Progress Query](../../.memory-bank/contracts/boundary-map.md#personal-progress-query-boundary) and [Attendance Charge Reconciliation](../../.memory-bank/contracts/boundary-map.md#attendance-charge-reconciliation-boundary).
- Financial rules: [.memory-bank/contracts/financial-ledger.md#financial-facts-and-invariants](../../.memory-bank/contracts/financial-ledger.md#financial-facts-and-invariants)
- Planning authority: [.memory-bank/spec-backbone.md](../../.memory-bank/spec-backbone.md), Global Backbone `complete`, Planning Revision `2`.

## Boundary and waves

1. `TASK-009-T3-FT-005-W5` owns homework completion and grade scale/privacy (AC-001, AC-002).
2. `TASK-010-T3-FT-005-W6` owns attendance eligibility and atomic reconciliation (AC-003, AC-004), after scheduling and ledger charge foundations.
3. `TASK-018-T3-FT-005-W8` owns the authorized lesson-scoped personal grade
   query, provider-owned homework selection, and privacy proof under AD-007,
   after TASK-009 and TASK-006.

Learning Progress owns attendance; Financial Ledger owns charge, allocation, balance, and audit writes.

## Verification

Run native gates with claim-linked paths: AC-001 class-visible completion,
AC-002 accepted grade scale/privacy, AD-007 lesson-scoped provider query,
AC-003 both-mode charge eligibility, and AC-004 atomic historical-price
reconciliation/audit/isolation. TASK-009 and TASK-010 evidence remains
evidence for their original outcomes only.

## W8 card completeness correction

`TASK-018-T3-FT-005-W8` is the sole owner of the Revision 2 provider outcome.
Its direct canonical inputs are the accepted
[System Architecture](../../.memory-bank/architecture/system-architecture.md),
[Boundary Map](../../.memory-bank/contracts/boundary-map.md),
[Access Control](../../.memory-bank/contracts/access-control.md),
[Core Domain](../../.memory-bank/domains/core-domain.md),
[Lifecycle Map](../../.memory-bank/states/lifecycle-map.md), and
[Testing Strategy](../../.memory-bank/testing/strategy.md), selected through
the [Spec Index](../../.memory-bank/spec-index.md) and
[Spec Backbone](../../.memory-bank/spec-backbone.md).

The card's hard write boundary is limited to the Learning Progress module and
its focused tests. It preserves dependencies on TASK-009 and TASK-006, exact
identity/tier/wave/status intent (`TASK-018-T3-FT-005-W8`, `T3`, `W8`,
`planned`), and explicitly forbids TASK-014 and its evidence surfaces.
The provider receives `lessonId` and server-resolved actor/context, owns
selection, and proves the deterministic cardinality path: one candidate yields
the selected grade (or null when its grade row is absent), zero yields null/no
grade, and multiple yields `ambiguous-homework-selection` with no grade.
The task card carries the exact `FT-005-AC-002` RED/GREEN evidence handoff,
isolated state-before/state-after, safe rerun/cleanup, native gates, and
verifier artifact paths; no implementation, execute/verify, lifecycle, or
retry-budget action is included here.

## Revision 2 reconciliation

The provider contract is explicit: Learning Progress receives `lessonId` and
server-resolved actor/context, selects homework internally, and returns a
personal grade projection. No existing lifecycle or evidence changed; the new
provider task is planned and requires fresh review before execution.
