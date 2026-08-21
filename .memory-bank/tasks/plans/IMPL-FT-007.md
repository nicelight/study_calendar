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

Include Internal Account profile metadata required by registries and bounded
Profile, protected navigation/logout, canonical routes, role-scoped class
destinations, provider-owned registry and metric queries, and Lesson Context
composition/presentation. Exclude a new
capability slice, statistics persistence/cache/event bus, source-fact writes
from projections, cross-center registry access, and changes to existing
attendance transition or financial allocation semantics.

## Canonical inputs and ownership

- Feature: [.memory-bank/features/FT-007-navigation-and-statistics.md](../../features/FT-007-navigation-and-statistics.md)
- Epic: [.memory-bank/epics/EP-006-navigation-and-statistics.md](../../epics/EP-006-navigation-and-statistics.md)
- Direct feature requirements: `REQ-014`, `REQ-017`. `REQ-001` and `REQ-003`
  govern the supporting all-path account-profile work in TASK-078;
  `REQ-010`, `REQ-012`, and `REQ-013` remain provider-source dependencies whose
  acceptance proof is not adopted by FT-007 cards.
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

## Rebuilt queue

Queue action is `rebuild_required`. The unexecuted TASK-058..061, TASK-063/064,
and TASK-070..077 cards are retired because the accepted Profile/routes decision
and fresh review require new AC ownership, dependencies, and material scope.
TASK-078..086 are fresh replacements and inherit no evidence.

The profile correction extends the existing Access Control contract with one
atomic `Account profile facts` obligation. It covers all supported new-account
paths and the current-actor/scoped-statistics queries, while preserving the
accepted no-migration/no-backfill disposition. The four feature routes are
`/home`, `/classes`, `/statistics`, and `/profile`; logout remains
`POST /auth/logout`.

The fail-closed disposable runner is implemented with TASK-079 because it is
development proof required by that shell outcome, not an independent product
claim. Later browser tasks reuse the executable runner with their own isolated
databases and claim-equivalent proof. Ordinary real-database smoke remains
unchanged.

## Ordered tasks

| Wave | Task | Outcome | Dependency |
|---|---|---|---|
| W27 | TASK-078-T3-FT-007-W27 | all-path Internal Account profile facts and profile queries | TASK-015-T3-FT-001-W2; TASK-029-T3-FT-001-W13; TASK-040-T3-FT-001-W20 |
| W28 | TASK-079-T3-FT-007-W28 | protected shell, existing logout integration, disposable proof, AC-001 | TASK-002-T3-FT-000-W1; TASK-020-T3-FT-001-W9; TASK-035-T3-FT-002-W19 |
| W28 | TASK-081-T3-FT-007-W28 | Center & Scheduling scoped registry facts query | TASK-006-T2-FT-002-W4 |
| W29 | TASK-080-T3-FT-007-W29 | `/home` and `/classes` role/scope outcome, AC-002 | TASK-079-T3-FT-007-W28; TASK-035-T3-FT-002-W19; TASK-026-T3-FT-002-W12 |
| W29 | TASK-082-T3-FT-007-W29 | Learning Progress attendance projection, AC-006 | TASK-042-T3-FT-005-W22; TASK-006-T2-FT-002-W4 |
| W29 | TASK-083-T3-FT-007-W29 | Financial Ledger payment projection, AC-005 | TASK-045-T3-FT-006-W23; TASK-046-T3-FT-006-W23 |
| W30 | TASK-084-T3-FT-007-W30 | `/statistics` Lesson Context composition, AC-003 | TASK-078-T3-FT-007-W27; TASK-079-T3-FT-007-W28; TASK-081-T3-FT-007-W28; TASK-082-T3-FT-007-W29; TASK-083-T3-FT-007-W29 |
| W31 | TASK-085-T3-FT-007-W31 | typed Statistics sorting, AC-004 | TASK-079-T3-FT-007-W28; TASK-084-T3-FT-007-W30 |
| W31 | TASK-086-T3-FT-007-W31 | `/profile` and canonical protected routes, AC-007 | TASK-078-T3-FT-007-W27; TASK-079-T3-FT-007-W28; TASK-080-T3-FT-007-W29; TASK-084-T3-FT-007-W30 |

Every task owns a material implementation result and keeps its proof. Account
creation paths merge only to complete one schema/query contract; Home and
Classes merge under one accepted role/scope result. Center & Scheduling owns
only structural facts, Learning Progress owns AC-006, Financial Ledger owns
AC-005, Lesson Context owns AC-003, sorting owns AC-004, and Profile owns
AC-007. Dependency proof remains with its owning card.

## Verification and gates

Each T3 task has a claim-linked RED/GREEN path, project-native check/build/test
gates, and only its own ownership evidence. TASK-079 implements the disposable
runner while proving AC-001; TASK-080, TASK-085, and TASK-086 reuse it for their
own focused browser claims. Provider and composition cards use isolated
database/route tests. No card inherits dependency proof.

## Planning Revision and Foundation

Global Backbone is `complete` at Planning Revision `2`. Foundation is required
and its final gate `TASK-002-T3-FT-000-W1` is `done`; every FT-007 task depends
on that gate directly or transitively through the existing product queue.
This reconciliation extends accepted leaf contracts only and does not change
the global architecture target or Foundation decision.
