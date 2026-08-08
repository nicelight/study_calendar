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

- No material target decision remains unresolved. Database vendor/migration
  library, exact provider SDK setup, and feature-level HTTP payloads are
  execution-level or downstream design choices recorded at their owning paths;
  they do not block the accepted modular-monolith target.

## Backbone Area Matrix

| Area | Status | Authoritative source | Notes |
|---|---|---|---|
| architecture_style | authoritative | [.memory-bank/architecture/system-architecture.md#accepted-target](architecture/system-architecture.md#accepted-target) | Modular monolith with capability/vertical slices, one deployable server. |
| source_of_truth | authoritative | [.memory-bank/domains/core-domain.md#persisted-source-of-truth](domains/core-domain.md#persisted-source-of-truth) | One shared database; slice write authority remains separate. |
| module_boundaries | authoritative | [.memory-bank/contracts/boundary-map.md#modules](contracts/boundary-map.md#modules) | Six capability slices, code roots, graph, exact public contracts, and forbidden bypasses. |
| user_scenarios | authoritative | [.memory-bank/prd.md#ux-interaction-flow](prd.md#ux-interaction-flow) | PRD flows are sufficient accepted scenario authority; no separate reviewed scenario artifact is required. |
| constraints | authoritative | [.memory-bank/constitution.md#governance-decisions](constitution.md#governance-decisions), [.memory-bank/product.md#constraints](product.md#constraints) | KISS, privacy, financial correctness, SvelteKit, small-center MVP. |
| non_goals | authoritative | [.memory-bank/prd.md#non-goals](prd.md#non-goals) | No school SIS, lesson-count payments, public personal grades, or second deployment mode. |
| domain_model | authoritative | [.memory-bank/domains/core-domain.md](domains/core-domain.md) | Entity ownership and read/write data flow are explicit. |
| data_flow | authoritative | [.memory-bank/architecture/system-architecture.md#composition-and-request-data-flow](architecture/system-architecture.md#composition-and-request-data-flow) | Request -> actor -> owning slice -> public cross-slice boundary -> shared DB -> serializable view. |
| storage | authoritative | [.memory-bank/domains/core-domain.md#persistence-and-transaction-rules](domains/core-domain.md#persistence-and-transaction-rules) | One shared durable DB, explicit transactions, exact money, project-level migration owner. |
| api_contracts | authoritative | [.memory-bank/contracts/boundary-map.md#inline-contracts](contracts/boundary-map.md#inline-contracts) | Internal public application boundaries are normative; HTTP payloads remain feature-level. |
| event_message_contracts | not_applicable | [.memory-bank/architecture/system-architecture.md#main-constraints](architecture/system-architecture.md#main-constraints) | No accepted inter-module event/message bus; persisted chat messages are Collaboration data. |
| agent_io_contracts | not_applicable | [.memory-bank/architecture/system-architecture.md#main-constraints](architecture/system-architecture.md#main-constraints) | The MVP has no agent/tool runtime or agent boundary. |
| security_safety | authoritative | [.memory-bank/contracts/access-control.md](contracts/access-control.md), [.memory-bank/invariants.md](invariants.md) | Server-side role/center/class/student checks, provider atomicity, privacy, and financial safety. |
| deployment | authoritative | [.memory-bank/architecture/system-architecture.md#deployment](architecture/system-architecture.md#deployment) | One SvelteKit server process and one shared database; providers are outbound adapters. |
| risks | authoritative | [.memory-bank/runbooks/mvp-verification.md#required-pre-real-data-checks](runbooks/mvp-verification.md#required-pre-real-data-checks), [.memory-bank/prd.md#edge-cases-failure-handling](prd.md#edge-cases-failure-handling) | Shared-boundary leakage, privacy, provider binding, lifecycle, financial, and projection risks have proof paths. |
| open_questions | authoritative | [.memory-bank/architecture/system-architecture.md#deferred-decisions](architecture/system-architecture.md#deferred-decisions) | No unresolved material target branch; deferred implementation choices have owner/trigger. |

## Global Backbone Status

- Status: complete
- Planning Revision: 1
- Mode: strict_architecture_scaffold
- Architecture artifact strategy: split-by-boundary-topic
- Not applicable areas:
  - event_message_contracts: not_applicable - no accepted inter-module event/message boundary; persisted Collaboration messages remain owned domain data.
  - agent_io_contracts: not_applicable - no agent, tool, or protocol runtime is in the accepted MVP target.
- Notes: The accepted operator target is durable in the architecture and
  domain contracts. Foundation is required because the repository has no
  executable baseline; no product behavior, task records, or implementation
  plan is created by this gate.

## Handoff To /prd-to-features

- Ready: yes
- Required reads: `.memory-bank/prd.md`, `.memory-bank/spec-index.md`, this
  file, `.memory-bank/glossary.md`, `.memory-bank/invariants.md`, and linked
  canonical design specs.
- Stop conditions: clarified PRD markers, framing status, glossary consistency,
  or relevant links are missing, stale, blocked, or contradictory.

## Handoff To /spec-design

- Global Backbone Status: complete
- Planning Revision: 1
- Decision: accepted target and strict architecture scaffold are durable.
- Downstream readiness: Foundation gate is complete; product task records
  remain absent pending the owning product design/task-planning workflow.

## Handoff To /foundation-to-tasks

- Ready: completed
- Foundation Required: true
- Gate anchor: `TASK-002-T3-FT-000-W1`
- Required reads: [.memory-bank/foundation.md](foundation.md),
  [.memory-bank/architecture/system-architecture.md](architecture/system-architecture.md),
  [.memory-bank/contracts/boundary-map.md](contracts/boundary-map.md), and
  [.memory-bank/runbooks/mvp-verification.md](runbooks/mvp-verification.md).

## Handoff To Feature Design

- Feature tasking must consume the exact links recorded in each feature's SDD
  Design Gate.
- The Foundation gate is complete. The next workflow is product feature design
  and task planning; no product task record is created by this sync.
