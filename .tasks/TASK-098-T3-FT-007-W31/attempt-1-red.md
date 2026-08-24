# TASK-098 attempt 1 — claim-linked RED

- Task claim: `FT-007-AC-007 / REQ-014 / REQ-017` — bounded canonical `/profile` route.
- Command: `npx vitest run tests/routes/ft-007-profile-routes.test.ts`
- CWD: `/home/serg/Projects/study_calendar`
- Exit code: `1`
- Observation: both focused claim tests failed before any production change because `src/routes/profile/+page.server.ts` was absent. The assertion was `the task-owned /profile server route must exist`; received `false`.
- Interpretation: this is an honest, claim-specific pre-implementation RED for the missing task-owned Profile route, not a setup, syntax, or artificial failure.
