---
description: Claim-equivalent GREEN evidence for TASK-095-T3-FT-007-W28.
status: active
receipt_status: supporting-only
---
# Attempt 1 — claim-equivalent GREEN

- claim: `FT-007-AC-009` / `REQ-014` / `REQ-017`.
- command: `npm run test -- tests/center-scheduling/ft-007-registry-facts.test.ts`
- cwd: `/home/serg/Projects/study_calendar`
- result: exit code `0`; 1 test file and 1 test passed.
- observed proof: Admin own-center and other-center facts, assigned Teacher
  class-only facts, Student/Parent denial, unassigned/removed Teacher denial,
  exact C&S-only output, no `getAccountEmail` call, and full relevant source
  state equality all passed.
- isolation: fresh `:memory:` SQLite and closed root per test; no production
  database, credentials, network, or external side effect.
- supporting-only status: executor GREEN is not independent `/verify` proof;
  fresh `/verify` remains required.
