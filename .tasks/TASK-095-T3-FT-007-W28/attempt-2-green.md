---
description: Retry claim-equivalent GREEN evidence for TASK-095-T3-FT-007-W28.
status: active
---
# Attempt 2 — claim-equivalent GREEN

- attempt: 2
- claim: `FT-007-AC-009` / `REQ-014` / `REQ-017`; corrected C&S registry
  provider boundary.
- command: `npm run test -- tests/center-scheduling/ft-007-registry-facts.test.ts`
- cwd: `/home/serg/Projects/study_calendar`
- result: exit code `0`; 1 test file and 1 test passed at 2026-08-22 05:37:04
  +0500.
- observed proof: Admin own-center and Teacher assigned-class scope,
  Student/Parent/unassigned/empty actor denial, cross-center isolation,
  removed-assignment denial, exact C&S-owned fields, no returned membership
  role/profile fields, no `resolveActor` or `getAccountEmail` calls during
  the provider query, and full relevant source-state equality.
- boundary proof: targeted source checks passed with exit code `0` for the
  registry query and membership helper, finding no `resolveActor`, `accounts`,
  `fullName`, or `registeredAt` references in the corrected boundary.
- isolation: fresh `:memory:` SQLite per test, cleanup in `afterEach`, no
  network, credentials, production database, or `study-calendar.db` access.
- status: executor GREEN is supporting evidence; fresh `/verify` remains
  required.
