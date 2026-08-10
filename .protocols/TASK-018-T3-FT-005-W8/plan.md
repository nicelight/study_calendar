---
description: Execution plan for TASK-018-T3-FT-005-W8.
status: active
---
# Plan — TASK-018-T3-FT-005-W8

## Goal

Expose one authorized `getGradeForLesson({ sessionToken, classId, lessonId,
studentAccountId })` provider query. Resolve the non-cancelled lesson and its
server-side center/class, select only class-scoped `learning_homework` rows,
and apply exactly-one/zero/multiple cardinality rules before the existing grade
projection lookup.

## Non-goals

- No new table/relation or lesson-to-homework persistence mapping.
- No direct database access or homework selection in Lesson Context.
- No changes to TASK-014 lifecycle, source, protocol, or evidence.
- No changes to existing homework/grade write ownership or accepted grade scale.

## Inputs / source specs

- Task record/index: `.memory-bank/tasks/TASK-018-T3-FT-005-W8.task.json`, `.memory-bank/tasks/index.json`
- Feature: `.memory-bank/features/FT-005-learning-progress.md#FT-005-AC-002`
- REQs: `REQ-009`, `REQ-014`
- Boundary/architecture/access/domain/testing specs listed in `context.md`.

## Constraints / invariants

- MUST keep homework selection and grade privacy inside Learning Progress.
- MUST authorize actor, class/center, lesson status, and selected student at
  the provider boundary.
- MUST return one selected student's permitted grade or null only for exactly
  one candidate with no grade, and null for zero candidates.
- MUST fail closed with `ambiguous-homework-selection` for multiple candidates.
- NEVER select by ordering, recency, title, or position.
- NEVER mutate persistence during the query.

## Scope

### In scope

- `src/lib/server/modules/learning-progress/`
- `tests/learning-progress/`
- Task-owned `.protocols/TASK-018-T3-FT-005-W8/` and `.tasks/TASK-018-T3-FT-005-W8/` evidence.

### Out of scope

- `src/lib/server/modules/lesson-context/`
- `.memory-bank/tasks/TASK-014-T3-FT-003-W8.task.json`
- `.protocols/TASK-014-T3-FT-003-W8/`
- `.tasks/TASK-014-T3-FT-003-W8/`
- Any new schema/migration/relation.

## Preflight-confirmed change surface

- Expected task hints: Learning Progress module and focused tests.
- Additional same-outcome files: none identified.
- Hard `write_boundary`: present and satisfied.
- `forbidden_scope` / stop conditions: clear.

## Applicable quality gates

- [ ] `npm run check` — TypeScript/Svelte project check.
- [ ] `npm run build` — project build.
- [ ] `npm run test` — project-native regression suite.
- [ ] Focused provider tests — positive, no-match, multiple-match,
  authorization-negative, and non-mutation claim cases.

## Claim-linked RED / GREEN (T2/T3)

- applicability: applicable
- accepted claim locators: `FT-005-AC-002`, `AD-007`,
  `personal-progress-query-boundary`, access-control data minimization.
- planned probe: call the public Learning Progress boundary with `lessonId`
  only, against isolated in-memory state, covering one/zero/multiple
  homework candidates and unauthorized sessions; compare database snapshots.
- RED: the public lesson-scoped method is absent or cannot resolve the accepted
  provider-owned projection/cardinality behavior.
- GREEN: the same public calls return the permitted grade/null, deny without
  existence leakage, fail closed on multiple candidates, and preserve state.
- T3 isolation/rerun/cleanup: each Vitest case uses `:memory:` composition root;
  before/after snapshots cover learning rows, and `afterEach` closes the DB.

## MB-SYNC handoff / owner

- `/exe` records implementation evidence only. `/verify` and `/red-verify`
  remain required for T3; lifecycle closure is not performed here.

## Definition of done

- Provider contract and deterministic cardinality behavior are implemented in
  the hard boundary.
- Minimal focused regression tests pass for all required cases.
- Native check/build/test pass and current Attempt 1 RED/GREEN receipts are
  recorded in `progress.md` and linked by `handoff.md`.
