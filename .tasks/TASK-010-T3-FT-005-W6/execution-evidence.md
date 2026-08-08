---
description: Execution evidence for TASK-010-T3-FT-005-W6.
status: active
---
# Execution Evidence — TASK-010-T3-FT-005-W6

## Attempt 1 — recovery

- status: active
- claim scope: `FT-005-AC-003`, `FT-005-AC-004`
- preflight: indexed `T3` task is `in_progress`; dependencies `TASK-006` and `TASK-007` are `done`; Planning Revision/review approval is current at `1`; no hard write boundary; forbidden Foundation task paths untouched.
- prospective RED: `node_modules/.bin/vitest run tests/learning-progress/attendance-red-probe.test.ts --reporter=verbose` → exit `1`; 1 file / 2 claim-specific tests failed at the absent `LearningProgressBoundary.recordAttendance` public surface. The test loaded the real composition root and called the intended attendance behavior; it was not a setup/import/syntax failure. This RED supports both AC-003 and AC-004 before production changes.
- implementation: `src/lib/server/modules/learning-progress/public.ts`, `src/lib/server/platform/database.ts`, `src/lib/server/modules/financial-ledger/public.ts`, and `src/lib/server/composition-root.ts` now implement the accepted attendance owner and transaction-preserving reconciliation integration; `tests/learning-progress/attendance-red-probe.test.ts` is the task-owned disposable GREEN probe.

## Attempt 1 — claim-equivalent GREEN

- command: `node_modules/.bin/vitest run tests/learning-progress/attendance-red-probe.test.ts --reporter=verbose`
- result: exit `0`; 1 file / 2 tests passed.
- AC-003 observation: `absent` persisted attendance without a charge in individual and group lessons; `present` created active charges using `12.5` and `20` historical prices even after later `99` settings; student-two remained uncharged.
- AC-004 observation: authorized absent→present transitions created historical `10.125` charges, deterministically allocated the existing `15` payment oldest-first, produced balances `-4.875` then `5.25`, recorded two `charge-created` audit records with actor/time/before-after facts, and left student-two unchanged. Missing-price provider failure rolled back the attendance transition and left financial charges empty. Student session was denied attendance write.
- isolation: fresh in-memory database, deterministic fixture, explicit close, no network/credentials/production data.

## Required gates

- focused claim test → exit `0`; 1 file / 2 tests passed.
- `npm run check` → exit `0`; 0 errors / 0 warnings.
- `npm run build` → exit `0`; client and SSR bundles built.
- `npm run test` → exit `0`; 10 files / 35 tests passed.
- `git diff --check` → exit `0`.

## Reuse candidate

- none; broad dirty/untracked workspace inputs prevent a conservatively bounded current-attempt receipt.
