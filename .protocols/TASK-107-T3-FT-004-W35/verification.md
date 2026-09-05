---
description: Fresh independent verification for TASK-107-T3-FT-004-W35 Attempt 2.
status: active
---
# Independent Verification — TASK-107-T3-FT-004-W35

## Scope and authority

- Role: Reviewer; one fresh `/verify` run for `TASK-107-T3-FT-004-W35`.
- Task status before and after verification: `in_progress`; no lifecycle, scheduler,
  Judge, dependency, planning, or Memory Bank sync transition was made.
- Task outcome: the existing named `editFieldComment` action enforces the current
  server-resolved Lesson Context class/lesson and selected personal student scope
  at the Collaboration write boundary.
- Owned claim: `FT-004-AC-005 / REQ-014` and the three task verification targets;
  dependency outcomes were treated as prerequisites, not claims of this task.
- Normative basis: `.memory-bank/contracts/collaboration-browser-surface.md`
  (`#authorized-mutation-transport`, `#ownership-and-route`),
  `.memory-bank/contracts/boundary-map.md` (`#day-discussion-query-boundary`,
  `#calendar-and-membership-query-boundary`),
  `.memory-bank/contracts/access-control.md` (`#authority-and-scope`,
  `#data-minimization-and-failure-behavior`),
  `.memory-bank/architecture/system-architecture.md`
  (`#composition-and-request-data-flow`),
  `.memory-bank/domains/core-domain.md#persistence-and-transaction-rules`,
  `.memory-bank/states/lifecycle-map.md#collaboration`, and the task card.

## Executor claim path

- Attempt 2 RED/GREEN was inspected as supporting execution evidence only:
  `.tasks/TASK-107-T3-FT-004-W35/attempt-2-red.md` and
  `.tasks/TASK-107-T3-FT-004-W35/attempt-2-green.md`.
- The retry RED was applicable: a forged `student-one` URL could edit a stored
  `student-two` personal comment before the correction. The retry GREEN then
  denied that edit with unchanged state while preserving same-context success.
- No executor receipt was used as independent proof. The fresh probe below was
  authored and run by this verification.

## New targeted probe

Command:

```text
./node_modules/.bin/vitest run --config .tasks/TASK-107-T3-FT-004-W35/fresh-verify-route-scope.vitest.config.ts --reporter=verbose
```

Result: exit `0`; 1 file and 2 tests passed.

Artifact: `.tasks/TASK-107-T3-FT-004-W35/fresh-verify-route-scope.probe.test.ts`.

Observed claim mapping:

- Forged cross-lesson shared edit, forged cross-class shared edit, and forged
  cross-student personal edit each returned `403 { error: 'comment_forbidden' }`.
- Each denied response exposed only the error field and did not contain the
  target comment ID or body. `body` and `last_changed_at` snapshots for all
  three targets were unchanged.
- Same-context shared and personal owner edits both returned
  `{ collaborationSuccess: true }` and changed the intended body.
- A spy on the existing Collaboration public method observed the route passing
  the server-resolved `classId`, `lessonId`, selected `studentAccountId`, actor
  session, target comment ID, and new body.
- The fixture uses `databaseFilename: ':memory:'`; each test closes its database
  in `afterEach`. The probe does not target `study-calendar.db`.

## Boundary and source review

- `src/routes/lesson-context/+page.server.ts:171-189` derives action context
  from the request URL and session cookie; `:501-524` delegates
  `editFieldComment` with current class/lesson/student context and has no direct
  database access.
- `src/lib/server/modules/collaboration/public.ts:237-281` resolves the actor,
  authorized class/lesson, personal student scope, stored target context, and
  author ownership before the existing update.
- `src/lib/server/modules/collaboration/public.ts:274-278` is the only scoped
  `UPDATE collaboration_comments` found. No alternate discussion writer or new
  mutation route was introduced in the reviewed surface.
- The focused source audit and task-linked regression suite confirm that
  Collaboration remains the sole discussion writer and Lesson Context remains
  the transport/composition adapter.

## Repeated checks

Fresh task-linked regression command:

```text
./node_modules/.bin/vitest run tests/collaboration/comments-reactions.test.ts tests/collaboration/center-lifecycle-isolation.test.ts tests/routes/task-102-lesson-context-transport.integration.test.ts --reporter=verbose
```

Result: exit `0`; 3 files and 9 tests passed.

Required native gates, independently rerun:

- `npm run check` — exit `0`; 0 Svelte errors and 0 warnings.
- `npm run build` — exit `0`; client and SSR bundles built.
- `npm run test` — exit `0`; 78 files and 268 tests passed.
- `git diff --check` — exit `0`.
- `node .memory-bank/scripts/mb-lint.mjs` — exit `0`; 77 files passed; only
  existing recommended metadata warnings were reported.
- `node .memory-bank/scripts/mb-doctor.mjs --strict` — exit `0`; 0 errors,
  0 warnings, and 2 informational messages.

## Scope, isolation, and co-review

- Verification added only the task-local fresh probe/config and this durable
  verification/report evidence; no implementation, specification, acceptance,
  dependency, or lifecycle file was changed by the verifier.
- Current task JSON still reports `status: in_progress`.
- The fresh probe used isolated in-memory SQLite and closed every fixture. The
  current disposable-state audit found no task-local temporary database files;
  the real `study-calendar.db` was not used by the focused probe.
- One best-effort co-review was launched on `gpt-5.6-luna` (`Codex Luna`) with
  reasoning effort `xhigh`, covering route scope propagation, boundary ownership,
  and forbidden expansion. It did not return candidate findings within the
  review window; no co-review finding was used in this verdict.

## Verdict

VERDICT: PASS

## Handoff

- Preserve `TASK-107-T3-FT-004-W35` as `in_progress`.
- The next required owner/action is the separate T3 `/red-verify TASK-107-T3-FT-004-W35`.
- Do not run closure, Judge, scheduler transition, or `/mb-sync` as part of this
  verification.
