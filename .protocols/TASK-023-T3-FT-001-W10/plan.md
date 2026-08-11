---
description: Execution plan for TASK-023-T3-FT-001-W10.
status: active
---
# Plan — TASK-023-T3-FT-001-W10

## Goal

Make the existing process-local authentication-state TTL enforce bounded
retention during issue/consume and discard only the state issued for a provider
start that fails, while preserving valid sibling capabilities.

## Non-goals

- No background cleanup worker, durable/second store, capacity policy, or process-restart recovery.
- No invitation, account, identity, session, provider protocol, or unrelated lifecycle changes.
- No rewrite of TASK-022 production scope or any W9/W10 historical artifact.

## Inputs / source specs

- Task record: `.memory-bank/tasks/TASK-023-T3-FT-001-W10.task.json`
- Task index: `.memory-bank/tasks/index.json`
- Feature: `.memory-bank/features/FT-001-authentication-and-binding.md#ft-001-ac-004`, `.memory-bank/features/FT-001-authentication-and-binding.md#ft-001-ac-007`
- REQ IDs: `REQ-001`, `REQ-002`, `REQ-014`
- Canonical specs: authentication transport bounded retention, provider failure/ownership, provider verification boundary, testing evidence/ownership.

## Constraints / invariants (MUST / NEVER)

- MUST keep the five-minute process-local Map and cleanup bounded to issue/consume plus failed provider begin.
- MUST remove expired records without deleting an unexpired sibling.
- MUST discard only the newly issued failed-start state and preserve valid sibling states.
- MUST leave account, identity, invitation, and session snapshots unchanged on provider-start failure/expiry rejection.
- NEVER add persistence, a worker, capacity policy, a second lifecycle, or a new public provider contract.

## Scope

### In scope

- `src/lib/server/platform/auth-state.ts`
- `src/routes/auth/transport.server.ts`
- `tests/routes/auth-transport.test.ts`
- `tests/adapters/provider-boundary.test.ts`
- `.protocols/TASK-023-T3-FT-001-W10/` and `.tasks/TASK-023-T3-FT-001-W10/`

### Out of scope

- TASK-022/W9 task cards, protocols, evidence, lifecycle, and retry history.
- Identity & Access persistence/schema, provider adapter protocols, composition/configuration wiring, background jobs, and all other product features.

## Proposed changes

### Touched areas

- `auth-state.ts` — bounded expiry pruning and one-state discard behavior are the owned platform seam.
- `transport.server.ts` — failed provider begin must discard the state just issued for that attempt.
- route/provider tests — deterministic fake-clock, failed-start, sibling-preservation, and product-snapshot regression coverage.

### Preflight-confirmed change surface

- Expected hints kept: yes.
- Additional same-outcome files/areas: task-local protocol/evidence only; no additional production area authorized.
- Hard write boundary present and satisfied: yes.
- Forbidden scope / stop conditions: clear; no TASK-022/W9 artifact will be touched.

## Applicable quality gates

- [x] focused claim probes: `timeout 120s npm run test -- tests/routes/auth-transport.test.ts tests/adapters/provider-boundary.test.ts` — 2 files / 17 tests passed.
- [x] `timeout 120s npm run check` — 0 errors / 0 warnings.
- [x] `timeout 120s npm run build` — client/server bundles built; adapter-auto notice non-fatal.
- [x] `timeout 120s npm run test` — 21 files / 81 tests passed.
- [x] `git diff --check -- src/lib/server/platform/auth-state.ts src/routes/auth/transport.server.ts tests/routes/auth-transport.test.ts tests/adapters/provider-boundary.test.ts` — no output / exit 0.

## Claim-linked RED / GREEN (T2/T3)

- applicability: applicable; claims are task-owned bounded retention and failed-start state safety.
- accepted claim locators: `FT-001-AC-004`, `FT-001-AC-007`, `.memory-bank/contracts/authentication-transport.md#browser-bound-callback-state-and-bounded-retention`, `.memory-bank/contracts/provider-adapters.md#failure-and-ownership-rules`.
- planned probe/environment: disposable in-memory state/provider fixtures, deterministic fake clock/factories, separate sibling capabilities, and unchanged product-state snapshots; no credentials, network, durable DB, or live provider.
- observable RED: only if the current baseline retains an expired state after issue/consume or a failed start blocks/removes a valid sibling; setup/artificial failure is not RED.
- corresponding GREEN: expired records are gone after bounded operations, failed-start state is unusable, valid siblings remain consumable, safe provider error is returned, and product state is unchanged.
- accepted not-applicable reason and alternative proof: not applicable; current implementation may produce honest pre-implementation GREEN, which is retained rather than falsified into RED.
- T3 isolation/cleanup/permission boundary: in-memory/disposable fixtures, explicit DB cleanup, hard write boundary only, no forbidden scope.

## MB-SYNC handoff / owner

- Owner identified: none for lifecycle closure; user explicitly requested execution only.
- `.memory-bank/` docs needing update: none beyond the required selected-task status transition; durable product docs remain untouched.
- Task registry/status update: `/exe` owns only `ready -> in_progress`; later owner handles closure.
- Changelog/index/RTM: no update in this execution.

## Definition of done

- Task-owned bounded retention and failed-start discard are claim-equivalently covered; the current baseline supplied pre-implementation GREEN and task-local tests make sibling preservation explicit.
- Focused/native gate results and reproducible evidence are recorded.
- Task remains `in_progress`; next route is `/verify`, then required T3 `/red-verify`; no closure or sync occurs here.
