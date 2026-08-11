---
description: Execution plan for TASK-019-T3-FT-001-W9.
status: active
---
# Plan — TASK-019-T3-FT-001-W9

## Goal

Provide one server-only normalized provider adapter boundary for Telegram Login
and Google OAuth, plus server-owned opaque `foundation_session` issuance,
validation, revocation, invitation acceptance, and cookie-option primitives.

## Non-goals

- Browser routes, SSR/UI, Admin pages/forms, or callback transport (TASK-020/021).
- Development login, role/center/account selection, provider SDK adoption,
  live credentials, or production database use.
- Changes to historical failed tasks or the accepted modular-monolith/shared DB
  ownership graph.

## Inputs / source specs

- Task record: `.memory-bank/tasks/TASK-019-T3-FT-001-W9.task.json`
- Task index: `.memory-bank/tasks/index.json`
- Feature: `.memory-bank/features/FT-001-authentication-and-binding.md`
- REQ IDs: `REQ-001`, `REQ-002`, `REQ-014`

## Richer execution inputs

- `.memory-bank/contracts/provider-adapters.md`
- `.memory-bank/contracts/authentication-transport.md`
- `.memory-bank/contracts/access-control.md`
- `.memory-bank/contracts/boundary-map.md`
- `.memory-bank/domains/core-domain.md`
- `.memory-bank/states/lifecycle-map.md`
- `.memory-bank/testing/strategy.md`
- `.memory-bank/workflows/tier-policy.md#claim-linked-red--green-for-t2t3`

## Constraints / invariants (MUST / NEVER)

- MUST keep provider verification and secrets in server-only modules.
- MUST return only normalized verified `{provider, subject}` from adapters.
- MUST let Identity & Access exclusively write identities, invitations, and
  sessions, with invitation/session operations atomic.
- MUST use `HttpOnly`, `Path=/`, `SameSite=Lax`, and `Secure` only for HTTPS;
  local HTTP may omit `Secure`.
- NEVER trust caller role, center, account, membership, invitation decision,
  or provider subject outside adapter verification.
- NEVER add a dev-login bypass, browser route, Admin UI, second server, or
  second database.

## Scope

### In scope

- `src/lib/server/adapters/` normalized Telegram/Google adapters and registry.
- `src/lib/server/platform/` provider config, one-use auth state, and cookie
  contract.
- `src/lib/server/modules/identity-access/` verified identity authentication,
  invitation acceptance, opaque session issue/resolve/revoke.
- Shared composition wiring and focused identity/adapter regression tests.
- Task-owned protocol/evidence/handoff files.

### Out of scope

- `src/routes/`, browser transport, Admin UI, and all forbidden historical task
  records.
- Membership ownership changes or new services/event buses/databases.

## Proposed changes

### Touched areas

- `src/lib/server/adapters/` — server-only provider contract and implementations.
- `src/lib/server/platform/config.ts` — environment-injected provider settings.
- `src/lib/server/platform/auth-state.ts` — expiring one-use state capability.
- `src/lib/server/platform/session-cookie.ts` — exact cookie options.
- `src/lib/server/platform/database.ts` — existing shared schema remains the
  Identity & Access session/identity source of truth; no new database is added.
- `src/lib/server/modules/identity-access/public.ts` — owned lifecycle commands.
- `src/lib/server/composition-root.ts` — one-server composition wiring.
- `tests/adapters/` and `tests/identity-access/` — isolated claim probes.

### Preflight-confirmed change surface

- Expected task hints kept: Identity & Access, adapters, platform, and tests.
- Additional same-outcome files/areas: `src/lib/server/composition-root.ts` and
  existing identity tests/fixtures are required to expose the single composed
  server boundary and preserve current regression coverage.
- Hard `write_boundary` present and satisfied: not set.
- `forbidden_scope` / stop-condition check: clear; old failed task cards,
  routes, and Admin UI are untouched.

## Applicable quality gates

- [x] Focused claim probes: `npm run test -- tests/adapters/provider-boundary.test.ts tests/identity-access/session-lifecycle.test.ts`.
- [x] `npm run check` — required type/Svelte check.
- [x] `npm run build` — required production build.
- [x] `npm run test` — required full regression suite.
- [x] `git diff --check` — touched diff hygiene.

## Claim-linked RED / GREEN (T2/T3)

- applicability: applicable
- retry: Attempt 2 of the initial attempt plus two-retry budget; correction
  basis is the independent Attempt 1 functional `FAIL`.
- accepted claim locators: `FT-001-AC-001`, `FT-001-AC-003`,
  `FT-001-AC-004`, `FT-001-AC-006`, `FT-001-AC-007`; `REQ-001`, `REQ-002`,
  `REQ-014`; provider-adapters verified identity/failure rules; authentication
  transport session/invitation rules; boundary-map provider and actor context.
- planned test/probe and environment: focused Vitest tests against fresh
  in-memory SQLite; Telegram crypto vectors and injected Google fetch doubles;
  no credentials, network, or production DB.
- observable RED: missing normalized adapter registry, server state replay
  protection, opaque session lifecycle, cookie helper, verified-identity
  authentication, and atomic invitation/session operation.
- corresponding GREEN: both adapters reject invalid state/signature/outage or
  missing configuration and return only `{provider, subject}`; state is
  server-bound and one-use; valid verified identities issue opaque sessions;
  revoked sessions resolve no actor; invitation binding/session failures roll
  back; cookie options match exact transport contract.
- T3 isolation, safe rerun, cleanup, and permission boundary: fresh in-memory
  DB per test, deterministic crypto/fetch doubles, no secrets/network/external
  writes, test cleanup closes DB, only task-owned source/test areas changed.

## Attempt 2 correction

- remove the public caller-controlled `createSession({ token, accountId })`
  surface; only `authenticateVerifiedIdentity` and `acceptInvitation` may
  reach the private server-owned session issuer;
- derive the Google token-exchange `redirect_uri` from the full callback URL
  path, matching the canonical `/auth/google/callback` transport path, and
  assert the exact value in the focused adapter test;
- add focused negative/regression coverage for forged session issuance and
  exact Google redirect URI, then rerun the focused claim probe and all task
  gates.

## Fan-out plan

- None; single Implementer, no subagents.

## MB-SYNC handoff / owner

- [x] Owner identified: scheduler/lifecycle owner after `/verify` and T3 semantic gate.
- [x] Explicit standalone closure owner basis: none; user explicitly forbids
  manual lifecycle changes.
- [x] `.memory-bank/` docs needing update: task-owned execution evidence only;
  broader Memory Bank sync remains workflow-owner scope.
- [x] `.memory-bank/index.md` router update needed: no.
- [x] RTM update needed: no.
- [x] Task registry/status update owner: lifecycle owner after verification.
- [x] Changelog update owner: wave-boundary `/mb-sync` owner.

## Definition of done

- Task-owned adapter/session/invitation claims have honest RED/GREEN evidence,
  all required gates pass, scope remains compliant, and the handoff routes to
  `/verify TASK-019-T3-FT-001-W9` without invoking it.
