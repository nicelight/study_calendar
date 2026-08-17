---
description: Claim-specific SSR RED evidence for TASK-038 Attempt 1.
status: active
---
# TASK-038 Attempt 1 — SSR RED

## Claim mapping

FT-003-AC-008 / REQ-005 / REQ-006 / REQ-014 requires a rendered calendar
lesson link to the existing `/lesson-context` route with exact identity.

## Probe

```text
npm run test -- tests/routes/calendar-navigation.test.ts
```

## Result

The targeted SSR test failed as expected (one test, one failure). The rendered
`lesson-own` fact is nested in a day anchor pointing to
`/calendar?classId=class-own&date=2026-08-10`; it has no anchor to
`/lesson-context?date=2026-08-10&classId=class-own&lessonId=lesson-own`.

The failing assertion is at
`tests/routes/calendar-navigation.test.ts:29`. No production file changed
before or after this probe.

## Blocking observation

The current `CalendarPageData` contract returned by
`src/routes/calendar/+page.server.ts` contains no server-authorized selected
student identity or list of permitted student identities. Under TASK-038's
hard boundary the loader cannot be changed, and the stop condition prohibits
deriving a `studentAccountId` from client role, URL, or a guessed value.
Therefore the required real rendered-link proof both with and without a
permitted student cannot receive a truthful GREEN inside this task.

## Safe rerun / cleanup

The probe is an SSR-only render with static `CalendarPageData`; it creates no
database, browser, network, or persisted state.
