STATUS: EXECUTION_COMPLETE_HANDOFF

## CHANGES

- Added `LearningProgressBoundary.getGradeForLesson({ sessionToken, classId,
  lessonId, studentAccountId })`.
- Provider resolves authorization and a non-cancelled lesson, counts only
  existing `learning_homework` rows in the resolved class, then applies:
  exactly one → existing grade or null; zero → null; multiple →
  `ambiguous-homework-selection` with no grade.
- Added focused regression tests for authorized positive viewers, no-match,
  multiple-match, exactly-one/no-grade, auth-negative, non-mutation, and safe
  rerun.

## TESTS/GATES

- Focused: 5/5 passed.
- `npm run check`: passed, 0 errors/0 warnings.
- `npm run build`: passed, SSR/client build completed.
- `npm run test`: 15 files/50 tests passed.
- `node scripts/mb-lint.mjs`: passed.
- `node scripts/mb-doctor.mjs --strict`: passed, 0 errors/0 warnings.
- `git diff --check`: passed for the changed tracked surface.

## RED_GREEN

- RED Attempt 1: public `getGradeForLesson` was absent; focused contract
  assertion observed `undefined` and exited 1.
- GREEN Attempt 1: focused provider suite exited 0 with 5/5 tests passed.
- Receipts: `red-attempt-1.txt`, `green-focused-attempt-1.txt`,
  `native-gates-attempt-1.txt`.

## EVIDENCE

- Protocol: `.protocols/TASK-018-T3-FT-005-W8/`.
- Scope audit: `scope-audit-attempt-1.md`.
- Changed production/test files are inside the task hard write boundary.

## RISKS

- Independent `/verify` and T3 `/red-verify` evidence does not exist yet;
  executor evidence is supporting-only.
- Broad pre-existing worktree changes prevent offering project-wide gate reuse
  receipts; exact current-attempt outputs remain preserved as evidence.

## NEXT_STEP

- Fresh independent `/verify TASK-018-T3-FT-005-W8`, then `/red-verify
  TASK-018-T3-FT-005-W8` after functional PASS. Do not change TASK-014
  lifecycle before its owning workflow.
