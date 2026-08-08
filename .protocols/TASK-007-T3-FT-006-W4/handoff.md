---
description: Implementer retry handoff for TASK-007-T3-FT-006-W4.
status: final
---
# Handoff — TASK-007-T3-FT-006-W4

## Summary

- Attempt 2 / bounded retry 1/2 completed the report-01 correction for task-owned `FT-006-AC-004`. Financial Ledger now recomputes and persists deterministic oldest-first Allocation and exact Balance from durable historical Charges and Payments whenever an attendance correction creates, cancels, or reactivates a Charge.
- `FT-006-AC-001` remains preserved: applied historical prices are immutable and later settings affect only future Charges.
- Attempt 1 and functional report-01 `FAIL` remain unchanged as historical supporting/correction evidence. Lifecycle remains `in_progress`.

## Current correction evidence

- claim mapping: `FT-006-AC-004` corrected; `FT-006-AC-001` regression-preserved
- retained RED / failed gate: `.tasks/TASK-007-T3-FT-006-W4/execution-evidence.md#retained-red-and-correction-basis`
- retry RED: `.tasks/TASK-007-T3-FT-006-W4/execution-evidence.md#claim-scoped-correction-red`
- current GREEN and gates: `.tasks/TASK-007-T3-FT-006-W4/execution-evidence.md#fresh-claim-equivalent-green`
- retry report: `.tasks/TASK-007-T3-FT-006-W4/TASK-007-T3-FT-006-W4-S-EXE-RETRY-final-report-code-02.md`
- reuse candidates: none; all execution results are supporting evidence only

## Current result

- Before correction, Payment `15` is persisted as `10.125 + 4.875` allocations across the two oldest exact `10.125` Charges; Balance is `5.25`.
- Cancelling the oldest Charge persists a `10.125` allocation to the remaining Charge and Balance `-4.875`; reactivation restores the original two allocations and Balance `5.25`.
- A second fresh database produces the identical charge/allocation/balance/audit history. Audit retains author, time, and before/after Charge change; denied mutation preserves Charge, Allocation, and audit counts.

## Files and boundaries

- production: `src/lib/server/modules/financial-ledger/public.ts`, Financial Ledger schema delta in `src/lib/server/platform/database.ts`
- probe: `tests/financial-ledger/historical-charges.test.ts`
- protocol/evidence: current `.protocols/TASK-007-T3-FT-006-W4/` and `.tasks/TASK-007-T3-FT-006-W4/`
- hard `write_boundary`: absent; forbidden TASK-001/TASK-002 task cards untouched
- no Payment command/authority, edit/cancel, marker, idempotency, Scheduling, Attendance, HTTP/UI, closure, or dependent behavior was added

## Gates

- `npx vitest run tests/financial-ledger/historical-charges.test.ts` → `2/2` passed
- `npm run check` → 0 errors / 0 warnings
- `npm run build` → exit 0
- `npm run test` → `17/17` passed
- `git diff --check` → exit 0

## Next action

- Fresh independent `/verify TASK-007-T3-FT-006-W4` against Attempt 2. This retry did not run `/verify`, `/red-verify`, `/mb-sync`, closure, promotion, or another workflow skill.
