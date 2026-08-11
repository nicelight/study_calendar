---
description: Adversarial semantic verification for TASK-020-T3-FT-001-W9.
status: active
---
# Red Verification — TASK-020-T3-FT-001-W9

## Semantic target

- Task outcome: minimum real SvelteKit browser/API login, logout, and invitation
  acceptance transport over TASK-019 public boundaries.
- Accepted boundaries: server-issued one-use state carries invitation context;
  Identity & Access alone authenticates/binds/consumes/issues/revokes; routes
  are thin adapters; `foundation_session` has the exact cookie contract; no
  client-trusted context, provider secret, direct persistence, or dev bypass.

## Evidence and adversarial coverage

- Functional prerequisite: `.protocols/TASK-020-T3-FT-001-W9/verification.md`
  records `VERDICT: PASS` with fresh verifier-owned proof and `20 files / 69`
  full tests.
- Changed surface inspected: auth/login/invite routes, hooks, auth transport,
  state/cookie platform helpers, TASK-019 adapter/public-boundary integration,
  focused route tests, verifier probe, and built client output.
- Cross-boundary ownership: routes call only the provider registry and public
  Identity & Access operations; no route DB write, alternate write command,
  caller-selected account/role/center, or second persistence owner exists.
- State/data/security coverage: server state is opaque, expiring, one-use and
  bound to provider/callback URL; invitation context is taken only from that
  state; valid and rejected/failed callback state-before/state-after behavior
  is covered for both providers; logout revokes server state before cookie
  clearing; client output contains no provider secret.
- Runtime coverage: SvelteKit SSR smoke confirms route rendering and safe
  unauthorized, invalid-state, invalid-invite, logout, and missing-config
  responses.

## Admitted findings

None.

## Operator questions

None.

## Verdict

SEMANTIC_VERDICT: semantic-pass

## Owner handoff

- Evidence/report paths: this protocol and
  `.tasks/TASK-020-T3-FT-001-W9/TASK-020-T3-FT-001-W9-S-RED-VERIFY-final-report-docs-01.md`.
- Recommended owner action: lifecycle owner may evaluate T3 closure after both
  functional and semantic verdicts; no BUG/follow-up is recommended.
- Resume route: `n/a`.
- Task card, lifecycle/status, retry budget, and scheduler state changed by
  semantic verification: no.
