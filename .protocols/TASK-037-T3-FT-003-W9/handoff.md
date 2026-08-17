---
description: Execution handoff for TASK-037-T3-FT-003-W9.
status: active
---
# Handoff — TASK-037-T3-FT-003-W9

## Summary
- Added a protected `/calendar` server load that validates the request actor against the existing `AuthorizedClassScope`, then reads current class `LessonView` facts through Center & Scheduling.
- Added a presentation-only calendar that uses DB-derived lesson weekdays and displays lesson identity/date/status without creating Lesson Context links.
- Added an isolated actual route-load/server-render matrix for permitted and denied roles.

## Where to look
- key files:
  - `src/routes/calendar/+page.server.ts`
  - `src/routes/calendar/+page.svelte`
  - `tests/routes/calendar-authorized.test.ts`
- advisory `touched_files` deviations and rationale: none.
- hard write-boundary compliance: yes. Production and test changes are inside the exact boundary; task bookkeeping is skill-owned. No forbidden path was touched.

## How to run / verify
- gates: `npm run check`, `npm run test`, `npm run build`.
- claim-linked RED/GREEN evidence: Attempt 1 in `progress.md#claim-linked-red--green-t2t3`; artifacts `attempt-1-red.md` and `attempt-1-green.md`.
- current-attempt reuse candidate locators: none. The executor gates are supporting-only because the current working tree includes unrelated tracked and untracked changes, so their input state cannot be bounded conservatively for independent reuse.
- superseded/supporting-only receipt locators: none.

## Known issues
- None.

## Follow-ups
- Run `/verify TASK-037-T3-FT-003-W9`, then required per-task `/red-verify` on functional PASS. Keep lifecycle `in_progress` until its explicit owner records the T3 closure decision.

## Owner lifecycle closure — 2026-08-15

The explicit owner consumed the independent functional `PASS` and required T3
semantic `pass`; TASK-037 is now `done`. FT-003, TASK-038, and the mapped
requirements remain planned pending the AC-008 and aggregate feature gates.
