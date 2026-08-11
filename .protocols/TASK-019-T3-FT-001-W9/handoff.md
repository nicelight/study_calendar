---
description: Implementer handoff for TASK-019-T3-FT-001-W9.
status: active
---
# Handoff — TASK-019-T3-FT-001-W9

## Summary

- Execution Attempt 2 is a bounded correction retry after independent Attempt
  1 functional `FAIL`. It removes the caller-controlled public session minting
  path, uses the full canonical Google callback URL for token exchange, and
  adds focused forged-session and exact-redirect regressions.
- This task owns server-only provider/session/invitation primitives only;
  TASK-020/021 own browser/Admin integration.

## Where to look

- key files:
  - `src/lib/server/adapters/types.ts`
  - `src/lib/server/adapters/telegram.ts`
  - `src/lib/server/adapters/google.ts`
  - `src/lib/server/adapters/index.ts`
  - `src/lib/server/platform/auth-state.ts`
  - `src/lib/server/platform/session-cookie.ts`
  - `src/lib/server/modules/identity-access/public.ts`
  - `tests/adapters/provider-boundary.test.ts`
  - `tests/identity-access/session-lifecycle.test.ts`
- advisory `touched_files` deviations and rationale: platform and public
  boundary files are direct task scope; existing adapter/test directories and
  task protocol/evidence files are the same accepted outcome surface.
- hard write-boundary compliance: not set.

## How to run / verify

- Attempt 1 gates are supporting-only historical evidence. Attempt 2 current
  focused and required gate receipts are recorded in
  `.tasks/TASK-019-T3-FT-001-W9/execution-evidence.md` after the correction.
- claim-linked RED/GREEN evidence: `.protocols/TASK-019-T3-FT-001-W9/progress.md`
  and `.tasks/TASK-019-T3-FT-001-W9/execution-evidence.md`.
- current-attempt receipt locators: `.tasks/TASK-019-T3-FT-001-W9/execution-evidence.md`,
  sections `Attempt 2 — correction retry focused GREEN` and
  `Attempt 2 — required gates`.
- superseded/supporting-only receipt locators: all Attempt 1 same-claim
  receipts in `execution-evidence.md` are supporting-only; the Attempt 1
  independent `FAIL` remains the retry correction basis.

## Known issues

- The task remains `in_progress`; independent `/verify` and the separate T3
  semantic lifecycle owner remain required. `/red-verify` is intentionally
  not run here.

## Follow-ups

- Next exact action: run `/verify TASK-019-T3-FT-001-W9`. Neither `/verify` nor
  `/red-verify` was run in this execution, and lifecycle/status was not changed.
