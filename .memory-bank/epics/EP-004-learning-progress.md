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
