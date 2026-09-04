# TASK-099-T3-FT-006-W32 — Attempt 2 GREEN

- attempt: 2
- Claim: `FT-006-AC-009 / REQ-011 / REQ-014`, including the accepted exact
  monetary precision requirement.
- Retry correction basis: confirmed `F-001` and completed `/feature-doctor
  FT-006` clarification. Attempt 1 GREEN is superseded for the changed
  browser constraint; Attempt 1 RED remains supporting historical evidence.

## Correction

- `src/routes/admin/[centerId]/finance/+page.svelte`: class and student
  override amount inputs use `step="any"`.
- `src/routes/lesson-context/+page.svelte`: the existing editable payment
  amount input uses `step="any"`.
- `tests/routes/lesson-context-payment-default.test.ts`: render expectation
  tracks the unrestricted exact-decimal browser setting.
- `e2e/ft-006-admin-pricing.spec.ts`: browser regression enters exact values,
  checks validity/submittability, submits Admin settings, and checks future
  exact charges without changing the payment action or financial ownership.

## Claim-equivalent GREEN

Focused command:

```sh
npm run test -- --run tests/routes/lesson-context-payment-default.test.ts tests/routes/admin-finance.test.ts tests/financial-ledger/price-settings.test.ts
```

Result: exit `0`; 3 files and 7 tests passed.

Disposable browser command:

```sh
node scripts/run-disposable-e2e.mjs --database tmp/ft-006-admin-pricing.db --spec e2e/ft-006-admin-pricing.spec.ts
```

Result: exit `0`; 1 test passed. The isolated browser journey observed:

- Admin class amount `10.125` and student override `15.125` had
  `step="any"`, `valid=true`, `stepMismatch=false`, and valid forms;
- both higher-precision Admin values were submitted and appeared in the
  deterministic history;
- Lesson Context initialized the editable amount to `10.125`, accepted it as
  a valid form value, and still accepted the edited `7.25` value;
- the future student charges stored `15.125` and `10.125`, while the prior
  charge stayed `10`.

## Required gates

| Command | Result |
|---|---|
| `npm run check` | exit `0`; 0 errors and 0 warnings |
| `npm run test` | exit `0`; 72 files and 247 tests passed |
| `npm run build` | exit `0`; production build completed |
| `node scripts/run-disposable-e2e.mjs --database tmp/ft-006-admin-pricing.db --spec e2e/ft-006-admin-pricing.spec.ts` | exit `0`; 1 test passed |
| `git diff --check` | exit `0`; no output |
| `node .memory-bank/scripts/mb-lint.mjs` | exit `0`; 76 files passed; existing metadata warnings only |
| `node .memory-bank/scripts/mb-doctor.mjs --strict` | exit `0`; 0 errors, 3 existing warnings, 2 info |

## Boundary and handoff

- Actual code/test files changed by Attempt 2 are task-listed and inside the
  hard write boundary.
- No Financial Ledger server code, authorization, ownership, history,
  future-charge, historical-charge, payment action, or disposable runner
  behavior changed.
- Forbidden Calendar, Center & Scheduling, real database, Playwright config,
  and runner paths were untouched. The exact `tmp/` database and sidecars were
  removed by the disposable runner.
- Attempt 2 evidence is executor-owned and not an independent verification
  result. Route to `/verify TASK-099-T3-FT-006-W32`; after functional PASS,
  route to `/red-verify TASK-099-T3-FT-006-W32`. Do not run either route inside
  this `/exe` handoff.
