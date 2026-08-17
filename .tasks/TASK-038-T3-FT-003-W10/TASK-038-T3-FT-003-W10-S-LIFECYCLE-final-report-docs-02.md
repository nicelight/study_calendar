---
description: Scheduler lifecycle disposition for superseded TASK-038.
status: final
---
# TASK-038 lifecycle disposition

TASK_ID: TASK-038-T3-FT-003-W10

LIFECYCLE: `failed`

DISPOSITION: `superseded`

SUPERSEDED_BY: `TASK-039-T3-FT-003-W10`

## Decision

The original TASK-038 target required a calendar link with optional
`studentAccountId` context, but the server-rendered calendar output does not
contain a server-authorized student identity and the task hard boundary forbids
changing the calendar loader. Its claim-specific RED and handoff prove the
boundary gap; they do not provide GREEN evidence.

The operator then accepted shared-only AC-008 through the owning
`/feature-to-tasks FT-003` route. Fresh reviewed TASK-039 owns the replacement
result: exact `date`, `classId`, and `lessonId` to `/lesson-context`, with no
`studentAccountId`. TASK-038 therefore cannot close against either the old or
new acceptance target and is terminally marked `failed` with disposition
`superseded`.

## Preservation and safety

- TASK-038 identity, tier, wave, dependencies, original card, protocol, and
  claim-specific RED evidence remain preserved.
- No production code, test implementation, persistence, unsafe side effect,
  retry, `/verify`, or `/red-verify` was replayed.
- TASK-039 is a fresh independently reviewed task and must not inherit TASK-038
  RED/GREEN or lifecycle evidence.

EVIDENCE:

- `.protocols/TASK-038-T3-FT-003-W10/handoff.md`
- `.protocols/TASK-038-T3-FT-003-W10/progress.md`
- `.tasks/TASK-038-T3-FT-003-W10/attempt-1-red.md`
- `.protocols/FT-003/decision-log.md`
- `.tasks/TASK-MB-REVIEW-TASKS-PLAN/TASK-MB-REVIEW-TASKS-PLAN-S-TASKS-FT-003-W10-SHARED-R1-final-report-docs-01.md`
