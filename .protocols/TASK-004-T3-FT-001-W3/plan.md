---
description: Execution plan for TASK-004-T3-FT-001-W3.
status: active
---
# Plan — TASK-004-T3-FT-001-W3

## Goal

Bind Telegram or Google to the invitation-owned account, add the other provider
only through a confirmed current session, and preserve identity state on
provider/callback failure.

## Non-goals

- Provider credentials, real network calls, UI/routes, duplicate-identity
  merging, provisioning redesign, and membership writes.
- Re-proving AC-003/AC-005 or changing completed dependency behavior.

## Inputs / source specs

- Task record: `.memory-bank/tasks/TASK-004-T3-FT-001-W3.task.json`
- Task index: `.memory-bank/tasks/index.json`
- Feature: `.memory-bank/features/FT-001-authentication-and-binding.md`
- REQ IDs: `REQ-001`, `REQ-002`

## Richer execution inputs

- Source artifacts: `.memory-bank/tasks/plans/IMPL-FT-001.md`,
  `.protocols/FT-001/plan.md`.
- Normative inputs: `.memory-bank/spec-backbone.md`,
  `.memory-bank/contracts/boundary-map.md#account-provisioning-boundary`,
  `.memory-bank/contracts/access-control.md`,
  `.memory-bank/states/lifecycle-map.md#access-and-membership`.
- Verification targets: exact AC-001 provider/account/role/membership checks,
  AC-002 confirmed-session positive/negative checks, and AC-004 explicit
  failure plus before/after persistence checks from the task card.

## Fallback basis

- Not applicable; richer inputs are complete.

## Constraints / invariants (MUST / NEVER)

- MUST keep identity/session writes in Identity & Access and provider
  verification behind that boundary.
- MUST resolve the second-provider target account from a valid server session.
- MUST leave invitation/account/role/membership/identity state unchanged on
  provider or callback failure.
- NEVER trust a client-selected role, merge identities, write membership state,
  or expose a route/UI bypass.

## Scope

### In scope

- Task-owned provider-binding behavior in Identity & Access.
- Isolated in-memory integration coverage for AC-001/002/004.
- T3 protocol, evidence, and Implementer handoff.

### Out of scope

- Foundation task cards in `runtime_context.forbidden_scope`.
- Provisioning implementation/proof, production provider credentials/network,
  schema migration, UI, and unrelated cleanup.

## Proposed changes

### Touched areas

- `src/lib/server/modules/identity-access/public.ts` — add the missing
  confirmed-session second-provider operation while preserving the owner.
- `src/lib/server/platform/database.ts` — persist the minimum one-use
  provider-binding confirmation fact for existing and new databases.
- `tests/identity-access/provider-binding.test.ts` — isolated claim-scoped
  probes for AC-001/002/004.
- Task-owned `.protocols/`, `.tasks/`, and lifecycle bookkeeping.

### Preflight-confirmed change surface

- Expected hints kept: `src/lib/server/modules/identity-access/` and
  `tests/identity-access/`.
- Advisory hints not needed: `src/lib/server/adapters/`; provider test doubles
  exercise the existing verifier port without credentials/network.
- Additional same-outcome file: `src/lib/server/platform/database.ts` owns the
  shared schema bootstrap and is required for Identity & Access's one-use
  session-confirmation fact; plus task-owned protocol/evidence and lifecycle.
- Hard `write_boundary` present and satisfied: not set.
- `forbidden_scope` / stop-condition check: clear; neither Foundation task card
  will be touched and no provider/privacy contract branch is unresolved.

## Applicable quality gates

- [x] Claim probes: `npm run test -- tests/identity-access/provider-binding.test.ts`
  — proves task-owned AC-001/002/004 behavior in disposable state.
- [x] Check: `npm run check` — task-required type/Svelte check.
- [x] Build: `npm run build` — task-required production build.
- [x] Test: `npm run test` — task-required regression suite.
- [x] Diff hygiene: `git diff --check` — checks touched diff formatting.

## Claim-linked RED / GREEN (T2/T3)

- applicability: applicable
- accepted claim locators: `FT-001-AC-001`, `FT-001-AC-002`, `FT-001-AC-004`
- planned test/probe and environment: one Vitest integration file using a fresh
  `:memory:` SQLite database per test; no credentials, network, or production DB.
- observable RED: AC-002 lacks any public second-provider operation and cannot
  bind the other provider from a confirmed session.
- corresponding GREEN: a valid session is re-confirmed through an already bound
  provider identity; the other provider then binds to the same account and
  consumes the one-use confirmation. Absent, invalid, unconfirmed, or
  wrong-identity confirmation paths reject without state change.
- accepted not-applicable reason and alternative proof: no artificial RED for
  AC-001/AC-004 because the dependency baseline already implements those exact
  task-owned behaviors; preserve honest pre-implementation GREEN with new
  claim-specific state assertions, then rerun after the AC-002 delta.
- T3 isolation, safe rerun, cleanup, and permission boundary: in-memory DB,
  `afterEach` close, deterministic verifier doubles, no secrets/network/external
  writes; only task-owned repository files are modified.

## Fan-out plan

- None; the operator assigned a single Implementer and no subagents.

## MB-SYNC handoff / owner

- [x] Owner identified: scheduler
- [x] Explicit standalone owner basis: n/a
- [x] `.memory-bank/` docs needing update: indexed task lifecycle only; broader
  sync remains scheduler-owned after verification/status decision.
- [x] `.memory-bank/index.md` router update needed: no
- [x] RTM update in `.memory-bank/requirements.md` needed: no
- [x] Task registry/status update owner: scheduler after `/verify` and required
  T3 `/red-verify`.
- [x] Changelog update owner: scheduler/`/mb-sync` at the wave boundary.

## Definition of done

- AC-001/002/004 have honest claim-linked execution evidence, the smallest
  required production delta is GREEN, task gates pass, hard/semantic scope is
  respected, and a durable Implementer handoff routes to `/verify` without
  running it.
