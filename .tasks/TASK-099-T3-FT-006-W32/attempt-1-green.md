# TASK-099-T3-FT-006-W32 — Attempt 1 GREEN

- Claim: `FT-006-AC-009 / REQ-011 / REQ-014`.
- Lifecycle: task remains `in_progress`; `/exe` did not close it.

## Claim-equivalent proof

- Focused tests:

  ```sh
  npm run test -- --run tests/financial-ledger/price-settings.test.ts tests/routes/admin-finance.test.ts tests/routes/lesson-context-payment-default.test.ts
  ```

  Result: PASS; 3 files and 7 tests.

- Disposable browser proof:

  ```sh
  node scripts/run-disposable-e2e.mjs --database tmp/ft-006-admin-pricing.db --spec e2e/ft-006-admin-pricing.spec.ts
  ```

  Result: PASS; 1 test. The isolated journey verifies own-center Admin history/forms, Lesson Context default initialization and editability, unchanged prior charge, and future class/override charge amounts.

## Required gates

| Gate | Result |
|---|---|
| `npm run check` | PASS — 0 errors, 0 warnings |
| `npm run test` | PASS — 72 files, 247 tests |
| `npm run build` | PASS |
| `git diff --check` | PASS |
| `node .memory-bank/scripts/mb-lint.mjs` | PASS — 76 files |
| `node .memory-bank/scripts/mb-doctor.mjs --strict` | PASS — 0 errors, 3 warnings, 2 info |

The remaining lint/doctor warnings are pre-existing and unrelated to this task: metadata gaps in existing Memory Bank records and planned-ready candidates TASK-101, TASK-102, and TASK-105.

## Boundary evidence

- Changed implementation and proof files are task-listed and inside the hard write boundary.
- Forbidden calendar routes, Center & Scheduling module, real database, Playwright config, and disposable runner were not changed.
- The disposable runner removed only the exact `tmp/ft-006-admin-pricing.db` state and sidecars after the browser run.
