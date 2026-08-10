---
description: Adversarial semantic verification basis for TASK-018-T3-FT-005-W8.
status: active
---
# Red Verification — TASK-018-T3-FT-005-W8

## Semantic target

- Task outcome: Learning Progress exposes one authorized lesson-scoped personal
  grade query over existing `learning_homework`, with provider-owned selection,
  exact-one/zero/multiple cardinality behavior, privacy, and read-only safety.
- Accepted contract and boundaries: `FT-005-AC-002`, `AD-007`, Personal
  Progress Query Boundary, Access Control, Core Domain, and the one-server/
  shared-database architecture. Lesson Context may consume the provider but
  must not resolve or persist a homework mapping.

## Evidence and adversarial coverage

- Existing functional verification: `.protocols/TASK-018-T3-FT-005-W8/verification.md`
  records fresh functional `VERDICT: PASS`; executor evidence was treated as
  supporting-only.
- Actual change surface: `src/lib/server/modules/learning-progress/public.ts`
  and `tests/learning-progress/lesson-scoped-grade.test.ts`; no Lesson Context,
  schema/migration, TASK-014, or consumer mapping change was observed.
- Boundary review: the provider resolves actor, authorized class/student scope,
  and non-cancelled lesson through accepted public ports; selection and grade
  lookup remain inside Learning Progress; Lesson Context has no `homeworkId`
  selection or direct Learning Progress table read.
- Adversarial disposable public-boundary probe passed for: cancelled lesson
  rejection before selection with unchanged state; an extra caller-supplied
  `homeworkId` not controlling provider selection; multiple class candidates
  returning `ambiguous-homework-selection` without grade and without state
  mutation; and safe database cleanup.
- Focused and native gates independently passed: focused `5/5`,
  `npm run check`, `npm run build`, and `npm run test` (`15` files / `50` tests).

## Admitted findings

None.

## Operator questions

None.

## Verdict

The semantic marker is recorded exactly once in the linked final report:
`.tasks/TASK-018-T3-FT-005-W8/TASK-018-T3-FT-005-W8-S-RED-VERIFY-final-report-docs-01.md`.

## Owner handoff

- Evidence/report paths: this protocol, the linked final report, and
  `verification.md`.
- Recommended owner action: retain `TASK-018-T3-FT-005-W8` `in_progress`;
  functional and semantic T3 obligations are evidenced, while lifecycle
  closure remains outside this verifier.
- Resume route: `n/a` unless the lifecycle owner requests follow-up.
