---
description: Execution plan for TASK-008-T3-FT-006-W5.
status: active
---
# Plan — TASK-008-T3-FT-006-W5

## Goal

Implement authorized, exact, deterministic payment commands, recomputation,
audit, retry safety, balance projection, and non-mutating calendar markers.

## Non-goals

- Change attendance, lesson, membership, class, or student ownership.
- Add financial writes outside Financial Ledger.
- Add routes/UI or a second source of financial truth.

## Inputs / source specs
- Task record: `.memory-bank/tasks/TASK-008-T3-FT-006-W5.task.json`
- Task index: `.memory-bank/tasks/index.json`
- Feature/Epic: `.memory-bank/features/FT-006-financial-ledger.md`, `EP-005`
- REQ IDs: `REQ-010`, `REQ-012`, `REQ-013`, `REQ-014`, `REQ-015`, `REQ-016`

## Richer execution inputs
- Source Artifacts: task-linked AC-002, AC-003, AC-005, AC-006, AC-007.
- Normative Inputs: financial-ledger, access-control, boundary-map financial projection, lifecycle learning/finance.
- Verification Targets: all five targets from the indexed task card.

## Fallback basis
- feature doc: `.memory-bank/features/FT-006-financial-ledger.md`
- requirements / RTM: linked REQ IDs
- duo docs: `.memory-bank/architecture/system-architecture.md`, `.memory-bank/domains/core-domain.md`
- related contracts / states: `.memory-bank/contracts/financial-ledger.md`, `.memory-bank/contracts/access-control.md`, `.memory-bank/states/lifecycle-map.md`

## Constraints / invariants (MUST / NEVER)
- MUST use exact decimal-safe string/bigint arithmetic end to end.
- MUST allocate oldest uncovered active Charges first in stable order.
- MUST re-check actor and Center & Scheduling scope at every command/query boundary.
- MUST keep payment edit/cancel Admin-only and own-center scoped; Teacher create-only for assigned classes.
- MUST preserve audit author/time/before-after evidence for payment corrections.
- MUST keep marker projection factual-date based and non-mutating.
- MUST make the same confirmed financial intent idempotent and require a new explicit confirmation for a new Payment.
- NEVER let Lesson Context/UI or another slice write financial records.
- NEVER derive financial balance from presentation markers.

## Scope
### In scope

- `src/lib/server/modules/financial-ledger/` payment commands, projections, and audit state.
- `src/lib/server/platform/database.ts` only where the Financial Ledger schema requires payment command/audit/idempotency persistence.
- `tests/financial-ledger/` claim-scoped isolated integration coverage.
- Task protocol/evidence/report files.

### Out of scope

- `.memory-bank/tasks/TASK-001-T3-FT-000-W0.task.json`
- `.memory-bank/tasks/TASK-002-T3-FT-000-W1.task.json`
- Existing unrelated dirty files and all other task lifecycle/verification workflows.

## Proposed changes
### Touched areas (hypotheses OK)
- `src/lib/server/modules/financial-ledger/public.ts` — named payment commands and projections remain inside the Financial Ledger public boundary.
- `src/lib/server/platform/database.ts` — durable payment audit/idempotency columns/tables if required by the existing schema bootstrap.
- `tests/financial-ledger/payments.test.ts` — isolated RED/GREEN task-owned scenarios.

### Preflight-confirmed change surface
- Expected hints kept: Financial Ledger and `tests/financial-ledger/`.
- Additional same-outcome files/areas and rationale: `src/lib/server/platform/database.ts` may be required because it owns shared schema bootstrap for Financial Ledger persistence; `src/lib/server/modules/lesson-context/` is not required unless an existing consumer contract needs a projection adapter.
- Hard `write_boundary` present and satisfied: not set.
- `forbidden_scope` / stop-condition check: clear.

## Applicable quality gates
- [ ] `npm run check` — proves SvelteKit/TypeScript integrity for the changed public boundary.
- [ ] `npm run build` — proves the application build remains valid.
- [ ] `npm run test` — proves the full project regression suite.
- [ ] focused financial-ledger test command — proves each current task claim in isolated disposable state.

## Claim-linked RED / GREEN (T2/T3)
- applicability: applicable
- accepted claim locators: `FT-006-AC-002`, `FT-006-AC-003`, `FT-006-AC-005`, `FT-006-AC-006`, `FT-006-AC-007`
- planned test/probe and environment: one task-owned focused integration file with deterministic fixtures, fresh `:memory:` database per test, no network/credentials/production data, explicit close.
- observable RED: current public boundary has no payment commands or marker projection; focused claims fail for the missing owner behavior.
- corresponding GREEN: same scenarios pass after implementation without weakening the probe.
- accepted not-applicable reason and alternative proof: none.
- T3 isolation, safe rerun, cleanup, and permission boundary: disposable in-memory SQLite; deterministic clock; no external side effects; close database in `afterEach`.

## Fan-out plan (if needed)
- None; delegated agents are not authorized by the operator.

## MB-SYNC handoff / owner
Scheduler or explicit standalone owner performs sync after verification/status decision. `/exe` only records handoff notes.

Checklist:
- [ ] Owner identified: scheduler | explicit standalone owner | human | none — scheduler/lifecycle owner after `/verify` and `/red-verify`.
- [ ] Explicit standalone owner basis recorded if manual closure is expected: n/a.
- [ ] `.memory-bank/` docs needing update (WHY/WHERE, no pseudocode): no task-owned durable architecture/spec update expected; report any required navigation update as blocker.
- [ ] `.memory-bank/index.md` router update needed: no.
- [ ] RTM update in `.memory-bank/requirements.md` needed: no.
- [ ] Task registry/status update owner: lifecycle owner; current `/exe` only started `in_progress`.
- [ ] Changelog update owner: lifecycle owner / boundary sync.

## Definition of done

Implementation and current-attempt RED/GREEN evidence are durable, all task
gates are recorded, actual files and boundary compliance are reported, and the
next handoff is `/verify TASK-008-T3-FT-006-W5` followed by required T3
`/red-verify`.
