# Execute evidence — TASK-039-T3-FT-003-W10

## Scope and outcome

- Task: `TASK-039-T3-FT-003-W10`, tier `T3`, Attempt `1`.
- Actual outcome surface: shared-only calendar lesson navigation to the
  existing `/lesson-context` route.
- Changed source/test files: `src/routes/calendar/+page.svelte`,
  `tests/routes/calendar-navigation.test.ts`.
- Task-owned evidence/protocol files: this file,
  `attempt-1-red.md`, `attempt-1-green.md`, and the task protocol.
- No advisory `touched_files` deviation.
- Hard write boundary: respected. No forbidden path was touched; no calendar
  loader, Lesson Context module, capability module, TASK-038 artifact, task
  index, or outer run file was changed.

## Claim-linked RED / GREEN

- Claim mapping: `FT-003-AC-008` / `REQ-005` / `REQ-006` / `REQ-014`.
- RED: [Attempt 1 RED](attempt-1-red.md) records the focused SSR assertion
  failing before the production change because no accepted Lesson Context
  href was rendered.
- GREEN: [Attempt 1 GREEN](attempt-1-green.md) records the equivalent
  DB-backed calendar-load → SSR → existing Lesson Context-load probe passing.
- The GREEN probe asserts exact ordered query keys `date`, `classId`,
  `lessonId`, absence of `studentAccountId`, shared Lesson Context identity,
  and unchanged database state.
- T3 isolation: the probe uses a fresh in-memory database and closes it in
  `afterEach`; no external side effect occurred.

## Gate results

Commands were run from `/home/serg/Projects/study_calendar` at repository
revision `61f206abb02a84b99201296d5f0e0ad811a3fbe7`. Before each gate, the
declared worktree snapshot showed the pre-existing unrelated dirty files and
the task-owned untracked calendar route/test; no forbidden path was added.

- `npm run test -- tests/routes/calendar-navigation.test.ts` — exit `0`; 1
  focused file and 1 test passed.
- `npm run check` — exit `0`; `svelte-check found 0 errors and 0 warnings`.
- `npm run test` — exit `1`; 31 files / 142 tests passed, but the existing
  out-of-boundary `tests/routes/calendar-authorized.test.ts` failed its stale
  assertion that the calendar component must not contain `lesson-context`.
  This assertion conflicts directly with accepted AC-008 and could not be
  repaired inside the hard boundary.
- `npm run build` — exit `0`; Vite/SvelteKit production build completed.
- `git diff --check -- src/routes/calendar/+page.svelte tests/routes/calendar-navigation.test.ts` — exit `0`.
- Supplemental untracked-file whitespace check with
  `git diff --no-index --check /dev/null <file>` reported no whitespace errors
  for both actual changed files.

## Boundary/spec compliance

- The component consumes only server-rendered lesson `lessonDate`, `classId`,
  and `lessonId` to build the shared link.
- Calendar day navigation remains owned by the calendar presentation; the
  lesson anchor is a non-nested sibling link.
- `/lesson-context` remains the existing composition and server-side
  authorization owner; no personal student contract or persistence write was
  added.
- The full-suite failure is an evidenced stale regression contract in a
  forbidden file, not a new product or architecture decision.

## Handoff state

- Lifecycle remains `in_progress`; `/exe` did not close, fail, block, verify,
  semantically verify, sync, or promote the task.
- No reusable gate candidate is offered: the full suite/build read broad
  project and generated state, and the focused probe is execution evidence
  for independent verifier review rather than independent proof.
- Recommended next route: `/verify TASK-039-T3-FT-003-W10`, with the stale
  out-of-boundary test conflict explicitly reviewed before accepting the full
  gate result.

## Operator-authorized post-execution reconciliation

The operator explicitly authorized removal of the stale negative requirement.
`tests/routes/calendar-authorized.test.ts:232` now asserts the accepted
`/lesson-context?` contract. This is a post-execution closure reconciliation,
not an executor-scope change. Fresh current gates passed: full `npm run test`
32 files / 143 tests, `npm run check`, `npm run build`, and
`git diff --check`.
