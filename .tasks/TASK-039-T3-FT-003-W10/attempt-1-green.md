# Attempt 1 — claim-equivalent GREEN

- Task: `TASK-039-T3-FT-003-W10`
- Claim: `FT-003-AC-008` / `REQ-005` / `REQ-006` / `REQ-014`
- Command: `npm run test -- tests/routes/calendar-navigation.test.ts`
- CWD: `/home/serg/Projects/study_calendar`
- Result: exit code `0`; 1 test file passed, 1 test passed.

The isolated T3 probe now follows the DB-backed calendar load into SSR output,
decodes the rendered Lesson Context href, and asserts the exact query key order
`date`, `classId`, `lessonId` with no `studentAccountId`. It then follows that
href through the existing `/lesson-context` server load and confirms shared
Lesson Context identity/material plus unchanged database state.

The claim-equivalent probe is disposable and safe to rerun: it uses a fresh
in-memory database and closes it in `afterEach`.
