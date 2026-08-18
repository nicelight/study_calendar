# Execution evidence — TASK-050-T3-FT-006-W26

## Attempt 1

- Hard write boundary: `src/routes/calendar/`,
  `tests/routes/calendar-navigation.test.ts`,
  `e2e/real-database-payment.spec.ts`, `playwright.config.ts`, and the existing
  `study-calendar.db` fixture. No forbidden scope was touched.
- Production changes: none; the accepted Calendar projection and E2E already
  satisfied the task outcome, so no artificial implementation change was made.
- Focused real-database probe:
  `npm run e2e -- e2e/real-database-payment.spec.ts` → PASS; 1 test passed in
  9.8s. It used the existing local database, recorded one payment and one
  allocation, and verified Student `paid` and `unpaid` calendar cards.
- Route regression probe:
  `npm run test -- --run tests/routes/calendar-navigation.test.ts` → PASS;
  1 file / 4 tests during execution, then 1 file / 5 tests after the
  verifier-owned projection probe was added. It covered assigned Teacher
  payment, Student denial, and omission of payment state from shared
  Admin/Teacher calendar data.
- Cleanup/fixture inspection: dedicated Teacher and Student accounts remain;
  the post-run query found `e2e_named_sessions: 0`, `payments: 1`, and
  `allocations: 1`. The E2E source removes only the exact session tokens it
  captured and does not reset the database.
- Final required gates:
  - `npm run check` → PASS; 0 errors and 0 warnings.
  - `npm test` → PASS; 56 files / 176 tests.
  - `npm run build` → PASS; adapter-auto output informational only.
  - `npm run e2e -- e2e/real-database-payment.spec.ts` → PASS; 1 test passed.
  - `git diff --check` → PASS.
  - `node scripts/mb-lint.mjs` → PASS; 72 files with advisory metadata
    warnings only.
  - `node scripts/mb-doctor.mjs --strict` → PASS; 0 errors, 0 warnings,
    2 info.
- Claim-linked RED/GREEN: the pre-implementation browser contour was already
  green; no artificial RED or production correction was manufactured. Fresh
  focused browser and route probes provide GREEN evidence for
  `FT-006-AC-008 / REQ-013`.
- Next owner: `/verify TASK-050-T3-FT-006-W26` after required full gates.
