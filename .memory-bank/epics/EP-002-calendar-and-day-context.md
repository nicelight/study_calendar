---
description: Epic for elastic calendar navigation and shared/personal lesson context.
status: active
type: epic
id: EP-002
lifecycle: planned
---
# EP-002 — Calendar and Day Context

## Value
Пользователь видит учебный ритм и открывает общий или личный контекст нужного
учебного дня без потери границы ученика.

## Scope
- [.memory-bank/features/FT-003-calendar-and-lesson-context.md](../features/FT-003-calendar-and-lesson-context.md)

## Requirements
- REQ-005, REQ-006, REQ-014, REQ-016.

## Success / acceptance
- Учебные дни визуально доминируют, date picker приводит к выбранной дате, а
  переходы сохраняют правильный класс и ученика.
- Общие материалы и личные сведения отображаются в раздельных разрешённых
  контекстах.

## Source / constraints
- [.memory-bank/prd.md](../prd.md#elastic-calendar), `FR-CAL-*`, `FR-DAY-*`,
  `NFR-UX-*`, `NFR-PRIV-*`.
