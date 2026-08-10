---
description: Claim-linked execution evidence for TASK-009-T3-FT-005-W5 Attempt 1.
status: final
---
# Execution Evidence — TASK-009-T3-FT-005-W5

## Attempt 1 — pre-implementation RED

- Claim mapping: `FT-005-AC-001` / `REQ-009` and `FT-005-AC-002` / `REQ-009`,
  `REQ-014`.
- Command: `npx vitest run --config .tasks/TASK-009-T3-FT-005-W5/vitest.config.ts`.
- CWD: `/home/serg/Projects/study_calendar`.
- Result: exit `0`; 1 disposable test file and 2 claim-specific tests passed.
- Observation: the composition root had no `learningProgress` boundary and the
  fresh SQLite schema had no `learning_homework` or `learning_grades` tables.
  This was an honest pre-implementation absence, not a setup/import/syntax,
  unrelated, or artificial failure.
- Artifact: `.tasks/TASK-009-T3-FT-005-W5/red-probe.test.ts`.

## Attempt 1 — implementation delta

- `src/lib/server/modules/learning-progress/public.ts`: added the owner-side
  homework assignment/completion and grade command/query boundary. Each public
  operation resolves the authenticated actor and server-side class scope
  through Identity & Access and Center & Scheduling; grade reads remain
  student/family/assigned-teacher/own-center-admin scoped.
- `src/lib/server/platform/database.ts`: added Learning Progress-owned
  homework, completion, and grade tables with accepted-grade database
  constraint and indexes. Existing unrelated schema work was preserved.
- `src/lib/server/composition-root.ts`: exposed `learningProgress` beside the
  existing capability boundaries.
- `tests/learning-progress/homework-grades.test.ts`: added isolated AC-001/002
  public-boundary tests with own/cross-center actors, class membership,
  assignment, parent links, and cleanup.

## Attempt 1 — claim-equivalent GREEN

- Command: `npx vitest run tests/learning-progress/homework-grades.test.ts --reporter=verbose`.
- CWD: `/home/serg/Projects/study_calendar`.
- Result: exit `0`; 1 file and 2 tests passed.
- `FT-005-AC-001`: a student completion persisted and the authorized class
  projection returned complete/incomplete status for class students without a
  grade field; an outsider was denied.
- `FT-005-AC-002`: all accepted values `α`, `β`, `γ`, `F` were persisted on
  update; invalid `A` was rejected before mutation; selected student, linked
  parent, assigned teacher, and own-center Admin could read the grade; another
  student, unrelated parent, unassigned teacher, and cross-center Admin were
  denied.
- Isolation/cleanup: each test used a fresh `:memory:` SQLite database and
  closed it in `afterEach`; no network, credentials, production data, or
  external side effect was used.

## Required gates

- `npm run check` → exit `0`; `svelte-check found 0 errors and 0 warnings`.
- `npm run build` → exit `0`; Vite SSR and client production bundles completed.
- `npm run test` → exit `0`; 8 files / 29 tests passed.
- `git diff --check` → exit `0`.

## Scope and boundary evidence

- Actual task-owned implementation surface: Learning Progress public boundary,
  additive Learning Progress schema, composition-root exposure, and the
  task-owned tests above.
- Advisory `touched_files` deviation: schema and composition-root wiring are
  same-outcome infrastructure required for durable state and public exposure.
- No non-empty `runtime_context.write_boundary` was defined. Both forbidden
  Foundation task records remained untouched.
- Learning Progress is the sole production writer for homework/completion/grade
  state; class/student authorization is delegated to accepted public
  boundaries, and no financial or attendance write path was introduced.
- Task remains `in_progress`; no `/verify`, `/red-verify`, `/mb-sync`, closure,
  promotion, or dependent lifecycle action was run.

## Attempt 1 evidence status

- Attempt 1 was the prior reconciled execution attempt after two pre-handoff
  stalls. Its RED, functional PASS, semantic-fail, and report-01 remain
  preserved as historical/supporting-only correction basis for Attempt 2.
- No execute-result reuse candidate is offered: the bounded-input snapshot
  required for a reusable receipt was not captured immediately before the
  final gate commands. These results are executor supporting evidence only.

## Attempt 2 — bounded correction retry 1/2

### Current retry claim RED

- Claim mapping: `FT-005-AC-002` / `REQ-009`, `REQ-014`; Personal Progress
  Query Boundary and Access Control Contract rule that the target student must
  be within the server-resolved requested class scope.
- Correction basis: Attempt 1 semantic-fail report-01 at
  `.protocols/TASK-009-T3-FT-005-W5/red-verification.md` and
  `.tasks/TASK-009-T3-FT-005-W5/TASK-009-T3-FT-005-W5-S-RED-VERIFY-final-report-docs-01.md`.
- Command: `npx vitest run tests/learning-progress/homework-grades.test.ts --reporter=verbose -t 'requires teacher and own-center Admin grade targets to belong to the requested class'`.
- CWD: `/home/serg/Projects/study_calendar`.
- Result: exit `1`; 1 targeted test failed and 2 existing tests were skipped.
- Observation: the new disposable public-boundary scenario reached
  `recordGrade` for `student-three`, who belongs to a different same-center
  class, and the expected `not-authorized` error was absent. This was the
  admitted production authorization defect, not setup/import/syntax failure.

### Correction and claim-equivalent GREEN

- Production correction: `src/lib/server/modules/learning-progress/public.ts`
  now authorizes `requireClassStudent` solely from the server-resolved
  `scope.studentAccountIds`. The existing assigned-teacher and own-center
  Admin role checks remain in `requireTeacherOrAdminClassScope`; no schema,
  public contract, completion, grade-scale, or lifecycle behavior changed.
- Probe change: `tests/learning-progress/homework-grades.test.ts` adds one
  same-center secondary class and a student enrolled only there, then proves
  both `recordGrade` and `getGrade` deny that target for the assigned teacher
  and own-center Admin. The read assertion seeds only the Learning Progress
  grade row in disposable SQLite to exercise the public read boundary; no
  production bypass is introduced.
- GREEN command: same focused command and filter as the current retry RED.
- CWD: `/home/serg/Projects/study_calendar`.
- Result: exit `0`; 1 targeted test passed and 2 existing tests were skipped.
- Observation: both teacher/Admin write attempts and both teacher/Admin read
  attempts for the out-of-class target now throw `not-authorized`; no grade
  row is created by the denied writes.
- T3 isolation/cleanup: fresh `:memory:` SQLite per test, deterministic
  fixture IDs, explicit `afterEach` close, public-boundary calls only for
  behavior, no network/credentials/production data/external side effect.

### Attempt 2 required gates

- Focused task gate: `npx vitest run tests/learning-progress/homework-grades.test.ts --reporter=verbose` → exit `0`; 1 file / 3 tests passed.
- `npm run check` → exit `0`; `svelte-check found 0 errors and 0 warnings`.
- `npm run build` → exit `0`; client and SSR bundles built; adapter-auto
  emitted only its existing informational environment notice.
- `npm run test` → exit `0`; 8 files / 30 tests passed.
- `git diff --check` → exit `0`; no whitespace errors.

### Attempt 2 scope and evidence status

- Current retry production/test change surface: `src/lib/server/modules/learning-progress/public.ts` and `tests/learning-progress/homework-grades.test.ts`.
- Retry bookkeeping/report surface: `.protocols/TASK-009-T3-FT-005-W5/{context,progress,handoff}.md`, this file, and `TASK-009-T3-FT-005-W5-S-EXE-RETRY-final-report-docs-02.md`.
- Attempt 1 implementation files, RED, functional PASS, semantic-fail, and
  report-01 remain preserved historical/supporting-only correction basis;
  current retry evidence supersedes only the same admitted class-membership
  claim for execution handoff purposes.
- No non-empty `runtime_context.write_boundary` was defined. Both forbidden
  Foundation task records remained untouched. Learning Progress remains the
  sole production writer for grade state.
- No execute-result reuse candidate is offered: the workspace contains broad
  unrelated dirty/untracked inputs and no compliant bounded-input snapshot was
  captured immediately before the final gate sequence. All current results
  are executor supporting evidence for independent verification.
