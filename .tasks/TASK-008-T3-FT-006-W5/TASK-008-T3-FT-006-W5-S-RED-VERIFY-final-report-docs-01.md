---
description: Current Attempt 1 adversarial semantic verification report for TASK-008-T3-FT-006-W5.
status: final
---
# Red Verify — TASK-008-T3-FT-006-W5 — Attempt 1

## Result

Current Attempt 1 does not satisfy the semantic projection contract. A fresh
supported-path probe proved that `getBalanceProjection(range)` returns an
Allocation outside the requested date range while omitting the corresponding
Payment. The current functional `PASS` remains supporting evidence only.

## Evidence

- Semantic protocol: `.protocols/TASK-008-T3-FT-006-W5/red-verification.md`.
- Functional evidence: `.protocols/TASK-008-T3-FT-006-W5/verification.md` and
  `.tasks/TASK-008-T3-FT-006-W5/TASK-008-T3-FT-006-W5-S-VERIFY-final-report-docs-01.md`.
- Normative basis: indexed task card; T3 tier policy; Financial Ledger,
  Access Control, Boundary Map, Lifecycle Map, Core Domain, and System
  Architecture contracts linked by the task.
- Current implementation surface:
  `src/lib/server/modules/financial-ledger/public.ts`,
  `src/lib/server/modules/center-scheduling/public.ts`,
  `src/lib/server/platform/database.ts`, and
  `tests/financial-ledger/payments.test.ts`.
- Adversarial result: with a January Charge and Payment, a February-only
  `getBalanceProjection` returned no selected Payment but returned the January
  Allocation. The implementation filters Charges/Payments by range but leaves
  Allocations unbounded and uses them for selected charge-state projection.

## Findings

- **HIGH** — repair the range consistency of `getBalanceProjection`: the
  current public query can return out-of-range Allocations and a state that
  cannot be reconciled with the returned Payments/Charges. This materially
  breaks the accepted student/date-range Financial Projection Query Boundary.

## Reviewer report

- verdict: `REQUEST_CHANGES`
- findings: one actionable HIGH semantic finding described above.
- evidence_checked: current Attempt 1 source, task-linked contracts and tier
  policy, current functional `PASS`, actual payment/schema/boundary surface,
  and a fresh supported-path disposable range probe.
- risks_or_questions: none requiring an operator interpretation.

## Failure / Blocker

- status: semantic-fail
- where: `src/lib/server/modules/financial-ledger/public.ts:442-497` and
  `:714-726`
- expected: date-range balance projection is internally range-consistent.
- observed: February-only output omitted the January Payment but included its
  January Allocation and used unbounded allocations in charge-state projection.
- likely category: financial projection range/data consistency
- next action: lifecycle owner keeps the task open, routes the task-local
  correction, and reruns fresh `/verify` followed by `/red-verify`.
- replan required: no.

## Owner action

No task status, scheduler state, closure, promotion, dependency, or
Memory Bank synchronization was changed by this review.

SEMANTIC_VERDICT: semantic-fail
