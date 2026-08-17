# Verifier-owned evidence — TASK-039-T3-FT-003-W10

## Run context

- Reviewer command: `/verify TASK-039-T3-FT-003-W10`.
- CWD: `/home/serg/Projects/study_calendar`.
- Date: `2026-08-15` (`Asia/Dushanbe`).
- Runtime: Node `v22.22.1`, Vitest `4.1.10`, Vite `8.2.1`.
- Lifecycle was observed as `in_progress`; no task card, index, dependency,
  plan, status, or lifecycle file was changed.

## Executor claim path

- Attempt 1 claim mapping is `FT-003-AC-008 / REQ-005 / REQ-006 / REQ-014`.
- Historical supporting RED: `.tasks/TASK-039-T3-FT-003-W10/attempt-1-red.md`.
  It records the pre-change rendered DB-shaped lesson lacking the accepted
  `/lesson-context` link.
- Historical supporting GREEN:
  `.tasks/TASK-039-T3-FT-003-W10/attempt-1-green.md` and
  `.tasks/TASK-039-T3-FT-003-W10/execution-evidence.md`.
- The executor claim path was inspected but not treated as independent proof.
  No execute receipt was reused.

## Reused execute evidence

- None. The handoff offers no eligible reuse candidate, and T3 requires fresh
  verifier-owned outcome evidence.

## New targeted probe

- Artifact: `.tasks/TASK-039-T3-FT-003-W10/verify-probe.test.ts`.
- Disposable config: `.tasks/TASK-039-T3-FT-003-W10/verify-probe.vitest.config.ts`.
- Command:
  `npm exec vitest -- --config .tasks/TASK-039-T3-FT-003-W10/verify-probe.vitest.config.ts --reporter=verbose`.
- Result: exit `0`; 1 file / 1 test passed.
- Flow: real `calendarLoad` over a fresh `:memory:` composition root, Svelte
  SSR of the current calendar component, extraction of the rendered lesson
  href, and the existing `lessonContextLoad`.
- Claim mapping and observations:
  - one DB-backed rendered lesson produced exactly one
    `/lesson-context` link;
  - the decoded URL contained exactly ordered keys/values
    `date=2026-08-10`, `classId=class-own`, `lessonId=lesson-own` and no
    `studentAccountId`;
  - the existing Lesson Context returned `mode: shared`, the same lesson/date/
    class identity, seeded shared material, `studentAccountId: null`, and
    `personal: null`;
  - a guessed `studentAccountId=student-guess` through the existing route was
    denied with status `403`;
  - complete SQLite snapshots were equal before/after both reads.
- Isolation: each probe run creates and closes a fresh in-memory database; no
  network, credentials, production database, or persistent external state was
  used.

## Repeated checks

- `npm run test -- tests/routes/calendar-navigation.test.ts` — exit `0`; 1
  file / 1 test passed. This is supporting focused regression evidence only;
  the new verifier probe above is the independent outcome proof.
- `npm run check` — exit `0`; `svelte-check found 0 errors and 0 warnings`.
- `npm run build` — exit `0`; SvelteKit client and SSR production bundles
  completed.
- `git diff --check` — exit `0`; no output.
- `git diff --no-index --check /dev/null src/routes/calendar/+page.svelte`
  and the analogous command for
  `tests/routes/calendar-navigation.test.ts` — exit `1` with no output, the
  normal no-index difference status and no whitespace diagnostics.
- `npm run test` — exit `1`; 31 files passed and 142/143 tests passed. The
  sole failure is `tests/routes/calendar-authorized.test.ts:232`, whose
  assertion requires the calendar component not to contain `lesson-context`.

## Architecture and hard-boundary inspection

- The accepted graph row is `Lesson Context -> Center & Scheduling` through
  the exact `Calendar and Membership Query Boundary`; the existing route also
  remains the `Lesson Context` composition/authorization owner. No new
  production inter-module edge was introduced by the component link.
- The current calendar component only consumes server-rendered lesson identity
  and constructs the link with `lessonDate`, `classId`, and `lessonId`. It has
  no server capability import, database access, role/student authorization,
  or persistence write.
- Tracked forbidden Lesson Context and Center & Scheduling public files match
  their `HEAD` object hashes exactly. The current component does not move
  authorization/composition or introduce a second source of truth.
- Current tracked worktree drift includes unrelated pre-existing changes to
  `src/routes/+page.svelte`; it is outside this task's target and was not
  attributed to the task. The task-specific target source/test paths are the
  two card paths. The legacy `src/routes/calendar/+page.server.ts` and
  `tests/routes/calendar-authorized.test.ts` are untracked pre-existing
  calendar-route artifacts with mtimes before the Attempt 1 start recorded in
  `.protocols/TASK-039-T3-FT-003-W10/context.md`; neither was edited by this
  verification.
- The failing legacy assertion is directly incompatible with the accepted
  `FT-003-AC-008` requirement that the calendar expose a `/lesson-context`
  link. It is outside this task's non-empty write boundary, so this verifier
  did not edit or bypass it.

## Normative paths used

- `.memory-bank/tasks/TASK-039-T3-FT-003-W10.task.json`
- `.memory-bank/features/FT-003-calendar-and-lesson-context.md#ft-003-ac-008`
- `.memory-bank/contracts/boundary-map.md#calendar-and-membership-query-boundary`
- `.memory-bank/contracts/access-control.md#authority-and-scope`
- `.memory-bank/contracts/authentication-transport.md#browserapi-path`
- `.memory-bank/architecture/system-architecture.md#composition-and-request-data-flow`
- `.memory-bank/domains/core-domain.md#read-and-write-data-flow`
- `.memory-bank/states/lifecycle-map.md#scheduling-and-lesson-context`
- `.memory-bank/testing/strategy.md#evidence-and-ownership`
- `.memory-bank/workflows/tier-policy.md#hard-write-boundary`
- `.memory-bank/workflows/tier-policy.md#claim-linked-red--green-for-t2t3`
- `.memory-bank/workflows/tier-policy.md#tier-obligations`
