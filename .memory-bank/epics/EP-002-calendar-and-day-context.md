---
description: Epic for elastic calendar navigation and shared/personal lesson context.
status: active
type: epic
id: EP-002
lifecycle: verified
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

## FT-003 aggregate closure — 2026-08-17

FT-003 now has current aggregate `semantic-pass` evidence for AC-001..AC-008,
including the real browser authoring path and responsive free-day navigation.
EP-002 is therefore `verified`; requirements shared with other epics retain
their own RTM lifecycle until those other mappings close.

- [FT-003 feature](../features/FT-003-calendar-and-lesson-context.md)
- [current semantic report](../../.tasks/FT-003/FT-003-S-RED-VERIFY-final-report-docs-02.md)
