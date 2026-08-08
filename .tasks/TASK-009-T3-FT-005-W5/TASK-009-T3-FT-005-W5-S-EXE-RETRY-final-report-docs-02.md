---
stage: EXE
task: TASK-009-T3-FT-005-W5
role: IMPLEMENTER
attempt: 2
retry: 1/2
status: final
---
# TASK-009-T3-FT-005-W5 — bounded correction retry report-02

COMPLETION_REPORT

- role: IMPLEMENTER
- task_id: TASK-009-T3-FT-005-W5
- attempt: 2; bounded correction retry `1/2`
- correction_basis:
  `.protocols/TASK-009-T3-FT-005-W5/red-verification.md` and
  `.tasks/TASK-009-T3-FT-005-W5/TASK-009-T3-FT-005-W5-S-RED-VERIFY-final-report-docs-01.md`
- historical_basis: Attempt 1 RED, functional `PASS`, semantic-fail, and
  report-01 remain preserved unchanged as supporting-only correction evidence.
- touched_files:
  - `src/lib/server/modules/learning-progress/public.ts`
  - `tests/learning-progress/homework-grades.test.ts`
  - `.protocols/TASK-009-T3-FT-005-W5/{context,progress,handoff}.md`
  - `.tasks/TASK-009-T3-FT-005-W5/execution-evidence.md`
  - this retry report
- changes: `requireClassStudent` now accepts only the target IDs in the
  server-resolved requested-class scope. The task-owned regression fixture adds
  a same-center secondary class and proves both `recordGrade` and `getGrade`
  deny an out-of-class target for the assigned teacher and own-center Admin.
  No schema, composition-root, public contract, completion, grade-scale,
  attendance, finance, or lifecycle change was introduced.
- claim_scoped_red:
  - command: `npx vitest run tests/learning-progress/homework-grades.test.ts --reporter=verbose -t 'requires teacher and own-center Admin grade targets to belong to the requested class'`
  - result: exit `1`; 1 targeted test failed and 2 tests were skipped.
  - observation: teacher/Admin `recordGrade` did not reject a student enrolled
    in a different same-center class, reproducing the admitted semantic defect.
- claim_scoped_green:
  - command: same focused command and filter after correction
  - result: exit `0`; 1 targeted test passed and 2 tests were skipped.
  - observation: teacher/Admin write and read attempts for the out-of-class
    target were denied with `not-authorized`, and denied writes created no row.
  - artifact: `.tasks/TASK-009-T3-FT-005-W5/execution-evidence.md#correction-and-claim-equivalent-green`
- commands_run:
  - `npx vitest run tests/learning-progress/homework-grades.test.ts --reporter=verbose` — exit `0`; 1 file / 3 tests.
  - `npm run check` — exit `0`; 0 errors and 0 warnings.
  - `npm run build` — exit `0`; client and SSR bundles built; adapter-auto informational notice only.
  - `npm run test` — exit `0`; 8 files / 30 tests.
  - `git diff --check` — exit `0`.
- evidence:
  - `.tasks/TASK-009-T3-FT-005-W5/execution-evidence.md`
  - `.protocols/TASK-009-T3-FT-005-W5/{context,progress,handoff}.md`
  - `tests/learning-progress/homework-grades.test.ts`
- isolation: fresh `:memory:` SQLite database per test, deterministic fixture
  IDs, explicit cleanup, public-boundary behavior calls, no network,
  credentials, production data, or external side effect.
- boundary: no non-empty `runtime_context.write_boundary`; forbidden
  Foundation task records remained untouched; Learning Progress remains the
  sole production writer for grade state.
- risks_or_questions: no unresolved implementation blocker within the
  admitted correction. Current evidence is executor supporting evidence; no
  reuse candidate is offered because the workspace has broad dirty/untracked
  inputs and no compliant bounded-input snapshot was captured immediately
  before the final gates.
- next_steps: hand off to the independent `/verify` owner, followed by the
  required T3 `/red-verify`; this report does not close, promote, replan,
  synchronize, or change the task lifecycle.
