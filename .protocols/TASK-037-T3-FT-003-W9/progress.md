---
description: Execution progress for TASK-037-T3-FT-003-W9.
status: active
---
# Progress — TASK-037-T3-FT-003-W9

## Current status
- state: implementing
- last update: 2026-08-15

## What was done
- Completed task, dependency, direct-spec, boundary, permission, and source-surface preflight.
- Initialized Attempt 1 before any prospective probe or production write.
- Moved only this task from `ready` to `in_progress`.
- Added the protected route, presentation-only DB-fact calendar, and isolated real route/SSR permission matrix.

## Commands run (with results)
- Read-only task/review/source preflight → OK.
- `test -f src/routes/calendar/+page.server.ts && test -f src/routes/calendar/+page.svelte` → RED (exit 1).
- `npx vitest run tests/routes/calendar-authorized.test.ts` → GREEN (1 file, 11 tests passed).
- `npm run check` → OK (0 errors, 0 warnings).
- `npm run test` → OK (31 files, 142 tests passed).
- `npm run build` → OK (production build emitted protected calendar server and page entries).
- `git diff --check` → OK.

## Claim-linked RED / GREEN (T2/T3)
- attempt: Attempt 1
- applicability: applicable
- accepted claim locator(s): `FT-003-AC-007 / REQ-005 / REQ-014 / REQ-016`
- accepted not-applicable reason and alternative proof: n/a
- RED command/probe: `test -f src/routes/calendar/+page.server.ts && test -f src/routes/calendar/+page.svelte`
- RED observation and evidence: exit 1 because neither protected route file exists; consequently no authenticated route can return server-authorized DB lesson facts. `.tasks/TASK-037-T3-FT-003-W9/attempt-1-red.md`.
- GREEN command/probe: `npx vitest run tests/routes/calendar-authorized.test.ts`.
- GREEN observation and evidence: 11/11 actual route-load plus server-render cases passed. Admin, assigned Teacher, permitted Student, and linked Parent received only `class-own`'s current `LessonView` identity/date/status; anonymous/revoked redirected, and cross-center/non-member/unassigned/removed reads returned 403 before a body rendered lessons. Every success/denial case compared a complete pre/post database snapshot. `.tasks/TASK-037-T3-FT-003-W9/attempt-1-green.md`.
- claim-equivalent probe changes and rationale: added one task-owned test file because no protected `/calendar` route existed. It calls the actual route `load`, uses the real composition root/query boundary, and server-renders the actual Svelte page; it does not mock authorization or persistence.
- T3 isolation/cleanup/permission evidence: each case creates an independent `:memory:` composition root and closes it in `afterEach`; snapshots enumerate every user table. The route reads only through `getAuthorizedClassScope` and `getLessons`, returns a minimized scope, and source/build inspection found no direct persistence, fixture weekday, or Lesson Context usage.

## Evidence links
- `.tasks/TASK-037-T3-FT-003-W9/attempt-1-red.md`
- `.tasks/TASK-037-T3-FT-003-W9/attempt-1-green.md`
- `.tasks/TASK-037-T3-FT-003-W9/TASK-037-T3-FT-003-W9-S-EXE-final-report-code-01.md`

## Open issues / risks
- No known task-scoped issue. Required independent functional and semantic verification remains outstanding by T3 policy.

## Next step (single concrete action)
- Run `/verify TASK-037-T3-FT-003-W9`; do not close this task in `/exe`.

## Owner lifecycle closure — 2026-08-15

- state: `done`
- owner: `/root`
- basis: independent functional `PASS` and required T3 `semantic-pass` for
  FT-003-AC-007 / REQ-005 / REQ-014 / REQ-016.
- residual: FT-003 and its mapped requirements remain `planned` pending the
  TASK-038 AC-008 outcome and aggregate feature gate; no prior task/code state
  changed.
