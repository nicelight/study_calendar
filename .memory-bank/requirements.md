---
description: Требования (REQ-IDs) + traceability matrix (RTM).
status: draft
---
# Requirements

## Status model
- Document `status`: `draft|active|deprecated|archived`
- RTM `Lifecycle`: `planned|implemented|verified`

## REQ list
### REQ-000 — Executable Foundation Baseline
- Before product features execute, the repository provides one runnable SvelteKit
  server with one composition root, one shared transactional database path, a
  minimal authenticated public-boundary path, project-native check/build/test
  commands, an isolated schema/fixture roundtrip, and an atomic failure probe
  that leaves no partial binding or transaction state. (Foundation Dev Path)

- **REQ-001 — Account binding and provider access:** MVP supports Telegram Login
  and Google OAuth; a center-created role and membership are bound through a
  one-time invitation, no user-selected role is allowed, and one external
  identity cannot bind to multiple accounts. (PRD FR-AUTH-001..008)
- **REQ-002 — Provider failure safety:** expired, revoked, reused, duplicate, or
  failed provider binding attempts reject without creating an account, changing
  role/membership, or creating a partial binding. (PRD Integrations; Edge Cases)
- **REQ-003 — Center and class administration:** Admin manages teachers,
  classes, students, parents, and links inside one center; a class is individual
  or group. (PRD FR-ORG-001..002)
- **REQ-004 — Lesson scheduling lifecycle:** Recurring schedules create planned
  lessons; one lesson may be added, moved, or cancelled without mutating other
  repetitions, and moving preserves lesson identity and context. (PRD FR-ORG-003..005)
- **REQ-005 — Elastic calendar navigation:** Each week uses an elastic row with
  lesson days wider than non-lesson days; the date picker reaches the selected
  date, shared/personal calendars use one temporal basis, and visual state is
  not conveyed by color alone. (PRD FR-CAL-001..005; NFR-UX-001..002)
- **REQ-006 — Shared and personal lesson context:** A shared day contains lesson
  topic, practical work, and homework; a personal day reuses shared material
  while isolating student-specific grades, discussions, and financial data.
  (PRD FR-DAY-001..005; AC-DAY-001)
- **REQ-007 — Field collaboration and reactions:** Authorized participants can
  edit one account-owned comment per field with author/time attribution and use
  five standard reactions on fields, comments, and messages while seeing
  reactors. (PRD FR-DAY-003..004; FR-COM-001..002)
- **REQ-008 — Threaded day chat:** Day chat supports arbitrary-depth replies;
  a root becomes a tab after its first reply, at most ten recently active
  branches are shown, hidden branches retain messages, and the common tab shows
  all accessible messages. (PRD FR-COM-003..007)
- **REQ-009 — Homework and grades:** A student can mark homework complete;
  teachers grade on `α`, `β`, `γ`, `F`; completion is class-visible while grades
  are restricted to the corresponding family, assigned teacher, and admin.
  (PRD FR-EDU-001..003)
- **REQ-010 — Attendance and charge eligibility:** MVP attendance is `present` or
  `absent`; an absent student in either individual or group lesson is not charged,
  and correcting `absent` to `present` creates the historical-price charge,
  recalculates the balance, and records an audit entry. (PRD FR-EDU-004..006)
- **REQ-011 — Historical lesson pricing:** Class lesson price, default payment
  amount, and student-specific price override are supported; the applied lesson
  price is fixed in its charge and settings changes affect only future charges.
  (PRD FR-FIN-001..003)
- **REQ-012 — Deterministic monetary ledger:** A payment stores student, amount,
  and factual date; allocation closes oldest uncovered charges first, preserves
  partial remainder and advance, marks paid/overdue states, and uses exact
  decimal-safe amounts. (PRD FR-FIN-004..010)
- **REQ-013 — Payment authority and projection:** Admin may create, edit, and
  cancel payments for any student/class in the Admin's own center; an assigned
  teacher may create only for an assigned class and may not edit/cancel. Cross-
  center access is denied. A payment marker may move to the closest previous
  non-lesson day and show factual date without changing the Payment, allocation,
  or balance; all markers remain discoverable. (PRD FR-FIN-011..015)
- **REQ-014 — Role and context privacy:** Every server-side read/change checks
  role and center/class/student membership; students and parents cannot receive
  another student's private data; assigned teachers get full class history only
  while assigned. (PRD NFR-PRIV-001..004)
- **REQ-015 — Financial correctness:** The same lesson, attendance, price, and
  payment sequence always yields the same balance/allocation; before real data,
  full, partial, excess payment, attendance correction, and historical-price
  cases are checked. (PRD NFR-FIN-001..002; Constitution)
- **REQ-016 — Product quality and acceptance:** The MVP requires build/smoke,
  integrated functional, privacy/access, and financial-correctness checks, then
  explicit operator acceptance or returned corrections. (PRD NFR-QA-001..003)

## Out of scope
- Полноценная школьная информационная система, школьная иерархия и
  государственная отчётность.
- Оплата количеством уроков и ручное распределение каждого платежа как
  основной сценарий.
- Финансовая цветовая кодировка общего календаря и классическая
  семиколоночная сетка как основной интерфейс.
- Публичные персональные оценки всему классу и самостоятельный выбор роли при
  входе.

## Traceability (RTM)
| REQ | Epic | Feature | Test | Lifecycle |
|---|---|---|---|---|
| REQ-000 | Foundation | FT-000 | test:foundation-baseline;test:foundation-smoke | planned |
| REQ-001 | EP-001 | FT-001 | test:FT-001-AC-001..005 | planned |
| REQ-002 | EP-001 | FT-001 | test:FT-001-AC-003..005 | planned |
| REQ-003 | EP-001 | FT-002 | test:FT-002-AC-001..002 | planned |
| REQ-004 | EP-001 | FT-002 | test:FT-002-AC-003..004 | planned |
| REQ-005 | EP-002 | FT-003 | test:FT-003-AC-001..004 | planned |
| REQ-006 | EP-002, EP-003 | FT-003, FT-004 | test:FT-003-AC-003..006;FT-004-AC-001;FT-004-AC-005 | planned |
| REQ-007 | EP-003 | FT-004 | test:FT-004-AC-001..002 | planned |
| REQ-008 | EP-003 | FT-004 | test:FT-004-AC-003..004 | planned |
| REQ-009 | EP-004 | FT-005 | test:FT-005-AC-001..002 | planned |
| REQ-010 | EP-004, EP-005 | FT-005, FT-006 | test:FT-005-AC-003..004;FT-006-AC-004 | planned |
| REQ-011 | EP-005 | FT-006 | test:FT-006-AC-001 | planned |
| REQ-012 | EP-005 | FT-006 | test:FT-006-AC-002..004;FT-006-AC-007 | planned |
| REQ-013 | EP-005 | FT-006 | test:FT-006-AC-005..006 | planned |
| REQ-014 | EP-001, EP-002, EP-003, EP-004, EP-005 | FT-001, FT-002, FT-003, FT-004, FT-005, FT-006 | test:FT-001-AC-001;FT-001-AC-005;FT-002-AC-005..006;FT-003-AC-006;FT-004-AC-005;FT-005-AC-002;FT-006-AC-005 | planned |
| REQ-015 | EP-004, EP-005 | FT-005, FT-006 | test:FT-005-AC-003..004;FT-006-AC-002..004;FT-006-AC-007 | planned |
| REQ-016 | EP-002, EP-005 | FT-003, FT-006 | test:FT-003-AC-001;FT-006-AC-002..006 | planned |
