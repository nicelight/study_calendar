# Executor Evidence — TASK-045-T3-FT-006-W23

## Attempt 1

- Executor lifecycle: `ready -> in_progress`; no retry consumed.
- Hard write boundary respected: only `tests/financial-ledger/` was changed;
  no production correction was required because the existing Financial Ledger
  implementation already satisfied the mapped allocation path.
- Fresh claim probe: `tests/financial-ledger/task-045-payment-allocation.test.ts`.
- RED/GREEN policy path: the pre-implementation probe was already GREEN
  (1 file / 1 test passed), so no artificial RED was manufactured.

## Claim-linked observations

- `FT-006-AC-002 / REQ-012 / REQ-015`: oldest-first allocation produced exact
  `10.125`, `2.22`, and `7.905` allocations; the same factual sequence replayed
  identically in a second isolated database.
- `FT-006-AC-003 / REQ-012 / REQ-015`: the partial remainder stayed at
  `7.905`, the final payment marked both charges `paid`, excess became advance
  `2.095`, and the resulting balance was `-2.095`; initial uncovered charges
  were `overdue`.
- Public API and isolated-state evidence: the probe used public
  `createPayment` and projection calls with disposable `:memory:` SQLite,
  fixed actor/scope/clock, explicit cleanup, and no consumer writes.

## Gates

- `npm run check` — PASS; `svelte-check found 0 errors and 0 warnings`.
- `npm run build` — PASS; adapter-auto informational output only.
- `npm run test` — PASS; 42 files / 161 tests.
- `git diff --check` — PASS.
- Read-only ownership scan over routes and consumer modules found no direct
  financial-table writes or bypasses.

## Handoff

Executor evidence is complete. The task is ready for independent `/verify`
using the task-scoped claims and hard boundary above.
