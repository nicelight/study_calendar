# Attempt 1 — claim-specific RED

- Task: `TASK-039-T3-FT-003-W10`
- Claim: `FT-003-AC-008` / `REQ-005` / `REQ-006` / `REQ-014`
- Command: `npm run test -- tests/routes/calendar-navigation.test.ts`
- CWD: `/home/serg/Projects/study_calendar`
- Result: exit code `1`; 1 test failed.

The claim-specific SSR probe failed because the rendered lesson only exposed
the calendar day link and lesson fact; it did not contain
`href="/lesson-context?date=2026-08-10&amp;classId=class-own&amp;lessonId=lesson-own"`.
This is an honest pre-implementation RED for the accepted navigation claim,
before changing production behavior.

The failing probe did not exercise setup, syntax, unrelated behavior, or an
artificial assertion: it rendered `CalendarPage` with a server-shaped lesson
identity and asserted the exact accepted Lesson Context URL.
