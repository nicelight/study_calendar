---
description: Claim-linked Attempt 1 RED evidence for TASK-080-T3-FT-007-W29.
status: active
---
# Attempt 1 — Claim-linked RED

- attempt: `1`
- applicability: applicable
- claim: `FT-007-AC-002 / REQ-014 / REQ-017`; both canonical `/home` and
  `/classes` role/scope destinations and their denial matrix are owned by this
  task.
- command: `npm run test -- tests/routes/ft-007-home-classes.test.ts`
- cwd: `/home/serg/Projects/study_calendar`
- input state basis: TASK-080 had just transitioned `ready -> in_progress`;
  the task-owned route test was newly present, while both route directories and
  production route modules were absent. Existing W27/W28 dirty changes were
  preserved and not part of the probe's production target.
- result: exit code `1`; all `13` task-specific tests failed before the route
  result existed. The first decisive failures were `Cannot find module
  '/src/routes/home/+page.server'` and the corresponding `/classes` module;
  the source-boundary assertion also observed that the four route files did
  not exist.
- decisive comparison: the accepted Home/Classes destination claim was not
  observable for any supported role, so implementation was required.
- evidence: command output captured in the execution session; no production
  behavior was changed before this RED observation.
