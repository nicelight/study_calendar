---
description: Claim-equivalent Attempt 1 GREEN evidence for TASK-080-T3-FT-007-W29.
status: active
---
# Attempt 1 — Claim-equivalent GREEN

- attempt: `1`
- applicability: applicable
- claim: `FT-007-AC-002 / REQ-014 / REQ-017`; `/home` and `/classes` expose
  only server-authorized role destinations and fail closed for the task's
  negative matrix.
- RED basis: `.tasks/TASK-080-T3-FT-007-W29/attempt-1-red.md` recorded the
  pre-implementation absence of both route modules and 13 failed task tests.
- focused GREEN command: `npm run test -- tests/routes/ft-007-home-classes.test.ts`
- focused GREEN result: exit code `0`; `1` file / `13` tests passed. The
  in-memory route matrix proved Admin own-center, Teacher assigned class,
  Student/Parent accessible calendar, anonymous/revoked denial,
  cross-center/class and non-member denial, removed-assignment denial, state
  equality, and route/provider boundary ownership.
- disposable GREEN command: `node scripts/run-disposable-e2e.mjs --database
  tmp/ft-007-home-classes.db --spec e2e/ft-007-home-classes.spec.ts`
- disposable GREEN result: exit code `0`; Playwright `1 passed`. The owned
  server/browser run exercised both routes, four positive role flows, all
  negative scope cases, and read-state equality. The runner removed the exact
  database and `-wal`, `-shm`, and `-journal` sidecars; all four were absent
  immediately after the command.
- claim-equivalent probe changes: the focused source-boundary assertions were
  adjusted only to include the shared task-local `destination.server.ts` and
  `DestinationPage.svelte`; no behavioral assertion was weakened or removed.
- T3 isolation and permission evidence: the route test used `:memory:`; the
  browser runner used only project `tmp/ft-007-home-classes.db`; `study-calendar.db`
  and all forbidden module/routes were untouched.
