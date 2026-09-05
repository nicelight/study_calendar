# Verification report — TASK-105-T3-FT-005-W37

- role: `Reviewer`
- task: `TASK-105-T3-FT-005-W37`
- attempt: `2`
- tier / wave / feature: `T3` / `W37` / `FT-005`
- planning_revision: `2`
- lifecycle_at_handoff: `in_progress`
- verdict: `PASS`

## Scope and basis

Проверен только принятый W37 outcome: server-composed Learning Progress
homework projection и named `/lesson-context` create/complete/grade actions.
W38 UI/Playwright scope, FT-006 dirty changes и другие задачи не расширяли
проверку. Нормативная база — task card, FT-005-AC-001/002, REQ-009/014,
Learning Progress Browser Surface, Personal Progress Query Boundary,
Cross-Slice Orchestration, access-control, AD-007, domain/state contracts и
Planning Revision 2.

## Fresh verifier-owned evidence

- Artifact:
  `.tasks/TASK-105-T3-FT-005-W37/verifier-owned-attempt-2.md` и
  `verifier-owned-attempt-2.test.ts`.
- Command:
  `npx vitest run --config .tasks/TASK-105-T3-FT-005-W37/verifier-attempt-2-vitest.config.ts --reporter verbose`
  — exit `0`, `1` test file / `1` test passed.
- Student A completes homework through the named Lesson Context action;
  Student B then loads the same authorized shared Lesson Context and sees A's
  persisted `completed: true` status. Shared completion entries contain no
  grade fields.
- A's personal context exposes the final `F` grade; the linked Parent receives
  that same permitted personal grade; Student B's shared view has no grades,
  while B's own permitted β grade remains personal. Student B's attempt to
  open A's personal context is denied.
- The probe also covered zero/one/multiple provider selection,
  server-generated opaque IDs, distinct IDs in distinct authorized classes,
  repeat-create/repeat-complete state equality, all accepted grades,
  forged/wrong-role/unassigned/cross-class/cross-center/invalid-grade
  denials, deny-before-write snapshots, ambiguity fail-closed behavior, no
  route direct Learning Progress persistence access, and GET-only API shape.
- All probe fixtures used isolated SQLite `:memory:` state, were safely
  rerunnable, closed the database in `afterEach`, and created no filesystem
  database or sidecars.

## Required gates and supporting evidence

- `npm run check` — exit `0`, 0 errors and 0 warnings.
- `npm run build` — exit `0`.
- `DATABASE_URL=:memory: npm run test` — exit `0`, `76` files / `260` tests.
- `git diff --check` — exit `0`.
- Attempt 1 RED, Attempt 2 executor GREEN/cleanup, and the prior semantic-fail
  report are retained as supporting evidence. No execute receipt was reused
  as independent proof.
- Two fresh `Codex Luna` `xhigh` co-review focuses were attempted. The
  authorization/data-isolation focus returned no candidate findings. The
  boundary/persistence focus raised a provider compatibility `homeworkId`
  candidate; it was not adopted because this task-owned claim is the protected
  Lesson Context transport, which rejects browser-supplied `homeworkId`, while
  Learning Progress remains the accepted owner and no task-path bypass was
  observed.

## Handoff

The current functional result is closure-eligible only after the required T3
`/red-verify TASK-105-T3-FT-005-W37`. The task remains `in_progress`; no
closure, promotion, `/mb-sync`, Judge, TASK-106 execution, or unrelated
worktree change was performed.
