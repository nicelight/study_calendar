---
description: Epic for comments, reactions, and threaded day communication.
status: active
last_updated: 2026-09-05
source_of_truth:
  - .memory-bank/epics/EP-003-day-collaboration.md
  - .memory-bank/features/FT-004-day-collaboration.md
type: epic
id: EP-003
lifecycle: planned
---
# EP-003 — Day Collaboration

## Value
Участники обсуждают конкретный учебный день и его поля, сохраняя авторство,
реакции, глубину ответов и личные границы.

## Scope
- [.memory-bank/features/FT-004-day-collaboration.md](../features/FT-004-day-collaboration.md)

## Requirements
- REQ-006, REQ-007, REQ-008, REQ-014.

## Success / acceptance
- Поля, комментарии и сообщения поддерживают установленную модель реакций и
  авторских комментариев.
- Ответы образуют вкладки активных веток без удаления скрытых сообщений.

## Browser completion reconciliation — 2026-09-03

The prior `verified` interpretation was based on Collaboration backend-boundary
and persistence evidence. The operator requires the whole Collaboration
experience to be available through the browser; the existing `/lesson-context`
currently exposes neither the content nor the mutation controls. EP-003 is
therefore `active`/`planned` pending the sequential FT-004 browser projection,
form transport, UI, and disposable Playwright cards. Historical task evidence
and task lifecycles remain unchanged.

## W35 correction closure — 2026-09-05

The indexed `TASK-107-T3-FT-004-W35` correction is now `done` with fresh
functional `PASS`, T3 `semantic-pass`, all required gates, and scheduler
closure. It closes the current route/Collaboration scope defect for
`FT-004-AC-005` without changing EP-003 lifecycle ownership. At that W35
boundary the remaining browser UI outcome was `TASK-103-T3-FT-004-W36`, still
awaiting its scheduler-owned dependent-state pass.

- [TASK-107 card](../tasks/TASK-107-T3-FT-004-W35.task.json)
- [W35 sync report](../../.tasks/TASK-107-T3-FT-004-W35/TASK-107-T3-FT-004-W35-S-MB-SYNC-final-report-docs-01.md)

## W36 browser closure reconciliation — 2026-09-05

The indexed `TASK-103-T3-FT-004-W36` card is now `done` under its recorded
Attempt 2 scheduler closure: functional `PASS`, T3 `semantic-pass`, required
native gates, and same-Judge `JUDGE_ASSESSMENT: SUPPORT`. The current evidence
closes the browser projection/UI contour for FT-004 while preserving the
accepted Lesson Context adapter and Collaboration ownership boundaries.

- [TASK-103 card](../tasks/TASK-103-T3-FT-004-W36.task.json)
- [functional evidence](../../.protocols/TASK-103-T3-FT-004-W36/verification.md)
- [functional report](../../.tasks/TASK-103-T3-FT-004-W36/TASK-103-T3-FT-004-W36-S-VERIFY-final-report-docs-02.md)
- [semantic evidence](../../.protocols/TASK-103-T3-FT-004-W36/red-verification.md)
- [semantic report](../../.tasks/TASK-103-T3-FT-004-W36/TASK-103-T3-FT-004-W36-S-RED-VERIFY-final-report-docs-01.md)
- [W36 sync report](../../.tasks/TASK-103-T3-FT-004-W36/TASK-103-T3-FT-004-W36-S-MB-SYNC-final-report-docs-01.md)

EP-003 remains document `active` / lifecycle `planned`. TASK-102 remains
`failed`, TASK-107 remains `done`, and this boundary makes no epic/feature or
requirement promotion decision; the feature-level aggregate lifecycle route
remains with its owning scheduler/feature workflow.

## Source / constraints
- [.memory-bank/prd.md](../prd.md#reactions-and-day-chat), `FR-COM-*`,
  `FR-DAY-003..005`, `NFR-PRIV-*`.
