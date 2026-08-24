---
description: Execution progress for TASK-090-T3-FT-007-W29.
status: active
---
# Progress — TASK-090-T3-FT-007-W29

## Current status

- state: verifying
- last update: 2026-08-22

## What was done

- Completed indexed-task, dependency, Planning Revision 2, task-plan approval,
  canonical contract, hard-scope, source-owner, and strict-doctor preflight.
- Initialized Execution Attempt 1 before any prospective probe or production
  change and durably started the selected task.
- Added the public `getPaymentCapability` query with server-resolved actor and
  class/student scope, counted Financial Ledger allocations, and current actual
  lesson dates obtained only through the accepted lesson-fact port.
- Added the planned isolated regression probe and completed every required gate.

## Commands run (with results)

- `node scripts/mb-doctor.mjs --strict` → PASS (0 errors, 0 warnings).
- `npm run test -- --run tests/financial-ledger/ft-007-payment-capability.test.ts`
  → RED, exit 1; 1 file / 2 claim-specific failures because the query was absent.
- Same focused command after implementation → GREEN, exit 0; 1 file / 2 tests.
- `npm run check` → exit 0; 0 errors and 0 warnings.
- `npm run test` → exit 0; 64 files / 210 tests.
- `npm run build` → exit 0; production bundles completed; adapter-auto notice
  was informational.
- `git diff --check` → exit 0.
- `node scripts/mb-lint.mjs` → exit 0; 74 files passed with only pre-existing
  recommended-metadata warnings outside task scope.
- `node scripts/mb-doctor.mjs --strict` → exit 0; 0 errors and 0 warnings.

## Claim-linked RED / GREEN (T2/T3)

- attempt: 1
- applicability: applicable
- accepted claim locator: `FT-007-AC-005 / REQ-014 / REQ-017`
- accepted not-applicable reason and alternative proof: none
- RED command/probe: `npm run test -- --run tests/financial-ledger/ft-007-payment-capability.test.ts`
- RED observation and evidence: exit 1; both claim-scoped tests failed because
  `FinancialLedgerBoundary.getPaymentCapability` did not exist. The fixture,
  public charge/payment setup, and disposable database completed before the
  missing accepted query was invoked, so this is claim-specific RED rather
  than setup, syntax, or unrelated failure.
- GREEN command/probe: `npm run test -- --run tests/financial-ledger/ft-007-payment-capability.test.ts`
- GREEN observation and evidence: exit 0; 1 file / 2 tests passed. The projection
  returned `0` for no counted allocation, overdue, equal-date, and advance-only;
  `100` for an on-time allocation with excess advance; and `50` for mixed
  on-time/equal allocations. Admin and currently assigned Teacher succeeded;
  anonymous, revoked, Student, Parent, cross-class/student, and removed-
  assignment calls were denied. Exact scope and per-allocation lesson-fact port
  calls were observed and the complete financial-table snapshots were equal
  before and after projection reads.
- claim-equivalent probe changes and rationale: the probe was unchanged between
  RED and GREEN; production added only the missing public query and its private
  counted-allocation read helper.
- T3 isolation/cleanup/permission evidence: disposable `:memory:` SQLite,
  deterministic actor/scope ports, public boundary only, explicit close; no
  real DB, network, credentials, or neighboring-source writes.

## Evidence links

- `.tasks/TASK-090-T3-FT-007-W29/execution-evidence.md`
- `.tasks/TASK-090-T3-FT-007-W29/TASK-090-T3-FT-007-W29-S-EXE-final-report-code-01.md`

## Open issues / risks

- No confirmed blocker or tier escalation. Broad unrelated workspace changes
  make executor gate receipt reuse ineligible; `/verify` should run fresh gates.

## Next step

- Run independent `/verify TASK-090-T3-FT-007-W29`.
