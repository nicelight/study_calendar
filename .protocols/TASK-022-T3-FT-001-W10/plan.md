---
description: Execution plan for TASK-022-T3-FT-001-W10.
status: active
---
# Plan — TASK-022-T3-FT-001-W10

## Goal

Make provider callback completion possible only from the browser that received
the matching server-issued binding cookie, with fail-closed one-use cleanup
before provider verification or Identity & Access completion.

## Non-goals

- No provider protocol or adapter contract changes.
- No Identity & Access, membership, account, invitation, or session ownership changes.
- No durable auth-state store, background cleanup, development login, client-readable authorization state, or W9 artifact changes.
- No TASK-023 retention/failed-start correction or TASK-024 composition/configuration wiring.

## Inputs / source specs

- Task record: `.memory-bank/tasks/TASK-022-T3-FT-001-W10.task.json`
- Task index: `.memory-bank/tasks/index.json`
- Feature/Epic: `.memory-bank/features/FT-001-authentication-and-binding.md#ft-001-ac-006`, `.memory-bank/features/FT-001-authentication-and-binding.md#ft-001-ac-007`
- REQ IDs: `REQ-001`, `REQ-002`, `REQ-014`

## Richer execution inputs

- Source Artifacts: authentication transport browser-bound state and invitation acceptance sections; provider verified identity contract; provider verification boundary; access-control binding/session rules; W10 plan.
- Normative Inputs: `.memory-bank/architecture/system-architecture.md`, `.memory-bank/testing/strategy.md`, `.memory-bank/workflows/tier-policy.md#hard-write-boundary`, `.memory-bank/workflows/tier-policy.md#claim-linked-red--green-for-t2t3`.
- Verification Targets: task `verify` and `verification_targets` fields; isolated provider doubles and disposable SQLite state snapshots.

## Constraints / invariants (MUST / NEVER)

- MUST keep state opaque and server-owned, and issue `HttpOnly`, `Path=/`, `SameSite=Lax` binding cookie with HTTPS-only `Secure` and `Max-Age` no greater than the five-minute state TTL.
- MUST reject missing, mismatched, expired, and replayed browser binding before `verifyCallback` or Identity & Access; matched state is one-use and the binding cookie is cleared after callback attempt.
- MUST preserve exact valid Telegram/Google provider/session/invitation behavior.
- NEVER trust browser role/center/account values, change provider protocols, add another store/worker, or touch W9 task/history artifacts.

## Scope

### In scope

- `src/lib/server/platform/auth-state.ts`
- `src/routes/auth/`
- `tests/routes/`
- `tests/adapters/`
- Task-owned `.protocols/TASK-022-T3-FT-001-W10/` and `.tasks/TASK-022-T3-FT-001-W10/` evidence.

### Out of scope

- All `.memory-bank/tasks/TASK-019/020/021`, their protocols/evidence, and all other W9 history.
- `src/lib/server/modules/identity-access/`, provider adapter protocol implementations, database schema, composition root, and other product features.

## Proposed changes

### Touched areas (hypotheses OK)

- `src/lib/server/platform/auth-state.ts` — store the opaque browser-binding value with each auth state and require it on consume.
- `src/routes/auth/transport.server.ts` — issue/read/clear the binding cookie and gate provider verification on a matched binding.
- `tests/routes/auth-transport.test.ts` — claim-scoped cross-browser/missing/mismatch/replay/valid/invitation matrix and cookie/state assertions.
- `tests/adapters/provider-boundary.test.ts` — direct store contract and cookie option regression if needed.

### Preflight-confirmed change surface

- Expected hints kept: yes; existing W9 auth transport files are the local implementation baseline.
- Additional same-outcome files/areas and rationale: task-local protocol/evidence only; no additional production area authorized.
- Hard `write_boundary` present and satisfied: yes (`src/lib/server/platform/`, `src/routes/auth/`, `tests/routes/`, `tests/adapters/`).
- `forbidden_scope` / stop-condition check: clear; no W9 task/protocol/evidence file will be touched.

## Applicable quality gates

- [ ] focused claim probe: `./node_modules/.bin/vitest run tests/routes/auth-transport.test.ts tests/adapters/provider-boundary.test.ts` — proves browser-bound callback and provider-call/state-preservation behavior.
- [ ] check: `npm run check` — proves SvelteKit/TypeScript validity for the touched transport/platform/test surface.
- [ ] build: `npm run build` — proves route/build integration.
- [ ] test: `npm run test` — proves project regression compatibility.
- [ ] diff: `git diff --check` — proves no whitespace errors in the task change surface.

## Claim-linked RED / GREEN (T2/T3)

- applicability: applicable
- accepted claim locator(s): `FT-001-AC-006`, `FT-001-AC-007`, `.memory-bank/contracts/authentication-transport.md#browser-bound-callback-state-and-bounded-retention`, `.memory-bank/contracts/authentication-transport.md#invitation-acceptance-path`.
- planned test/probe and environment: disposable in-memory SQLite, injected Telegram/Google provider doubles, separate cookie jars for browser A/B/no-cookie, provider-call spies, and state snapshots; no credentials, network, production DB, or live provider.
- observable RED: current start issues only portable state and callback consumes it without a browser binding, so callback from a different or cookie-less browser can reach provider verification and session/invitation completion.
- corresponding GREEN: start sets the opaque binding cookie; callback requires its exact value, rejects invalid context before provider/Identity & Access, consumes it once, and clears the binding cookie after each callback attempt.
- accepted not-applicable reason and alternative proof: none.
- T3 isolation, safe rerun, cleanup, and permission boundary: `:memory:` database per test, explicit database close, provider doubles only, task hard boundary, and no W9 artifact mutation.

## Fan-out plan (if needed)

- None; no subagents are authorized for this Implementer session.

## MB-SYNC handoff / owner

Scheduler or explicit standalone owner performs sync after verification/status
decision. `/exe` only records handoff notes.

- [ ] Owner identified: none for lifecycle closure; user requested execution only.
- [ ] Explicit standalone owner basis recorded if manual closure is expected: n/a.
- [ ] `.memory-bank/` docs needing update: none; task-local execution state is sufficient for this implementation handoff.
- [ ] `.memory-bank/index.md` router update needed: no.
- [ ] RTM update in `.memory-bank/requirements.md` needed: no.
- [ ] Task registry/status update owner: `/exe` owns only `ready -> in_progress`; lifecycle owner handles later closure.
- [ ] Changelog update owner: later lifecycle/sync owner if required.

## Definition of done

- Browser-bound callback behavior is implemented within the hard boundary.
- Both task claims have honest RED and claim-equivalent GREEN evidence plus required native gate results.
- Task remains `in_progress`; next handoff is `/verify TASK-022-T3-FT-001-W10`, then `/red-verify TASK-022-T3-FT-001-W10`; no lifecycle closure or sync occurs here.
