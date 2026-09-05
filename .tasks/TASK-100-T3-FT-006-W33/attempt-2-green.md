---
description: Claim-equivalent Attempt 2 GREEN evidence for TASK-100-T3-FT-006-W33.
status: active
---
# Attempt 2 — Claim-equivalent GREEN

- attempt: `2`
- applicability: applicable; `FT-006-AC-010 / REQ-012 / REQ-013 / REQ-014 /
  REQ-015` remains the owned claim set.
- RED basis: `.tasks/TASK-100-T3-FT-006-W33/attempt-2-red.md` observed the
  unchanged journal failing the second distinct edit because the fixed
  `confirm-edit` key conflicted in Financial Ledger.
- correction: `src/routes/admin/[centerId]/finance/+page.svelte` now prepares
  an idempotency/confirmation value on each payment-form submit. The form
  reuses it only while the serialized non-confirmation payload is identical;
  changing amount, date, payment, or scope generates a fresh
  `crypto.randomUUID()` value. The checkbox remains required and the server
  still rejects an empty value, while the Ledger remains the sole command and
  idempotency owner.
- browser regression: `e2e/ft-006-admin-journal.spec.ts` now seeds two
  payments for one own-center Admin and proves both entries appear once, then
  proves two distinct edits and two distinct cancellations with authoritative
  allocation, balance, status, audit, and database-count assertions.
- GREEN command: `node scripts/run-disposable-e2e.mjs --database
  tmp/ft-006-admin-journal.db --spec e2e/ft-006-admin-journal.spec.ts`
- GREEN result: exit code `0`; one disposable Playwright test passed. The
  second edit succeeds after the first edit, and the second cancellation
  succeeds after the first cancellation; the final journal contains both
  cancelled payments, no correction forms, empty allocations, balance
  `10.125`, and three audit records per payment.
- focused route GREEN: `npx vitest run tests/routes/admin-finance-journal.test.ts`
  exited `0`; one file and three tests passed, including the no-fixed-key
  render assertion and existing authorization/non-mutation coverage.
- project gates: `npm run check` exited `0` with 0 errors/0 warnings;
  `npm run test` exited `0` with 73 files/250 tests; `npm run build` exited
  `0`; `git diff --check` exited `0`; `node .memory-bank/scripts/mb-lint.mjs`
  exited `0` with 76 files and existing advisory metadata warnings; and
  `node .memory-bank/scripts/mb-doctor.mjs --strict` exited `0` with 0 errors,
  1 existing planned-candidate warning, and 2 info.
- T3 isolation: focused tests use in-memory SQLite; browser proof uses only
  `tmp/ft-006-admin-journal.db` through the project runner. The exact
  temporary database and sidecars were absent after cleanup; `study-calendar.db`
  remained unchanged with SHA-256
  `537c91346e7c8b2b1479e1ec48b63edb0573e0d169335ecd96a441e901d8d05e`.
- probe changes: the two-payment fixture and assertions are the minimum
  claim-equivalent correction proof; no Financial Ledger, route boundary,
  creation flow, runner, configuration, task card, lifecycle, or dependency
  was changed.
- receipt disposition: no execute result is offered for independent reuse;
  the shared worktree contains unrelated durable scheduler changes and
  runtime-sensitive inputs. Attempt 1 artifacts remain preserved as
  historical/supporting-only evidence.
