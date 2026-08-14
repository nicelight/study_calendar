---
description: Execution handoff placeholder for TASK-030-T3-FT-001-W14.
status: active
---
# Handoff — TASK-030-T3-FT-001-W14

## Summary
- Identity & Access now verifies an existing normalized email/password
  credential using Node `scrypt` plus `timingSafeEqual`, issues only the
  existing session on success, and returns a generic error without a session
  for unknown/wrong credentials.
- `/login` now contains the password form/action while retaining the Telegram
  and Google choices. The thin route calls the public Identity & Access boundary,
  reuses `foundation_session`, and sends an Admin to the existing `/admin` path.

## How to run / verify
- Required gates: `npm run check`, `npm run test`, `npm run build`.
- Claim-linked RED/GREEN evidence: Attempt 1 in `progress.md#claim-linked-red--green-t2t3`, detailed in
  `.tasks/TASK-030-T3-FT-001-W14/execution-evidence.md`.
- Current-attempt reuse candidate locators: none.

## Where to look
- Owner: `src/lib/server/modules/identity-access/public.ts`.
- Browser adapter: `src/routes/login/+page.server.ts`,
  `src/routes/login/password-login.server.ts`, and `src/routes/login/+page.svelte`.
- Focused probes: `tests/identity-access/password-login.test.ts` and
  `tests/routes/login-password.test.ts`.
- Advisory `touched_files` deviation: the sibling server-only login helper is
  necessary because SvelteKit forbids arbitrary `+page.server.ts` exports; it
  adds no public endpoint or state owner. Hard write boundary was not set;
  forbidden TASK-025/TASK-026 scope was untouched.

## Follow-ups
- Run `/verify TASK-030-T3-FT-001-W14`; after its functional result, the T3
  lifecycle owner routes the required independent `/red-verify`. `/exe` leaves
  this task `in_progress` and does not self-verify.
