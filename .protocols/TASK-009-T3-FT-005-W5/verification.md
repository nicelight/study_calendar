---
description: Independent functional verification of TASK-009-T3-FT-005-W5 Attempt 2.
status: active
---
# Verification — TASK-009-T3-FT-005-W5 — Attempt 2

## What was verified

- The current Attempt 2 correction source satisfies the task-owned functional
  outcomes `FT-005-AC-001` and `FT-005-AC-002` for `REQ-009` and `REQ-014`.
- Fresh verifier-owned and verifier-run probes exercised the public Learning
  Progress boundary against disposable in-memory SQLite state. The current
  class-membership correction was checked on both `recordGrade` and `getGrade`.
- Attempt 1 functional and semantic results were read only as historical
  context; neither was used as current verdict evidence.
- Task lifecycle remains `in_progress`. No implementation, spec, AC, status,
  closure, promotion, `/red-verify`, `/mb-sync`, or dependent transition was
  performed.

## Verification basis

- Indexed task: `.memory-bank/tasks/TASK-009-T3-FT-005-W5.task.json`; dependency
  `TASK-005-T3-FT-002-W3` is a prerequisite only.
- Feature/REQ basis: `.memory-bank/features/FT-005-learning-progress.md`
  (`FT-005-AC-001`, `FT-005-AC-002`), `REQ-009`, and `REQ-014`.
- Direct canonical specs: `.memory-bank/contracts/boundary-map.md#personal-progress-query-boundary`,
  `.memory-bank/contracts/access-control.md`,
  `.memory-bank/domains/core-domain.md#ownership-map`, and
  `.memory-bank/states/lifecycle-map.md#learning-and-finance`.
- Applicable graph interactions use the exact accepted contracts:
  Learning Progress -> Identity & Access via `Actor Context Boundary`, and
  Learning Progress -> Center & Scheduling via
  `Calendar and Membership Query Boundary`. Learning Progress remains the sole
  writer of homework, completion, and grade state.
- Task purpose, success outcome, anti-goals, constraints, invariants, T3
  isolation, Attempt 2 handoff, retry report-02, and claim-linked execution
  evidence were read before probing.

## Executor claim path

- Attempt 2 retained the applicable class-membership correction RED and
  claim-equivalent GREEN in
  `.tasks/TASK-009-T3-FT-005-W5/execution-evidence.md#current-retry-claim-red`
  and `#correction-and-claim-equivalent-green`.
- The retry report and handoff are executor supporting evidence only. They were
  not treated as independent proof, and no execute receipt was reused because
  the handoff declares no compliant bounded-input snapshot.
- The preserved Attempt 1 evidence was not used for the current functional
  verdict.

## Reused execute evidence

- Receipt locator: none.
- Supported claims: none; all current outcome claims below have fresh
  verifier-owned or verifier-run observations.
- Freshness basis: current Attempt 2 source was inspected before the probes;
  each runtime probe used new `:memory:` SQLite state and explicit cleanup.

## Task-scoped checklist

- [x] `FT-005-AC-001` / `REQ-009`: assigned student completion persists and is
  visible in the permitted class context without exposing a grade.
  - Method: fresh public-boundary probe and independent disposable runtime
    probe with teacher-created homework, student completion, same-class
    projection, persisted completion, grade-free response, and cross-center
    denial.
  - Evidence: `.tasks/TASK-009-T3-FT-005-W5/verifier-owned-probe.test.ts`
    rerun against current source (`1` file / `2` tests), plus the independent
    `npx tsx -` probe (exit `0`).
- [x] `FT-005-AC-002` / `REQ-009`, `REQ-014`: exactly `α`, `β`, `γ`, `F` are
  accepted; invalid input does not mutate persisted state; the full private
  read matrix and requested-class target boundary hold.
  - Method: fresh public-boundary probes recorded all four accepted grades,
    rejected `A` and compared persisted state before/after, checked positive
    student/linked-parent/assigned-teacher/own-center-Admin reads, negative
    other-student/unrelated-parent/unassigned-teacher/cross-center-Admin reads,
    and denied both teacher/Admin write and read attempts for a target student
    enrolled only in another same-center class.
  - Evidence: verifier-owned probe rerun (`2/2`); independent `npx tsx -`
    probe (exit `0`); same-center unassigned-teacher probe (exit `0`); and
    current correction-specific public-boundary test (`1` passed, `2` skipped).

## New targeted probes

- `npx vitest run --config .tasks/TASK-009-T3-FT-005-W5/verifier-vitest.config.ts --reporter=verbose`
  -> `1` file / `2` tests passed against the current Attempt 2 source. It
  covered class-visible grade-free completion, persistence, accepted scale,
  invalid-grade non-mutation, and the positive/negative privacy matrix.
- Independent disposable runtime probe via `npx tsx -` -> exit `0`. It
  additionally proved teacher/Admin out-of-class target write denial, no grade
  row after denied writes, and read denial after a disposable seeded grade row.
  The scenario used a same-center secondary class and an exclusively enrolled
  target student.
- Independent same-center unassigned-teacher probe via `npx tsx -` -> exit `0`;
  the unassigned teacher could not read the assigned student's grade.
- The current targeted correction test was rerun independently of its earlier
  executor result:
  `npx vitest run tests/learning-progress/homework-grades.test.ts --reporter=verbose -t 'requires teacher and own-center Admin grade targets to belong to the requested class'`
  -> `1` passed / `2` skipped.
- Every runtime probe used deterministic disposable state, explicit database
  close, public-boundary behavior calls, and no network, credentials,
  production data, or external side effect.

## Architecture, scope, and non-goals

- Current source resolves actor and requested class scope through the accepted
  Identity & Access and Center & Scheduling public ports. `requireClassStudent`
  checks the server-resolved requested-class `studentAccountIds` on both grade
  command and query paths.
- Production Learning Progress writes are confined to its homework,
  completion, and grade state. No route/UI, attendance, financial, or consumer
  table write path was introduced or claimed here.
- The class completion projection contains completion fields only; it does not
  expose a grade. The two forbidden Foundation task records were untouched,
  and no non-empty hard write boundary was configured.
- The probe state was isolated and safely rerunnable. No unrelated dependency
  claim was adopted.

## Quality gates evidence

- `npm run check` -> exit `0`; `svelte-check found 0 errors and 0 warnings`.
- `npm run build` -> exit `0`; client and SSR production bundles completed;
  adapter-auto emitted only its informational environment notice.
- `npm run test` -> exit `0`; `8` files / `30` tests passed.
- `git diff --check` -> exit `0`.

## Repeated checks

- The focused verifier probe, current correction-specific test, and all
  required task gates were run from `/home/serg/Projects/study_calendar`.
- Repetition was necessary because T3 requires fresh verifier-owned outcome
  proof and the current handoff explicitly offered no eligible execute receipt.

## Verdict

VERDICT: PASS

## Handoff

- Required next T3 gate: `/red-verify TASK-009-T3-FT-005-W5`.
- Task remains `in_progress`; lifecycle closure, promotion, synchronization,
  and dependent transitions remain outside this verification command.
- No functional BUG or clarification question was identified.
- `/execute`, `/red-verify`, `/mb-sync`, lifecycle closure, promotion, and other
  workflow skills were not run.
