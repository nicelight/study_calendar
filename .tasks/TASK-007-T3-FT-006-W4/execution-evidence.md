---
description: Claim-linked execution evidence for TASK-007-T3-FT-006-W4 Attempts 1 and 2.
status: final
---
# Execution Evidence — TASK-007-T3-FT-006-W4

## Attempt 1

### Pre-implementation RED

- Claim mapping: `FT-006-AC-001`, `FT-006-AC-004`.
- Command: `npx vitest run tests/financial-ledger/historical-charges.test.ts`
- CWD: `/home/serg/Projects/study_calendar`
- Completed at: 2026-08-08T16:50:31+05:00
- Exit code: `1`
- Result: `1` test file failed; `2` tests failed.
- FT-006-AC-001 observation: the isolated database returned no `financial_price_settings` or `financial_lesson_charges` tables.
- FT-006-AC-004 observation: the isolated database returned no `financial_lesson_charges` or `financial_audit_records` tables.
- Credibility: both tests imported and executed successfully through their claim assertions. The failures directly observed the absence of the durable Financial Ledger facts required for historical price snapshots and auditable correction replay; no setup, syntax, unrelated, or artificial failure was used.
- Isolation/cleanup: a new `:memory:` SQLite database was opened per test and closed in `afterEach`; no external system or production data was accessed.

### Implementation delta

- `src/lib/server/platform/database.ts`: added Financial Ledger-owned price-setting, lesson-charge, and financial-audit durable tables plus owner-query indexes. Pre-existing provider, center, class, membership, assignment, and link schema is dependency/baseline work and is not claimed by TASK-007.
- `src/lib/server/modules/financial-ledger/public.ts`: added the Financial Ledger public owner boundary. It resolves actors through Identity & Access, consumes class/student/lesson facts through an injected Center & Scheduling-facing typed port, persists only financial state in one transaction, canonicalizes exact positive decimal strings, snapshots the applicable effective default/override price, and performs idempotent active/cancelled charge reconciliation with audit facts.
- `tests/financial-ledger/historical-charges.test.ts`: retained two AC-specific tests and strengthened the RED schema assertions into full claim-equivalent isolated integration scenarios.

Payment creation/allocation/advance/markers remain TASK-008-owned. Scheduling/lesson persistence remains TASK-006-owned. The TASK-007 replay exposes an empty allocation list for its no-payment foundation scenario and proves exact active-charge balance; it does not claim downstream payment-allocation behavior.

### Claim-equivalent GREEN

- Command: `npx vitest run tests/financial-ledger/historical-charges.test.ts`
- CWD: `/home/serg/Projects/study_calendar`
- Completed at: 2026-08-08T16:55:13+05:00
- Exit code: `0`
- Result: `1` test file passed; `2` tests passed.

#### FT-006-AC-001

- Default `10.1250` and override `7.500` are canonicalized and persisted as exact decimal strings `10.125` and `7.5` in early lesson Charges.
- Later effective settings `12.34` and `8.75` do not modify those Charges and are applied only to later lesson Charges.
- Exact charge balances are `22.465` and `16.25`; no binary floating-point arithmetic is used for persistence, comparison, or summation.

#### FT-006-AC-004

- The same set-price/create/cancel/reactivate command history is executed in two fresh databases with the same fixed clock and produces identical charge, balance, empty-foundation-allocation, and audit projections.
- The reactivated historical Charge retains `10.125` after a later `99.99` setting; balance returns exactly to `10.125`.
- Audit actions are `charge-created`, `charge-cancelled`, and `charge-reactivated`; each records `admin-own`, deterministic time, and exact before/after Charge state.
- A Student attempt to cancel the Charge throws `not-authorized`; charge and audit counts remain unchanged.

### Probe change

The initial RED used the existing `SharedDatabase` surface to assert the two AC-specific durable fact sets and reached both assertions without an import/setup failure. After implementation, the same two AC-labeled tests and disposable database surface were strengthened to exercise the public boundary end to end. This is strictly stronger claim-equivalent evidence and preserves the exact missing-table RED observations rather than replacing or backfilling them.

### Required execution gates

- `npm run check`: exit 0; `svelte-check found 0 errors and 0 warnings`.
- `npm run build`: exit 0; production client/server bundles completed. Adapter-auto emitted only its informational environment message.
- `npm run test`: exit 0; `5` test files and `17` tests passed.
- `git diff --check`: exit 0.

No result is proposed as a reuse candidate because the final commands were not paired with the immediately preceding bounded-input snapshot required by the execution contract. These are executor supporting results, not independent functional or semantic workflow verdicts.

### Scope and boundary evidence

- Actual task-owned production files: `src/lib/server/modules/financial-ledger/public.ts` and the Financial Ledger schema delta in `src/lib/server/platform/database.ts`.
- Actual task-owned probe: `tests/financial-ledger/historical-charges.test.ts`.
- Financial Ledger remains the sole writer of price, charge, and audit facts. Identity & Access is consumed through `resolveActor`; Center & Scheduling facts are consumed through a typed port. No consumer table-write bypass, new graph edge, route-derived authorization, Scheduling write, Attendance write, or Payment/Allocation write was introduced.
- The shared database change is additive and compatible with all existing consumers; the full regression suite remains GREEN.
- `runtime_context.write_boundary` is absent. Neither forbidden Foundation task card was touched, no forbidden scope was touched, and the monetary source of truth remains the accepted shared database.
- Attempt state and `in_progress` lifecycle were durable before the first RED probe. The production implementation occurred only after RED.
- Isolation used fresh `:memory:` SQLite state, fixed server-side actor/scope fixtures and clock, and explicit database close; no network, credentials, persistent/production data, privileged action, or external side effect was used.
- Tier remains T3 and lifecycle remains `in_progress`; no closure, promotion, functional verdict, semantic verdict, or Memory Bank sync was performed.

## Attempt 2 — bounded retry 1/2

### Retained RED and correction basis

- Attempt 1's durable pre-implementation RED remains unchanged above and is supporting-only for this retry.
- Functional failure basis: `.protocols/TASK-007-T3-FT-006-W4/verification.md` and `.tasks/TASK-007-T3-FT-006-W4/TASK-007-T3-FT-006-W4-S-VERIFY-final-report-docs-01.md` found that AC-004 always projected `allocations: []`, had no persisted Payment/Allocation state, and therefore proved only the no-payment subset.
- Retry claim mapping: `FT-006-AC-004` correction; `FT-006-AC-001` is preserved as a regression claim with no new production behavior.

### Claim-scoped correction RED

- Command: `npx vitest run tests/financial-ledger/historical-charges.test.ts`
- CWD: `/home/serg/Projects/study_calendar`
- Completed at: 2026-08-08T17:09:50+05:00
- Exit code: `1`
- Result: `1` file ran; AC-001 passed and AC-004 failed at its allocation assertion (`1 passed`, `1 failed`).
- AC-004 observation: with two exact `10.125` historical Charges and one persisted exact `15` Payment, replay returned `[]` instead of oldest-first allocations `10.125` and `4.875`; the test reached the accepted claim assertion, so this was not an import, syntax, setup, or unrelated failure.
- Isolation: two fresh `:memory:` databases, deterministic actors/scope/clock, no network or external state, and explicit close.
- Temporary RED fixture note: the probe created only the missing Payment-history table so current production could reach the allocation assertion. The final GREEN probe must remove that setup and rely on production-owned Payment/Allocation schema.

### Task-local implementation correction

- `src/lib/server/platform/database.ts`: added the minimum Financial Ledger-owned persisted Payment-history and Payment Allocation tables/indexes required to recompute an attendance correction from durable facts. No payment command, marker, or second source of truth was added.
- `src/lib/server/modules/financial-ledger/public.ts`: replaced unconditional empty allocations with persisted oldest-first recomputation after an actual Charge create/cancel/reactivate transition. Exact BigInt-scaled decimal arithmetic now derives signed Balance from active Charges minus recorded Payments and persists canonical Allocation amounts in stable Payment/Charge order.
- `tests/financial-ledger/historical-charges.test.ts`: strengthened AC-004 with two `10.125` Charges and one exact `15` historical Payment, persisted Allocation rows, cancellation reallocation, reactivation restoration, identical replay in a second disposable database, audit assertions, and denied-mutation preservation. The temporary RED-only Payment table creation was removed; GREEN relies on production schema.
- `FT-006-AC-001` production behavior was not changed; its existing historical default/override assertions remain the regression guard.

### Fresh claim-equivalent GREEN

- Command: `npx vitest run tests/financial-ledger/historical-charges.test.ts`
- CWD: `/home/serg/Projects/study_calendar`
- Completed at: 2026-08-08T17:13:00+05:00
- Exit code: `0`
- Result: `1` file and `2` tests passed.
- `FT-006-AC-004`: before correction, Payment `15` allocates `10.125` to `lesson-early-default` and `4.875` to `lesson-late-default`, leaving exact Balance `5.25`. Cancelling the oldest Charge persists one `10.125` allocation to the remaining Charge and exact Balance `-4.875`; reactivation restores both original allocations and Balance `5.25`.
- Determinism/audit: the complete history is identical in a second fresh database; audit records fixed author/time and exact Charge before/after state for creation, cancellation, and reactivation. A denied Student correction leaves Charge, Allocation, and audit counts unchanged.
- `FT-006-AC-001`: the same focused run preserves exact historical `10.125`/`7.5` snapshots, future-only `12.34`/`8.75` settings, and exact `22.465`/`16.25` balances.
- Probe-strength rationale: the final probe keeps the same AC locator, disposable SQLite boundary, actors, and deterministic clock; it is stronger than the retry RED because schema now comes from production and it inspects both public replay and persisted Allocation rows.

### Attempt 2 required gates

- `npm run check`: exit `0`; `svelte-check found 0 errors and 0 warnings`.
- `npm run build`: exit `0`; production client/server bundles completed; adapter-auto emitted only its informational environment message.
- `npm run test`: exit `0`; `5` files and `17` tests passed.
- `git diff --check`: exit `0`.
- Owner scan: production Payment/Allocation statements occur only in the shared schema owner and Financial Ledger public owner boundary. The sole direct Payment insert outside production is the isolated task test fixture that supplies accepted historical input.

### Attempt 2 scope, safety, and handoff

- Actual correction files: `src/lib/server/platform/database.ts`, `src/lib/server/modules/financial-ledger/public.ts`, and `tests/financial-ledger/historical-charges.test.ts`, plus task-owned protocol/evidence/report files.
- `runtime_context.write_boundary` remains absent. Neither forbidden Foundation task card was touched; no Scheduling, Attendance, UI, HTTP, marker, payment-command, payment-authority, idempotency, or lifecycle-closure behavior was added.
- Financial Ledger remains the only production writer of financial facts; the accepted Identity & Access and Center & Scheduling public dependency directions are unchanged.
- T3 isolation remained fresh `:memory:` state with deterministic fixtures, no network/credentials/production data, safe rerun, and explicit database close.
- No reuse candidate is offered because no compliant bounded-input snapshot was captured immediately before a final gate. Attempt 1 evidence is supporting-only; current Attempt 2 results are executor supporting evidence for fresh independent verification.
- Tier remains `T3`; lifecycle remains `in_progress`. No `/verify`, `/red-verify`, closure, promotion, `/mb-sync`, or other workflow skill ran.
