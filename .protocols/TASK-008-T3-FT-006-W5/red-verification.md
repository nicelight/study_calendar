---
description: Current Attempt 2 adversarial semantic verification for TASK-008-T3-FT-006-W5.
status: final
---
# Red Verification — TASK-008-T3-FT-006-W5 — Attempt 2

## Semantic target

- Current Attempt 2 must satisfy the task-owned outcomes for
  `FT-006-AC-002`, `FT-006-AC-003`, `FT-006-AC-005`, `FT-006-AC-006`, and
  `FT-006-AC-007`: exact deterministic allocation, correct payment correction
  and audit, role/center authority, non-mutating marker projection, and retry
  safety.
- The Financial Projection Query Boundary must keep a bounded
  `getBalanceProjection(range)` internally consistent: returned and
  state-affecting allocations must be linked to dates inside the requested
  range.
- Financial Ledger remains the sole writer of financial state; every protected
  command/query must resolve the server-side actor and current
  Center & Scheduling scope.

## Historical correction basis

- Attempt 1 semantic-fail and report-01 remain unchanged and are retained only
  as the correction basis for the bounded projection defect.
- The current review did not reuse Attempt 1's verdict. Attempt 2's source,
  functional `PASS` report-02, and current correction evidence were evaluated
  independently.

## Evidence and adversarial coverage

- Indexed task identity, T3 tier obligations, closure authority, direct
  task-linked canonical contracts, current Attempt 2 handoff, and the current
  functional verification report-02 were inspected.
- Current source review covered
  `src/lib/server/modules/financial-ledger/public.ts`, the
  Center & Scheduling financial scope/date ports, composition wiring, and the
  shared financial schema. Financial writes are confined to Financial Ledger;
  the public commands and projection re-check Identity & Access plus current
  class/student scope.
- The Attempt 2 correction evidence was checked at
  `.tasks/TASK-008-T3-FT-006-W5/execution-evidence.md#attempt-2-correction-red`
  and `#attempt-2-claim-equivalent-green`. The implementation now joins each
  allocation to its Payment factual date and Charge lesson date, and bounded
  projection filters those linked dates before both charge-state calculation
  and returned allocation projection.
- Fresh verifier-owned execution of
  `.tasks/TASK-008-T3-FT-006-W5/verifier-probe-02.test.ts` and the real-boundary
  probe passed `6/6`. The bounded probe confirmed that a January Payment
  allocated across January and February Charges is absent from the February
  projection, cannot make the February Charge partially paid, and remains
  correctly represented by a January-only projection.
- Hostile coverage also exercised or inspected oldest-first exact arithmetic,
  partial/paid/overdue/advance states, Admin/Teacher/cross-center authority,
  Admin recomputation and audit, same-confirmation retry behavior, multiple
  month-boundary markers, non-mutation, transaction boundaries, and the
  production financial-writer/dependency surface.

## Admitted findings

none.

## Operator questions

none.

## Verdict

SEMANTIC_VERDICT: semantic-pass

## Owner handoff

- Evidence/report paths: this protocol; current functional evidence in
  `.protocols/TASK-008-T3-FT-006-W5/verification.md`; current semantic report
  `.tasks/TASK-008-T3-FT-006-W5/TASK-008-T3-FT-006-W5-S-RED-VERIFY-final-report-docs-02.md`;
  correction evidence in `.tasks/TASK-008-T3-FT-006-W5/`.
- Recommended owner action: record this current T3 semantic result as the
  semantic gate outcome and evaluate task closure through the existing
  lifecycle owner. No semantic repair, replan, or operator decision is
  required.
- Lifecycle, scheduler status, dependent promotion, and Memory Bank
  synchronization were not changed by this review.
