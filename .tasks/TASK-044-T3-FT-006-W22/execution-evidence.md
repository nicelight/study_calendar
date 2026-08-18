# Execution evidence — TASK-044-T3-FT-006-W22

## Attempt 1

- Claim: `FT-006-AC-004 / REQ-010 / REQ-012 / REQ-015` — authorized attendance
  transitions produce deterministic Financial Ledger charge/allocation/balance
  and audit consequences, or leave financial state unchanged on failure.
- Actual change surface: `tests/financial-ledger/task-044-attendance-reconciliation.test.ts`.
  No production, Learning Progress, Center & Scheduling, route, or real DB file
  was changed.
- Hard boundary: satisfied; the new test is inside `tests/financial-ledger/`.
  Forbidden scope was not touched.
- Source ownership inspection: Learning Progress calls the public
  `reconcileLessonCharge` boundary and owns attendance; financial charge,
  allocation, and audit writes remain in Financial Ledger.

## Claim-linked path

- Initial command: `npm run test -- --run tests/financial-ledger/task-044-attendance-reconciliation.test.ts`.
  The first run failed only because the new harness expected one group charge
  while creating two; this was a test assertion mismatch, not claim-specific
  RED. The assertion was corrected without production changes.
- Corrected claim probe: same command, exit 0; 1 file / 1 test passed.
- Exact observations: individual payment `15` allocated `10.125` and `4.875`
  oldest-first with balance `5.25`; cancellation moved `10.125` to the later
  charge and balance `-4.875`; reactivation restored the original allocation
  and balance. Group charges remained exact and audited. Failed price
  resolution and outsider authorization preserved charge/allocation/audit
  counts; unrelated student replay was unchanged; a second fresh database
  produced identical history.
- No production behavior change followed the corrected pre-implementation
  GREEN result; no artificial RED was manufactured.

## Required gates

- `npm run check` — exit 0; `svelte-check found 0 errors and 0 warnings`.
- `npm run build` — exit 0; production client/server bundles completed.
- `npm run test` — exit 0; 39 files / 158 tests passed.
- `git diff --check` — exit 0.

The worktree was broadly dirty from the surrounding autopilot run and user
changes, so no executor gate is offered as an independent `/verify` reuse
receipt.

## Handoff

- Next owner: `/verify TASK-044-T3-FT-006-W22`.
- Keep lifecycle `in_progress`; `/exe` does not close T3 tasks.
- After functional PASS, run `/red-verify TASK-044-T3-FT-006-W22`.
