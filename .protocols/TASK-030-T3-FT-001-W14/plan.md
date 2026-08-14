---
description: Execution plan for TASK-030-T3-FT-001-W14.
status: active
---
# Plan — TASK-030-T3-FT-001-W14

## Goal
Implement FT-001-AC-011: a pre-created password credential logs in at `/login`,
receives the existing `foundation_session` cookie, and reaches the existing
permitted context.

## Non-goals
- Bootstrap/account+credential creation (TASK-029), provider rewrites,
  registration/recovery/reset/MFA/password management, new dependencies,
  cookies, session stores, client authorization state, role selection, or
  center creation.

## Inputs / source specs
- Task: `.memory-bank/tasks/TASK-030-T3-FT-001-W14.task.json`
- Feature/claim: `FT-001-AC-011`; REQs: `REQ-001`, `REQ-014`
- Direct contracts: authentication transport browser/session, access-control
  session rules, Account Provisioning Boundary, and access lifecycle.

## Constraints / invariants (MUST / NEVER)
- MUST normalize email with `trim().toLowerCase()`, use Node `scrypt` and
  `timingSafeEqual`, and use one generic sessionless denial for unknown email
  and wrong password through the same comparison path.
- MUST issue only the existing Identity & Access session and
  `foundation_session` cookie after verification, preserving logout/revocation.
- NEVER write credential/session tables from the route; trust client role,
  account, center, membership, or session identity; expose account existence;
  persist/log plaintext password; or modify provider flows.

## Scope
### In scope
- Identity & Access password-verification public operation.
- `/login` SvelteKit form action and runes-mode form presentation.
- Focused disposable Identity & Access and route/action tests, minimal browser
  deployment instructions, T3 protocol/evidence.

### Out of scope
- Every anti-goal and each forbidden TASK-025/TASK-026 card/protocol/evidence
  path in the task record.

## Proposed changes
### Preflight-confirmed change surface
- `src/lib/server/modules/identity-access/public.ts` — credential verification
  plus existing session issuance.
- `src/routes/login/+page.server.ts` and `src/routes/login/+page.svelte` — thin
  form action/UI, existing cookie settings, and permitted redirect.
- `tests/identity-access/password-login.test.ts` and
  `tests/routes/login-password.test.ts` — disposable claim-equivalent probes.
- `deployment.md` — browser login instruction without a password literal.
- `.protocols/TASK-030-T3-FT-001-W14/` and `.tasks/TASK-030-T3-FT-001-W14/` —
  workflow-owned evidence.
- Advisory hints retained; no hard `write_boundary` is set. Forbidden scope is
  clear and remains untouched.

## Applicable quality gates
- [ ] `npm run check` — Svelte/TypeScript route and public boundary correctness.
- [ ] `npm run test` — task behavior and provider regressions.
- [ ] `npm run build` — production SvelteKit build.
- [ ] `git diff --check` — whitespace/diff integrity.

## Claim-linked RED / GREEN (T2/T3)
- applicability: applicable.
- accepted claim locator: `FT-001-AC-011 / REQ-001 / REQ-014` and the direct
  authentication-transport/access-control session rules.
- planned probe: disposable pre-created password credential; identity probe
  observes normalized success and generic sessionless unknown/wrong denial;
  route action probe observes cookie options, Admin redirect, logout/revocation,
  and preserved provider starts.
- observable RED: no public password-authentication operation and no `/login`
  action/form can authenticate a password credential or issue the existing
  session.
- corresponding GREEN: focused isolated tests pass after adding the public
  boundary and thin action/UI.
- T3 isolation: all probes use in-memory `SharedDatabase`, route cookie/form
  doubles, and no real provider, browser, external service, or persistent DB.

## MB-SYNC handoff / owner
- Owner identified: parent lifecycle owner; `/exe` only starts and hands off.
- Explicit standalone owner basis: n/a for this delegated T3 execution.
- `.memory-bank/` update: no contract/plan mutation needed; `deployment.md` is
  task-owned operator routing only.
- Registry/status update owner: `/exe` wrote `ready -> in_progress`; final T3
  status remains owner-owned after `/verify` and `/red-verify`.
- Changelog/index/RTM update: not due from this execution.

## Definition of done
- The task-owned AC passes claim-equivalent RED/GREEN evidence and every card
  gate; protocol/handoff records actual scope and routes to `/verify` without
  self-verification or T3 closure.
