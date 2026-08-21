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

Queue action remains `rebuild_required`. Fresh TASK-058..069 first replaced the
unexecuted TASK-051..057 surface. The subsequent fresh review accepted
TASK-058..061 and TASK-063..064 but rejected TASK-062 and TASK-065..069 because
AC-003 crossed the accepted composition direction and the declared disposable
browser path could reuse a real-database server. Fresh TASK-070..077 replace
only that rejected subset:

1. TASK-058/059 separately implement direct-password and invitation profile
   provisioning.
2. TASK-060/061 separately implement shell and server logout; TASK-071 owns
   their AC-001 integration proof.
3. TASK-063/064 separately implement Home and Classes adapters; TASK-072 owns
   their AC-002 integration proof.
4. TASK-070 owns the shared fail-closed disposable browser runner contract.
5. TASK-073 owns only Center & Scheduling scoped registry facts and never calls
   Identity & Access or claims AC-003.
6. TASK-074 owns Learning Progress attendance and AC-006.
7. TASK-075 owns Financial Ledger payment capability and AC-005.
8. TASK-076 owns Lesson Context profile enrichment, provider composition, and
   the complete AC-003 integration proof.
9. TASK-077 owns typed sorting and AC-004 after the composed projection exists.

Every feature AC has one owner and dependency proof is never inherited. The
three browser cards call the TASK-070 runner with distinct `tmp/ft-007-*.db`
paths; it starts a new server, prepares and cleans the exact database, and
fails before using `study-calendar.db` or an existing server.

### Boundary pass

Unmerged units and independent proof paths are: direct-password provisioning,
invitation provisioning, shell implementation, logout implementation,
fail-closed disposable runner, Home adapter, Classes adapter, shell/logout
acceptance, Home/Classes acceptance, C&S registry facts, attendance provider,
payment provider, profile-enriched Statistics composition, and typed sorting.
No provider unit is merged with composition. The only justified integration
cards combine already completed inputs into one feature acceptance outcome:
TASK-071 for AC-001, TASK-072 for AC-002, and TASK-076 for AC-003. TASK-077
keeps the independently completable AC-004 presentation result separate.

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
gates, and only its owned proof. TASK-070 proves the reusable disposable runner;
TASK-071, TASK-072, and TASK-077 use it for focused browser gates. Provider and
composition cards use isolated database/route tests. Feature completion remains
subject to `/red-verify --feature FT-007` and the normal review/sync boundary.

## Planning revision

Global Backbone remains `complete` at Planning Revision `2`. This feature
extends accepted leaf contracts and provider queries without changing module
identity, the global architecture target, or the Foundation decision.
