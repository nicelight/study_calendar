---
description: Bounded task-planning resume state for FT-007.
status: active
---
# FT-007 Task Planning Plan

## Outcome and scope

Deliver protected navigation, role-oriented Home/Classes destinations, and
read-only center-scoped Students, Teachers, and Classes registries with typed
sorting, factual payment capability, and conducted-lesson attendance metrics.

## Accepted clarification

- Statistics identity fields use an Identity & Access-owned participant
  `fullName` and immutable server-generated `registeredAt`; the participant
  creation path collects mandatory surname and given name and the system records
  the timestamp.
- Statistics obtains `fullName` and `registeredAt` only through the accepted
  Actor Context Boundary for account IDs already scoped by Center & Scheduling;
  direct account-table access is forbidden.
- Accounts without a name are outside the target population; no migration,
  backfill, or legacy-account handling is planned.
- Teacher attendance percentage is the aggregate of `present` student
  attendance across the teacher's assigned classes and conducted lessons,
  divided by all assigned-class student/lesson slots. Unmarked slots follow the
  accepted default-present attendance workflow.
- The feature remains read-only: no statistics projection may mutate account,
  center, class, lesson, attendance, payment, allocation, or balance facts.

## Canonical inputs and ownership

- Feature: [.memory-bank/features/FT-007-navigation-and-statistics.md](../../.memory-bank/features/FT-007-navigation-and-statistics.md)
- Epic: [.memory-bank/epics/EP-006-navigation-and-statistics.md](../../.memory-bank/epics/EP-006-navigation-and-statistics.md)
- Governing requirements: REQ-014 and REQ-017.
- Primary composition owner: Lesson Context for the cross-slice read-only
  statistics projection; SvelteKit routes remain transport/presentation
  adapters only.
- Provider owners: Identity & Access owns participant profile metadata;
  Center & Scheduling owns registry scope and class/membership facts; Learning
  Progress owns attendance facts and attendance aggregates; Financial Ledger
  owns payment/allocation facts and payment capability aggregation.
- Canonical contract:
  [.memory-bank/contracts/statistics-projection.md](../../.memory-bank/contracts/statistics-projection.md)
- Accepted graph and provider contracts:
  [.memory-bank/contracts/boundary-map.md](../../.memory-bank/contracts/boundary-map.md)

## Rejected-plan rebuild and boundary outline

Queue action is `rebuild_required`: fresh TASK-058..069 cards replace the
unexecuted TASK-051..057 cards because identity, dependency, E2E scope, and
claim ownership changed. The fresh boundary is:

1. TASK-058/059 separately implement direct-password and invitation profile
   provisioning.
2. TASK-060/061 separately implement shell and server logout; TASK-062 owns
   their AC-001 integration proof.
3. TASK-063/064 separately implement Home and Classes adapters; TASK-065 owns
   their AC-002 integration proof.
4. TASK-066 owns the Center & Scheduling registry payload, scope, and AC-003.
5. TASK-067 owns Learning Progress attendance and AC-006.
6. TASK-068 owns Financial Ledger payment capability and AC-005.
7. TASK-069 owns Lesson Context composition and typed sorting AC-004 only.

The provider and integration cards use exact single-task AC ownership. A
dependency's proof is never inherited. Browser gates use focused disposable
`tmp/ft-007-*.db` databases; `study-calendar.db` is forbidden for every FT-007
card.

### Boundary pass

Unmerged units and independent proof paths are: direct-password provisioning,
invitation provisioning, shell implementation, logout implementation, Home
adapter, Classes adapter, shell/logout acceptance, Home/Classes acceptance,
registry provider, attendance provider, payment provider, and Statistics typed
sorting. No implementation units are merged. The only justified merges are the
three feature-level integration cards: each combines already-completed sibling
adapters into one indivisible browser acceptance outcome (AC-001, AC-002, or
AC-004), with no dependency proof transfer.

## Non-goals

- No new capability slice, event bus, statistics database, cache, or competing
  source of truth.
- No student/parent center-wide registry access.
- No financial or attendance writes from statistics routes or projections.
- No changes to existing payment allocation, attendance transition, or session
  lifecycle semantics beyond the named read queries and accepted profile
  metadata.

## Verification and gates

Each T3 task has a claim-linked RED/GREEN path, project-native check/build/test
gates, and only its owned proof. TASK-062, TASK-065, and TASK-069 own focused
disposable-DB browser gates; provider cards use isolated database tests.
Feature completion remains subject to `/red-verify --feature FT-007` and the
normal review/sync boundary.

## Planning revision

Global Backbone remains `complete` at Planning Revision `2`. This feature
extends accepted leaf contracts and provider queries without changing module
identity, the global architecture target, or the Foundation decision.
