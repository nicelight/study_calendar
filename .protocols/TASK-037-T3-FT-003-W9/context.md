---
description: Execution context for TASK-037-T3-FT-003-W9.
status: active
---
# Context — TASK-037-T3-FT-003-W9

## Purpose

Replace only the authenticated `/calendar` fixture path with a server-authorized,
database-backed class calendar.

## Execution Attempt
- attempt: Attempt 1
- started: 2026-08-15

## Inputs (what drives this task)
- Task record: `.memory-bank/tasks/TASK-037-T3-FT-003-W9.task.json`
- Task index: `.memory-bank/tasks/index.json`
- Feature/AC: `.memory-bank/features/FT-003-calendar-and-lesson-context.md#ft-003-ac-007--authorized-calendar-uses-db-backed-class-lessons`
- REQs: `REQ-005`, `REQ-014`, `REQ-016`

## Richer inputs
- Public read boundaries: `.memory-bank/contracts/boundary-map.md#actor-context-boundary` and `#calendar-and-membership-query-boundary`.
- Permission and denial rules: `.memory-bank/contracts/access-control.md#authority-and-scope`.
- Browser path: `.memory-bank/contracts/authentication-transport.md#browserapi-path`.

## Loaded context set
- `AGENTS.md`
- `.memory-bank/constitution.md`
- `.memory-bank/spec-backbone.md`
- `.memory-bank/contracts/boundary-map.md`
- `.memory-bank/contracts/access-control.md`
- `.memory-bank/contracts/authentication-transport.md`
- `.memory-bank/tasks/TASK-037-T3-FT-003-W9.task.json`
- `.tasks/TASK-MB-REVIEW-TASKS-PLAN/TASK-MB-REVIEW-TASKS-PLAN-S-TASKS-FT-003-W9-W10-R1-final-report-docs-01.md`

## Decisions / assumptions
- The route will consume the existing request actor plus `getAuthorizedClassScope` and `getLessons`; it will not access persistence.
- `src/lib/calendar.ts` is reused unchanged as a pure geometry presenter with DB-derived lesson weekdays.
- Route tests use an isolated in-memory composition root, Svelte server rendering, and direct route load control-flow responses, matching the existing protected-route test style.

## Commands run / environment notes
- Read-only task/dependency/review preflight → OK: task is `in_progress` after this skill-owned transition; `TASK-013-T2-FT-003-W7` is `done`; Planning Revision 2 is approved.
- Touched production/test paths were clean before task work; unrelated working-tree changes were preserved.

## Open questions / blockers
- None. Existing public queries expose the required authorized scope and current `LessonView` facts.

## Next session
- Start by reading: `context.md`, `plan.md`, `progress.md`.
- Next action: obtain the AC-007 absence RED before creating the protected route.
