---
description: Adversarial semantic verification for TASK-014-T3-FT-003-W8.
status: active
---
# Red Verification — TASK-014-T3-FT-003-W8

## Semantic target

- Task-owned outcome: authorized shared/personal day context with selected-
  student private projections, stable navigation, no cross-boundary leakage,
  and visible personal grade rendering.
- Accepted claims: `FT-003-AC-003..AC-006` / `REQ-005`, `REQ-006`, `REQ-014`,
  `REQ-016`; Lesson Context composes named provider reads and Learning Progress
  owns the lesson-scoped grade projection.
- Direct canonical basis: system architecture request-data flow and `AD-007`,
  Personal Progress Query Boundary, Access Control, and the indexed T3 task
  card. The provider contract receives `lessonId` plus server-resolved actor /
  scope context; Lesson Context does not resolve or pass `homeworkId`.

## Evidence and adversarial coverage

- Functional prerequisite was independently present before this review:
  `VERDICT: PASS` in `.protocols/TASK-014-T3-FT-003-W8/verification.md` and
  `.tasks/TASK-014-T3-FT-003-W8/TASK-014-T3-FT-003-W8-S-VERIFY-final-report-docs-02.md`.
  `/verify` was not run in this session.
- Historical claim-specific RED is retained in the prior task red report: the
  selected grade reached the personal server payload but was absent from the
  rendered form. The correction now renders `context.personal.progress.grade`
  and a safe null state in `src/routes/lesson-context/+page.svelte`.
- Current adversarial render probe:
  `npx vitest run --config .tasks/TASK-014-T3-FT-003-W8/vitest.red-verify-current.config.ts --reporter=verbose`
  -> exit `0`, 1 file / 1 test passed; production Svelte SSR output contains
  the provider-owned selected grade `β`.
- Current focused semantic regression set:
  `npx vitest run tests/learning-progress/lesson-scoped-grade.test.ts tests/lesson-context/authorized-day-context.test.ts tests/lesson-context/grade-projection-route.test.ts tests/lesson-context/personal-page-rendering.test.ts --reporter=verbose`
  -> exit `0`, 4 files / 12 tests passed. It covers shared material reuse,
  selected-student grade composition, navigation identity, provider
  authorization/cardinality, generic API `403`, and state-before/state-after
  preservation on denied/read paths.
- Provider ownership was checked against current source and focused results:
  `LessonContextBoundary` calls `getGradeForLesson` with `sessionToken`,
  resolved `classId`, stable `lessonId`, and selected `studentAccountId`; the
  provider performs lesson/class authorization and internal homework selection.
  A production-only scan of `src/lib/server/modules/lesson-context/` and
  `src/routes/lesson-context/` found no `homeworkId`.
- Navigation/SSR/API and privacy were cross-checked against the current
  verifier-owned functional artifact `verify-current.test.ts` and its
  `docs-02` report: exact date/class/lesson/student identity survives API and
  SSR adapters; unauthenticated, wrong-student, wrong-class, cross-center,
  and forged-role requests return generic denial; no private target data is
  returned. The route source maps denied API reads to `{ error: 'forbidden' }`
  with status `403` and SSR denial to `error(403, 'Forbidden')`.
- All runtime probes used disposable in-memory roots or render-only SSR; no
  production data, credentials, network, or external side effect was used.

## Admitted findings

None. No material break of an unambiguous accepted outcome was evidenced after
the AC-004 rendering correction.

## Operator questions

None.

## Verdict

The prior AC-004 semantic blocker is closed by current rendered output and the
focused adversarial checks. No semantic concern or fail condition remains.

SEMANTIC_VERDICT: semantic-pass

## Owner handoff

- Evidence/report paths: this protocol, the task-owned red report, the current
  functional PASS report, the red probe/config, and the focused semantic test
  artifacts under `.tasks/TASK-014-T3-FT-003-W8/`.
- Recommended owner action: treat the T3 semantic obligation as satisfied and
  apply the existing closure route if otherwise authorized by the lifecycle
  owner. This standalone review changes no task status, feature lifecycle,
  scheduler state, or `/mb-sync` state.
- Resume route: `n/a` unless the lifecycle owner requests a separate follow-up.
