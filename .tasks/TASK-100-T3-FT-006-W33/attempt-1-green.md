---
description: Attempt 1 claim-equivalent GREEN evidence for TASK-100-T3-FT-006-W33.
status: final
---
# Attempt 1 GREEN — TASK-100-T3-FT-006-W33

- Claim: `FT-006-AC-010 / REQ-012 / REQ-013 / REQ-014 / REQ-015`.
- Applicability: applicable T3 claim-linked path; the original Attempt 1 RED
  remains preserved at `attempt-1-red.md`.
- Production change: the Admin finance route now composes server-resolved
  own-center class/student pairs with `getBalanceProjection`, and its actions
  invoke only `editPayment` / `cancelPayment` after role, center, class,
  student, and payment checks. The Svelte page renders one journal card per
  payment, exact financial facts, allocation, balance/advance, audit
  before/after history, and explicit confirmation controls without a create
  form.

## Focused route/action proof

- Command: `npx vitest run tests/routes/admin-finance-journal.test.ts`
- CWD: `/home/serg/Projects/study_calendar`
- Exit code: `0`
- Result: `3 tests passed`.
- Evidence: `tests/routes/admin-finance-journal.test.ts` proves one-time
  authoritative listing, exact decimal/date/status presentation, edit and
  cancel reloads, deterministic allocation/balance changes, audit history,
  explicit confirmation, role denial, wrong-center denial, forged
  class/student/payment denial, and unchanged financial state on denial.

## Disposable browser proof

- Command: `node scripts/run-disposable-e2e.mjs --database
  tmp/ft-006-admin-journal.db --spec e2e/ft-006-admin-journal.spec.ts`
- CWD: `/home/serg/Projects/study_calendar`
- Exit code: `0`
- Result: `1 passed`.
- Evidence: `e2e/ft-006-admin-journal.spec.ts` logs in the disposable Admin,
  verifies one journal entry and its Ledger projection, edits with a required
  confirmation, verifies reloaded amount/date/allocation/balance/audit, then
  cancels with confirmation and verifies cancelled status, removed allocation,
  refreshed balance, audit, hidden correction forms, and one payment identity.
- Isolation: the runner used only `tmp/ft-006-admin-journal.db` and its owned
  server, then removed the exact database and sidecars. In a final bounded
  rerun, `study-calendar.db` had the same SHA-256 before and after:
  `ccc4e1a877518cf4cd0287c0be0c2f82a9d44679af518977e22b63bf4d52ac5d`. No
  existing server or real financial database was targeted by the task command.

## Required project gates

- `npm run check` → PASS; `svelte-check` 0 errors / 0 warnings.
- `npm run test` → PASS; 73 files / 250 tests.
- `npm run build` → PASS.
- `git diff --check` → PASS.
- `node .memory-bank/scripts/mb-lint.mjs` → PASS; 76 files, existing advisory
  metadata warnings only.
- `node .memory-bank/scripts/mb-doctor.mjs --strict` → PASS; 0 errors, one
  existing planned-candidate warning, 2 info.

## Scope and ownership

- Actual task outcome files: `src/routes/admin/[centerId]/finance/+page.server.ts`,
  `src/routes/admin/[centerId]/finance/+page.svelte`,
  `tests/routes/admin-finance-journal.test.ts`, and
  `e2e/ft-006-admin-journal.spec.ts`.
- Workflow protocol/evidence files are the `/exe` bookkeeping output.
- The existing W32 precision changes in the shared Svelte page were preserved.
- No Financial Ledger provider, Lesson Context, Calendar, runner/config,
  forbidden path, or direct financial table write was added.
- No reuse candidate is offered; these are executor self-attested results and
  `/verify` must independently establish the functional verdict.
