# Execution Evidence — TASK-099-T3-FT-006-W32

## Attempt 1

- Claim: `FT-006-AC-009 / REQ-011 / REQ-014`.
- Status: Attempt 1 in progress; task status `in_progress`.
- Preflight source observation: existing price commands and charge price resolution are present; the Admin finance browser surface, price-history/default queries, focused tests, and disposable spec are absent.
- Hard boundary: task `runtime_context.write_boundary` only; forbidden scope clear.

### Claim-linked RED

- Command: `node --input-type=module -e "...assert finance route and Financial Ledger queries..."`
- Result: `exit_code=1`.
- Observation: `AssertionError: FT-006-AC-009 finance route is missing`.
- Meaning: the accepted Admin pricing/history browser outcome is demonstrably absent before production changes; this is not a setup, syntax, or artificial failure.

### Implementation and GREEN

- Lifecycle action: `/exe` changed only the selected task card from `ready` to `in_progress`; the task was not closed.
- Financial Ledger: added authorized `getPriceSettings` and `getPaymentDefault` read projections. Existing set commands remain append-only and existing Charge rows remain immutable.
- Admin surface: added the protected own-center finance route/page, server-side class/student scope resolution, class price and student override actions, deterministic history, and navigation from the Admin center page.
- Lesson Context: existing payment form now receives the current class default as its initial editable amount; existing `createPayment` action and custom amount behavior remain unchanged.
- Focused GREEN: `npm run test -- --run tests/financial-ledger/price-settings.test.ts tests/routes/admin-finance.test.ts tests/routes/lesson-context-payment-default.test.ts` → PASS, 3 files and 7 tests.
- Browser GREEN: `node scripts/run-disposable-e2e.mjs --database tmp/ft-006-admin-pricing.db --spec e2e/ft-006-admin-pricing.spec.ts` → PASS, 1 test. It verifies Admin history/forms, Lesson Context initialization/editability, old charge preservation, and future class/override charge amounts in an isolated database.

### Required gates

- `npm run check` → PASS; `svelte-check found 0 errors and 0 warnings`.
- `npm run test` → PASS; 72 test files and 247 tests.
- `npm run build` → PASS; production build completed.
- `git diff --check` → PASS; no output.
- `node .memory-bank/scripts/mb-lint.mjs` → PASS; 76 files. Existing metadata warnings remain only in unrelated records.
- `node .memory-bank/scripts/mb-doctor.mjs --strict` → PASS; 0 errors, 3 warnings, 2 info. Warnings are the existing planned-ready candidates TASK-101, TASK-102, and TASK-105.

### Boundary and safety evidence

- Actual implementation/test/E2E files are all within the indexed `write_boundary`; no advisory file was omitted or added outside the selected outcome.
- No files under `src/routes/calendar/`, `src/lib/server/modules/center-scheduling/`, `study-calendar.db`, `playwright.config.ts`, or `scripts/run-disposable-e2e.mjs` were changed.
- Route code uses the Financial Ledger public boundary and server-resolved scope; it adds no direct financial SQL.
- The disposable runner cleaned only `tmp/ft-006-admin-pricing.db` and its sidecars; no persistent temporary database remains.

### Routing

- GREEN is executor evidence, not final closure. Route to `/verify TASK-099-T3-FT-006-W32`, then to T3 `/red-verify TASK-099-T3-FT-006-W32` if functional verification passes.
- Scheduler owns lifecycle closure, FT-000 updates, and wave status/checkpoint synchronization.
