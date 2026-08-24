---
description: Verification handoff for TASK-098-T3-FT-007-W31.
status: active
---
# Verification — TASK-098-T3-FT-007-W31

## What was verified

- Current task/card identity is `T3 / FT-007 / W31`, `in_progress`, with the
  task-owned `FT-007-AC-007 / REQ-014 / REQ-017` outcome, valid gates and
  Attempt 1 protocol/handoff/evidence.
- `/profile` is a protected, read-only route adapter: it calls only
  `getCurrentActorProfile`, returns only `fullName`, `role`, and
  `registeredAt`, redirects anonymous actors, and rejects a missing/revoked
  profile result. The page has no form, input, button, or mutation path.
- The current static shell has the four literal canonical href values and the
  existing `POST /auth/logout` form. Browser evidence directly reaches all four
  destinations, proves the Profile display/denial matrix, and proves logout
  revocation and redirect.

## Verification basis

- Direct task-linked canonical rules: `FT-007-AC-007`, Access Control
  `#profile-consumer-boundary` and `#profile-creation-and-query-obligation`,
  Authentication Transport `#session-issuance-and-revocation`, Boundary Map
  `#actor-context-boundary`, and Testing Strategy `#disposable-browser-proof`.
- Task purpose, constraints, anti-goals, invariants, hard write boundary,
  verification target, evidence requirement, T3 RED/GREEN path, tier
  obligations, and closure authority from the indexed card and tier policy.

## Executor claim path

- Attempt 1 RED is the honest absence of the task-owned Profile server route;
  Attempt 1 GREEN is recorded in `attempt-1-red.md`, `attempt-1-green.md`,
  and `execution-evidence-attempt-1.md`. It is supporting evidence only.

## Reused execute evidence

- None. The executor supplied no eligible bounded-input receipt, and no
  executor result is used as independent proof.

## Repeated checks

- `npx vitest run tests/routes/ft-007-profile-routes.test.ts` — PASS, 3 tests.
- `node scripts/run-disposable-e2e.mjs --database tmp/ft-007-profile-routes.db --spec e2e/ft-007-profile-routes.spec.ts` — PASS twice, 1 Playwright test each time. The final rerun removed the exact DB/WAL/SHM/JOURNAL files and preserved `study-calendar.db` size, inode, and mtime (`356352`, `265994`, `1787569249`) before/after.
- `npm run check` — PASS, 0 errors and 0 warnings.
- `npm run test` — PASS, 68 files / 228 tests.
- `npm run build` — PASS.
- `git diff --check` — PASS.
- `node scripts/mb-lint.mjs` — PASS, only existing advisory metadata warnings.
- `node scripts/mb-doctor.mjs --strict` — PASS, 0 errors, 0 warnings, 2 info.

## New targeted probes

- Verifier source inspection and the fresh focused test independently observed
  the direct `getCurrentActorProfile` path, exact three-field serialization and
  SSR rendering, no mutation controls, anonymous redirect, and revoked `403`.
- The fresh owned-server browser run observed anonymous/revoked `303 -> /login`
  for all four routes; authenticated navigation to `/home`, `/classes`,
  `/statistics`, and `/profile`; Profile's exact displayed fields and absent
  controls; logout to `/login`; and rejection of the old session token.
- This browser test navigates directly to each route. It does not open the
  hydrated shell menu or observe its `<a href>` attributes / logout form at
  runtime. The exact shell values are therefore only static focused-test/source
  proof. A bounded verifier-owned menu DOM probe was attempted against the
  card-authorized disposable state but could not obtain a hydrated menu
  observation; it is not evidence.

## Architecture, scope, and finding adjudication

- Actual TASK-098 implementation/probe files are inside the literal hard
  boundary. No forbidden provider root, `playwright.config.ts`, new endpoint,
  route alias/redirect, Profile persistence, or direct profile-table read was
  observed. The disposable E2E result proved cleanup and real-DB metadata
  preservation for the required browser proof.
- Fresh Codex Luna xhigh focus reviews covered (1) runtime shell/link/logout
  evidence and (2) Profile data, denial, revocation, cleanup, and boundary
  behavior. The first found the runtime-shell evidence gap; the second found no
  functional security/data violation. Their findings informed this verdict but
  do not replace verifier-owned checks.

## Verdict

VERDICT: NEEDS-CLARIFICATION

The implementation is not disproved. However, the literal task evidence
requirement calls for focused-route and owned-server disposable browser proof
of the exact href/logout integration. Current browser evidence proves direct
destinations and logout, while exact shell href/form integration is static-only;
the bounded runtime observation could not be reproduced because of hydration.

## Handoff

- Recommended scheduler action: retain `in_progress`; route TASK-098 to its
  executor for a task-boundary, card-authorized disposable browser replacement
  probe that observes the hydrated shell's four hrefs and `POST /auth/logout`,
  then run a fresh `/verify TASK-098-T3-FT-007-W31`.
- Do not run `/red-verify`, `/mb-sync`, a Judge action, or any lifecycle change
  from this verification.
