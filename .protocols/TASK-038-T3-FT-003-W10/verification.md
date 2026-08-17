---
description: Verification handoff for TASK-038-T3-FT-003-W10.
status: active
---
# Verification — TASK-038-T3-FT-003-W10

## What was verified

- No functional verification is eligible yet. Attempt 1 has an honest SSR RED
  but no GREEN because the current route output omits server-authorized student
  scope required by the task's claim.

## Verification basis

- Task outcome: Calendar lesson links preserve exact context into existing
  Lesson Context and do not broaden authorization.
- Task-scoped REQ IDs / acceptance criteria: FT-003-AC-008 / REQ-005 /
  REQ-006 / REQ-014.
- Required gates: `npm run check`, `npm run test`, `npm run build`.
- Executor RED/GREEN path: pending in `progress.md`.

## Task-scoped checklist

- [ ] FT-003-AC-008 / REQ-005 / REQ-006 / REQ-014.
  - Method: independent real rendered-link/SSR route probe plus gate review.
  - Evidence: executor artifacts and a fresh verifier-owned probe.

## Regression / non-goals

- [ ] Confirm only calendar presentation/link surface and isolated test changed.
- [ ] Confirm calendar load, public fixture, and existing Lesson Context owner
  remain unchanged.

## Quality gates evidence

- Targeted SSR RED: recorded in
  `.tasks/TASK-038-T3-FT-003-W10/attempt-1-red.md`.
- `git diff --check`: executor pass.
- `npm run check`, full `npm run test`, and `npm run build`: not run; the task's
  intentional RED cannot become GREEN without a planning/boundary decision.

## Handoff

- Recommended owner/action: `/feature-to-tasks FT-003` resolves the accepted
  scope before this task may continue. Do not invoke `/verify` or T3
  `/red-verify` against this intentionally incomplete RED state.
- Tier escalation or planning repair: planning repair required; preserve this
  task's Attempt 1 evidence and use a replacement card if server-output scope
  changes.
- Task lifecycle changed by verifier: no.
