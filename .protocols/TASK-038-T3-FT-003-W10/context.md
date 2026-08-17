---
description: Execution context for TASK-038-T3-FT-003-W10.
status: active
---
# Context — TASK-038-T3-FT-003-W10

## Purpose

Make an authorized lesson rendered by `/calendar` navigate to the existing
`/lesson-context` route while preserving its exact server-rendered identity and
without granting client-side authorization authority.

## Execution Attempt

- attempt: Attempt 1
- started: 2026-08-15 01:18 +05

## Inputs (what drives this task)

- Task record: `.memory-bank/tasks/TASK-038-T3-FT-003-W10.task.json`
- Task index: `.memory-bank/tasks/index.json`
- Feature acceptance: `.memory-bank/features/FT-003-calendar-and-lesson-context.md#FT-003-AC-008`
- Planning approval: `.tasks/TASK-MB-REVIEW-TASKS-PLAN/TASK-MB-REVIEW-TASKS-PLAN-S-TASKS-FT-003-W9-W10-R1-final-report-docs-01.md`
- Direct contracts: Calendar and Membership Query, Access Control,
  Authentication Transport Browser/API path, and request-data-flow contracts.

## Richer inputs

- Dependencies `TASK-014-T3-FT-003-W8` and `TASK-037-T3-FT-003-W9` are `done`.
- `AuthorizedClassScope` and `LessonView` are already server-resolved by the
  calendar load; Lesson Context remains the final composition/authorization
  owner.
- Claim: FT-003-AC-008 / REQ-005 / REQ-006 / REQ-014.

## Loaded context set

- `AGENTS.md`
- `.memory-bank/constitution.md`
- `.memory-bank/spec-backbone.md`
- `.memory-bank/spec-index.md`
- `.memory-bank/features/FT-003-calendar-and-lesson-context.md`
- `.memory-bank/contracts/boundary-map.md`
- `.memory-bank/contracts/access-control.md`
- `.memory-bank/contracts/authentication-transport.md`

## Decisions / assumptions

- Decision: construct only standard anchors in the calendar presentation from
  its serialized `data`; do not call server modules or modify the calendar load.
- Assumption to prove: existing calendar data is sufficient to construct the
  exact required query identity and the existing Lesson Context route rejects a
  guessed student context.

## Commands run / environment notes

- Context and static source inspection only; no prospective test or production
  write occurred before this Attempt and lifecycle transition.

## Open questions / blockers

- Blocker: `CalendarPageData` from the existing `/calendar` server load
  exposes `classId`, `className`, `role`, `selectedDate`, and `lessons` only.
  It does not expose `accountId`, `studentAccountIds`, or another
  server-permitted selected student identity. The task forbids modifying that
  loader and stops execution if the optional student identity cannot be limited
  to server-returned scope. A shared-only link is safe but cannot satisfy the
  task-owned proof requiring a rendered link both with and without a permitted
  `studentAccountId`.

## Next session

- Start by reading: `context.md`, `plan.md`, `progress.md`.
- Next action: obtain a task/spec decision that either expands the calendar
  server-output boundary or narrows AC-008 to a shared-only link.
