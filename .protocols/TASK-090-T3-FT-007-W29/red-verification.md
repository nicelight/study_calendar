---
description: Current adversarial semantic verification for TASK-090-T3-FT-007-W29 Attempt 1.
status: final
---
# Red Verification — TASK-090-T3-FT-007-W29

## Semantic target

- Task outcome: `FT-007-AC-005 / REQ-014 / REQ-017`; Financial Ledger returns
  the authorized student's numeric factual payment capability from counted
  Payment Allocations, using strict factual payment date before the current
  actual lesson date, without changing financial state.
- Accepted boundary: Financial Ledger owns payment, allocation, charge, and
  capability facts; actor identity and current class/student scope come through
  Actor Context and Financial Scope/Lesson Fact public seams. Statistics
  composition, route behavior, direct C&S persistence access, and allocation
  redesign remain outside the task.
- Lifecycle was observed as `in_progress` and was not changed.

## Evidence and adversarial coverage

- The authoritative task card, `FT-007-AC-005`, `REQ-014`, `REQ-017`, Statistics
  Projection payment-capability formula, Financial Ledger facts/failure rules,
  Actor Context, Financial Scope/Lesson Fact, Financial Projection, Access
  Control, and applicable T3 tier/closure rules were inspected completely.
- Functional `/verify` `PASS` was treated as supporting evidence only:
  `.protocols/TASK-090-T3-FT-007-W29/verification.md` and
  `.tasks/TASK-090-T3-FT-007-W29/TASK-090-T3-FT-007-W29-S-VERIFY-final-report-docs-01.md`.
  The complete Attempt 1 protocol, RED/GREEN evidence, executor report,
  verifier-owned probe, and preserved verifier fixture failure were also read.
- Current source inspection covered
  `src/lib/server/modules/financial-ledger/public.ts:548` and `:792`, the C&S
  provider at `src/lib/server/modules/center-scheduling/public.ts:766`, the
  database allocation/charge schema, and both task-owned tests. Current source
  and test SHA-256 values match the executor/functional-verifier evidence.
- Domain coverage challenged allocation-row counting across partial/excess
  replay, strict current actual-date comparison, moved lesson identity,
  no-counted/all-on-time/mixed/equal/overdue results, and exclusion after
  payment/charge cancellation. Authority coverage challenged current
  Admin/Teacher scope, revoked/removed/cross-scope denial, provider-fact
  consistency, accepted dependency direction, direct-table bypass, transaction
  behavior, and source-state preservation.
- Fresh bounded execution passed 4 files / 10 tests:
  `ft-007-payment-capability`, TASK-045 allocation semantic, TASK-046 authority
  semantic, and C&S recurring-scheduling/lesson-transfer coverage. It used only
  disposable test state; no real database or task lifecycle state was touched.
- For each of the two independent semantic focuses, fresh `Codex Luna` `xhigh`
  launch and the one permitted retry were rejected before analysis with
  `Unknown model Codex Luna`. No substitute model or claimed co-review finding
  was used; the reviewer completed both focuses locally.

## Admitted findings

- none

## Operator questions

- none

## Verdict

SEMANTIC_VERDICT: semantic-pass

## Owner handoff

- Evidence/report paths: this protocol; the task final semantic report; the
  current functional verification/report; Attempt 1 execution evidence; the
  current implementation/tests; and the direct task-linked canonical contracts.
- Recommended owner action: the scheduler/lifecycle owner may evaluate normal
  T3 closure using the existing functional PASS and this semantic PASS.
- Resume route or `n/a`: `n/a`; no implementation, specification, task card,
  lifecycle, queue/dependent, scheduler, or `/mb-sync` state was changed.
