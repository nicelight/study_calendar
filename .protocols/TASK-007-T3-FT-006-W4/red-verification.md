---
description: Current Attempt 2 adversarial semantic verification for TASK-007-T3-FT-006-W4.
status: final
---
# Red Verification — TASK-007-T3-FT-006-W4 — Attempt 2

## Semantic target

- Task-owned outcome: `FT-006-AC-001` and `FT-006-AC-004` must preserve the
  historical applied price and provide deterministic attendance/charge
  correction replay with exact balance, persisted allocations, and audit
  author/time/change evidence.
- Canonical meaning and boundaries: Financial Ledger owns price, charge,
  payment-allocation, balance, and financial-audit state; the shared database
  is the source of truth; authorization is server-side through Identity &
  Access plus the Center & Scheduling scope boundary.

## Evidence and adversarial coverage

- Current functional Attempt 2 `PASS` in
  `.tasks/TASK-007-T3-FT-006-W4/TASK-007-T3-FT-006-W4-S-VERIFY-final-report-docs-02.md`
  and `.protocols/TASK-007-T3-FT-006-W4/verification.md` was treated as
  supporting input only. Attempt 1 `report-01` remains historical correction
  basis only.
- Independently inspected the indexed T3 task, tier obligations and closure
  authority, direct task-linked Financial Ledger and Boundary Map contracts,
  Core Domain persistence rules, lifecycle/access contracts, current Attempt 2
  source/schema/test change surface, and executor evidence.
- Fresh command `npx vitest run tests/financial-ledger/historical-charges.test.ts
  --reporter=verbose` exited 0 with one file and two tests passed. The current
  probe covers exact default/override snapshots, later-setting isolation,
  persisted oldest-first allocation, cancellation reallocation, reactivation,
  exact balance, identical replay in a second fresh database, audit
  before/after author/time facts, and denied-mutation state preservation.
- Allocation/balance recomputation: active Charges are ordered by lesson
  date/identity, recorded Payments by factual date/identity, persisted
  Allocations are rebuilt oldest-first with exact scaled `BigInt` arithmetic,
  and Balance is recomputed from the same persisted Charge/Payment facts,
  including the exact advance after cancellation.
- Payment-history foundation ownership: schema ownership and all production
  Payment/Allocation reads and writes remain inside the shared schema owner and
  Financial Ledger boundary. The direct Payment insert is confined to the
  isolated historical-input fixture; no payment command, edit/cancel command,
  marker, idempotency behavior, or TASK-008 acceptance claim was adopted.
- Atomicity: actor/scope validation, Charge transition, audit insertion,
  Allocation delete/rebuild, and returned replay execute inside one
  `SharedDatabase.transaction`; any supported-path exception rolls back the
  command rather than exposing partial financial mutation.
- Deterministic replay: stable persisted ordering, canonical decimal strings,
  immutable applied price on reactivation, and the second fresh-database replay
  produce the same Charges, Allocations, Balance, and audit change sequence.
- Authorization: the command resolves a current server-side actor, permits only
  Admin/Teacher roles, delegates center/class/student/lesson authorization to
  the accepted Center & Scheduling scope port, rejects unresolved/mismatched
  targets, and the focused denial path preserves financial state.
- Hard scope: no `runtime_context.write_boundary` is present; both forbidden
  Foundation task records are unchanged. The Attempt 2 delta stays in Financial
  Ledger schema/boundary/test evidence and does not write Scheduling,
  Attendance, UI, HTTP, lifecycle, scheduler, or dependent-task state.

## Admitted findings

None. No material accepted-outcome break or operator-owned decision remained
after current-source adversarial coverage.

## Operator questions

None.

## Verdict

SEMANTIC_VERDICT: semantic-pass

## Owner handoff

- Evidence/report paths: this protocol and
  `.tasks/TASK-007-T3-FT-006-W4/TASK-007-T3-FT-006-W4-S-RED-VERIFY-final-report-docs-02.md`.
- Recommended owner action: the active lifecycle owner may record this current
  Attempt 2 semantic gate and evaluate T3 closure under tier policy. This
  verifier did not close, fail, block, reopen, promote, or synchronize the
  task.
- Resume route: lifecycle owner/scheduler; no implementation or workflow
  mutation is required by this review.
