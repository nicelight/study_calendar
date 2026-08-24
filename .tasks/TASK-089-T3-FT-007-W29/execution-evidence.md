---
description: Execution evidence for TASK-089-T3-FT-007-W29 Attempt 1.
status: active
---
# Execution Evidence — TASK-089-T3-FT-007-W29

## Attempt and claim

- attempt: `1`
- claim: `FT-007-AC-006 / REQ-014 / REQ-017`
- outcome: Learning Progress exposes an authorized numeric attendance
  percentage over conducted student/lesson slots without changing attendance or
  financial facts.
- RED: `.tasks/TASK-089-T3-FT-007-W29/attempt-1-red.md`
- GREEN: `.tasks/TASK-089-T3-FT-007-W29/attempt-1-green.md`

## Actual change surface

- `src/lib/server/modules/learning-progress/public.ts`: adds the
  `getAttendancePercentage` provider query, Actor Context/C&S authorization,
  completed-lesson filtering, numeric empty-denominator handling, and a
  read-only attendance calculation over Learning Progress facts.
- `tests/learning-progress/ft-007-attendance-projection.test.ts`: isolated
  `:memory:` proof for student/Teacher formulas, default-present,
  absence/correction, no-slot, planned/cancelled exclusion, denial, and state
  equality.
- `.memory-bank/tasks/TASK-089-T3-FT-007-W29.task.json`: `/exe` lifecycle
  bookkeeping only, accepted `ready -> in_progress`; the pre-existing
  promotion to `ready` was preserved.
- `.protocols/TASK-089-T3-FT-007-W29/` and this `.tasks/` directory: required
  execution protocol and evidence only.

## Boundary compliance

- Hard allowed writes: satisfied for production/test outcome files.
- Workflow-owned writes: task protocol, evidence, and selected task lifecycle
  start were written as required by `/exe`.
- Forbidden scope: not touched. No routes, C&S, Identity & Access, Financial
  Ledger, Lesson Context, `study-calendar.db`, scheduler checkpoint, queue
  selection, dependent task, closure, or sync artifact was changed by this
  execution.
- Owner/boundary rule followed: actor identity is resolved by Identity & Access;
  current class/lesson/assignment scope is obtained from C&S public methods;
  attendance facts remain Learning Progress-owned.

## Commands and results

- `npx vitest run tests/learning-progress/ft-007-attendance-projection.test.ts`
  -> RED, exit `1`, 4 claim paths failed because the provider method was absent;
  artifact: `attempt-1-red.md`.
- `npx vitest run tests/learning-progress/ft-007-attendance-projection.test.ts`
  -> GREEN, exit `0`, 1 file / 4 tests passed; artifact:
  `attempt-1-green.md`.
- `npm run check` -> exit `0`, `svelte-check found 0 errors and 0 warnings`.
- `npm run test` -> exit `0`, 63 files / 208 tests passed.
- `npm run build` -> exit `0`; production client and SSR builds completed. The
  existing adapter-auto deployment advisory was informational only.
- `git diff --check` -> exit `0`, no output.
- `node scripts/mb-lint.mjs` -> exit `0`, 74 files; existing metadata warnings
  only, no lint failure.
- `node scripts/mb-doctor.mjs --strict` -> exit `0`, 0 errors, 0 warnings,
  2 informational messages.

## Evidence and reuse

The focused fixture uses a fresh in-memory database per test and leaves the
real database untouched. Query state-before/state-after equality covers
`learning_attendance` and the financial source/audit tables. No execute result
is proposed as a `/verify` reuse candidate: the shared worktree contains
unrelated dirty and runtime-sensitive inputs, so the independent verifier must
rerun its own claim proof and required gates.

## Next verification targets

- Fresh independent `/verify TASK-089-T3-FT-007-W29` for functional PASS.
- After functional PASS, required per-task T3 `/red-verify TASK-089-T3-FT-007-W29`.
- Scheduler/lifecycle owner decides closure and later wave-boundary `/mb-sync`;
  `/exe` makes no such decision.
