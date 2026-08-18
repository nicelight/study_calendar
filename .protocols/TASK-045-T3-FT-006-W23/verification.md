---
description: Independent functional verification for TASK-045-T3-FT-006-W23.
status: active
---
# Verification — TASK-045-T3-FT-006-W23

## What was verified

- Task outcome: Financial Ledger allocates payments oldest-first with exact
  partial remainder, excess advance, charge states, and deterministic balance.
- Feature / AC / REQ: `FT-006-AC-002`, `FT-006-AC-003` / `REQ-012`, `REQ-015`.
- Task remains `in_progress`; verification changed no lifecycle state.

## Verification basis

- Direct normative basis: `.memory-bank/contracts/financial-ledger.md#financial-facts-and-invariants`,
  `.memory-bank/contracts/financial-ledger.md#public-commands-and-queries`,
  `.memory-bank/domains/core-domain.md#persistence-and-transaction-rules`.
- Task basis: purpose, success outcome, anti-goals, constraints, invariants,
  and FT-006-AC-002/AC-003 verification targets.
- Hard scope: verifier probe is inside `tests/financial-ledger/`; no routes,
  consumer modules, or `study-calendar.db` were touched.

## Executor claim path

- Attempt 1 mapped both claims in `.protocols/TASK-045-T3-FT-006-W23/progress.md`.
- The executor probe was already GREEN before any production change, so no
  artificial RED was manufactured; the existing implementation was retained.
- Supporting executor evidence:
  `.tasks/TASK-045-T3-FT-006-W23/execution-evidence.md`.

## Reused execute evidence

- None. The worktree is broadly dirty, so executor receipt reuse was ineligible;
  verifier-owned gates were rerun independently.

## New targeted probe

- Verifier-owned probe:
  `tests/financial-ledger/task-045-payment-allocation-verifier.test.ts`.
- Command: `npm run test -- --run tests/financial-ledger/task-045-payment-allocation-verifier.test.ts`.
- Result: exit 0; 1 file / 1 test passed.
- Method: fresh disposable `:memory:` SQLite state, distinct fixture and
  decimal values, fixed admin actor/scope/clock, public price/attendance/
  payment/projection calls, explicit cleanup, and second fresh-database replay.
- Observed values: two overdue `8.875` charges; payment `10.125` allocated
  `8.875` oldest-first and `1.25` to the newer charge, leaving exact remainder
  `7.625`; payment `8` completed the newer charge with exact advance `0.375`
  and balance `-0.375`.

## Task-scoped checklist

- [x] `FT-006-AC-002 / REQ-012 / REQ-015`: oldest uncovered charge received
  allocation first and replay was identical in a second isolated database.
- [x] `FT-006-AC-003 / REQ-012 / REQ-015`: partial, paid, overdue, remaining,
  excess, and balance values were exact and persisted through projection.
- [x] Ownership / anti-goal: public Financial Ledger commands were used; a
  read-only source scan found no direct financial-table writes in routes or
  consumer modules.

## Repeated checks

- `npm run check` — exit 0; 0 errors and 0 warnings.
- `npm run build` — exit 0; production client/server bundles completed.
- `npm run test` — exit 0; 43 files / 162 tests passed.
- `git diff --check` — exit 0.

These checks were rerun because T3 requires fresh verifier-owned outcome proof
and executor receipt reuse was not eligible.

## Regression / non-goals

- Payment authority, editing/cancellation, markers, retry/idempotency, routes/UI,
  attendance persistence, and consumer writes are not claimed by this task.
- No production correction was required by the accepted claims.

## Verdict

VERDICT: PASS

## Handoff

- Recommended next action: `/red-verify TASK-045-T3-FT-006-W23`.
- Lifecycle change by verifier: none.
- Scheduler must retain `in_progress` until semantic verification and closure.
