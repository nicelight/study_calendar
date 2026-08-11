---
description: Execution plan for TASK-024-T3-FT-001-W10.
status: active
---
# Plan — TASK-024-T3-FT-001-W10

## Goal

Restore accepted platform/composition ownership of provider configuration and
registry wiring. Keep `createAuthenticationTransport` injectable and make
route transport consume only supplied provider dependencies while preserving
Telegram/Google success paths and safe missing-configuration failures.

## Non-goals

- No provider SDK/protocol or credential-name change.
- No secret in page data, form results, API responses, client bundle, or route error.
- No dev-login, role-selection, direct persistence, membership-write, second composition root, store, worker, or architecture change.
- No W9 card/protocol/evidence/lifecycle/retry-history edits.

## Inputs / source specs

- Task: `.memory-bank/tasks/TASK-024-T3-FT-001-W10.task.json`
- Feature/AC: `.memory-bank/features/FT-001-authentication-and-binding.md#ft-001-ac-006`, `#ft-001-ac-007`
- REQs: `REQ-001`, `REQ-002`, `REQ-014`
- Canonical specs: provider adapter failure/ownership, authentication transport browser/API path, provider verification boundary, system architecture composition/deployment, testing evidence/ownership.

## Constraints / invariants

- Preserve `TELEGRAM_BOT_TOKEN`, `GOOGLE_CLIENT_ID`, and `GOOGLE_CLIENT_SECRET` meaning and safe missing-config mapping.
- Keep provider secrets server-only and registry construction in platform/composition ownership.
- Keep `createAuthenticationTransport` injectable for isolated doubles.
- Leave identity normalization, session/invitation behavior, and no-direct-persistence rules unchanged.
- Never add a second composition root or change accepted module topology.

## Scope

### In scope

- `src/lib/server/platform/config.ts`
- `src/lib/server/composition-root.ts`
- `src/routes/auth/transport.server.ts`
- `tests/adapters/provider-boundary.test.ts`
- `tests/routes/auth-transport.test.ts`
- `.protocols/TASK-024-T3-FT-001-W10/` and `.tasks/TASK-024-T3-FT-001-W10/`

### Out of scope

- All W9 task artifacts and all paths in the task `forbidden_scope`.
- Provider adapter protocol implementation, Identity & Access persistence, route names, client UI, and unrelated route/test modules.

## Change surface

- `platform/config.ts` — existing server-only env values are exposed to composition wiring.
- `composition-root.ts` — one provider registry is created and exposed with existing composition dependencies.
- `routes/auth/transport.server.ts` — provider env reads and registry construction are removed; route consumes the composition-supplied registry.
- `tests/routes/auth-transport.test.ts` — source ownership and disposable configured/missing-config runtime probes.
- `tests/adapters/provider-boundary.test.ts` — inspected and unchanged; existing provider protocol/secret assertions remain authoritative regression coverage.

Hard `runtime_context.write_boundary` is satisfied. No forbidden W9 path was
targeted or modified by this execution; those paths were pre-existing broad
untracked worktree state at preflight.

## Claim-linked RED / GREEN

- Applicable claims: `FT-001-AC-006` / `FT-001-AC-007`, `REQ-001` / `REQ-002` / `REQ-014`, authentication transport browser/API ownership, provider adapter failure/ownership.
- Initial RED: `.tasks/TASK-024-T3-FT-001-W10/red-attempt-1.txt`; route source still contained provider secret reads and registry construction, while composition root did not own the registry.
- Claim-equivalent GREEN: `.tasks/TASK-024-T3-FT-001-W10/focused-green-attempt-1.txt`; route/composition source boundary, configured Telegram/Google starts, safe missing config, secret absence, and existing regressions passed.
- T3 isolation: disposable in-memory SQLite/source probes only; no live credentials, network, production state, or dev bypass.

## Quality gates

- [x] `npm run test -- tests/routes/auth-transport.test.ts tests/adapters/provider-boundary.test.ts` — 2 files / 20 tests.
- [x] `npm run check` — 0 errors / 0 warnings.
- [x] `npm run build` — client/SSR bundles built; adapter-auto notice non-fatal.
- [x] `npm run test` — 21 files / 84 tests.
- [x] scoped `git diff --check` and route secret/config symbol scan.

Receipts: `.tasks/TASK-024-T3-FT-001-W10/{focused-green-attempt-1,check-attempt-1,build-attempt-1,full-test-attempt-1,scope-audit-attempt-1}.*`.

## Handoff owner

`/exe` does not run `/verify`, `/red-verify`, `/mb-sync`, closure, or dependent
promotion. Next owner: `/verify TASK-024-T3-FT-001-W10`; after functional PASS,
the required T3 `/red-verify` route applies. Lifecycle owner decides status.
