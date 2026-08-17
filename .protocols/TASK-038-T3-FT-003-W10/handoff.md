---
description: Execution handoff for TASK-038-T3-FT-003-W10.
status: active
---
# Handoff — TASK-038-T3-FT-003-W10

## Summary

- Execution started and produced a claim-specific SSR RED. No production code
  changed because the task's hard stop condition is met: current calendar
  output cannot safely carry a selected student identity.

## Where to look

- key files: `src/routes/calendar/+page.svelte`,
  `tests/routes/calendar-navigation.test.ts`.
- advisory `touched_files` deviations and rationale: none; only the isolated
  navigation test was added, plus workflow-owned protocol/evidence artifacts.
- hard write-boundary compliance: yes; no forbidden application path changed.

## How to run / verify

- gates: full gates are unavailable while the intentionally RED task test is
  unresolved; do not interpret their absence as a verification result.
- claim-linked RED/GREEN evidence: RED at `progress.md#claim-linked-red--green-t2t3`
  and `.tasks/TASK-038-T3-FT-003-W10/attempt-1-red.md`; GREEN is blocked.
- current-attempt reuse candidate locators: none yet.
- superseded/supporting-only receipt locators: none.

## Known issues

- The calendar route output omits server-authorized student scope/identity.
  Adding it requires changing the hard-forbidden calendar loader or accepting
  a redesigned/narrowed task contract.

## Follow-ups

- `/feature-to-tasks FT-003` owns the required controlled task repair. Keep
  TASK-038 `in_progress`; do not send it to `/verify` or `/red-verify` until a
  replacement accepted card resolves the boundary.
