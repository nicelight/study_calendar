# Execution evidence — TASK-043-T3-FT-006-W22

## Attempt 1

- Claim: `FT-006-AC-001 / REQ-011` — historical applied default/student
  prices are persisted exactly and later settings affect only future charges.
- Actual change surface: `tests/financial-ledger/task-043-historical-applied-price.test.ts`.
  No production file, route, Center & Scheduling module, or real database was
  changed.
- Hard boundary: satisfied; the new file is inside
  `tests/financial-ledger/`. Forbidden scope was not touched.
- Source ownership inspection: financial price/charge `INSERT`/`UPDATE`
  statements are confined to `src/lib/server/modules/financial-ledger/public.ts`
  (schema creation remains in the shared database owner); no consumer or route
  bypass was found.

## Claim-linked path

- Initial focused probe: `npm run test -- --run tests/financial-ledger/task-043-historical-applied-price.test.ts`
  — exit 0; 1 file / 1 test passed before any production behavior change.
  This is pre-implementation GREEN because the accepted behavior was already
  present; no artificial failing setup was introduced.
- Exact observations: early default `10.125` and override `7.5` remained
  unchanged after settings `12.34` and `8.75` were added; future charges used
  only the later settings; raw persisted values matched; same-state rerun kept
  the historical value.

## Required gates

- `npm run check` — exit 0; `svelte-check found 0 errors and 0 warnings`.
- `npm run build` — exit 0; production client/server bundles completed.
- `npm run test` — exit 0; 36 files / 155 tests passed.
- `git diff --check` — exit 0.

The worktree was already broadly dirty from the surrounding autopilot run and
user changes, so no gate is offered as an independent `/verify` reuse receipt.
The fresh verifier must rerun the required gates and claim probe.

## Handoff

- Next owner: `/verify TASK-043-T3-FT-006-W22`.
- Keep lifecycle `in_progress`; `/exe` does not close T3 tasks.
- After functional PASS, run `/red-verify TASK-043-T3-FT-006-W22`.
