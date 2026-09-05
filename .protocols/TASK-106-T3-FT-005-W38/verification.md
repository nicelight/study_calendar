---
description: Independent functional verification for TASK-106-T3-FT-005-W38.
status: final
---
# Verification — TASK-106-T3-FT-005-W38

## Result scope

- Reviewer role: `Reviewer`; scheduler/outer lifecycle mode; task lifecycle was
  observed as `in_progress` and left unchanged.
- Tier: `T3`; wave: `W38`; feature: `FT-005`.
- Owned claims: `FT-005-AC-001 / REQ-009` and
  `FT-005-AC-002 / REQ-009 / REQ-014`.
- Executor Attempt 1 RED/GREEN and cleanup artifacts were inspected as
  supporting execution history only. No execute receipt was reused as proof.

## Verification basis

- Indexed task card and exact task/index identity:
  `.memory-bank/tasks/TASK-106-T3-FT-005-W38.task.json` and
  `.memory-bank/tasks/index.json`. Point-of-use preflight passed: one indexed
  row, matching ID/file, valid T3/W38/FT-005 identity, string-array
  requirements/dependencies, required gates, and non-empty verify claims.
- Direct feature claims:
  `.memory-bank/features/FT-005-learning-progress.md#FT-005-AC-001` and
  `#FT-005-AC-002`.
- Direct canonical contracts:
  `.memory-bank/contracts/learning-progress-browser-surface.md#server-composed-homework-projection`,
  `#authorized-homework-form-actions`, `#browser-user-surface-and-persistence`,
  and `#verification-target`; `.memory-bank/contracts/access-control.md#authority-and-scope`,
  `#data-minimization-and-failure-behavior`; and
  `.memory-bank/contracts/boundary-map.md#personal-progress-query-boundary`.
- Supporting governing inputs read before verification:
  `.memory-bank/constitution.md`, `.memory-bank/mbb/index.md`,
  `.memory-bank/spec-backbone.md` (complete, Planning Revision 2),
  `.memory-bank/spec-index.md`, `.memory-bank/index.md`,
  `.memory-bank/roles/reviewer.md`,
  `.memory-bank/architecture/system-architecture.md`,
  `.memory-bank/workflows/tier-policy.md`,
  `.memory-bank/workflows/execute-loop.md`,
  `.memory-bank/testing/strategy.md`, and
  `.memory-bank/tasks/plans/IMPL-FT-005.md`.
- Current execution context, plan, progress, handoff, and executor artifacts
  were read from `.protocols/TASK-106-T3-FT-005-W38/` and
  `.tasks/TASK-106-T3-FT-005-W38/`.

## Executor claim path

- Attempt 1 retained an applicable pre-implementation RED: the disposable
  browser reached the existing Lesson Context page but found no homework
  heading/create control. Evidence: `.tasks/TASK-106-T3-FT-005-W38/attempt-1-red.md`.
- Attempt 1 GREEN claims Admin creation, Student completion/reload, Teacher
  `α`/`β`/`γ`/`F` persistence, class-visible status, linked-family access,
  unrelated denial, and cleanup. It remains supporting evidence at
  `.tasks/TASK-106-T3-FT-005-W38/attempt-1-green.md` and
  `progress.md`; it was independently rerun below.
- The executor's actual W38 outcome surface is limited to
  `src/routes/lesson-context/+page.svelte` and the new
  `e2e/ft-005-homework-grading-ui.spec.ts`, as recorded in the handoff and
  confirmed by target-scoped diff inspection. Existing dirty changes in W37
  server/provider files were treated as dependency/out-of-scope state and
  were not modified by this verification.

## New targeted probes

1. `node scripts/run-disposable-e2e.mjs --database
   tmp/ft-005-homework-grading-ui.db --spec
   e2e/ft-005-homework-grading-ui.spec.ts` exited `0`; Playwright reported
   `1 passed (12.2s)`. With the runner-owned server at
   `http://127.0.0.1:5174`, headless `Desktop Chrome`, one worker, the fresh
   browser flow observed:
   - Admin created the missing class-scoped item through the existing named
     action.
   - Student One marked completion, reloaded, and saw `Выполнено`; assigned
     Teacher then saw both class students' persisted completion statuses.
   - Assigned Teacher selected and reloaded each accepted grade `α`, `β`, `γ`,
     and `F`; final `F` was visible to the corresponding Student and linked
     Parent.
   - Student/Parent completion projection did not expose the Teacher/Admin
     grade controls; the shared status section rendered completion state only.
   - Student Two's forged grade POST returned the server denial marker
     `homework_forbidden` and left the progress snapshot unchanged.
   - Student Two's guessed Student One personal URL and the unlinked Parent's
     guessed URL both returned HTTP 403, showed no private grade, and left the
     progress snapshot unchanged.
   - Final persisted state contained exactly one homework item, one completion
     for Student One, and the final `F` grade.
   Immediately after the run, the exact database and all exact SQLite
   sidecars (`.db`, `-wal`, `-shm`, `-journal`) were absent and no owned
   server/Playwright process remained. The runner passed the disposable path
   through `DATABASE_URL`; `study-calendar.db` was not used.
2. `npx vitest run tests/routes/lesson-context-homework-actions.test.ts
   tests/lesson-context/personal-page-rendering.test.ts --reporter verbose`
   exited `0`: 2 files and 6 tests passed. This independently repeated the
   server-composed zero/one/multiple selection, named actions, accepted grade
   values, grade-free shared projection, corresponding personal/family grade,
   and denied/non-mutating role/scope checks supporting the browser outcome.
3. `npx vitest run tests/scripts/run-disposable-e2e.test.ts --reporter
   verbose` exited `0`: 1 file and 5 tests passed. This independently proved
   rejection of the real database and out-of-scope paths, stale-target
   preparation, dedicated-server configuration, and exact cleanup after a
   forced failing owned run.
4. Required native gates passed independently:
   - `npm run check` — exit `0`; `svelte-check found 0 errors and 0 warnings`.
   - `npm run build` — exit `0`; SSR and client bundles built. The existing
     adapter-auto environment notice was informational.
   - `DATABASE_URL=:memory: npm run test` — exit `0`; 76 test files and 260
     tests passed without using the real database.
   - `git diff --check` — exit `0`.

## Boundary, scope, and non-goal review

- `src/routes/lesson-context/+page.svelte:119-173` consumes the server
  `homeworkProgress` projection, renders the Student completion form with only
  `completeHomework`, renders the missing-item create form with only
  `createHomework`, and renders the grade selector only when the server
  `canEditMaterial` capability is true. The selector contains exactly
  `α`/`β`/`γ`/`F` and submits the server-provided student selector plus named
  `recordGrade` action.
- `src/routes/lesson-context/+page.svelte:176-195` keeps the personal grade in
  the existing personal context and does not add grade data to the shared
  summary. The component contains no database/SQLite access, new route, API
  call, client-wide store, browser persistence, role/center/lesson/student
  authority resolution, or homework identity submission.
- The W37 dependency supplies the server projection and named actions through
  the accepted Lesson Context/Learning Progress boundary. The current W38
  component only adapts that projection; no forbidden server/provider/API or
  runner/config path is part of the W38 target outcome surface.
- The target-scoped diff contains only the allowed component plus the allowed
  disposable E2E spec. Pre-existing dirty W37 files under the task's forbidden
  scope were preserved and not treated as W38 implementation changes.

## Co-review and finding adjudication

- The required fresh co-review was attempted on `Codex Luna`; the literal
  launch returned a system HTTP 400 before analysis, and the required retry
  with the available Luna model completed without a candidate-finding payload.
  A second independent focus was also launched and completed without a
  candidate-finding payload. No co-review finding was available to admit.
- Verifier-owned probes and source review found no concrete task-relevant
  defect. No scope expansion, architecture repair, or operator decision is
  required.

## Verdict

VERDICT: PASS

## Handoff

- Leave `TASK-106-T3-FT-005-W38` lifecycle `in_progress`.
- T3 next requires `/red-verify TASK-106-T3-FT-005-W38`; this verification did
  not run `/red-verify`, `/mb-sync`, Judge, closure, promotion, or another
  task.
