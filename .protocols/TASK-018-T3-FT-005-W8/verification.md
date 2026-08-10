---
description: Verification handoff basis for TASK-018-T3-FT-005-W8.
status: active
---
# Verification — TASK-018-T3-FT-005-W8

## What was verified

- Current Attempt 1 source satisfies the task-owned `FT-005-AC-002` / `REQ-009`
  and `REQ-014` lesson-scoped grade-query outcome on a fresh verifier run.
- Task remains `T3`, `in_progress`, `W8`; no implementation, task status,
  lifecycle, scope, AC, dependency, or dependent task was changed.

## Verification basis

- Indexed task: `.memory-bank/tasks/TASK-018-T3-FT-005-W8.task.json`; the task
  is unique in `.memory-bank/tasks/index.json`, and both dependencies are `done`.
- Direct normative basis: `FT-005-AC-002`, `AD-007`, Personal Progress Query
  Boundary, Access Control (`authority-and-scope` and
  `data-minimization-and-failure-behavior`), Core Domain, request data flow,
  and Testing Strategy.
- Tier basis: T3 full protocol, independent functional PASS, then per-task
  hostile `/red-verify` are required.
- Executor RED/GREEN and handoff were read as supporting evidence only;
  no execute receipt was reused because the handoff declares broad
  pre-existing worktree state.

## Executor claim path

- Applicable RED/GREEN path is recorded in `.protocols/TASK-018-T3-FT-005-W8/progress.md`
  and `.tasks/TASK-018-T3-FT-005-W8/{red-attempt-1.txt,green-focused-attempt-1.txt}`.
- The executor RED was the absent public `getGradeForLesson` boundary; its
  GREEN was the same focused contract suite after implementation. These remain
  supporting observations, not the independent verdict basis.

## Task-scoped results

- [x] `FT-005-AC-002`: fresh focused public-boundary run proved the permitted
  selected student's grade projection and the accepted privacy matrix for
  student, linked parent, assigned teacher, and own-center admin; the existing
  grade scale remains `α`/`β`/`γ`/`F`.
- [x] Exact-one/zero/multiple: exactly one candidate returns its grade or null
  when the grade row is absent; zero class-scoped candidates returns null;
  multiple candidates throw `ambiguous-homework-selection` before any grade
  lookup, with no ordering/recency/title/position tie-break.
- [x] Auth/privacy-negative: unauthenticated, wrong-student, wrong-class, and
  cross-center requests fail before private projection, with no differing
  target-existence result and unchanged state.
- [x] Provider ownership: `getGradeForLesson` is implemented in Learning
  Progress, resolves actor/class/lesson scope through accepted public ports,
  selects existing `learning_homework` internally, and delegates only the
  existing provider grade projection. Lesson Context contains no homework
  mapping, `homeworkId` selection, or direct Learning Progress table read.
- [x] Non-mutation/safe rerun: the focused tests use fresh `:memory:` roots,
  compare homework/grade/completion/attendance snapshots before/after denied,
  zero, and multiple reads, repeat the reads, and close the database in
  `afterEach`.
- [x] Scope/non-goals: production change is confined to
  `src/lib/server/modules/learning-progress/`; focused test is under
  `tests/learning-progress/`; no Lesson Context, TASK-014, schema/migration,
  new relation, or consumer-owned mapping change was observed.

## New targeted probes

- `npx vitest run tests/learning-progress/lesson-scoped-grade.test.ts` — exit
  `0`, 1 file / 5 tests passed, run at 2026-08-10 14:30 +0500.
- Source/diff inspection was performed before the probe; current SHA-256 basis:
  `public.ts` `22da8cb86a52f19b7f690c6a1f92cbeea41db1cad3b4f1c3ea2dd7ab7cf678b8`,
  focused test `769cd796319605f1013b556818d5cfbdef227647839ad4d89e32225cc56aeba5`.
- `git diff --check` — exit `0`.

## Quality gates evidence

- `npm run check` — exit `0`; svelte-check reported 0 errors and 0 warnings.
- `npm run build` — exit `0`; SSR and client builds completed; adapter-auto
  emitted only its informational environment notice.
- `npm run test` — exit `0`; 15 test files / 50 tests passed.

## Repeated checks

- Focused outcome probe and all required task gates were rerun from
  `/home/serg/Projects/study_calendar` because no bounded current-attempt
  execute receipt was eligible for reuse.
- All runtime checks used disposable in-memory state or read-only build/test
  execution; no network, credentials, production data, or external side effect
  was used.

## Verdict

VERDICT: PASS

## Handoff

- Required next action: `/red-verify TASK-018-T3-FT-005-W8`.
- No functional finding or clarification blocker was identified.
- Task lifecycle remains `in_progress`; closure, promotion, sync, and dependent
  transitions were not performed by this verification.
