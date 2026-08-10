---
description: Foundation implementation plan for the FT-000 walking skeleton.
status: active
last_updated: 2026-08-10
source_of_truth:
  - .memory-bank/tasks/plans/IMPL-FT-000.md
---
# IMPL-FT-000 — Foundation Walking Skeleton

## Objective

Establish the smallest executable substrate that proves the accepted
one-server modular-monolith composition, one shared transactional database
path, explicit public boundaries, and reproducible Foundation verification.

## Normative basis

- [.memory-bank/requirements.md](../../requirements.md#req-000--executable-foundation-baseline): REQ-000.
- [.memory-bank/architecture/system-architecture.md](../../architecture/system-architecture.md#accepted-target): runtime and deployment target.
- [.memory-bank/architecture/system-architecture.md](../../architecture/system-architecture.md#composition-and-request-data-flow): request/composition flow.
- [.memory-bank/contracts/boundary-map.md](../../contracts/boundary-map.md#modules): slice roots and ownership.
- [.memory-bank/contracts/boundary-map.md](../../contracts/boundary-map.md#actor-context-boundary): actor boundary.
- [.memory-bank/contracts/boundary-map.md](../../contracts/boundary-map.md#calendar-and-membership-query-boundary): scope boundary.
- [.memory-bank/contracts/access-control.md](../../contracts/access-control.md): server-side authorization.
- [.memory-bank/domains/core-domain.md](../../domains/core-domain.md#persistence-and-transaction-rules): shared persistence and transaction rules.
- [.memory-bank/testing/strategy.md](../../testing/strategy.md#risk-based-checks): cheapest sufficient checks.
- [.memory-bank/runbooks/mvp-verification.md](../../runbooks/mvp-verification.md#foundation-smoke-path): smoke and evidence.

## Implementation units

### W0 — Bootstrap and focused substrate harness

Owned by `TASK-001-T3-FT-000-W0`:

- create the SvelteKit shell and project-native `check`, `build`, `test`, and
  `dev` commands;
- wire `src/hooks.server.ts`, `src/routes/`, and the single
  `src/lib/server/composition-root.ts`;
- establish the platform database/provider seam without fixing a vendor in
  this plan;
- create only the Identity & Access and Center & Scheduling roots needed to
  expose the actor/scope proof path; preserve public-boundary ownership and do
  not create empty future slices;
- add isolated fixture/harness probes for schema roundtrip and failed
  binding/transaction no-partial behavior.

### W1 — Integrated Foundation gate

Owned by `TASK-002-T3-FT-000-W1` after W0 is done:

- run the project-native check, build, and test gates;
- start one server on `127.0.0.1` and exercise one representative route;
- prove the configured shared database adapter reaches an isolated fixture;
- prove protected denial without an actor and authenticated access to a public
  module boundary;
- prove a failed binding/transaction leaves no partial state;
- record the result against the Foundation exit criteria and stop if a new
  material design branch appears.

## Expected change surface

- `package.json` and generated SvelteKit project configuration.
- `src/hooks.server.ts`, `src/routes/`, and
  `src/lib/server/composition-root.ts`.
- `src/lib/server/platform/` for the configured runtime seams.
- `src/lib/server/modules/identity-access/` and
  `src/lib/server/modules/center-scheduling/` only.
- Project-native isolated foundation tests and task-scoped evidence.

Exact filenames for the database adapter, migration source, provider test
double, and test runner were left as executor choices inside the accepted
roots.

## Explicit exclusions

- No calendar, collaboration, learning-progress, financial-ledger, or other
  product behavior.
- No additional capability slice, event bus, shared cross-slice repository,
  second server, cache, or speculative platform layer.
- No product feature task records, product implementation plan, or task
  execution/verification in this planning artifact.

## Verification ownership

The W0 task owns focused substrate checks. The W1 task owns the integrated
Foundation smoke and final gate. Dependency evidence is not copied into the W1
claim scope. Both tasks use isolated/disposable state with safe rerun and
cleanup and retain evidence under their task-scoped protocol/evidence paths at
execution time.
