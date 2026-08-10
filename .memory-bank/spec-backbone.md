---
description: Global SDD backbone and durable architecture readiness state.
status: active
---
# SDD Spec Backbone

## Pre-PRD Spec Status

- Status: ready_for_prd
- Last updated: 2026-08-08
- Notes: Clarified PRD, Constitution, glossary, and decomposition-affecting
  product evidence are consistent; global design is now accepted and routed to
  the Foundation Dev Path before feature tasking.

## Decomposition Inputs

- User scenarios: authoritative in [.memory-bank/prd.md](prd.md#ux-interaction-flow),
  covering initial access, class work, personal context, and payment flow.
- Domain model: authoritative in [.memory-bank/domains/core-domain.md](domains/core-domain.md)
  and [.memory-bank/prd.md](prd.md#data-domain-model), reconciled with
  [.memory-bank/glossary.md](glossary.md).
- Constraints: authoritative in [.memory-bank/product.md](product.md#constraints) and
  [.memory-bank/constitution.md](constitution.md#governance-decisions).
- Non-goals: authoritative in [.memory-bank/prd.md](prd.md#non-goals).
- Risks: authoritative in [.memory-bank/prd.md](prd.md#edge-cases-failure-handling), elevated by the
  Constitution, and routed to
  [.memory-bank/runbooks/mvp-verification.md](runbooks/mvp-verification.md).
- Boundary model: accepted capability slices, graph, public boundaries, and
  write ownership are in [.memory-bank/contracts/boundary-map.md](contracts/boundary-map.md).
- Lifecycle model: accepted access, lesson, learning, collaboration, and
  financial transitions are in [.memory-bank/states/lifecycle-map.md](states/lifecycle-map.md).

## Resolved Operator Decision

- **Owner:** operator; applied by `/spec-design --all` on 2026-08-10.
- **Decision:** Learning Progress owns lesson-to-homework selection/relation
  semantics for the grade projection and exposes an authorized lesson-scoped
  personal progress query, for example
  `getGradeForLesson({ lessonId, actor/context })`. Lesson Context passes the
  stable lesson identity and server-resolved context and consumes the
  provider-owned result.
- **Persistence boundary:** this decision does not introduce an alternative
  consumer-owned or separately persisted `lessonId -> homeworkId` relation.
  Selection and any supporting representation remain inside Learning Progress;
  concrete feature-level selection behavior is downstream task-design detail.
- **Non-negotiables preserved:** no Lesson Context direct DB access, no
  invented `homeworkId`, and no weakening of the selected-student privacy rule.
- **Affected scope:** `REQ-006`, `REQ-009`, `REQ-014`; `FT-003-AC-004` and its
  personal-grade portion of `FT-003-AC-006`; provider compatibility for FT-005;
  `TASK-014-T3-FT-003-W8`; and the canonical routes
  [boundary-map personal progress query](contracts/boundary-map.md#personal-progress-query-boundary),
  [access control](contracts/access-control.md),
  [core domain](domains/core-domain.md#domain-relationships), and
  [request data flow](architecture/system-architecture.md#composition-and-request-data-flow).

## Open Design Questions

- No unresolved global architecture decision remains for this backbone.
  Concrete selection behavior, feature-level response payloads, database
  vendor/migration library, and provider SDK setup remain downstream or
  execution-level choices at their owning paths.

## Backbone Area Matrix

| Area | Status | Authoritative source | Notes |
|---|---|---|---|
| architecture_style | authoritative | [.memory-bank/architecture/system-architecture.md#accepted-target](architecture/system-architecture.md#accepted-target) | Modular monolith with capability/vertical slices, one deployable server. |
| source_of_truth | authoritative | [.memory-bank/domains/core-domain.md#persisted-source-of-truth](domains/core-domain.md#persisted-source-of-truth) | One shared database; slice write authority remains separate. |
| module_boundaries | authoritative | [.memory-bank/contracts/boundary-map.md#modules](contracts/boundary-map.md#modules) | Six capability slices, code roots, graph, exact public contracts, and forbidden bypasses. |
| user_scenarios | authoritative | [.memory-bank/prd.md#ux-interaction-flow](prd.md#ux-interaction-flow) | PRD flows are sufficient accepted scenario authority; no separate reviewed scenario artifact is required. |
| constraints | authoritative | [.memory-bank/constitution.md#governance-decisions](constitution.md#governance-decisions), [.memory-bank/product.md#constraints](product.md#constraints) | KISS, privacy, financial correctness, SvelteKit, small-center MVP. |
| non_goals | authoritative | [.memory-bank/prd.md#non-goals](prd.md#non-goals) | No school SIS, lesson-count payments, public personal grades, or second deployment mode. |
| domain_model | authoritative | [.memory-bank/domains/core-domain.md#domain-relationships](domains/core-domain.md#domain-relationships) | Learning Progress owns lesson-scoped homework selection/relation semantics; Lesson Context owns composition only. |
| data_flow | authoritative | [.memory-bank/architecture/system-architecture.md#composition-and-request-data-flow](architecture/system-architecture.md#composition-and-request-data-flow) | Lesson Context passes `lessonId` and actor/context to the authorized Learning Progress query; no consumer mapping is used. |
| storage | authoritative | [.memory-bank/domains/core-domain.md#persistence-and-transaction-rules](domains/core-domain.md#persistence-and-transaction-rules) | One shared durable DB, explicit transactions, exact money, project-level migration owner. |
| api_contracts | authoritative | [.memory-bank/contracts/boundary-map.md#personal-progress-query-boundary](contracts/boundary-map.md#personal-progress-query-boundary) | Personal Progress Query Boundary now owns the authorized lesson-scoped grade projection. |
| event_message_contracts | not_applicable | [.memory-bank/architecture/system-architecture.md#main-constraints](architecture/system-architecture.md#main-constraints) | No accepted inter-module event/message bus; persisted chat messages are Collaboration data. |
| agent_io_contracts | not_applicable | [.memory-bank/architecture/system-architecture.md#main-constraints](architecture/system-architecture.md#main-constraints) | The MVP has no agent/tool runtime or agent boundary. |
| security_safety | authoritative | [.memory-bank/contracts/access-control.md](contracts/access-control.md), [.memory-bank/invariants.md](invariants.md) | Server-side role/center/class/student checks, provider atomicity, privacy, and financial safety. |
| deployment | authoritative | [.memory-bank/architecture/system-architecture.md#deployment](architecture/system-architecture.md#deployment) | One SvelteKit server process and one shared database; providers are outbound adapters. |
| risks | authoritative | [.memory-bank/runbooks/mvp-verification.md#required-pre-real-data-checks](runbooks/mvp-verification.md#required-pre-real-data-checks), [.memory-bank/prd.md#edge-cases-failure-handling](prd.md#edge-cases-failure-handling) | Shared-boundary leakage, privacy, provider binding, lifecycle, financial, and projection risks have proof paths. |
| open_questions | authoritative | [.memory-bank/spec-backbone.md#resolved-operator-decision](spec-backbone.md#resolved-operator-decision) | No global blocker remains; feature-level selection and payload detail are explicitly routed downstream. |

## Global Backbone Status

- Status: complete
- Planning Revision: 2
- Mode: strict_architecture_scaffold
- Architecture artifact strategy: split-by-boundary-topic
- Not applicable areas:
  - event_message_contracts: not_applicable - no accepted inter-module event/message boundary; persisted Collaboration messages remain owned domain data.
  - agent_io_contracts: not_applicable - no agent, tool, or protocol runtime is in the accepted MVP target.
- Notes: The accepted modular-monolith target, one SvelteKit server, and one
  shared database remain authoritative. The operator's KISS projection
  decision resolves the Lesson Context -> Learning Progress contract and
  advances Planning Revision from 1 to 2 exactly once. No product behavior,
  task record, implementation plan, retry budget, or task lifecycle was changed
  by this gate.

## Handoff To /prd-to-features

- Ready: yes
- Required reads: `.memory-bank/prd.md`, `.memory-bank/spec-index.md`, this
  file, `.memory-bank/glossary.md`, `.memory-bank/invariants.md`, and linked
  canonical design specs.
- Stop conditions: clarified PRD markers, framing status, glossary consistency,
  or relevant links are missing, stale, blocked, or contradictory.

## Handoff To /spec-design

- Global Backbone Status: complete
- Planning Revision: 2
- Decision: accepted target and strict architecture scaffold remain durable;
  Learning Progress owns the lesson-scoped grade projection and its internal
  selection semantics.
- Downstream readiness: ready for planning reconciliation. Because indexed
  product tasks exist and the revision advanced, run `/foundation-to-tasks`
  revalidation when required, then `/feature-to-tasks --all` and
  `/review-tasks-plan --all` before any product task execution resumes.

## Handoff To /foundation-to-tasks

- Ready: completed
- Foundation Required: true
- Gate anchor: `TASK-002-T3-FT-000-W1`
- Required reads: [.memory-bank/foundation.md](foundation.md),
  [.memory-bank/architecture/system-architecture.md](architecture/system-architecture.md),
  [.memory-bank/contracts/boundary-map.md](contracts/boundary-map.md), and
  [.memory-bank/runbooks/mvp-verification.md](runbooks/mvp-verification.md).

## Handoff To Feature Design

- Ready with stale-planning reconciliation required. `FT-003` must compose the
  resolved Personal Progress Query Boundary, and all indexed product feature
  task plans must be rebuilt/reconciled for Planning Revision 2. Preserve
  existing task evidence, statuses, and lifecycles; no feature promotion, task
  closure, retry-budget increment, or sync is authorized by this run.
