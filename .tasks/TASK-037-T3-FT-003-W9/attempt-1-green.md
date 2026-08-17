# Attempt 1 — AC-007 GREEN

- Claim: `FT-003-AC-007 / REQ-005 / REQ-014 / REQ-016`
- Probe: `npx vitest run tests/routes/calendar-authorized.test.ts`
- CWD: `/home/serg/Projects/study_calendar`
- Result: exit `0`; 1 test file and 11 tests passed.
- Environment: every case creates a fresh `createCompositionRoot({ databaseFilename: ':memory:' })`, uses its real public Center & Scheduling boundary, invokes the actual SvelteKit `load`, and server-renders the actual calendar component. `afterEach` closes the database.
- Authorized comparison: Admin, assigned Teacher, permitted Student, and linked Parent each receive only `class-own` current facts: `lesson-own-planned` on `2026-08-10` with `planned`, and `lesson-own-completed` on `2026-08-11` with `completed`. The response body exposes only the authorized class/role and lesson identity/date/status; it excludes the other-center lesson and the public-fixture heading.
- Denial comparison: anonymous and revoked sessions redirect to `/login`; cross-center Admin, non-member Student, unassigned Teacher, and removed Teacher receive 403 before protected lesson markup is rendered.
- State comparison: the test snapshots every non-system SQLite table before and after each read. All authorized and denied route reads are state-equal; the removed-Teacher assertion compares after the deliberate fixture removal with after the rejected read.
- Boundary comparison: source and generated server output contain the named `getAuthorizedClassScope` and `getLessons` calls, with no direct `.sqlite` access, `DEFAULT_LESSON_WEEKDAYS`, or `/lesson-context` reference in the route surface.

Supporting project gates after this GREEN:

- `npm run check` → exit `0`, 0 errors and 0 warnings.
- `npm run test` → exit `0`, 31 files / 142 tests passed.
- `npm run build` → exit `0`, emitted both calendar server and page entries.
- `git diff --check` → exit `0`.
