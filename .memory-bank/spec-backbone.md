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

## Open Design Questions

- One material shared contract/data-flow decision is unresolved: how Lesson
  Context obtains the selected student's grade for a `lessonId` through the
  Learning Progress public boundary. Database vendor/migration library, exact
  provider SDK setup, and feature-level HTTP payloads remain execution-level or
  downstream design choices recorded at their owning paths.

## HALT_BLOCKING_QUESTIONS

- **Owner:** operator.
- **Question:** Which canonical Learning Progress contract supplies the
  selected student's grade in the Lesson Context personal response for a
  `lessonId`?
  - **KISS recommendation:** Learning Progress owns the lesson-to-homework
    relation/selection and exposes one authorized lesson-scoped personal
    progress query; Lesson Context passes `lessonId` and consumes the
    provider-owned projection. This keeps identity resolution and grade
    aggregation inside the existing provider boundary.
  - **Alternative requiring explicit acceptance:** retain the one-homework
    `getGrade(homeworkId)` query and authorize a stable `lessonId -> homeworkId`
    relation, including its owner, cardinality, lifecycle, and handoff to
    Lesson Context.
- **Non-negotiables:** no Lesson Context direct DB access, no invented
  `homeworkId`, no silent provider-contract change, and no weakening of the
  selected-student privacy rule.
- **Why this cannot be silently chosen:** either branch changes a public
  cross-slice contract and/or the persisted domain relation. The current
  sources do not decide relation ownership, cardinality, or projection shape;
  implementation evidence only shows `getGrade(homeworkId)` and a
  `lessonId`-based Lesson Context request.
- **Affected scope:** `REQ-006`, `REQ-009`, `REQ-014`; `FT-003-AC-004` and its
  personal-grade portion of `FT-003-AC-006`; provider compatibility for FT-005;
  `TASK-014-T3-FT-003-W8`; and the canonical routes
  [boundary-map personal progress query](contracts/boundary-map.md#personal-progress-query-boundary),
  [access control](contracts/access-control.md),
  [core domain](domains/core-domain.md#domain-relationships), and
  [request data flow](architecture/system-architecture.md#composition-and-request-data-flow).
- **Resume:** after the operator decision, rerun `/spec-design --all`, then
  route the affected feature through `/feature-to-tasks FT-003` before any
  retry of TASK-014.

## Backbone Area Matrix

| Area | Status | Authoritative source | Notes |
|---|---|---|---|
| architecture_style | authoritative | [.memory-bank/architecture/system-architecture.md#accepted-target](architecture/system-architecture.md#accepted-target) | Modular monolith with capability/vertical slices, one deployable server. |
| source_of_truth | authoritative | [.memory-bank/domains/core-domain.md#persisted-source-of-truth](domains/core-domain.md#persisted-source-of-truth) | One shared database; slice write authority remains separate. |
| module_boundaries | authoritative | [.memory-bank/contracts/boundary-map.md#modules](contracts/boundary-map.md#modules) | Six capability slices, code roots, graph, exact public contracts, and forbidden bypasses. |
| user_scenarios | authoritative | [.memory-bank/prd.md#ux-interaction-flow](prd.md#ux-interaction-flow) | PRD flows are sufficient accepted scenario authority; no separate reviewed scenario artifact is required. |
| constraints | authoritative | [.memory-bank/constitution.md#governance-decisions](constitution.md#governance-decisions), [.memory-bank/product.md#constraints](product.md#constraints) | KISS, privacy, financial correctness, SvelteKit, small-center MVP. |
| non_goals | authoritative | [.memory-bank/prd.md#non-goals](prd.md#non-goals) | No school SIS, lesson-count payments, public personal grades, or second deployment mode. |
| domain_model | blocked | [.memory-bank/spec-backbone.md#halt_blocking_questions](spec-backbone.md#halt_blocking_questions) | Existing ownership remains accepted, but lesson-to-homework identity/cardinality for the grade projection is not decided. |
| data_flow | blocked | [.memory-bank/spec-backbone.md#halt_blocking_questions](spec-backbone.md#halt_blocking_questions) | The request has `lessonId`; the legal provider path to the grade projection is unresolved. |
| storage | authoritative | [.memory-bank/domains/core-domain.md#persistence-and-transaction-rules](domains/core-domain.md#persistence-and-transaction-rules) | One shared durable DB, explicit transactions, exact money, project-level migration owner. |
| api_contracts | blocked | [.memory-bank/spec-backbone.md#halt_blocking_questions](spec-backbone.md#halt_blocking_questions) | Personal Progress Query Boundary names the outcome but does not authorize the missing lesson-scoped grade query or mapping. |
| event_message_contracts | not_applicable | [.memory-bank/architecture/system-architecture.md#main-constraints](architecture/system-architecture.md#main-constraints) | No accepted inter-module event/message bus; persisted chat messages are Collaboration data. |
| agent_io_contracts | not_applicable | [.memory-bank/architecture/system-architecture.md#main-constraints](architecture/system-architecture.md#main-constraints) | The MVP has no agent/tool runtime or agent boundary. |
| security_safety | authoritative | [.memory-bank/contracts/access-control.md](contracts/access-control.md), [.memory-bank/invariants.md](invariants.md) | Server-side role/center/class/student checks, provider atomicity, privacy, and financial safety. |
| deployment | authoritative | [.memory-bank/architecture/system-architecture.md#deployment](architecture/system-architecture.md#deployment) | One SvelteKit server process and one shared database; providers are outbound adapters. |
| risks | authoritative | [.memory-bank/runbooks/mvp-verification.md#required-pre-real-data-checks](runbooks/mvp-verification.md#required-pre-real-data-checks), [.memory-bank/prd.md#edge-cases-failure-handling](prd.md#edge-cases-failure-handling) | Shared-boundary leakage, privacy, provider binding, lifecycle, financial, and projection risks have proof paths. |
| open_questions | blocked | [.memory-bank/spec-backbone.md#halt_blocking_questions](spec-backbone.md#halt_blocking_questions) | Operator must choose the provider-owned lesson projection contract or explicit lesson-to-homework relation. |

## Global Backbone Status

- Status: blocked
- Planning Revision: 1
- Mode: strict_architecture_scaffold
- Architecture artifact strategy: split-by-boundary-topic
- Not applicable areas:
  - event_message_contracts: not_applicable - no accepted inter-module event/message boundary; persisted Collaboration messages remain owned domain data.
  - agent_io_contracts: not_applicable - no agent, tool, or protocol runtime is in the accepted MVP target.
- Notes: The accepted modular-monolith target, one SvelteKit server, and one
  shared database remain authoritative. The backbone is blocked only on the
  Lesson Context -> Learning Progress grade projection contract. Planning
  Revision remains 1 because no durable target decision was accepted; no
  product behavior, task record, implementation plan, retry budget, or task
  lifecycle was changed by this gate.

## Handoff To /prd-to-features

- Ready: yes
- Required reads: `.memory-bank/prd.md`, `.memory-bank/spec-index.md`, this
  file, `.memory-bank/glossary.md`, `.memory-bank/invariants.md`, and linked
  canonical design specs.
- Stop conditions: clarified PRD markers, framing status, glossary consistency,
  or relevant links are missing, stale, blocked, or contradictory.

## Handoff To /spec-design

- Global Backbone Status: blocked
- Planning Revision: 1
- Decision: accepted target and strict architecture scaffold remain durable;
  the provider projection branch in
  [HALT_BLOCKING_QUESTIONS](spec-backbone.md#halt_blocking_questions) is not
  accepted.
- Downstream readiness: blocked; obtain the operator decision and rerun
  `/spec-design --all` before feature/task reconciliation or task retry.

## Handoff To /foundation-to-tasks

- Ready: completed
- Foundation Required: true
- Gate anchor: `TASK-002-T3-FT-000-W1`
- Required reads: [.memory-bank/foundation.md](foundation.md),
  [.memory-bank/architecture/system-architecture.md](architecture/system-architecture.md),
  [.memory-bank/contracts/boundary-map.md](contracts/boundary-map.md), and
  [.memory-bank/runbooks/mvp-verification.md](runbooks/mvp-verification.md).

## Handoff To Feature Design

- Blocked by the unresolved shared provider projection contract. Preserve
  existing feature/task evidence and statuses; no feature promotion, task
  closure, retry-budget increment, or sync is authorized by this run.
