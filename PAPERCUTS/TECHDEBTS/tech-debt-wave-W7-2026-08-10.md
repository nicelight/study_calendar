---
description: Advisory technical-debt report for W7 TASK-013.
status: advisory
---

# Technical Debt — W7 / TASK-013-T2-FT-003-W7

## RESULT

Подтверждён один material deferred-integration finding. Других material debt на проверенной поверхности не подтверждено.

## Checked scope

- Task card: `.memory-bank/tasks/TASK-013-T2-FT-003-W7.task.json` (`status: done`, W7, FT-003, `REQ-005`/`REQ-016`, advisory surface `src/routes/`, `src/lib/`, `tests/calendar/`).
- Actual relevant diff: рабочее изменение `src/routes/+page.svelte` и новые `src/lib/calendar.ts`, `tests/calendar/elastic-calendar.test.ts`.
- Durable evidence/probes: `.tasks/TASK-013-T2-FT-003-W7/execution-evidence.md`, `.protocols/TASK-013-T2-FT-003-W7/{progress,verification}.md`, `.tasks/TASK-013-T2-FT-003-W7/TASK-013-T2-FT-003-W7-S-VERIFY-final-report-docs-01.md`.
- Boundary basis: `.protocols/FT-003/plan.md:13-23`, `.memory-bank/features/FT-003-calendar-and-lesson-context.md:34-47`; unrelated worktree changes and workflow state were excluded.

## Findings

### TD-W7-01 — hard-coded lesson schedule remains on the production presentation path

- Evidence: `src/lib/calendar.ts:21-27` defines `DEFAULT_LESSON_WEEKDAYS` as a presentation fixture; `src/lib/calendar.ts:90-106` uses it by default to derive `isLesson`; `src/routes/+page.svelte:15` calls `buildCalendarWeeks(selectedDate)` without authorized lesson facts.
- Impact: the rendered lesson/free labels and elastic geometry can become factually wrong once the calendar is expected to represent real schedules. The fixture also creates a replacement seam that must be wired before the feature can provide the authorized learning rhythm promised by FT-003.
- Priority: Medium — not a W7 closure blocker because the task explicitly owns presentation geometry/date navigation and the plan assigns Lesson Context composition downstream, but it must be resolved before FT-003 relies on live lesson state.
- Smallest remediation direction: at the Lesson Context integration boundary, pass a typed per-week lesson-day model into `buildCalendarWeeks`, remove the default fixture, and add one data-backed probe covering changed lesson facts and resulting tracks/labels. Keep the existing pure geometry helper and presentation-only boundary.

## Uncertainty / non-findings

- This is deferred integration debt, not evidence that W7 violated its accepted scope: the source comment explicitly marks the fixture as temporary, and `.protocols/FT-003/plan.md:13-23` assigns Lesson Context ownership downstream.
- The focused probe contains source-contract assertions (`tests/calendar/elastic-calendar.test.ts:6-45`), but no separate debt is admitted for that brittleness: the durable verification also records fresh production-preview, SSR, hydration, exact-date navigation, geometry, and cue observations (`.protocols/TASK-013-T2-FT-003-W7/verification.md`, `#new-targeted-probes`).

## Next action

При интеграции Lesson Context заменить fixture на authorized schedule model и повторно проверить AC-001/AC-002 на данных, отличающихся по неделям; до этого workflow state не менять.
