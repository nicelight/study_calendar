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
  - .memory-bank/contracts/authentication-transport.md
  - .memory-bank/contracts/boundary-map.md
  - .memory-bank/contracts/statistics-projection.md
  - .memory-bank/domains/core-domain.md
clarification_status: complete
last_clarified: 2026-08-21
clarification_questions: 1
last_updated: 2026-08-22
---
# FT-007 — Navigation and Scoped Statistics

## Use Cases
- Авторизованный пользователь открывает из protected page Home (`/home`),
  Classes (`/classes`), Statistics (`/statistics`), Profile (`/profile`) или
  завершает сессию через существующий `POST /auth/logout`.
- Admin/Teacher просматривают разрешённые registry; Student/Parent переходят
  в доступный календарь класса.
- В Profile пользователь видит только server-owned `fullName`, `role` и
  immutable `registeredAt`; editing, password/provider management и membership
  controls не входят в FT-007.

## Edge / Failure Behavior
- UI visibility не заменяет server-side scope: прямой запрос вне доступа даёт
  отказ или безопасное empty state.
- Admin не получает данные другого Center, Teacher — вне assignment; Student и
  Parent не получают center-wide registry или private fields.
- Registry read-only и не изменяют account, center, lesson, attendance, payment,
  allocation или balance facts.
- `/home`, `/classes`, `/statistics` и `/profile` являются protected routes;
  anonymous или revoked session не получает их данные.

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

### FT-007-AC-007 — Canonical navigation routes and Profile are bounded
- REQ: REQ-014, REQ-017
- Home, Classes, Statistics и Profile используют canonical protected routes
  `/home`, `/classes`, `/statistics` и `/profile`; Logout сохраняет существующий
  server-owned `POST /auth/logout`. `/profile` read-only показывает только
  `fullName`, `role` и immutable `registeredAt` из server-resolved Identity &
  Access actor/profile facts и не содержит editing, password/provider
  management, membership controls или новой persistence.
- Verification: protected SSR/browser flow проверяет exact href/routes,
  authenticated Profile fields, anonymous/revoked denial, logout revocation и
  отсутствие profile mutation controls/commands.

### FT-007-AC-008 — Account profile facts and queries are bounded
- REQ: REQ-014, REQ-017
- Каждый новый target Internal Account из bootstrap Admin, invitation и
  direct-password paths атомарно получает обязательные `fullName` и immutable
  server-generated `registeredAt`. Current-actor query возвращает только
  `accountId`, `fullName`, `role`, `registeredAt` для valid session, а scoped
  statistics query — только `accountId`, `fullName`, `registeredAt` для
  запрошенных account IDs; revoked actor и failed creation не раскрывают и не
  оставляют partial profile state. Migration, backfill и fallback name не
  добавляются.
- Verification: isolated all-path creation/query matrix с exact projections,
  revoked denial, rollback, immutable timestamp и no-legacy proof.

### FT-007-AC-009 — Registry source facts preserve provider scope
- REQ: REQ-014, REQ-017
- Center & Scheduling public query возвращает только owner-held institution,
  class, membership, parent-link, assignment/count facts и account IDs:
  Admin — для собственного Center, Teacher — для assigned classes.
  Student/Parent center-wide requests и removed assignment не раскрывают rows;
  query не вызывает соседний capability, не возвращает profile/metric fields и
  не изменяет source state.
- Verification: isolated provider role/scope matrix, removed-assignment
  negative, exact fields, no-neighbor-call и state-before/state-after equality.

## Acceptance Closure
| Outcome | Coverage |
|---|---|
| Navigation and logout | FT-007-AC-001 |
| Role-scoped Home/Classes | FT-007-AC-002 |
| Scoped registries and fields | FT-007-AC-003 |
| Typed sorting | FT-007-AC-004 |
| Payment capability | FT-007-AC-005 |
| Attendance percentage | FT-007-AC-006 |
| Canonical routes and bounded Profile | FT-007-AC-007 |
| Bounded account profile facts and queries | FT-007-AC-008 |
| Provider-scoped registry source facts | FT-007-AC-009 |

## SDD Design Gate
Feature composes existing access, Center/class, lesson, and financial query
boundaries. It does not introduce a global Admin role, cross-center boundary,
or statistics source of truth.

- [.memory-bank/contracts/access-control.md](../contracts/access-control.md#profile-creation-and-query-obligation)
- [.memory-bank/contracts/authentication-transport.md](../contracts/authentication-transport.md#session-issuance-and-revocation)
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
is forbidden. Every supported new target-account path — first bootstrap Admin,
invitation participant, and direct-password participant — requires surname and
given name and records the server timestamp. Accounts without these facts are
outside the target population, so FT-007 adds no migration, backfill, fallback
name, or legacy-account handling.

### 2026-08-21 — Canonical routes and bounded Profile

The operator selected dedicated protected routes `/home`, `/classes`,
`/statistics`, and `/profile`. Profile is a read-only projection of existing
Identity & Access `fullName`, `role`, and immutable `registeredAt`; it adds no
editing, password/provider management, membership controls, or persistence.
Logout continues to use the existing server-owned `POST /auth/logout` contract.
This is a feature-local clarification under REQ-014/REQ-017 and does not change
the shared architecture or Planning Revision.
