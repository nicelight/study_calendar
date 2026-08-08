---
description: Execution plan for TASK-007-T3-FT-006-W4.
status: active
---
# Plan — TASK-007-T3-FT-006-W4

## Goal

Persist the exact price applied to each lesson charge and make attendance-driven charge correction reproducible with immutable price facts and author/time/change audit evidence.

For retry 1/2, complete the missing AC-004 result by recomputing persisted allocations and balance from existing historical Charge/Payment facts whenever attendance correction changes charge eligibility.

## Non-goals

- Payment create/edit/cancel commands, payment authority, partial/excess state closure, markers, and idempotency owned by TASK-008.
- Scheduling lifecycle or lesson persistence owned by TASK-006.
- Learning Progress attendance persistence owned by its later feature task.

## Inputs / source specs
- Task record: `.memory-bank/tasks/TASK-007-T3-FT-006-W4.task.json`
- Task index: `.memory-bank/tasks/index.json`
- Feature: `.memory-bank/features/FT-006-financial-ledger.md`
- REQ IDs: `REQ-010`, `REQ-011`, `REQ-012`, `REQ-014`, `REQ-015`

## Richer execution inputs
- Source Artifacts: FT-006 AC-001/004, Financial Ledger facts/invariants, Financial Scope and Lesson Fact Boundary.
- Normative Inputs: SDD backbone; Financial Ledger contract; Core Domain persistence/transaction rules.
- Verification Targets: historical default/override snapshots; deterministic correction replay and audit facts.

## Constraints / invariants (MUST / NEVER)
- MUST persist and compare money without binary floating-point.
- MUST snapshot the selected price in the Charge and leave it unchanged after later settings.
- MUST write financial state only inside Financial Ledger's transaction boundary.
- MUST preserve deterministic charge/balance state for the same isolated historical input sequence.
- NEVER implement or write Scheduling, Attendance, Payment command, or Marker behavior in this task.
- MUST keep the retry delta to the Payment-history/Allocation persistence and recomputation foundation explicitly required by AC-004; do not adopt TASK-008's AC-002/003/005/006/007 proofs.

## Scope
### In scope
- Financial price-setting, charge, and financial-audit schema foundations.
- Minimal persisted Payment-history and Payment Allocation foundation needed to replay a charge correction.
- Financial Ledger public boundary for class/student price settings and lesson-charge reconciliation.
- Claim-scoped isolated RED/GREEN test for FT-006-AC-001 and FT-006-AC-004.

### Out of scope
- TASK-008 payment outcomes and TASK-006 scheduling outcomes.
- HTTP/UI work and broad refactors.

## Proposed changes
### Touched areas
- `src/lib/server/platform/database.ts` — shared durable schema for Financial Ledger-owned facts.
- `src/lib/server/modules/financial-ledger/public.ts` — owner boundary and exact charge/allocation replay behavior.
- `tests/financial-ledger/historical-charges.test.ts` — isolated claim-scoped probe.
- task-owned `.protocols/` and `.tasks/` evidence/report files.

### Preflight-confirmed change surface
- Expected hints kept: Financial Ledger module and financial-ledger tests; no Center & Scheduling implementation write is required because it is consumed through a typed port.
- Additional same-outcome files/areas and rationale: `src/lib/server/platform/database.ts` is the established one-database schema owner and is necessary for durable financial facts; protocol/task evidence is workflow-owned.
- Hard `write_boundary` present and satisfied: not set
- `forbidden_scope` / stop-condition check: clear; forbidden TASK-001/TASK-002 records will not be touched and no global monetary source-of-truth change is needed.

## Applicable quality gates
- [x] Claim probe: `npx vitest run tests/financial-ledger/historical-charges.test.ts` — proves FT-006-AC-001/004 in isolated disposable SQLite state.
- [x] Check: `npm run check` — proves TypeScript/Svelte static validity.
- [x] Build: `npm run build` — proves production bundling.
- [x] Test: `npm run test` — proves required regression suite plus task claims.
- [x] Diff check: `git diff --check` — proves patch hygiene.

## Claim-linked RED / GREEN (T2/T3)
- applicability: applicable
- accepted claim locator(s): `FT-006-AC-001`; `FT-006-AC-004`
- planned test/probe and environment: one Vitest integration file using a fresh in-memory SQLite database, fixed actor/scope facts, and a deterministic clock.
- observable RED: public Financial Ledger boundary/schema is absent, so the test cannot import/execute historical charge behavior.
- corresponding GREEN: exact default/override prices remain fixed in existing charges after later price settings; correction/cancellation with persisted payment history produces identical oldest-first allocation, balance, and author/time/change audit facts across isolated replays.
- accepted not-applicable reason and alternative proof: none.
- T3 isolation, safe rerun, cleanup, and permission boundary: `:memory:` database per test, no network/production side effect, database closed after each run, server-resolved fake actor/scope port limited to fixed fixtures.

## MB-SYNC handoff / owner
- [x] Owner identified: scheduler
- [x] Explicit standalone owner basis recorded if manual closure is expected: n/a
- [x] `.memory-bank/` docs needing update: only indexed task lifecycle start owned by `/exe`; broader reconciliation remains outside this command.
- [x] `.memory-bank/index.md` router update needed: no
- [x] RTM update in `.memory-bank/requirements.md` needed: no
- [x] Task registry/status update owner: scheduler after independent verification stages
- [x] Changelog update owner: scheduler/`/mb-sync` at its due boundary

## Definition of done
- [x] Honest pre-implementation RED and claim-equivalent GREEN are durable for both owned ACs.
- [x] Task gates pass; actual files, scope compliance, and reproduction commands are recorded.
- [x] Final Implementer handoff/report is durable while task remains `in_progress` for independent verification.
