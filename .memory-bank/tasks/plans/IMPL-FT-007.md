---
description: Implementation plan for FT-007 navigation and statistics.
status: active
---
# IMPL-FT-007 — Navigation and Statistics

## Goal

Implement one protected navigation shell, role-oriented Home/Classes
destinations, and read-only Students, Teachers, and Classes registries with
server-enforced scope, typed sorting, factual payment capability, and
conducted-lesson attendance metrics.

## Scope / non-goals

Include participant profile metadata required by registry rows, protected
navigation/logout, role-scoped class destinations, provider-owned registry and
metric queries, and Lesson Context composition/presentation. Exclude a new
capability slice, statistics persistence/cache/event bus, source-fact writes
from projections, cross-center registry access, and changes to existing
attendance transition or financial allocation semantics.

## Canonical inputs and ownership

- Feature: [.memory-bank/features/FT-007-navigation-and-statistics.md](../../features/FT-007-navigation-and-statistics.md)
- Epic: [.memory-bank/epics/EP-006-navigation-and-statistics.md](../../epics/EP-006-navigation-and-statistics.md)
- Requirements: `REQ-003`, `REQ-010`, `REQ-012`, `REQ-013`, `REQ-014`, `REQ-017`.
- Composition owner: Lesson Context at
  `src/lib/server/modules/lesson-context/`.
- Profile owner: Identity & Access at
  `src/lib/server/modules/identity-access/`.
- Registry/scope owner: Center & Scheduling at
  `src/lib/server/modules/center-scheduling/`.
- Attendance owner: Learning Progress at
  `src/lib/server/modules/learning-progress/`.
- Payment owner: Financial Ledger at
  `src/lib/server/modules/financial-ledger/`.
- Canonical feature contract:
  [.memory-bank/contracts/statistics-projection.md](../../contracts/statistics-projection.md)
- Accepted graph and shared contracts:
  [.memory-bank/contracts/boundary-map.md](../../contracts/boundary-map.md),
  [.memory-bank/contracts/access-control.md](../../contracts/access-control.md),
  [.memory-bank/domains/core-domain.md](../../domains/core-domain.md).

## Rejected-plan rebuild

Queue action is `rebuild_required`. The original unexecuted TASK-051..057 cards
are retired from the active index because their identity, ownership, and
material task boundaries changed. Fresh cards keep the accepted feature ACs and
do not inherit the old cards' proof.

The accepted profile decision reuses the existing Actor Context Boundary: I&A
returns only `fullName` and `registeredAt` for account IDs already scoped by
C&S; no consumer reads its tables. New accounts require surname and given name,
and no migration, backfill, or legacy-row path is planned.

The E2E gates use focused Playwright specs with an explicit disposable
`tmp/ft-007-*.db` `DATABASE_URL`. `study-calendar.db` is forbidden and is never
used by FT-007 proof.

## Ordered tasks

| Wave | Task | Outcome | Dependency |
|---|---|---|---|
| W27 | TASK-058-T3-FT-007-W27 | direct-password participant provisioning with required profile fields | TASK-040-T3-FT-001-W20 |
| W28 | TASK-059-T3-FT-007-W28 | invitation participant provisioning with required profile fields | TASK-058-T3-FT-007-W27; TASK-040-T3-FT-001-W20 |
| W28 | TASK-060-T3-FT-007-W28 | protected navigation shell implementation | TASK-020-T3-FT-001-W9; TASK-035-T3-FT-002-W19 |
| W28 | TASK-061-T3-FT-007-W28 | server-session logout implementation | TASK-020-T3-FT-001-W9 |
| W29 | TASK-062-T3-FT-007-W29 | shell/logout browser integration and AC-001 proof | TASK-060-T3-FT-007-W28; TASK-061-T3-FT-007-W28 |
| W29 | TASK-063-T3-FT-007-W29 | role-oriented Home destination implementation | TASK-060-T3-FT-007-W28; TASK-035-T3-FT-002-W19; TASK-026-T3-FT-002-W12 |
| W29 | TASK-064-T3-FT-007-W29 | scoped Classes destination implementation | TASK-060-T3-FT-007-W28; TASK-035-T3-FT-002-W19; TASK-026-T3-FT-002-W12 |
| W30 | TASK-065-T3-FT-007-W30 | Home/Classes browser integration and AC-002 proof | TASK-062-T3-FT-007-W29; TASK-063-T3-FT-007-W29; TASK-064-T3-FT-007-W29 |
| W30 | TASK-066-T3-FT-007-W30 | Center & Scheduling registry provider and AC-003 proof | TASK-059-T3-FT-007-W28; TASK-006-T2-FT-002-W4; TASK-040-T3-FT-001-W20 |
| W31 | TASK-067-T3-FT-007-W31 | Learning Progress attendance projection and AC-006 proof | TASK-066-T3-FT-007-W30; TASK-042-T3-FT-005-W22; TASK-006-T2-FT-002-W4 |
| W31 | TASK-068-T3-FT-007-W31 | Financial Ledger payment projection and AC-005 proof | TASK-066-T3-FT-007-W30; TASK-045-T3-FT-006-W23; TASK-046-T3-FT-006-W23 |
| W32 | TASK-069-T3-FT-007-W32 | Lesson Context composition and typed sorting with AC-004 proof | TASK-062-T3-FT-007-W29; TASK-065-T3-FT-007-W30; TASK-066-T3-FT-007-W30; TASK-067-T3-FT-007-W31; TASK-068-T3-FT-007-W31 |

Implementation units remain separate from their feature-level integration
claims: shell/logout and Home/Classes each have sibling implementation cards
plus one focused integration card; provider cards own AC-003/005/006, while
Lesson Context owns only AC-004. Dependency proof remains with its owning card.

## Verification and gates

Each T3 task has a claim-linked RED/GREEN path, project-native check/build/test
gates, and only its own ownership evidence. Focused disposable-DB browser gates
belong to TASK-062, TASK-065, and TASK-069; provider cards use isolated
database tests. No card inherits shell, provider, payment, or attendance proof
from a dependency.

## Planning Revision and Foundation

Global Backbone is `complete` at Planning Revision `2`. Foundation is required
and its final gate `TASK-002-T3-FT-000-W1` is `done`; every FT-007 task depends
on that gate directly or transitively through the existing product queue.
This reconciliation extends accepted leaf contracts only and does not change
the global architecture target or Foundation decision.
