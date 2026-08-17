---
description: Pseudo-feature for the minimum executable Foundation baseline.
status: draft
type: feature
id: FT-000
lifecycle: planned
clarification_status: complete
last_clarified: 2026-08-08
clarification_questions: 0
requirements: [REQ-000]
---
# FT-000 — Foundation Executable Baseline

## Scope

FT-000 is a reserved pseudo-feature for product-enabling Foundation work. It
does not describe product behavior and does not authorize any of the seven
product features. Its purpose is to make the accepted modular-monolith target
executable and verifiable before product tasking.

## Foundation outcome

The repository has one SvelteKit server, one composition root, one shared
transactional database path, the smallest Identity & Access and Center &
Scheduling boundary seams needed by the smoke path, and a project-native
check/build/test harness. The integrated smoke proves a representative route,
isolated fixture roundtrip, protected denial without an actor, authenticated
boundary access, and no partial state after a failed binding/transaction.

## Reused canonical substrate specs

- [.memory-bank/architecture/system-architecture.md](../architecture/system-architecture.md#accepted-target): one deployable server, composition root, and platform shape.
- [.memory-bank/contracts/boundary-map.md](../contracts/boundary-map.md#modules): accepted slice roots, ownership, and dependency boundaries.
- [.memory-bank/contracts/access-control.md](../contracts/access-control.md): server-side actor and scope checks.
- [.memory-bank/domains/core-domain.md](../domains/core-domain.md#persistence-and-transaction-rules): one database and transaction ownership.
- [.memory-bank/testing/strategy.md](../testing/strategy.md#risk-based-checks): cheapest sufficient executable checks.
- [.memory-bank/runbooks/mvp-verification.md](../runbooks/mvp-verification.md#foundation-smoke-path): Foundation smoke and evidence route.

## Clarifications

Clarification is complete: the accepted Foundation Dev Path is required for
the greenfield repository, and the execution-level database/provider choices
remain deferred without changing the accepted architecture or boundary
contracts.

## Lifecycle and handoff

- Lifecycle remains `planned`; this pseudo-feature is not promoted by sync.
- Implementation plan: [.memory-bank/tasks/plans/IMPL-FT-000.md](../tasks/plans/IMPL-FT-000.md).
- Foundation protocol: [`.protocols/FT-000/plan.md`](../../.protocols/FT-000/plan.md).
- Final gate: `TASK-002-T3-FT-000-W1`, which depends on
  `TASK-001-T3-FT-000-W0` and is complete in the authoritative task record.

FT-000 is intentionally absent from product feature decomposition and is not
a product acceptance surface.
