---
description: Claim-equivalent Attempt 2 GREEN evidence for the reconciled TASK-080 outcome.
status: active
---
# Attempt 2 — Claim-equivalent GREEN

- attempt: `2`
- applicability: applicable
- claim: `FT-007-AC-002 / REQ-014 / REQ-017`; C&S owns the complete
  server-resolved accessible class list for bare Student/Parent Home/Classes,
  while both routes remain read-only adapters over public C&S results.
- RED basis: `.tasks/TASK-080-T3-FT-007-W29/attempt-2-red.md` recorded the
  absent `getAccessibleClassList` query before the production correction.
- provider GREEN command: `npm run test -- tests/center-scheduling/ft-007-accessible-class-list.test.ts`
- provider GREEN result: exit code `0`; `1` file / `1` test passed. The
  in-memory C&S fixture proves complete Student and Parent enumeration across
  own-center classes, excludes unrelated center facts, returns only
  `classId`, `centerId`, `name`, and `mode`, denies unsupported/anonymous
  actors, and preserves membership/class/parent-link state.
- route GREEN command: `npm run test -- tests/routes/ft-007-home-classes.test.ts`
- route GREEN result: exit code `0`; `1` file / `13` tests passed. Both bare
  canonical routes prove Admin own-center, Teacher assigned-class, complete
  Student/Parent accessible-calendar lists, safe query filtering only after
  provider selection, anonymous/revoked/cross-center/non-member/removed-
  assignment denial, read-state equality, no direct DB access, and preserved
  destination owners.
- disposable GREEN command: `node scripts/run-disposable-e2e.mjs --database tmp/ft-007-home-classes.db --spec e2e/ft-007-home-classes.spec.ts`
- disposable GREEN result: exit code `0`; Playwright `1 passed`. The owned
  server/browser run exercised bare `/home` and `/classes` for Admin, Teacher,
  Student, and Parent, complete Student/Parent class lists, negative scope
  cases, revoked/anonymous redirects, and state equality. The exact database
  plus `-wal`, `-shm`, and `-journal` sidecars were absent immediately after
  cleanup.
- native GREEN results: `npm run check` passed with 0 errors/0 warnings;
  `npm run test` passed with `62` files / `204` tests; `npm run build` exited
  `0`; `git diff --check` exited `0`; `node scripts/mb-lint.mjs` exited `0`
  with 74 files and pre-existing advisory metadata warnings; and
  `node scripts/mb-doctor.mjs --strict` exited `0` with 0 errors, 0 warnings,
  and 2 info.
- claim-equivalent probe changes: the provider fixture and route/browser
  assertions were expanded only to cover the reconciled bare-list outcome;
  Attempt 1 evidence remains supporting-only and was not relabeled.
- T3 isolation and permission evidence: provider/route tests used `:memory:`;
  browser proof used only the declared `tmp/ft-007-home-classes.db`; forbidden
  capability modules, protected statistics/profile routes, and
  `study-calendar.db` were not touched.
