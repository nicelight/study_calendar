---
description: Execution context for TASK-020-T3-FT-001-W9.
status: active
---
# Context — TASK-020-T3-FT-001-W9

## Purpose

Expose the existing server-only provider, session, and invitation primitives
through the minimum SvelteKit browser/API path for login, logout, and invite
acceptance. Keep provider verification and persistence ownership in TASK-019.

## Execution Attempt

- attempt: 1
- started: 2026-08-11T02:33:15+05:00

## Execution Attempt — 2

- attempt: 2
- started: 2026-08-11T02:43:18+05:00

## Inputs (what drives this task)

- Task record: `.memory-bank/tasks/TASK-020-T3-FT-001-W9.task.json`
- Task index: `.memory-bank/tasks/index.json`
- Feature/REQs: FT-001 AC-006/AC-007; REQ-001, REQ-002, REQ-014
- Direct contracts: `.memory-bank/contracts/authentication-transport.md`,
  `.memory-bank/contracts/provider-adapters.md`,
  `.memory-bank/contracts/access-control.md`,
  `.memory-bank/contracts/boundary-map.md#actor-context-boundary`
- Dependency: `TASK-019-T3-FT-001-W9` is `done` with functional PASS and T3
  semantic-pass evidence for the consumed provider/session/invitation APIs.

## Constraints / invariants

- Routes, hooks, loads, and actions are thin adapters over public boundaries.
- `foundation_session` is the only session cookie: HttpOnly, Path=/,
  SameSite=Lax; Secure only for HTTPS and relaxed for local HTTP.
- Browser input never chooses account, role, center, membership, or invite
  ownership. Invitation callback state is server-issued, expiring, one-use,
  and remains bound until callback completion.
- No dev-login bypass, provider secrets, Admin UI/provisioning, direct DB write,
  new service/store, or changes to forbidden historical task records.

## Loaded context set

- `AGENTS.md`, `.memory-bank/constitution.md`, `.memory-bank/mbb/index.md`
- `.memory-bank/spec-backbone.md`, `.memory-bank/spec-index.md`,
  `.memory-bank/index.md`, `.memory-bank/roles/implementer.md`
- Task card, FT-001 plan/feature, current Planning Revision 2 FT-001 review
- Authentication transport, provider adapter, access-control, and boundary specs
- TASK-019 context/plan/progress/handoff and current source/public APIs

## Decisions / assumptions

- Use the existing composed `AuthenticationStateStore` capability as the
  server-side state owner; invitation context must be carried only through
  that server-bound state, never trusted from callback query/form input.
- Use injected provider adapters in route tests; no credentials or live
  provider network is required.

## Open questions / blockers

- None at preflight. Stop if satisfying the path requires changing a TASK-019
  public contract, adding a second state store/database, or widening ownership.

## Retry basis

- This bounded correction retry (1/2) addresses the Attempt 1 focused-gate
  failure recorded in `.tasks/TASK-020-T3-FT-001-W9/focused-green-blocked.txt`:
  `AuthenticationStateStore.issue()` drops the optional `invitationToken`
  before callback consumption.
- Attempt 1 RED and failed focused-gate evidence remain preserved historical
  supporting evidence; no prior artifact is overwritten.

## Next session

- Start by reading: `context.md`, `plan.md`, `progress.md`.
- Next action: apply the bounded state-continuity correction and rerun the
  focused route gate.
