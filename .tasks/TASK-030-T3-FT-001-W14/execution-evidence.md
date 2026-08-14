# TASK-030-T3-FT-001-W14 — execution evidence

## Execution Attempt
- attempt: Attempt 1
- started: 2026-08-13T23:27:52+05:00
- completed execution: 2026-08-13T23:39:00+05:00
- lifecycle: `in_progress`; T3 closure is not owned by `/exe`.

## Claim mapping and isolation
- Claim: `FT-001-AC-011 / REQ-001 / REQ-014` — password-credential login
  creates only the existing server session/cookie; normalized success reaches
  the persisted Admin context; unknown email and wrong password are generic,
  timing-safe, and sessionless; logout/revocation and provider paths remain
  compatible.
- Direct rule path: authentication transport browser/session issuance,
  access-control binding/session rules, Account Provisioning Boundary, and
  access lifecycle.
- T3 proof surface: `SharedDatabase({ filename: ':memory:' })`, in-process
  `RequestEvent`/cookie/form doubles, and no production database, real browser,
  provider credential, network request, persistent auth state, or external side
  effect. Every fixture is closed in `afterEach`.

## Honest RED — before production changes
- Command: `npm run test -- tests/identity-access/password-login.test.ts tests/routes/login-password.test.ts`
- Result: exit `1`; two claim-specific tests failed.
- Observation: `IdentityAccessBoundary.authenticatePassword` was `undefined`
  for a disposable pre-created credential, and `/login/+page.server.ts` exposed
  no SvelteKit `actions` export. The test assertions failed for exactly the
  absent password-verification/session transport claim, not setup, syntax, or
  an artificial break.

## GREEN — after production changes
- Focused command: `npm run test -- tests/identity-access/password-login.test.ts tests/routes/login-password.test.ts tests/routes/auth-transport.test.ts tests/identity-access/session-lifecycle.test.ts`
- Result: exit `0`; 4 files / 22 tests passed.
- Observed claim coverage:
  - trimmed/lowercased email and correct password issue an opaque existing
    session for the exact persisted Admin account;
  - unknown email and wrong password each derive through the configured
    credential path, produce `invalid-credentials`, create zero sessions, and
    the Identity & Access source performs `timingSafeEqual` on the common
    comparison path;
  - the `/login` form action returns the same `401` / `invalid_credentials`
    body and no cookie for both denials; success sets the existing
    `foundation_session` with `HttpOnly`, `Path=/`, `SameSite=Lax`, and
    HTTPS `Secure`, then redirects the Admin to `/admin`;
  - existing logout revokes that password-issued token, clears the same cookie,
    and redirects to `/login`; focused Telegram/Google transport and existing
    session lifecycle regressions pass;
  - source probe confirms the route adapter calls the Identity & Access public
    operation and has no direct credential/session persistence statement.
- Claim-equivalent probe changes: the initial two RED presence tests became two
  focused suites with four behavioral checks, adding only the direct security
  observations required by the card (generic denial, exact actor/cookie,
  logout/revocation, and route ownership).

## Required gates after final changes
- `npm run check` → exit `0`; `svelte-check found 0 errors and 0 warnings`.
- `npm run test` → exit `0`; 28 files / 112 tests passed.
- `npm run build` → exit `0`; SvelteKit/Vite production build completed. The
  existing adapter-auto informational notice about no detected deployment
  environment did not fail the build; no container build is configured or
  required by the card.
- `git diff --check` → exit `0`; no whitespace errors.

## Fix cycles
1. `npm run check` initially found an undeclared Svelte `form` prop and a test
   RequestEvent cast. Added the typed runes prop and intentional double cast;
   rerun check passed.
2. `npm run build` rejected an arbitrary export from `+page.server.ts`.
   Moved the testable action factory to the sibling server-only
   `password-login.server.ts`, following the local route-helper pattern;
   rerun check, focused tests, build, and final full gates passed.

## Scope and ownership
- Actual source/doc/test files: `src/lib/server/modules/identity-access/public.ts`,
  `src/routes/login/+page.server.ts`,
  `src/routes/login/password-login.server.ts`,
  `src/routes/login/+page.svelte`,
  `tests/identity-access/password-login.test.ts`,
  `tests/routes/login-password.test.ts`, and the task-owned sentence in
  `deployment.md`.
- Workflow files: `.memory-bank/tasks/TASK-030-T3-FT-001-W14.task.json`,
  `.protocols/TASK-030-T3-FT-001-W14/*`, and
  `.tasks/TASK-030-T3-FT-001-W14/*`.
- Advisory deviation: `src/routes/login/password-login.server.ts` is the
  smallest sibling server-only helper needed because SvelteKit forbids exporting
  the action factory from `+page.server.ts`. It remains in the task-owned login
  transport area and introduces no public route or state boundary.
- Hard `write_boundary`: not set. Forbidden TASK-025/TASK-026 card, protocol,
  and evidence paths were not touched. Existing unrelated dirty worktree files
  and pre-existing Task-029 bootstrap changes in the shared Identity & Access
  file were preserved; TASK-029 was neither edited nor re-proved.
- No new dependency, cookie/session/store, role selector, registration/reset,
  center action, provider modification, direct route persistence, plaintext
  password persistence/logging, or ownership/dependency-graph change.

## Handoff
- Independent next step: `/verify TASK-030-T3-FT-001-W14`.
- Executor evidence is supporting-only; no execute receipt is offered for reuse
  because final gates read the broad dirty worktree.
