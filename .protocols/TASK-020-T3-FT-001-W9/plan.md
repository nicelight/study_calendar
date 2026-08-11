---
description: Execution plan for TASK-020-T3-FT-001-W9.
status: active
---
# Plan — TASK-020-T3-FT-001-W9

## Goal

Implement `/login`, `/auth/{provider}/start`, `/auth/{provider}/callback`,
`/invite/{token}`, and `/auth/logout` transport plus per-request actor
resolution, secure session cookie handling, server-bound invite state, and
focused SSR/route/action regression coverage.

## Non-goals

- Provider verification, Identity & Access persistence, or contract changes
  owned by TASK-019.
- Admin UI/provisioning (TASK-021), dev-login, password auth, role selection,
  client-trusted authorization, secrets, or historical task changes.

## Inputs / source specs

- `.memory-bank/tasks/TASK-020-T3-FT-001-W9.task.json`
- `.memory-bank/features/FT-001-authentication-and-binding.md#FT-001-AC-006`
- `.memory-bank/features/FT-001-authentication-and-binding.md#FT-001-AC-007`
- `.memory-bank/contracts/authentication-transport.md`
- `.memory-bank/contracts/provider-adapters.md`
- `.memory-bank/contracts/access-control.md`
- `.memory-bank/contracts/boundary-map.md#actor-context-boundary`
- `.memory-bank/states/lifecycle-map.md#access-and-membership`

## Scope

### In scope

- SvelteKit auth/login/invite routes, server hooks/app locals, and route tests.
- Composition-root transport access to existing server-only provider registry
  and authentication state.
- Safe redirects/errors, logout revocation and cookie clearing, exact session
  cookie attributes, and invite callback state continuity.

### Out of scope

- `src/lib/server/modules/identity-access/`, provider adapter implementation,
  database schema, Admin routes, memberships, or new persistence owners.

## Proposed changes

### Preflight-confirmed change surface

- Expected route/hook/app/test hints kept; composition/platform wiring may be
  added only if required to expose the already-accepted public boundaries.
- Hard `write_boundary`: not set.
- `forbidden_scope` / stop conditions: clear at start.

## Applicable quality gates

- `npm run check` — SvelteKit/type correctness.
- `npm run build` — SSR/build compatibility.
- `npm run test` — full regression suite.
- Focused route/SSR/action tests and `git diff --check` — task claims/diff.

## Claim-linked RED / GREEN (T2/T3)

- applicability: applicable
- claim locators: FT-001 AC-006 / AC-007; REQ-001 / REQ-002 / REQ-014;
  authentication-transport session issuance/revocation, browser/API path, and
  invitation acceptance path.
- planned RED: focused route suite fails because the browser transport is absent
  and cannot prove exact cookie/session or server-bound invite-state behavior.
- planned GREEN: both provider login paths, logout/revocation, and valid invite
  acceptance pass; tampered/forged/mismatched/replayed/expired/wrong-account and
  rollback cases reject without consuming valid invitation state.
- T3 isolation: fresh disposable fixtures and injected adapters; no credentials,
  network, production DB, or forbidden task writes.

## MB-SYNC handoff / owner

- Owner: `/verify` then explicit lifecycle owner; this execution does not close
  the T3 task, run `/verify`, run `/red-verify`, or run `/mb-sync`.
- `.memory-bank/` durable feature/RTM/changelog updates: no; task protocol and
  evidence are the required execution artifacts.

## Definition of done

- Task-owned route claims have honest RED/GREEN evidence, required gates pass,
  scope is compliant, and handoff routes to `/verify TASK-020-T3-FT-001-W9`.
