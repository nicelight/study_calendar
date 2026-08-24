---
description: Reproducible executor evidence for TASK-090-T3-FT-007-W29 Attempt 1.
status: final
---
# Execution Evidence — TASK-090-T3-FT-007-W29

## Attempt and claim

- Execution Attempt: 1
- Claim: `FT-007-AC-005 / REQ-014 / REQ-017`
- Outcome: authorized Financial Ledger payment capability counts only persisted
  counted Payment Allocations and uses strict factual payment date earlier than
  the actual lesson date obtained through the accepted provider seam.

## Prospective RED

- Command: `npm run test -- --run tests/financial-ledger/ft-007-payment-capability.test.ts`
- Result: exit 1; 1 file, 2 failed tests.
- Decisive observation: `TypeError: ledger.getPaymentCapability is not a function`
  in both formula and authorization probes after successful disposable fixture
  setup. This was the missing accepted capability, not a harness/setup failure.

## Claim-equivalent GREEN

- Command: `npm run test -- --run tests/financial-ledger/ft-007-payment-capability.test.ts`
- Result: exit 0; 1 file, 2 passed tests.
- Formula observations: no allocations `0`; on-time allocation plus excluded
  excess advance `100`; overdue `0`; equal actual date `0`; mixed on-time/equal
  `50`; unallocated advance-only payment `0`.
- Seam observation: the equal-date case changes the current provider lesson
  date after charge creation, returns `0`, and records the expected per-
  allocation lesson-fact calls, proving the stored charge date was not used as
  the actual-date authority.
- Authority observation: current Admin and assigned Teacher return `100`;
  anonymous, revoked, Student, Parent, cross-class/student, and removed-
  assignment calls throw `not-authorized`.
- Non-mutation observation: serialized rows from all seven Financial Ledger
  source/audit tables are exactly equal before and after all projection calls.

## Required gates

| Gate | Result | Concise evidence |
|---|---|---|
| focused test | pass | 1 file / 2 tests |
| `npm run check` | pass | 0 errors / 0 warnings |
| `npm run test` | pass | 64 files / 210 tests |
| `npm run build` | pass | client/server production bundles completed |
| `git diff --check` | pass | exit 0, no output |
| `node scripts/mb-lint.mjs` | pass | 74 files; only existing advisory metadata warnings |
| `node scripts/mb-doctor.mjs --strict` | pass | 0 errors / 0 warnings / 2 info |

## Change and boundary evidence

- Production: `src/lib/server/modules/financial-ledger/public.ts`
  (`bbc84c93ca702a143ff65743188a230ca00c1392a9f8cade2aee6857e6c60515`).
- Test: `tests/financial-ledger/ft-007-payment-capability.test.ts`
  (`244cf702b2d7fa2c011423391c1a0e92607f6f581e15c9152c978304c0a7cd52`).
- Production/test writes are exactly inside the literal hard write boundary.
- No forbidden-scope path or `study-calendar.db` was touched.
- The accepted graph path remains Financial Ledger -> Actor Context and
  Financial Ledger -> Financial Scope and Lesson Fact; no direct C&S table read,
  caller-supplied authority, new edge, source owner, or write command was added.
- Actual production/test files match the planned proof surface. The advisory
  touched-file hint omitted only the exact task-planned regression test.

## Reuse disposition

No reuse candidate is offered. The repository contains broad unrelated dirty
and concurrently produced inputs, so the complete read surfaces of project-wide
gates cannot be conservatively bounded. Results remain reproducible supporting
executor evidence for fresh independent verification.
