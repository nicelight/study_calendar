---
description: Epic for homework completion, grading, and attendance.
status: draft
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
