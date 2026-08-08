---
description: Durable plan for the FT-000 Foundation planning handoff.
status: active
---
# FT-000 Foundation Plan

## Goal

Convert the accepted Foundation Dev Path into the smallest normal JSON task
queue that can establish and prove the executable SvelteKit/shared-database
walking skeleton before product feature tasking.

## Inputs and reused substrate

- [.memory-bank/foundation.md](../../.memory-bank/foundation.md): required Foundation decision, pressure map, minimal path, and exit criteria.
- [.memory-bank/requirements.md](../../.memory-bank/requirements.md#req-000--executable-foundation-baseline): REQ-000 and RTM entry.
- [.memory-bank/spec-backbone.md](../../.memory-bank/spec-backbone.md): complete strict architecture scaffold, Planning Revision 1.
- [.memory-bank/architecture/system-architecture.md](../../.memory-bank/architecture/system-architecture.md#accepted-target): one-server modular monolith and composition root.
- [.memory-bank/contracts/boundary-map.md](../../.memory-bank/contracts/boundary-map.md#modules): accepted capability slices and write owners.
- [.memory-bank/contracts/access-control.md](../../.memory-bank/contracts/access-control.md): server-side actor and scope authorization.
- [.memory-bank/domains/core-domain.md](../../.memory-bank/domains/core-domain.md#persistence-and-transaction-rules): shared database and transaction rules.
- [.memory-bank/testing/strategy.md](../../.memory-bank/testing/strategy.md#risk-based-checks): risk-based test selection.
- [.memory-bank/runbooks/mvp-verification.md](../../.memory-bank/runbooks/mvp-verification.md#foundation-smoke-path): executable Foundation smoke path.

The accepted database engine/migration library and exact provider SDK
configuration remain execution-level decisions. They must not be encoded as a
new global spec or used to widen the Foundation target.

## Minimum walking skeleton

1. Bootstrap the SvelteKit application shell and project-native `check`,
   `build`, `test`, and `dev` commands.
2. Wire one `src/lib/server/composition-root.ts`, the server hook/route shell,
   one platform database/provider seam, and only the Identity & Access and
   Center & Scheduling boundary seams required by the probes.
3. Establish an isolated database/schema fixture harness and focused atomic
   failure probes using disposable test state and test doubles; do not implement
   product calendars, collaboration, learning, or finance behavior.
4. Run the one-server integrated smoke and close only when the Foundation exit
   criteria are evidenced. The final gate itself is not closed by this planning
   workflow.

## Queue and dependency shape

| Task | Tier | Wave | Status | Responsibility | Dependency |
|---|---|---|---|---|---|
| `TASK-001-T3-FT-000-W0` | T3 | W0 | done | Bootstrap substrate, composition/boundary seams, and focused harness. | none |
| `TASK-002-T3-FT-000-W1` | T3 | W1 | planned | Final integrated check/build/test/start/smoke gate. | `TASK-001-T3-FT-000-W0` |

There is exactly one final Foundation gate: `TASK-002-T3-FT-000-W1`. No
product task records are created; the W0 completion is reflected from its
authoritative task record, while the final gate remains open.

## Scope controls

- Preserve the accepted modular monolith, one server, one shared database,
  explicit public boundaries, and single write owners.
- Do not create empty future slices, a layer-centric architecture, an event
  bus, a second deployment, speculative domain behavior, or product endpoints.
- Keep provider and database vendor choices at the execution-level seam unless
  implementation evidence exposes a new material architecture branch; then
  stop and route that branch to `/spec-design`.
- Use only isolated/disposable probe state with safe rerun and cleanup.

## Handoff

This planning boundary hands the queue to `/mb-doctor --strict`. Execution is
owned by the subsequent Foundation phase; this workflow does not invoke
`/exe`, `/verify`, `/red-verify`, `/autopilot`, or product tasking.
