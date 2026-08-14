---
description: Independent adversarial semantic verification for TASK-030-T3-FT-001-W14.
status: final
---
# Red Verification — TASK-030-T3-FT-001-W14

## Semantic target

- Task outcome: password login must open the persisted actor's permitted
  context through the one existing server session/cookie without exposing
  account existence, weakening provider login, or creating a neighboring auth
  lifecycle.
- Accepted contract and boundaries: `FT-001-AC-011`, `REQ-001`, applicable
  REQ-014 access behavior, Authentication Transport browser/session rules,
  Access Control binding/session rules, Account Provisioning Boundary, and the
  Identity & Access-owned `issued -> revoked` Session lifecycle.
- Scope boundary: TASK-029 bootstrap and center creation are prerequisite or
  neighboring outcomes, not claims adopted by this review.

## Evidence and adversarial coverage

- Existing verification verdict: fresh functional `VERDICT: PASS` in
  `.protocols/TASK-030-T3-FT-001-W14/verification.md`, with the task still
  `in_progress` and no lifecycle mutation by the verifier.
- Actual change and owner path: hostile diff/source inspection covered Identity
  & Access password verification/session issuance, the SvelteKit login action
  and page, shared cookie/logout/actor resolution, provider transport, current
  tests, deployment guidance, and the built client artifacts.
- Disposable semantic probe: an in-memory database and in-process SvelteKit
  events used generated test-only values. It established that unknown email,
  wrong password, and malformed credential each fail with the same result and
  no cookie even when the submitted unknown-account password equals the known
  dummy derivation input. Each denial invoked exactly one `scrypt` derivation,
  then the shared `timingSafeEqual` path; no speculative microbenchmark or real
  credential was used.
- Session semantics: a preexisting cookie value was not adopted as the
  authenticated session; login generated a fresh token. Independent password
  logins generated distinct tokens, persisted role selected Admin versus
  non-Admin routing, HTTP/HTTPS cookie options retained the existing rule, and
  logout revoked only its current token while another valid password session
  and a provider-issued session remained valid. Direct revocation remained
  effective through the current actor/protected-route path established by
  functional verification.
- Provider compatibility: a fresh Google bound-identity callback completed on
  the unchanged provider session lifecycle beside password sessions; the
  focused Telegram/Google invitation, callback, browser-binding, failure,
  logout, and session regression set passed 4 files / 23 tests together with
  password behavior.
- Boundary, SSR, and maintenance semantics: route code delegates to the public
  Identity & Access operation and contains no direct persistence, authority
  input, center orchestration, second store/cookie, or client auth state. The
  sibling `password-login.server.ts` helper follows the existing testable
  server-route-helper pattern, is forced by SvelteKit route-export rules, and
  owns no state/lifecycle. The built client contains the generic form/error and
  provider links, but no dummy credential material, `scrypt`,
  `timingSafeEqual`, password table names, or provider secrets.
- Commands:
  - `npx vitest run --config .tasks/TASK-030-T3-FT-001-W14/vitest.red.config.ts`
    -> exit 0; 1 file / 2 hostile semantic tests passed.
  - `npm run test -- tests/identity-access/password-login.test.ts tests/routes/login-password.test.ts tests/routes/auth-transport.test.ts tests/identity-access/session-lifecycle.test.ts`
    -> exit 0; 4 files / 23 focused tests passed.
  - `git diff --check` -> exit 0.

## Admitted findings

- none.

## Operator questions

- none.

## Verdict

SEMANTIC_VERDICT: semantic-pass

## Owner handoff

- Evidence/report paths:
  `.tasks/TASK-030-T3-FT-001-W14/red-semantic.test.ts`,
  `.tasks/TASK-030-T3-FT-001-W14/vitest.red.config.ts`, and
  `.tasks/TASK-030-T3-FT-001-W14/TASK-030-T3-FT-001-W14-S-RED-VERIFY-final-report-docs-01.md`.
- Recommended owner action: the explicit lifecycle owner may record
  `TASK-030-T3-FT-001-W14` as `done`, preserving both functional and semantic
  evidence, then perform the due wave-boundary `/mb-sync` routing.
- Resume route: lifecycle-owner decision; no repair or clarification route is
  required.
