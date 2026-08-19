---
description: Product feature for protected navigation and center-scoped read-only registries.
status: draft
type: feature
id: FT-007
lifecycle: planned
epic: EP-006
requirements: [REQ-014, REQ-017]
spec_design_status: complete
spec_design_links:
  - .memory-bank/contracts/access-control.md
  - .memory-bank/contracts/boundary-map.md
  - .memory-bank/contracts/statistics-projection.md
  - .memory-bank/domains/core-domain.md
last_updated: 2026-08-19
---
# FT-007 — Navigation and Scoped Statistics

## Use Cases
- Авторизованный пользователь открывает из protected page Home, Classes,
  Statistics, Profile или Logout.
- Admin/Teacher просматривают разрешённые registry; Student/Parent переходят
  в доступный календарь класса.

## Edge / Failure Behavior
- UI visibility не заменяет server-side scope: прямой запрос вне доступа даёт
  отказ или безопасное empty state.
- Admin не получает данные другого Center, Teacher — вне assignment; Student и
  Parent не получают center-wide registry или private fields.
- Registry read-only и не изменяют account, center, lesson, attendance, payment,
  allocation или balance facts.

## Acceptance Criteria

### FT-007-AC-001 — Protected pages expose one navigation shell and logout
- REQ: REQ-017
- На каждой protected page hamburger открывает Home, Classes, Statistics,
  Profile и Logout; Logout завершает server session и возвращает на login.
- Verification: browser smoke на protected pages с проверкой session revocation.

### FT-007-AC-002 — Home and Classes are role- and scope-oriented
- REQ: REQ-014, REQ-017
- Home/Classes показывают только разрешённые destinations: Admin — собственный
  Center, Teacher — assigned classes, Student/Parent — доступный class calendar.
- Verification: role-based browser flow с cross-center/class и
  removed-assignment negative cases.

### FT-007-AC-003 — Three registries expose permitted rows and fields
- REQ: REQ-014, REQ-017
- Statistics открывает read-only registry с полями: Students — ФИО, дата
  регистрации, класс, родитель, teacher, payment capability, attendance %,
  institution; Teachers — ФИО, дата регистрации, классы, attendance %,
  institution, число students; Classes — название, institution, число students,
  teacher. ФИО и дата регистрации принадлежат server-owned participant profile;
  Teacher attendance % — aggregate present-student ratio по conducted lessons в
  assigned classes. Admin получает свой Center, Teacher — assigned classes;
  Student/Parent не получают center-wide registry или private fields.
- Verification: server-side role/scope matrix и guessed-route negative cases.

### FT-007-AC-004 — Registry sorting is typed
- REQ: REQ-017
- Каждый column сортируется в обоих направлениях с видимым active direction:
  text — alphabetically, dates — chronologically, percentages/numbers —
  numerically. Classes teacher отображаются по одной строке и сортируются по
  first class.
- Verification: table flow для всех column types и обоих направлений.

### FT-007-AC-005 — Payment capability uses factual dates
- REQ: REQ-017
- Payment capability равна доле counted payments с factual payment date раньше
  actual lesson date; counted unit — Payment Allocation к lesson charge; аванс
  и unallocated amount не считаются. Без counted units — `0%`, все on time —
  `100%`.
- Verification: no-payment, on-time, overdue, mixed и boundary-date scenarios.

### FT-007-AC-006 — Attendance percentage uses conducted lessons
- REQ: REQ-017
- Attendance percentage считается по `present`/`absent` для всех conducted
  lessons, включая записи из Teacher class-day attendance form; unmarked
  students after the class-day save follow the accepted default-present rule.
- Verification: education/statistics scenario с explicit absence, default
  present и correction.

## Acceptance Closure
| Outcome | Coverage |
|---|---|
| Navigation and logout | FT-007-AC-001 |
| Role-scoped Home/Classes | FT-007-AC-002 |
| Scoped registries and fields | FT-007-AC-003 |
| Typed sorting | FT-007-AC-004 |
| Payment capability | FT-007-AC-005 |
| Attendance percentage | FT-007-AC-006 |

## SDD Design Gate
Feature composes existing access, Center/class, lesson, and financial query
boundaries. It does not introduce a global Admin role, cross-center boundary,
or statistics source of truth.

- [.memory-bank/contracts/access-control.md](../contracts/access-control.md)
- [.memory-bank/contracts/boundary-map.md](../contracts/boundary-map.md#calendar-and-membership-query-boundary)
- [.memory-bank/contracts/boundary-map.md](../contracts/boundary-map.md#financial-projection-query-boundary)
- [.memory-bank/contracts/statistics-projection.md](../contracts/statistics-projection.md)
- [.memory-bank/domains/core-domain.md](../domains/core-domain.md#read-and-write-data-flow)

Feature-level composition and verification remain downstream `/feature-to-tasks`
work.

## Clarifications

### 2026-08-19 — Account profile boundary and population

Statistics receives `fullName` and immutable `registeredAt` from Identity &
Access through the accepted Actor Context Boundary; direct account-table access
is forbidden. New participant creation requires both surname and given name.
Accounts without a name are outside the target population, so FT-007 adds no
migration, backfill, or legacy-account handling.
