---
description: Claim-linked execution evidence for TASK-008-T3-FT-006-W5 Attempt 1.
status: final
---
# Execution Evidence — TASK-008-T3-FT-006-W5

## Attempt 1 — pre-implementation RED

- Claim mapping: `FT-006-AC-002`, `FT-006-AC-003`, `FT-006-AC-005`, `FT-006-AC-006`, `FT-006-AC-007`.
- Command: `npx vitest run tests/financial-ledger/payments.test.ts --reporter=verbose`
- CWD: `/home/serg/Projects/study_calendar`
- Declared source basis immediately before probe: repository revision `cc8bf5a2331075576df23ee3d51fecfab4086f6d`; pre-existing dirty worktree preserved, including the task's current Financial Ledger foundation and `tests/financial-ledger/payments.test.ts`; no task-owned production payment command implementation was present.
- Completed at: `2026-08-08 18:42:24 +0500`
- Exit code: `1`
- Result: `1` file ran; `5` tests failed.
- Observation: all five AC-specific scenarios reached their first payment command assertion after fixture setup and failed at `harness.api.createPayment is not a function`. The current `FinancialLedgerBoundary` had no public `createPayment` method, so the accepted payment-command/projection claims were genuinely absent. This was not an import, syntax, setup, unrelated, or artificial failure.
- Isolation/cleanup: the probe uses the task-owned fresh `:memory:` SQLite harness and closes each database in `afterEach`; no network, credentials, production data, or external side effect was used.

The RED evidence is retained as supporting execution evidence and is not a final
functional or semantic verdict.

## Attempt 1 — implementation delta

- `src/lib/server/modules/financial-ledger/public.ts`: added public `createPayment`, `editPayment`, and `cancelPayment` commands; actor/center/class/student checks; exact canonical-decimal payment handling; durable command-confirmation idempotency; payment correction audit; deterministic oldest-first recomputation; balance/advance/state projection; and non-mutating factual-date marker projection.
- `src/lib/server/platform/database.ts`: added Financial Ledger-owned payment command/idempotency and payment-audit tables. Existing W4 charge/payment-allocation foundation was preserved.
- `src/lib/server/modules/center-scheduling/public.ts`: added the read-only `getFinancialLessonDates` port used to identify lesson days for marker placement; no scheduling state is written by Financial Ledger.
- `tests/financial-ledger/payments.test.ts`: strengthened the existing AC-002/003/005/006/007 claim probe and corrected inconsistent AC-003 expected arithmetic for its declared exact fixture.

The Financial Ledger remains the only production writer of Payment,
Allocation, balance-derived facts, marker inputs, and financial audit state.
`tests/financial-ledger/` is the only non-production direct financial fixture
writer. No `lesson-context` file was needed: marker consumers remain outside
this task and the public projection boundary is sufficient.

## Attempt 1 — claim-equivalent GREEN

- Command: `npx vitest run tests/financial-ledger/payments.test.ts --reporter=verbose`
- CWD: `/home/serg/Projects/study_calendar`
- Completed at: `2026-08-08 18:49:34 +0500`
- Exit code: `0`
- Result: `1` file ran; `5` tests passed.
- `FT-006-AC-002`: exact Payment `15` allocated `10.125` to `lesson-oldest` and `4.875` to `lesson-newer`, leaving balance `5.25`; the same command sequence in a second fresh database produced the identical projection.
- `FT-006-AC-003`: before payment both completed past Charges were `overdue`; `12.345` paid the oldest Charge and left exact `7.905` on the newer Charge; a subsequent `10` paid both and produced exact advance `2.095` and balance `-2.095`.
- `FT-006-AC-005`: Teacher edit was denied; cross-center Admin create was denied; Admin edit `10 -> 8` and cancel each recomputed persisted allocations; payment audit retained Admin actor/time and before/after states. The remaining Teacher-created `2` Payment remained allocated and balance became `18.25` after Admin cancellation.
- `FT-006-AC-006`: two Payments dated `2026-03-01` projected to `2026-02-27` because `2026-03-01` was a lesson day; both factual dates remained discoverable and counts of Payments, Allocations, and Charges were unchanged by the projection read.
- `FT-006-AC-007`: repeating the same confirmed create returned the same Payment and left count `1`; a new explicit confirmation created a second Payment and count `2`.
- Isolation/cleanup: every harness uses fresh `:memory:` SQLite, deterministic server-side actor/scope facts and clock, no network/credentials/production data, and explicit `afterEach` close.

## Probe change and strength

The initial RED used the existing AC-specific payment test surface and reached
the missing public command. The final GREEN retained that surface and the same
isolated boundary while adding fresh-database deterministic replay, exact
state/balance assertions, recomputation after correction, multiple markers,
and retry counts. The original AC-003 expected values (`3.28` remainder and
`1.72` advance) did not follow from the test's existing two `10.125` Charges
and `12.345`/`5` Payments; the probe was corrected to `7.905`, then a `10`
Payment for exact `2.095` excess. This is a claim-equivalent arithmetic
correction, not a production-contract change.

## Required gates

- `npx vitest run tests/financial-ledger/historical-charges.test.ts tests/financial-ledger/payments.test.ts --reporter=verbose` → exit `0`; `2` files / `7` tests passed.
- `npm run check` → exit `0`; `svelte-check found 0 errors and 0 warnings`.
- `npm run build` → exit `0`; production client/server bundles completed; adapter-auto emitted only its informational environment message.
- `npm run test` → exit `0`; `7` files / `26` tests passed.
- `git diff --check` → exit `0`.

## Scope and boundary evidence

- Actual task-owned implementation surface: Financial Ledger public boundary plus its additive payment-command/payment-audit schema; the Center & Scheduling lesson-date read port; and `tests/financial-ledger/payments.test.ts`.
- Advisory `touched_files` deviation: no `src/lib/server/modules/lesson-context/` change was necessary because this task owns the Financial Ledger projection boundary, while Lesson Context remains a read consumer.
- No hard `runtime_context.write_boundary` was present. Both forbidden Foundation task cards were untouched.
- Financial commands re-check actor and scope inside their transaction boundary. Teacher create-only and Admin own-center create/edit/cancel rules are enforced through Identity & Access plus Center & Scheduling facts.
- Allocation and balance use scaled `BigInt` arithmetic and persisted historical Charges/Payments; markers only read Payment and lesson-date facts.
- No external side effect, privileged action, secret/credential access, destructive operation, new dependency edge, route/UI write, or lifecycle closure occurred.
- Task remains tier `T3` and indexed status `in_progress`; `/verify`, `/red-verify`, `/mb-sync`, closure, promotion, and dependent lifecycle actions were not run.

## Reuse candidates

None. No executor result is offered as a `/verify` reuse candidate because the
required bounded-input snapshot was not captured immediately before the final
gate sequence. These are supporting execution results only.

## Attempt 2 — correction RED

- Claim mapping: Attempt 1 semantic-fail correction claim for the Financial Projection Query Boundary's bounded date-range consistency; the supported path must not return or use allocations linked to out-of-range Payment factual dates or Charge lesson dates.
- Retry basis: bounded task-local correction retry `1/2` after the preserved Attempt 1 T3 semantic-fail HIGH finding. Attempt 1 RED, functional PASS, semantic-fail, and report-01 artifacts remain unchanged and supporting-only.
- Command: `npx vitest run tests/financial-ledger/payments.test.ts --reporter=verbose -t 'keeps bounded balance projection allocations and charge state in range'`
- CWD: `/home/serg/Projects/study_calendar`
- Declared source basis immediately before probe: repository revision `cc8bf5a2331075576df23ee3d51fecfab4086f6d`; pre-existing dirty worktree preserved; Attempt 2 protocol bookkeeping and the new task-owned regression assertion were present; `public.ts` still had unbounded allocation selection in `getBalanceProjection`.
- Completed at: `2026-08-08 19:14:37 +0500`
- Exit code: `1`
- Result: `1` file ran; `1` targeted test failed and `5` unrelated tests were skipped by the filter.
- Observation: the supported public path reached the correction assertion and returned the February `lesson-newer` Charge as `partially_paid`, with allocated `4.875` and remaining `5.25`, although the January `2026-01-15` Payment was outside the requested `2026-02-01..2026-02-28` range and `payments` was empty. This was the current production behavior defect, not setup/import/syntax/artificial failure.
- Isolation/cleanup: deterministic task fixture, fresh in-memory SQLite, server-side actor/scope, and explicit `afterEach` close; no network, credentials, production data, or external side effect.

The Attempt 2 RED is retained as current correction evidence and is not a
functional or semantic verdict.

## Attempt 2 — implementation delta

- `src/lib/server/modules/financial-ledger/public.ts`: extended the internal allocation query with linked Payment `factual_date` and Charge `lesson_date`; bounded `getBalanceProjection` now filters allocations by both linked dates before calculating selected charge state and returning allocations. No-range projections retain the existing complete allocation set.
- `tests/financial-ledger/payments.test.ts`: added a supported public-path regression proving that a January Payment allocated across January/February Charges is excluded from a February-only balance projection and cannot make the February Charge appear partially paid.
- Scope preserved: Financial Ledger remains the sole financial writer and projection owner; authorization, exact arithmetic, oldest-first allocation, payment/charge commands, audit, retry, marker projection, and dependency direction were not changed.

## Attempt 2 — claim-equivalent GREEN

- Claim: the same bounded Financial Projection Query Boundary correction described in Attempt 2 RED.
- Command: `npx vitest run tests/financial-ledger/payments.test.ts --reporter=verbose -t 'keeps bounded balance projection allocations and charge state in range'`
- CWD: `/home/serg/Projects/study_calendar`
- Declared source basis immediately before GREEN: repository revision `cc8bf5a2331075576df23ee3d51fecfab4086f6d`; same pre-existing dirty worktree plus the Attempt 2 production filter and regression assertion; no unrelated source change was introduced between RED and GREEN.
- Completed at: `2026-08-08 19:15:00 +0500`
- Exit code: `0`
- Result: `1` file ran; `1` targeted correction test passed.
- Observation: the February-only projection returned only the February Charge as `overdue`, `allocatedAmount: '0'`, `remainingAmount: '10.125'`, `balance: '10.125'`, `advance: '0'`, and empty `allocations` and `payments`. The same test also preserves the supported actor/class/student scope path.
- Probe changes and rationale: the correction test was added before the production filter and remained identical for GREEN; no weakening, skipped assertion, fixture relaxation, or alternate path was introduced.
- Isolation/cleanup: fresh in-memory SQLite, deterministic actor/scope/clock, explicit close, no external side effect.

The Attempt 2 GREEN is executor supporting evidence; it does not close the T3
task or replace independent `/verify` and `/red-verify` evidence.

## Attempt 2 — required gates

- `npx vitest run tests/financial-ledger/payments.test.ts --reporter=verbose` → exit `0`; `1` file / `6` tests passed.
- `npx vitest run tests/financial-ledger/historical-charges.test.ts tests/financial-ledger/payments.test.ts --reporter=verbose` → exit `0`; `2` files / `8` tests passed.
- `npm run check` → exit `0`; `svelte-check found 0 errors and 0 warnings`.
- `npm run build` → exit `0`; production client/server bundles built; adapter-auto emitted only its informational environment message.
- `npm run test` → exit `0`; `7` files / `27` tests passed.
- `git diff --check` → exit `0`.

No Attempt 2 command is offered as a `/verify` reuse candidate: a compliant
bounded-input snapshot was not captured immediately before the full gate
sequence. All Attempt 2 executor results remain supporting evidence.
