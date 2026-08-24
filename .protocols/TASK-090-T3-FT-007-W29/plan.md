---
description: Execution plan for TASK-090-T3-FT-007-W29.
status: active
---
# Plan — TASK-090-T3-FT-007-W29

## Goal

Return the authorized student's numeric factual payment capability from
Financial Ledger: on-time counted allocations divided by all counted
allocations, multiplied by 100.

## Non-goals

- No Statistics route/composition/sorting.
- No allocation, money, charge, lesson, authorization, or source-of-truth
  redesign.
- No proof adoption from TASK-045 or TASK-046.

## Inputs / source specs

- Task record: `.memory-bank/tasks/TASK-090-T3-FT-007-W29.task.json`
- Task index: `.memory-bank/tasks/index.json`
- Feature: `FT-007-AC-005`
- REQ IDs: `REQ-014`, `REQ-017`

## Constraints / invariants (MUST / NEVER)

- MUST resolve actor and current student/class scope server-side.
- MUST obtain actual lesson dates only through the Financial Scope and Lesson
  Fact port and use strict `payment factual date < actual lesson date`.
- MUST return `0` when no counted allocations and `100` when all are on time.
- NEVER count advances/unallocated amounts or mutate financial source facts.
- NEVER read Center & Scheduling tables or touch `study-calendar.db`.

## Scope

### In scope

- `src/lib/server/modules/financial-ledger/public.ts`
- `tests/financial-ledger/ft-007-payment-capability.test.ts`

### Out of scope

- Every path in `runtime_context.forbidden_scope` and all unrelated files.

## Proposed changes

### Touched areas

- Financial Ledger public boundary — add the bounded projection query.
- Task-local isolated test — prove the factual formula, exclusions, scope,
  exact ports, and non-mutation.

### Preflight-confirmed change surface

- Expected hints kept: Financial Ledger `public.ts`.
- Additional same-outcome files/areas and rationale: exact task-planned test.
- Hard `write_boundary` present and satisfied: yes.
- `forbidden_scope` / stop-condition check: clear.

## Applicable quality gates

- [ ] focused RED/GREEN: `npm run test -- --run tests/financial-ledger/ft-007-payment-capability.test.ts`
- [ ] check: `npm run check`
- [ ] test: `npm run test`
- [ ] build: `npm run build`
- [ ] diff: `git diff --check`
- [ ] mb-lint: `node scripts/mb-lint.mjs`
- [ ] strict-doctor: `node scripts/mb-doctor.mjs --strict`

## Claim-linked RED / GREEN (T2/T3)

- applicability: applicable
- accepted claim locator: `FT-007-AC-005 / REQ-014 / REQ-017`
- planned test/probe and environment: disposable `:memory:` SQLite, public
  Financial Ledger calls, real Actor Context boundary, controlled Financial
  Scope/Lesson Fact port, state snapshots, explicit close.
- observable RED: missing payment-capability public query prevents the complete
  0/100/mixed/overdue/equal-date/advance/unallocated and scope matrix.
- corresponding GREEN: exact numeric results and denial/non-mutation pass
  through the accepted ports.
- accepted not-applicable reason and alternative proof: none.
- T3 isolation, safe rerun, cleanup, and permission boundary: no filesystem DB,
  no network/credentials, deterministic fixture, explicit database close.

## MB-SYNC handoff / owner

- [x] Owner identified: scheduler
- [x] Explicit standalone owner basis: n/a
- [x] Memory Bank docs update: none during `/exe`
- [x] Router/RTM/changelog update: scheduler/wave owner only
- [x] Task registry/status update owner: scheduler after verification; `/exe`
  owns only `ready -> in_progress`.

## Definition of done

- Honest claim-specific RED precedes production behavior change.
- Smallest boundary-compliant implementation reaches claim-equivalent GREEN.
- All task gates pass with reproducible evidence and handoff to `/verify`.
