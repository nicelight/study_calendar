---
description: Pure SDD spec registry and planned-spec index.
status: active
last_updated: 2026-08-18
source_of_truth:
  - .memory-bank/spec-index.md
---
# SDD Spec Index

## Purpose
- Keep a concise registry of existing and planned SDD specs.
- Read this index before creating new specs or doing serious design-pressure work.
- Keep readiness, open design questions, backbone status, and routing handoffs in [.memory-bank/spec-backbone.md](spec-backbone.md).
- Feature `spec_design_status` lives in feature frontmatter, not in this index.

## Spec Registry
| Type | Path | Status | Scope | Change route |
|---|---|---|---|---|
| governance | [.memory-bank/constitution.md](constitution.md) | active | Top governing policy. | /constitution |
| invariants | [.memory-bank/invariants.md](invariants.md) | planned | Global MUST/NEVER rules when evidence exists. | /spec-init or /spec-design |
| glossary | [.memory-bank/glossary.md](glossary.md) | active | Product vocabulary grounded in the accepted Product Brief. | /brief, /spec-init, or /spec-design |
| architecture | [.memory-bank/architecture/system-architecture.md](architecture/system-architecture.md) | active | Global modular-monolith shape, composition root, runtime, deployment, and Architecture Spine. | /spec-design |
| contract | [.memory-bank/contracts/boundary-map.md](contracts/boundary-map.md) | active | Canonical capability-slice inventory, dependency graph, public boundaries, and write ownership. | /spec-design or /feature-to-tasks |
| contract | [.memory-bank/contracts/access-control.md](contracts/access-control.md) | active | Server-side authentication, authorization scope, privacy, and provider-binding contract. | /spec-design or /feature-to-tasks |
| contract | [.memory-bank/contracts/authentication-transport.md](contracts/authentication-transport.md) | active | Minimal SvelteKit browser/HTTP path for authentication, sessions, protected Admin provisioning, and scoped schedule-form drafts. | /feature-to-tasks |
| contract | [.memory-bank/contracts/financial-ledger.md](contracts/financial-ledger.md) | active | Financial ownership, exactness, allocation, audit, projection, and replay contract. | /spec-design or /feature-to-tasks |
| contract | [.memory-bank/contracts/provider-adapters.md](contracts/provider-adapters.md) | active | Server-only normalized verification boundary for Telegram Login and Google OAuth adapters. | /feature-to-tasks |
| contract | [.memory-bank/contracts/statistics-projection.md](contracts/statistics-projection.md) | active | Read-only role-scoped registry shape, attendance/payment metric formulas, sorting, and composition rules for FT-007. | /feature-to-tasks |
| domain | [.memory-bank/domains/core-domain.md](domains/core-domain.md) | active | Global entity model, persisted source of truth, ownership, and storage/data flow. | /spec-design or /feature-to-tasks |
| state | [.memory-bank/states/lifecycle-map.md](states/lifecycle-map.md) | active | Access, lesson, collaboration, learning, and financial lifecycle transitions. | /spec-design or /feature-to-tasks |
| runbook | [.memory-bank/runbooks/mvp-verification.md](runbooks/mvp-verification.md) | active | Foundation smoke, pre-real-data checks, deployment smoke, and evidence routing. | /spec-design or /foundation-to-tasks |
| foundation | [.memory-bank/foundation.md](foundation.md) | active | Foundation Dev Path decision, anchors, pressure map, and exit criteria. | /spec-design or /foundation-to-tasks |
| testing | [.memory-bank/testing/strategy.md](testing/strategy.md) | active | Framework baseline testing policy. | explicit project-level user decision |

## Planned Specs
| Area | Expected path | Needed by | Notes |
|---|---|---|---|
| user_scenarios | .memory-bank/user-scenarios.md | /prd-to-features, /spec-design | Create only if a reviewed scenario artifact becomes necessary for a future scenario-sensitive decision; PRD flows currently suffice. |
| interface_contract_specs | .memory-bank/contracts/*, .memory-bank/testing/*, and .memory-bank/runbooks/* | /foundation-to-tasks, /feature-to-tasks | Extend only when a feature introduces a concrete subject contract, evidence/redaction concern, or non-trivial verification method. |
| foundation_substrate_specs | existing registered architecture, contract, domain, state, testing, and runbook paths | /foundation-to-tasks | Reuse the accepted global scaffold for the walking-skeleton proof path; do not create product behavior in Foundation. |
| subject_feature_concerns | .memory-bank/contracts/*, .memory-bank/domains/*, .memory-bank/states/*, .memory-bank/testing/*, .memory-bank/runbooks/*, or .memory-bank/guides/* | /feature-to-tasks | Discover registered canonical specs first; create only missing subject-based concerns and link exact paths from features/tasks. |

## Broken / Missing Links
- None identified.

## Update Rules
- Keep this file as index/registry only: types, canonical paths, statuses,
  scopes, change routes, and broken links.
- Canonical identity is the path. Do not add a separate spec key, feature owner,
  `used_by`, or reverse-usage copy; derive usage from feature/task links.
- Do not add global backbone status, backbone matrices, feature status maps, long hard rules, or open design question dumps here.
- Use [.memory-bank/spec-backbone.md](spec-backbone.md) for pre-PRD readiness, decomposition inputs, global backbone status, matrix, and handoffs.
- Use linked specs or ADRs for detailed decisions, rationale, contracts, state transitions, schemas, invariants, and testing rules.
