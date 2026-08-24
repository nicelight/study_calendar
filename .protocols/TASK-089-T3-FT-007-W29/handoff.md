---
description: Execution handoff for TASK-089-T3-FT-007-W29.
status: active
---
# Handoff — TASK-089-T3-FT-007-W29

## Summary

- Execution Attempt 1 started for the Learning Progress attendance projection.
- The focused task-scoped RED is recorded before production change;
  `attempt-1-red.md` shows the missing `getAttendancePercentage` method across
  four claim paths.
- Attempt 1 completed the bounded provider implementation and claim-equivalent
  GREEN. The task remains `in_progress`; no lifecycle closure or scheduler state
  was changed.

## Completion report

COMPLETION_REPORT
- role: `Implementer`
- task_id: `TASK-089-T3-FT-007-W29`
- attempt: `1`
- touched_files:
  - `src/lib/server/modules/learning-progress/public.ts`
  - `tests/learning-progress/ft-007-attendance-projection.test.ts`
  - task-owned `.protocols/` and `.tasks/` evidence
- changes: added the Learning Progress `getAttendancePercentage` query. Student
  requests use current C&S class scope; Teacher aggregates use server-resolved
  C&S assignments and current class scopes. Only completed lessons contribute;
  the result is numeric and read-only. No route, table owner, transition, or
  financial behavior changed.
- commands_run: focused RED/GREEN test, `npm run check`, `npm run test`,
  `npm run build`, `git diff --check`, `node scripts/mb-lint.mjs`, and
  `node scripts/mb-doctor.mjs --strict`.
- evidence: `attempt-1-red.md`, `attempt-1-green.md`, `execution-evidence.md`,
  and current `progress.md`.
- risks_or_questions: none unresolved; independent T3 verification remains due.
- next_steps: fresh `/verify TASK-089-T3-FT-007-W29`, then required
  `/red-verify TASK-089-T3-FT-007-W29`. Scheduler retains lifecycle closure and
  later wave-sync ownership.

## Where to look

- key files:
  - `src/lib/server/modules/learning-progress/public.ts`
  - `tests/learning-progress/ft-007-attendance-projection.test.ts`
  - `.protocols/TASK-089-T3-FT-007-W29/progress.md`
- execution evidence:
  - `.tasks/TASK-089-T3-FT-007-W29/execution-evidence.md`
  - `.tasks/TASK-089-T3-FT-007-W29/attempt-1-red.md`
  - `.tasks/TASK-089-T3-FT-007-W29/attempt-1-green.md`
- advisory `touched_files` deviations and rationale: none
- hard write-boundary compliance: yes; no forbidden path touched

## How to run / verify

- gates: focused test 1 file / 4 tests, full test 63 files / 208 tests,
  check/build/diff/mb-lint/strict-doctor all passed; exact output is in
  `execution-evidence.md`.
- claim-linked RED/GREEN evidence: RED at
  `.tasks/TASK-089-T3-FT-007-W29/attempt-1-red.md`; claim-equivalent GREEN at
  `.tasks/TASK-089-T3-FT-007-W29/attempt-1-green.md`.
- current-attempt reuse candidate locators: none proposed.
- superseded/supporting-only receipt locators: none.

## Known issues

No unresolved task-local issue or owner/boundary gap.

## Follow-ups

- Return the normal handoff to `/verify TASK-089-T3-FT-007-W29`; T3 also
  requires per-task `/red-verify`.
- Do not run `/verify`, `/red-verify`, `/mb-sync`, or mutate scheduler checkpoint
  and queue/lifecycle closure from `/exe`.
