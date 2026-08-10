---
description: Fresh independent functional and semantic checkpoint report for TASK-014-T3-FT-003-W8.
status: final
---
# Independent Verification — TASK-014-T3-FT-003-W8

## Result

Functional verification failed on `FT-003-AC-004 / REQ-006`. In isolated
state, the Learning Progress provider returned the selected student's grade
(`β`), but Lesson Context returned only attendance under `personal.progress`.
The personal response therefore omits an accepted private projection.

The same unambiguous contract break is a semantic failure for this checkpoint.
Standalone `/red-verify` was not invoked because the required functional PASS
prerequisite was not met.

## Evidence

- Protocol: `.protocols/TASK-014-T3-FT-003-W8/verification.md`.
- Fresh verifier probe: `.tasks/TASK-014-T3-FT-003-W8/verifier-functional-probe.test.ts`
  plus its task-local Vitest config; 3/4 verifier tests passed and the AC-004
  grade assertion failed.
- Passing probe coverage: all authorized shared roles, shared-material reuse,
  selected-student discussion/attendance/finance, exact API/SSR context,
  guessed/cross-student denial, generic 403 responses, client-role rejection,
  safe cleanup/rerun, and no persisted mutation.
- Required gates: `npm run check`, `npm run build`, and `npm run test` passed;
  the full suite was 14 files / 45 tests.
- Normative/source proof: Access Control requires personal responses to carry
  permitted grade, discussion, attendance, and financial projection; the
  Learning Progress public boundary provides `getGrade`, while
  `src/lib/server/modules/lesson-context/public.ts` calls only `getAttendance`
  and defines `progress` with attendance only.

## Finding

- `HIGH` — complete the accepted personal-day composition for the selected
  student's provider-owned grade/progress projection. The current behavior is
  incomplete even though privacy denial, navigation, shared material, and all
  project gates pass. Use `/feature-to-tasks FT-003`; route to `/spec-design`
  first if the missing aggregate provider boundary requires an architecture or
  public-contract decision. Then rerun `/exe`, `/verify`, and (only after
  functional PASS) `/red-verify` for this exact task.

## Handoff

- verdict: `REQUEST_CHANGES`
- semantic result: `semantic-fail` on the same evidenced accepted-outcome break;
  no standalone red gate was run because functional verification failed
- lifecycle: remains `in_progress`
- no implementation/spec/task-card/index/lifecycle/scheduler change and no
  `/mb-sync` was performed

SEMANTIC_VERDICT: semantic-fail
