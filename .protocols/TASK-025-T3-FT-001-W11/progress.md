---
description: Execution progress for TASK-025 bootstrap Admin center creation.
status: active
---
# Progress — TASK-025-T3-FT-001-W11

## Current status

- state: verifying
- last update: 2026-08-12

## What was done

- Reconciled the delegated bounded scope with FT-001-AC-009 and the current
  auth/access/provider contracts.
- Added the public Center & Scheduling bootstrap command and Admin entry query.
- Added the protected `/admin` browser route/form and routed successful bound
  Admin login callbacks there.
- Added focused boundary and HTTP tests for success, atomic rollback, repeat,
  non-Admin, unauthenticated, and forged-input denial.

## Commands run

- `npm test -- --run tests/center-scheduling/bootstrap-center.test.ts` → RED:
  one claim-scoped failure, `createBootstrapCenter is not a function`.
- `npm test -- --run tests/center-scheduling/bootstrap-center.test.ts tests/routes/admin-center-bootstrap.test.ts`
  → GREEN: 2 files, 5 tests passed.
- `npm run check` → passed, 0 errors and 0 warnings after preserving the
  provider test literal type.
- `npm test` → passed, 23 files and 89 tests. Existing calendar-date-expired
  invitation fixtures were stabilized to durable future dates.
- `npm run build` → passed; adapter-auto emitted its existing deployment
  environment advisory only.

## Claim-linked RED / GREEN

- attempt: 1
- applicability: applicable
- accepted claim locator(s): `FT-001-AC-009`
- RED command/probe: `npm test -- --run tests/center-scheduling/bootstrap-center.test.ts`
- RED observation and evidence: failed specifically because the accepted public
  bootstrap command did not exist (`createBootstrapCenter is not a function`).
- GREEN command/probe: `npm test -- --run tests/center-scheduling/bootstrap-center.test.ts tests/routes/admin-center-bootstrap.test.ts`
- GREEN observation and evidence: 2 files, 5 tests passed; exact Admin success,
  atomic rollback, once-only behavior, auth redirect, member Admin routing, and
  forged/non-Admin/unauthenticated denial are covered.
- claim-equivalent probe changes and rationale: the initial one-test boundary
  probe was retained and expanded with HTTP/SSR route coverage required by
  FT-001-AC-009.
- T3 isolation/cleanup/permission evidence: disposable in-memory SQLite;
  no secrets, live providers, production data, or external writes.

### Execution Attempt 2 — verifier-directed correction

- attempt: 2
- retry correction basis: independent `/verify` `VERDICT: FAIL` and
  `/red-verify` `semantic-fail` showed that forged `centerId`/`role` form fields
  were ignored instead of rejected before mutation.
- RED command/probe: `npm test -- --run tests/routes/admin-center-bootstrap.test.ts`
- RED observation: forged-field scenario reached a 303 center redirect and
  therefore exposed the exact rejected-before-mutation defect.
- correction: `/admin` POST now accepts exactly one `name` field; any authority
  or unknown field returns safe 400 `invalid_request` before the public command.
- GREEN commands/results:
  - project focused tests: 2 files, 6 tests passed;
  - verifier-owned probe via its dedicated config: 1 file, 2 tests passed;
  - `npm run check`: 0 errors and 0 warnings;
  - `npm test`: 23 files, 90 tests passed;
  - `npm run build`: passed with adapter-auto's existing environment advisory.
- isolation: disposable in-memory SQLite; spy and state-before/state-after
  assertions prove the public bootstrap command was not invoked and no center
  or membership changed for forged requests.

## Open issues / risks

- Formal indexed card was absent at execution start; lifecycle bookkeeping is
  retained by the Orchestrator. No implementation blocker remains.

## Next step

- Return correction to the same Reviewer for `/verify` and `/red-verify`.
