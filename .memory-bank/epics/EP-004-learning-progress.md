---
description: Epic for homework completion, grading, and attendance.
status: active
last_updated: 2026-09-04
source_of_truth:
  - .memory-bank/epics/EP-004-learning-progress.md
  - .memory-bank/features/FT-005-learning-progress.md
type: epic
id: EP-004
lifecycle: planned
---
# EP-004 — Learning Progress

## Value
Учитель и ученик фиксируют прогресс по домашней работе и посещаемости, не
раскрывая персональные оценки и не создавая ошибочные начисления.

## Scope
- [.memory-bank/features/FT-005-learning-progress.md](../features/FT-005-learning-progress.md)

## Browser surface reconciliation — 2026-09-04

The prior `verified` interpretation was based on Learning Progress backend
storage and query evidence. The accepted product surface also requires
homework creation, Student completion, class-visible status, and Teacher/Admin
grading through `/lesson-context`. EP-004 is therefore `active`/`planned`
pending the sequential FT-005 W37 server transport and W38 UI/browser proof.
Historical task identities and evidence remain unchanged.

## Requirements
- REQ-009, REQ-010, REQ-014, REQ-015.

## Success / acceptance
- Статус ДЗ виден классу, оценка — только разрешённому личному контексту.
- `absent` не начисляет стоимость индивидуального или группового урока, а
  исправление `absent` на `present` создаёт charge по исторической цене,
  пересчитывает баланс и сохраняет audit history.

## Source / constraints
- [.memory-bank/prd.md](../prd.md#homework-grades-and-attendance), `FR-EDU-*`,
  `NFR-PRIV-*`, `NFR-FIN-*`.

## W37 task evidence reconciliation — 2026-09-05

The scheduler-decided `TASK-105-T3-FT-005-W37` closure adds current Attempt 2
functional `PASS` and required T3 `semantic-pass` evidence for the
server-composed Lesson Context homework projection and named create, complete,
and grade actions under `FT-005-AC-001 / FT-005-AC-002 / REQ-009 / REQ-014`.
See the [FT-005 W37 closure route](../features/FT-005-learning-progress.md#w37-server-transport-closure--2026-09-05)
and the [W37 sync report](../../.tasks/TASK-105-T3-FT-005-W37/TASK-105-T3-FT-005-W37-S-MB-SYNC-final-report-docs-01.md).

This task-scoped sync preserves the existing EP-004 document status and
`lifecycle: planned`. FT-005, REQ-009, and shared REQ-014 remain `planned`
because the W38 browser outcome and the feature-level aggregate gate are still
outstanding; no epic or feature lifecycle decision is inferred here.

## W38 browser UI closure — 2026-09-05

The scheduler-decided `TASK-106-T3-FT-005-W38` closure adds current Attempt 1
functional `PASS` and required T3 `semantic-pass` evidence for the existing
Lesson Context homework completion and grading surface under
`FT-005-AC-001 / FT-005-AC-002 / REQ-009 / REQ-014`. See the [FT-005 W38
closure route](../features/FT-005-learning-progress.md#w38-browser-ui-closure--2026-09-05)
and the [W38 sync report](../../.tasks/TASK-106-T3-FT-005-W38/TASK-106-T3-FT-005-W38-S-MB-SYNC-final-report-docs-01.md).

The browser contour is now evidenced through the W37 server transport and W38
UI/browser proof. This task-scoped sync preserves EP-004 document status
`active` and `lifecycle: planned`; FT-005, REQ-009, and shared REQ-014 also
remain `planned` pending the applicable feature-level aggregate/lifecycle
owner decision. No promotion or dependent transition is inferred here.
