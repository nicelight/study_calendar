---
description: Epic for protected navigation and center-scoped read-only statistics.
status: draft
type: epic
id: EP-006
lifecycle: planned
---
# EP-006 — Navigation and Statistics

## Value
Единый переход между разрешёнными разделами и компактный обзор данных Center
без изменения исходных учебных и финансовых записей.

## Scope
- [.memory-bank/features/FT-007-navigation-and-statistics.md](../features/FT-007-navigation-and-statistics.md)

## Requirements
- REQ-014, REQ-017.

## Success metrics
- Menu присутствует на защищённых страницах и показывает только допустимые
  destinations.
- Статистика не возвращает строки вне server-resolved scope.
- Три registry дают согласованные columns, typed sorting и воспроизводимые
  payment/attendance metrics.

## Acceptance criteria
- Admin видит собственный Center, Teacher — назначенные классы; Student и
  Parent не получают center-wide registry.
- Registry остаются read-only и соответствуют PRD-колонкам и формулам.

## Source / constraints
- [.memory-bank/prd.md](../prd.md#global-navigation-and-statistics):
  `FR-NAV-*`, `FR-STAT-*`, `NFR-PRIV-005`, `AC-HOME-001`.
- [.memory-bank/contracts/access-control.md](../contracts/access-control.md)
  и [.memory-bank/contracts/boundary-map.md](../contracts/boundary-map.md#calendar-and-membership-query-boundary):
  server-side scope и существующие owner queries; новый source of truth не
  создаётся.
