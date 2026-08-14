---
description: Executor evidence for the TASK-031 scoped browser schedule-draft behavior.
status: active
---
# TASK-031 execution evidence

## Attempt 1 — claim-linked RED

In an isolated Chrome protected-Admin fixture for `center-task031-a` / `class-task031-a1`, the initial form submitted the exact native Form Data `startDate=2026-08-12`, `endDate=2026-09-01`, and repeated `weekdays=2,4,6`. Before implementation its exact draft key was absent; after reload all three values were empty/unchecked and the key remained absent. This is the honest pre-implementation loss observation.

## Attempt 1 — claim-linked GREEN

The same Chrome fixture observed the exact key value:

```json
{"startDate":"2026-08-12","endDate":"2026-09-01","weekdays":[2,4,6]}
```

Reload restored those exact visible values and Form Data to `class-task031-a1`. `class-task031-a2` and `center-task031-b` remained clean. Missing, invalid JSON, wrong-shape JSON, `2026-02-30`, and weekday `7` all opened clean defaults without a render failure. An empty-weekday submission returned the existing `invalid_schedule` text while preserving the matching key with the two dates and empty weekdays. A subsequent valid submission had exact native weekday Form Data, displayed `schedule_created`, removed only the A1 key, retained the separately seeded A2 key, and a later reload of A1 was clean.

## Gates

- Focused test: `npm run test -- tests/routes/admin-schedule-draft.test.ts` — 1 file / 2 tests passed.
- `npm run check` — 0 errors / 0 warnings.
- `npm run build` — production client and SSR builds completed.
- `npm run test` — 29 files / 114 tests passed.
- `git diff --check` — passed.

The reusable browser driver is `.tasks/TASK-031-T2-FT-002-W15/browser-probe.mjs`; it uses a disposable local SQLite fixture and Chrome DevTools only, not product persistence.
