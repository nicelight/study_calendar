# Execution Evidence — TASK-020-T3-FT-001-W9

## Scope and attempt disposition

- Task: `TASK-020-T3-FT-001-W9`, tier `T3`, lifecycle remains `in_progress`.
- Execution Attempt 1 remains preserved as historical/supporting-only evidence:
  its honest pre-implementation RED is in `red-initial.txt`, and its failed
  focused gate is in `focused-green-blocked.txt`.
- Execution Attempt 2 is bounded correction retry 1/2. It fixes only the
  server-owned authentication-state continuity defect identified by Attempt 1.
- Actual Attempt 2 implementation files:
  - `src/lib/server/platform/auth-state.ts`: copy the optional
    `invitationToken` into the stored state record created by `issue()`.
  - `tests/routes/auth-transport.test.ts`: add the direct state continuity
    assertion and exact safe-error body assertions for the existing route
    scenarios.
- Existing routes/transport and their prior tests remain task-owned context;
  no new provider/session contract or persistence owner was introduced.
- Advisory `touched_files` deviation: `src/lib/server/platform/auth-state.ts`
  is the existing server-state owner required to complete the invitation
  callback integration; changing its one state-copy expression is the minimum
  same-outcome correction and does not widen the boundary.
- Workflow files updated: `.protocols/TASK-020-T3-FT-001-W9/` and
  `.tasks/TASK-020-T3-FT-001-W9/`.
- Durable executor report: `TASK-020-T3-FT-001-W9-S-EXE-final-report-code-01.md`.
- Forbidden historical task records, TASK-019/TASK-021 task cards, Admin UI,
  provider secrets, dev-login bypass, and lifecycle/status were untouched.

## Claim-linked RED / GREEN

### Attempt 1 historical RED and failed gate

- RED: `npm run test -- tests/routes/auth-transport.test.ts` exited `1`
  before the browser transport module existed. Evidence:
  `red-initial.txt`.
- Failed focused gate after the initial transport implementation: the suite
  exited `1` with `3 failed, 1 passed`; `issue()` dropped invitation context,
  so valid/rollback callbacks fell into ordinary login and wrong-account took
  the incorrect redirect path. Evidence: `focused-green-blocked.txt`.
- These receipts are retained as supporting-only retry basis and were not
  replayed as a fresh initial RED.

### Attempt 2 correction and focused GREEN

- Claim locators: `FT-001-AC-006`, `FT-001-AC-007`, `REQ-001`, `REQ-002`,
  `REQ-014`, and the authentication-transport session, browser/API, and
  invitation-acceptance obligations.
- Correction: `AuthenticationStateStore.issue()` now preserves the optional
  invitation token in server-owned state; callback `consume()` therefore
  returns the token that selects `acceptInvitation`.
- Command: `npm run test -- tests/routes/auth-transport.test.ts`
- Result: exit `0`; 1 test file and 5 tests passed.
- Decisive observations: direct `issue() -> consume()` token continuity;
  valid invitation binds the exact pre-created account and consumes once;
  forged, mismatched, and replayed state is rejected without consuming a
  valid invitation; wrong-account rejection stays a safe `410` instead of an
  ordinary-login `303`; session-write rollback stays a safe generic `500`
  without invitation, identity, or session mutation or the induced database
  error in the response.
- Focused receipt: `focused-green-attempt-2.txt`.

## Required gates

- `npm run check` — exit `0`; `svelte-check found 0 errors and 0 warnings`.
- `npm run build` — exit `0`; SSR and client bundles built successfully. The
  existing adapter-auto platform detection note is informational and does not
  affect the build result.
- `npm run test` — exit `0`; 20 test files and 69 tests passed.
- `git diff --check` — exit `0`.

All command evidence was produced in the shared working tree after the
Attempt 2 correction. No credentials, live provider network, production DB,
or external side effect was used. The broad pre-existing worktree state makes
these executor receipts supporting-only; no current-attempt reuse candidate is
offered to independent verification.

## Handoff

- `/exe` implementation and required-gate work is complete for the selected
  task scope.
- Independent `/verify TASK-020-T3-FT-001-W9` remains the next owner action;
  required T3 `/red-verify` is also outside this execution.
