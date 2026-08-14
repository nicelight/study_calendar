---
description: Execution plan for TASK-029-T3-FT-001-W13.
status: active
---
# Plan — TASK-029-T3-FT-001-W13

## Goal

Supply the Identity & Access first-Admin credential operation and a thin local
hidden-input CLI adapter that atomically creates it only in an empty database.

## Non-goals

- Browser password verification, `/login`, sessions, cookies, or changes to existing provider transport (TASK-030).
- Registration, reset/recovery, verification, MFA, password history, provider changes, centers, or memberships.
- Password input through argv, environment, HTTP, output, logs, chat, or repository files.

## Inputs / source specs
- Task card: `.memory-bank/tasks/TASK-029-T3-FT-001-W13.task.json`
- Feature/AC: `FT-001-AC-010`
- REQs: `REQ-001`, `REQ-014`
- Direct contracts: Account Provisioning Boundary; Bootstrap Admin and center creation; Binding and session rules; Core Domain persistence and transaction rules.

## Constraints / invariants
- MUST have Identity & Access derive/store the credential and own the account+credential transaction.
- MUST normalize email with `trim().toLowerCase()` and enforce database uniqueness.
- MUST use per-credential `randomBytes` salt and Node built-in `scrypt`; plaintext is never stored or emitted.
- MUST fail without state change for non-empty accounts, invalid/duplicate normalized email, cancellation, derivation failure, and write failure.
- NEVER let the CLI write account or credential tables directly, or create a center/membership.

## Scope

### In scope
- `src/lib/server/modules/identity-access/` public first-Admin operation.
- `src/lib/server/platform/database.ts` password-credential schema.
- `scripts/bootstrap-admin.mjs` thin local adapter and its minimal runtime helper if required by Node execution.
- Focused disposable database and CLI-I/O tests.
- Existing `deployment.md` bootstrap instructions as read-only pre-existing compatible documentation.

### Out of scope
- TASK-025/026 artifacts and all TASK-030 browser-login/session paths.

## Preflight-confirmed change surface
- Expected hints kept: Identity & Access, SharedDatabase schema, `scripts/`, focused identity/CLI tests, package script if needed.
- Additional same-outcome files: `scripts/bootstrap-admin-loader.mjs` resolves/transpiles existing TypeScript server modules for the Node CLI without adding a package. The `.mjs` command remains the public local adapter.
- Hard `write_boundary` present and satisfied: not set.
- `forbidden_scope` / stop-condition check: clear.

## Applicable quality gates
- [ ] `npm run check` — validates typed SvelteKit/server source.
- [ ] `npm run test` — validates focused disposable CLI/database behavior and regression suite.
- [ ] `npm run build` — validates production build.

## Claim-linked RED / GREEN (T2/T3)
- applicability: applicable
- accepted claim locator(s): `FT-001-AC-010 / REQ-001 / REQ-014`
- planned test/probe and environment: disposable SQLite via `SharedDatabase`; test-owned prompt/CLI-I/O doubles; source scan of command argv/output paths.
- observable RED: current Identity & Access public boundary lacks the named first-Admin credential operation, so the disposable bootstrap claim cannot succeed.
- corresponding GREEN: one focused suite proves interactive normalized email, hidden password/no argv or output secret, random-salt `scrypt` credentials without plaintext, empty-set account+credential atomic success, and no-change failure/rerun cases.
- accepted not-applicable reason and alternative proof: none.
- T3 isolation, safe rerun, cleanup, and permission boundary: all probes use `:memory:` or a temporary disposable SQLite file; no production database, provider, browser, or external side effect is used.

## MB-SYNC handoff / owner
- Owner identified: scheduler / lifecycle owner.
- Explicit standalone owner basis: n/a.
- `.memory-bank/` docs needing update: none expected; task-compatible bootstrap deployment instructions already exist as preserved dirty worktree content.
- `.memory-bank/index.md` router update needed: no.
- RTM update needed: no.
- Task registry/status update owner: `/verify` and lifecycle owner after T3 gates.
- Changelog update owner: wave/feature sync owner.

## Definition of done

Attempt evidence contains an honest pre-change RED and claim-equivalent GREEN;
the task remains `in_progress` for independent `/verify`, then T3 `/red-verify`.
