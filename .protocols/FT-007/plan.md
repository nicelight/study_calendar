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
- Protected destinations use `/home`, `/classes`, `/statistics`, and `/profile`;
  Profile is read-only over `fullName`, `role`, and `registeredAt`, and logout
  keeps the existing `POST /auth/logout` transport.

## Canonical inputs and ownership

- Feature: [.memory-bank/features/FT-007-navigation-and-statistics.md](../../.memory-bank/features/FT-007-navigation-and-statistics.md)
- Epic: [.memory-bank/epics/EP-006-navigation-and-statistics.md](../../.memory-bank/epics/EP-006-navigation-and-statistics.md)
- Governing requirements: REQ-014 and REQ-017; REQ-001 and REQ-003 govern the
  supporting all-path Internal Account profile correction.
- Primary composition owner: Lesson Context for the cross-slice read-only
  statistics projection; SvelteKit routes remain transport/presentation
  adapters only.
- Provider owners: Identity & Access owns participant profile metadata;
  Center & Scheduling owns registry scope and class/membership facts; Learning
  Progress owns attendance facts and attendance aggregates; Financial Ledger
  owns payment/allocation facts and payment capability aggregation.
- Canonical contract:
  [.memory-bank/contracts/statistics-projection.md](../../.memory-bank/contracts/statistics-projection.md)
- Canonical account profile contract:
  [.memory-bank/contracts/access-control.md#account-profile-facts](../../.memory-bank/contracts/access-control.md#account-profile-facts)
- Accepted graph and provider contracts:
  [.memory-bank/contracts/boundary-map.md](../../.memory-bank/contracts/boundary-map.md)

## Rebuilt queue and boundary outline

Queue action is `rebuild_required`. The unexecuted TASK-058..061, TASK-063/064,
and TASK-070..077 surface is retired because the accepted routes, AC ownership,
dependencies, and material task boundaries changed. Fresh TASK-078..086 replace
it without inheriting proof:

1. TASK-078 owns one complete Identity & Access profile result across bootstrap
   Admin, invitation, and direct-password creation plus the two accepted profile
   queries.
2. TASK-079 implements the protected shell and keeps existing logout integration,
   disposable-runner implementation, and AC-001 RED/GREEN proof together.
3. TASK-080 implements both `/home` and `/classes` as one role/scope-oriented
   AC-002 result.
4. TASK-081 owns only Center & Scheduling scoped registry facts.
5. TASK-082 and TASK-083 separately own attendance and payment projections.
6. TASK-084 owns Lesson Context composition and the `/statistics` AC-003 route.
7. TASK-085 owns typed Statistics sorting under AC-004.
8. TASK-086 implements `/profile` and owns the canonical protected-route AC-007
   result after the other destinations exist.

Every feature AC has one owner. Exact canonical technical claims are unique:
TASK-078 owns Access Control `Account profile facts`, and TASK-081 owns the
Statistics Projection C&S facts query. Dependency outcomes remain prerequisites
whose proof is not adopted by consumers.

### Boundary pass

Unmerged material outcomes are account profile facts, protected navigation,
role-oriented Home/Classes, C&S registry facts, attendance projection, payment
projection, Statistics composition, typed sorting, and bounded Profile. The
account paths merge because one schema and profile boundary are incomplete until
all supported creation paths satisfy them. Home and Classes merge because the
accepted AC-002 result and one server-resolved destination projection govern
both adapters. Existing logout and the disposable runner are supporting inputs
and proof mechanics inside TASK-079, not standalone outcomes. Provider units,
composition, sorting, and Profile remain independently completable.

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
gates, and only its owned proof. TASK-079 establishes the fail-closed disposable
runner while proving AC-001; TASK-080, TASK-085, and TASK-086 reuse the runner
for their own claims without inheriting TASK-079 evidence. Provider and
composition cards use isolated database/route tests. Feature completion remains
subject to `/red-verify --feature FT-007` and the normal review/sync boundary.

## Planning revision

Global Backbone remains `complete` at Planning Revision `2`. This feature
extends accepted leaf contracts and provider queries without changing module
identity, the global architecture target, or the Foundation decision.
