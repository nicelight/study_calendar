---
description: Executor handoff for TASK-037-T3-FT-003-W9 Attempt 1.
status: active
---
# TASK-037-T3-FT-003-W9 — executor handoff

## Outcome

The authenticated `/calendar` path now renders current, server-authorized
DB-backed class lessons. It resolves Actor Context from the request, validates
the matching `AuthorizedClassScope`, then consumes `getLessons` through the
existing Center & Scheduling public boundary. The presentation receives only
the class name/id, role, selected date, and `LessonView` facts; it never reads
persistence or receives student scope.

## Actual change surface

- `src/routes/calendar/+page.server.ts`
- `src/routes/calendar/+page.svelte`
- `tests/routes/calendar-authorized.test.ts`
- Skill-owned execution evidence: `.protocols/TASK-037-T3-FT-003-W9/` and
  `.tasks/TASK-037-T3-FT-003-W9/`

All production/test changes are inside the hard `write_boundary`. The public
home fixture, pure helper, Center & Scheduling module, Lesson Context,
Collaboration, Learning Progress, Financial Ledger, and prerequisite artifacts
were not modified.

## Claim evidence

- RED: protected calendar route was absent before production work —
  [attempt-1-red.md](attempt-1-red.md).
- GREEN: an isolated actual route-load/server-render matrix passed 11/11 for
  Admin/Teacher/Student/Parent and anonymous/revoked/cross-center/non-member/
  unassigned/removed branches, including complete state equality —
  [attempt-1-green.md](attempt-1-green.md).

## Gates

- `npm run check` — passed, 0 errors / 0 warnings.
- `npm run test` — passed, 31 files / 142 tests.
- `npm run build` — passed; production output includes protected calendar entries.
- `git diff --check` — passed.

## Next route

Independent functional verification is required: `/verify TASK-037-T3-FT-003-W9`.
On functional PASS, run required per-task `/red-verify`. The task remains
`in_progress`; this executor did not close it.
