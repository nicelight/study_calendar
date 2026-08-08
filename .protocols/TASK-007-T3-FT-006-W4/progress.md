---
description: Execution progress for TASK-007-T3-FT-006-W4.
status: active
---
# Progress — TASK-007-T3-FT-006-W4

## Current status
- state: handoff_ready
- last update: 2026-08-08

## Attempt 2 — bounded retry 1/2

- attempt: 2
- applicability: applicable
- accepted claim locators: `FT-006-AC-004` correction; `FT-006-AC-001` regression preservation
- Attempt 1 functional report-01 is retained unchanged as correction basis only; its no-payment AC-004 GREEN and gates are supporting-only for the retry.
- Failed gate evidence: `.protocols/TASK-007-T3-FT-006-W4/verification.md` and `.tasks/TASK-007-T3-FT-006-W4/TASK-007-T3-FT-006-W4-S-VERIFY-final-report-docs-01.md` observe unconditional `allocations: []` and no persisted Payment/Allocation recomputation path.
- Accepted correction: add the smallest Financial Ledger-owned historical payment/allocation foundation and recompute Allocation plus Balance when attendance correction changes Charge eligibility, without adding payment commands or adopting TASK-008-owned ACs.
- AC-001 production behavior is preserved; its Attempt 1 evidence remains supporting regression evidence.
- Execution Attempt 2 was durably recorded before the first retry probe or production write; task lifecycle remains `in_progress`.
- Claim-scoped retry RED: `npx vitest run tests/financial-ledger/historical-charges.test.ts` exited `1`; AC-001 passed, while AC-004 reached its allocation assertion and received `[]` instead of `10.125`/`4.875` oldest-first allocations for an exact `15` Payment over two exact `10.125` Charges. Evidence: `.tasks/TASK-007-T3-FT-006-W4/execution-evidence.md#claim-scoped-correction-red`.
- Correction implemented: persisted Financial Ledger Payment-history/Allocation foundations plus exact deterministic Allocation and Balance recomputation on actual Charge create/cancel/reactivate, with no public payment command or TASK-008 behavior.
- Fresh claim-equivalent GREEN: focused test exited `0`, `2/2` passed. AC-004 now reallocates Payment `15` from `10.125 + 4.875` across two Charges to `10.125` on the remaining Charge after cancellation, changes Balance from `5.25` to `-4.875`, and restores the original persisted allocations/Balance after reactivation; a second fresh database produced the identical history and audit.
- Probe change and strength: the retry RED temporarily supplied only the missing Payment-history table to reach the allocation assertion; final GREEN removed that setup, relies on production Payment/Allocation schema, and additionally inspects persisted Allocation rows plus denied-mutation state.
- Current evidence artifacts: `.tasks/TASK-007-T3-FT-006-W4/execution-evidence.md#attempt-2--bounded-retry-12` and `.tasks/TASK-007-T3-FT-006-W4/TASK-007-T3-FT-006-W4-S-EXE-RETRY-final-report-code-02.md`.
- Attempt 2 required gates: `npm run check`, `npm run build`, `npm run test` (`17/17`), and `git diff --check` all exited `0`; production owner scan found no financial write bypass.

## What was done
- Completed bounded preflight and reconciled the pre-handoff stall: no prior task-owned attempt/probe/implementation existed, so this is initial Attempt 1.
- Initialized the T3 protocol and durably transitioned the indexed task `ready -> in_progress` before any prospective probe or production write.
- Added the smallest claim-scoped schema probe and obtained honest pre-implementation RED for both owned ACs.
- Added Financial Ledger-owned price-setting, immutable charge, and audit schema to the established shared database.
- Added the public Financial Ledger boundary with exact canonical-decimal handling, server-resolved actor/scope ports, historical default/override price selection, atomic charge create/cancel/reactivate, deterministic charge balance replay, and author/time/before-after audit facts.
- Strengthened the same two AC-labeled isolated tests from the initial missing-fact assertions to full claim-equivalent behavior; obtained GREEN and completed all required gates.
- Lifecycle remains `in_progress` for independent functional and T3 semantic verification.

## Commands run (with results)
- Read-only task, review-revision, dependency, spec, boundary, code, and protocol-template inspection → OK.
- `npx vitest run tests/financial-ledger/historical-charges.test.ts` → expected RED, exit 1, 2/2 claim assertions failed because the Financial Ledger tables were absent; evidence: `.tasks/TASK-007-T3-FT-006-W4/execution-evidence.md#pre-implementation-red`.
- `npx vitest run tests/financial-ledger/historical-charges.test.ts` → GREEN, exit 0; 1 file and 2 tests passed.
- `npm run check` → exit 0; 0 errors and 0 warnings.
- `npm run build` → exit 0; production bundle built; adapter-auto emitted only its informational environment message.
- `npm run test` → exit 0; 5 files and 17 tests passed.
- `git diff --check` → exit 0.
- Read-only owner scan → Financial Ledger table statements occur only in the shared schema owner, Financial Ledger public owner boundary, and its isolated test; no consumer write bypass appeared.

## Claim-linked RED / GREEN (T2/T3)
- evidence status: supporting-only after Attempt 2
- attempt: 1
- applicability: applicable
- accepted claim locator(s): `FT-006-AC-001`; `FT-006-AC-004`
- accepted not-applicable reason and alternative proof: none
- RED command/probe: `npx vitest run tests/financial-ledger/historical-charges.test.ts`
- RED observation and evidence: exit 1; FT-006-AC-001 received `[]` instead of `financial_price_settings`/`financial_lesson_charges`, and FT-006-AC-004 received `[]` instead of `financial_lesson_charges`/`financial_audit_records`. Both tests reached their claim assertions; no import/setup/syntax failure occurred. See `.tasks/TASK-007-T3-FT-006-W4/execution-evidence.md#pre-implementation-red`.
- GREEN command/probe: `npx vitest run tests/financial-ledger/historical-charges.test.ts`
- GREEN observation and evidence: exit 0; 2/2 tests passed. AC-001 preserves exact `10.125`/`7.5` historical default/override snapshots after later `12.34`/`8.75` settings and applies the new values only to later charges; exact balances are `22.465` and `16.25`. AC-004 reproduces the same create/cancel/reactivate history in two fresh databases with identical charge/balance/empty-foundation-allocation/audit projections, retains `10.125` after a later `99.99` setting, records Admin author plus fixed time and before/after change, and leaves state unchanged after an unauthorized correction. See `.tasks/TASK-007-T3-FT-006-W4/execution-evidence.md#claim-equivalent-green`.
- claim-equivalent probe changes and rationale: retained the two AC-specific test locators and the same in-memory SQLite surface, then strengthened their initial durable-fact assertions to exercise the implemented public boundary end to end. The GREEN probe is strictly stronger for the same claims: it preserves the RED-required tables while adding exact snapshot, future-only setting, replay, balance, audit, and negative authorization comparisons.
- T3 isolation/cleanup/permission evidence: fresh `:memory:` SQLite state; fixed fake server-side actor/scope facts; no external systems; close database after probe.

## Reuse Candidates
- None. No result is offered for reuse because a compliant bounded-input snapshot was not captured immediately before the final Attempt 2 gate sequence; all executor results remain supporting evidence only.

## Evidence links
- `.tasks/TASK-007-T3-FT-006-W4/execution-evidence.md#pre-implementation-red`
- `.tasks/TASK-007-T3-FT-006-W4/execution-evidence.md#claim-equivalent-green`
- `.tasks/TASK-007-T3-FT-006-W4/TASK-007-T3-FT-006-W4-S-EXE-final-report-code-01.md`
- `.tasks/TASK-007-T3-FT-006-W4/execution-evidence.md#attempt-2--bounded-retry-12`
- `.tasks/TASK-007-T3-FT-006-W4/TASK-007-T3-FT-006-W4-S-EXE-RETRY-final-report-code-02.md`

## Open issues / risks
- No unresolved implementation blocker. TASK-008 may consume the persisted Payment/Allocation foundation through its owning payment commands and remains responsible for AC-002/003/005/006/007.

## Next step (single concrete action)
- Fresh independent `/verify TASK-007-T3-FT-006-W4`.
