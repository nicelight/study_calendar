---
description: Global domain model, persistence ownership, and cross-slice data-flow rules.
status: active
last_updated: 2026-08-10
source_of_truth:
  - .memory-bank/domains/core-domain.md
---
# Core Domain and Data Ownership

## Persisted source of truth

The product has one shared application database. It is the authoritative
persisted source for account, center, class, lesson, collaboration, learning,
and financial facts. Physical colocation is not business ownership: every
mutable invariant and transition has one capability owner as listed below.

## Ownership map

| Capability slice | Owned entities/state | Must not own |
|---|---|---|
| Identity & Access | Internal Account, role, External Identity, Invitation, Session | Class/student membership, lesson schedule, grades, payment facts |
| Center & Scheduling | Center, Class, Student Membership, Parent Link, Teacher Assignment, Schedule, Lesson identity/date/status | Provider binding, grades/attendance, discussion, charges/payments |
| Lesson Context | Shared lesson material and authorized calendar/personal-day composition | Personal grade/attendance records, discussion objects, financial facts |
| Collaboration | Field Comment, Reaction, Message, Reply relationship, branch activity/visibility | Lesson ownership, grade/attendance, payment or balance state |
| Learning Progress | Homework completion, Grade, Attendance, lesson-scoped homework selection/relation semantics, and its transition workflow | Charge/allocation/balance rows; it calls Financial Ledger |
| Financial Ledger | Pricing settings, Lesson Charge, Payment, Payment Allocation, Balance, Payment Marker, Financial Audit Record | Center/class membership, lesson identity/date, grade/attendance state |

The Lesson Context composition is a read composition owner, not a new source of
truth for the facts it displays. Likewise, Payment Marker is a projection, not a
second Payment.

## Domain relationships

- A Center contains accounts and Classes within its administrative boundary.
- A Class has `individual` or `group` mode, class members, teacher assignment,
  schedule, and Lessons.
- A Lesson has stable identity, planned/actual date and status, shared material,
  and zero or more student-specific progress contexts.
- Learning Progress owns how lesson-scoped homework is selected for a grade
  projection. A personal lesson view consumes that provider-owned selection
  through `lessonId`; it does not own or persist a competing
  `lessonId -> homeworkId` mapping.
- A Personal Lesson Context is addressed by one Lesson and one Student; it
  composes Learning Progress, Collaboration scope, and Financial Ledger
  projections without owning those records.
- A Charge belongs to one Student/Lesson and snapshots the applied price.
- A Payment belongs to one Student and has an exact amount and factual date.
  Allocations connect the Payment to the oldest uncovered Charges; an advance
  is retained when no uncovered charge remains.
- A Discussion object carries an explicit shared/personal context and actor
  ownership. A root Message becomes a branch after its first reply; hidden
  branches remain persisted.

## Read and write data flow

1. The request adapter resolves an actor through Identity & Access.
2. The capability owner resolves target scope and current facts through its own
   state and accepted provider boundaries.
   For a personal grade, Learning Progress resolves the lesson-scoped homework
   selection internally and returns the authorized projection to Lesson Context.
3. The owner executes a command or scoped query. A command writes only its
   owned entities and calls a neighbor's public command for a neighbor-owned
   consequence.
4. Cross-slice views are composed from public queries. A consumer never reads
   another slice's tables to recreate authorization, balance, lifecycle, or
   business rules.
5. The result is a serializable view model; it is not persisted as a competing
   source unless a later subject contract explicitly assigns ownership.

## Persistence and transaction rules

- All durable business writes use the one shared database and an explicit
  transaction boundary appropriate to the owning public command.
- Cross-slice commands may participate in one transaction when the use case
  requires atomicity, while each owner still writes only its own state.
- Schema/migration ownership is project-level and linear; it does not replace
  capability-level business write ownership. The concrete migration tool is a
  Foundation decision within the accepted one-database target.
- Financial values are persisted and compared using one exact decimal-safe
  representation; the representation cannot be changed by a presentation
  projection or a price-setting update.
- External provider systems, browser state, calendar geometry, and UI markers
  are not persisted product sources of truth.

## Current-state evidence

The Foundation gate and current executable baseline are recorded in
[.memory-bank/foundation.md](../foundation.md). Current product evidence still
contains a single-homework `getGrade(homeworkId)` provider method and no
consumer-side lesson mapping; this is implementation drift to reconcile under
the accepted provider-owned lesson-scoped contract, not a competing target.
