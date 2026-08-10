---
description: Claim-linked execution evidence for TASK-005-T3-FT-002-W3 attempts 1 and 2.
status: final
---
# Execution Evidence — TASK-005-T3-FT-002-W3

## Attempt 1 — pre-implementation RED

- Attempt and lifecycle were durable before probe creation/execution.
- Environment: Vitest with a fresh in-memory SQLite composition root per test,
  closed in `afterEach`; no network, credentials, persistent/production data,
  or external side effect.

### FT-002-AC-001 — RED

- Command: `npm run test -- tests/center-scheduling/membership-class-mode.test.ts -t "FT-002-AC-001 lets only an own-center Admin"`
- Result: exit 1; 1 failed, 1 skipped.
- Decisive observation: the accepted Center & Scheduling participant-management
  command is absent (`typeof createParticipant` was `undefined`, expected
  `function` at line 49), so the Admin CRUD/center-bounded relationship outcome
  cannot be performed before implementation.

### FT-002-AC-002 — RED

- Command: `npm run test -- tests/center-scheduling/membership-class-mode.test.ts -t "FT-002-AC-002 returns only permitted member-scoped authorization"`
- Result: exit 1; 1 failed, 1 skipped.
- Decisive observation: the required public member-scoped class authorization
  decision is absent (`typeof getAuthorizedClassScope` was `undefined`,
  expected `function` at line 241), so neither individual nor group member
  authorization can be returned before implementation.

These are claim-specific missing-behavior failures, not setup, syntax,
unrelated, or artificially introduced failures. They are executor supporting
evidence and are not workflow verdicts.

## Attempt 1 — implementation and GREEN

### Task-owned implementation delta

- `src/lib/server/modules/center-scheduling/public.ts`: added protected
  participant, class, teacher/student membership, and parent-link commands;
  added the public member-scoped class authorization decision; removed the
  unauthenticated Foundation-only center/membership scaffold writes.
- `src/lib/server/platform/database.ts`: added exact `individual|group` class
  mode and composite center-bounded foreign-key constraints for classes,
  teacher assignments, class students, and parent/student links. The existing
  provider-confirmation table is dependency-owned baseline, not this task's
  outcome.
- `tests/center-scheduling/membership-class-mode.test.ts`: retained the stalled
  child's isolated AC-001/002 probe and strengthened the final AC-001 negative
  matrix for participant provisioning.
- `tests/foundation/index.test.ts`: prepares its isolated membership fixture
  directly in test SQL after removal of the unprotected production scaffold
  helper.

Participant creation performs Identity & Access account/invitation provisioning
and the Center & Scheduling membership insert in one shared transaction. Every
public command resolves the actor and owner-side target scope before a write;
role-bearing accounts remain Identity & Access-owned when a center participant
is removed.

### FT-002-AC-001 — claim-equivalent GREEN

- Command: `npm run test -- tests/center-scheduling/membership-class-mode.test.ts`
- Result: exit 0; 1 file, 2 tests passed.
- Decisive comparison: own-center Admin participant/class/link CRUD persists
  only same-center rows and exact `individual|group` modes. Own-center
  non-Admin, cross-center Admin, cross-center target assignment, and invalid
  mode attempts throw before mutation; the aggregate persisted-state snapshot
  is unchanged. Removal deletes owner-side membership/links while retaining the
  Identity & Access account.

### FT-002-AC-002 — claim-equivalent GREEN

- Command: same focused command above.
- Result: exit 0; the AC-002 role/mode scenario passes.
- Decisive comparison: Admin and assigned Teacher receive all class student
  IDs; a member Student receives self scope; a linked Parent receives only the
  linked student's scope. Individual and group fixtures are represented.
  Non-member Student, unassigned Teacher, cross-center Admin, unrelated actor,
  and missing session receive `null`.

### Probe change

- The original RED probe shape and locators were preserved. Before final GREEN,
  AC-001 gained two same-claim negative calls against `createParticipant`:
  own-center non-Admin and cross-center Admin. This closes the security claim
  on the newly added participant command without introducing a new accepted
  behavior.

### Required execution gates

- `npm run check`: exit 0; 0 errors and 0 warnings.
- `npm run build`: exit 0; production bundle built. Adapter-auto emitted the
  existing informational warning that no production adapter is configured.
- `npm run test`: exit 0; 4 files, 15 tests passed.
- `git diff --check`: exit 0.

No result is proposed as a reuse candidate: the final commands were not paired
with the immediately preceding bounded-input snapshot required by the execution
contract. These observations are executor supporting evidence, not independent
functional or semantic workflow verdicts.

## Scope and boundary evidence

- Actual task-owned production files are
  `src/lib/server/modules/center-scheduling/public.ts` and the Center &
  Scheduling schema delta in `src/lib/server/platform/database.ts`; focused and
  compatibility probes are the two test files listed above.
- Center & Scheduling remains the exclusive write owner for center membership,
  class, parent-link, teacher-assignment, and student-membership facts. Identity
  & Access is called only through the accepted account provisioning edge and
  retains account, invitation, role, provider, and session ownership.
- Consumers receive only the public scoped authorization result; no consumer
  table read/write, route-derived authorization, downstream view composition,
  new dependency edge, or public cross-slice contract was introduced.
- `runtime_context.write_boundary` is absent. Neither forbidden Foundation task
  card was touched, no `forbidden_scope` path was touched, and no stop condition
  fired.
- Attempt 1 used a fresh in-memory SQLite composition root per test and closed
  it in `afterEach`; no production database, network, credentials, privileged
  action, or external side effect was used.
- Task tier remains T3 and lifecycle remains `in_progress`; implementation
  produced no closure, promotion, functional verdict, or semantic verdict.

## Attempt 2 — bounded retry 1 correction

### Retained RED and correction basis

- Attempt 2 was durable in `context.md` before its first probe or production
  change. Retry number is 1 of the allowed 2.
- RED source: the preserved Attempt 1 T3 semantic failure at
  `.protocols/TASK-005-T3-FT-002-W3/red-verification.md` and
  `.tasks/TASK-005-T3-FT-002-W3/TASK-005-T3-FT-002-W3-S-RED-VERIFY-final-report-docs-01.md`.
- Decisive RED observation: an authorized own-center Admin could call the
  supported `createClass` plus repeated `addStudentToClass` path, persist two
  distinct students in an `individual` class, and receive both IDs from
  `getAuthorizedClassScope`. This contradicts the canonical one-student
  meaning and is the retry RED; the failed path was not replayed before the
  bounded correction.
- Claim mapping/applicability: `FT-002-AC-002`, applicable. Attempt 1 execution
  evidence remains supporting-only for this corrected class-mode claim.

### Task-local implementation correction

- `src/lib/server/modules/center-scheduling/public.ts` retains the existing
  server-side actor, own-center Admin, target membership, and class resolution,
  then rejects another student when the resolved class is `individual`.
- The same owner boundary rejects changing a `group` that already has more
  than one student into `individual`; the write is not attempted, so the class
  remains `group`.
- `tests/center-scheduling/membership-class-mode.test.ts` extends the existing
  AC-002 disposable probe with the exact second-student negative, the invalid
  multi-student mode conversion, and persisted public-scope assertions. The
  group fixture still accepts and returns both students.
- No schema, public type, dependency edge, composition wiring, Identity &
  Access behavior, or consumer contract changed in Attempt 2.

### Fresh claim-equivalent GREEN

- Command: `npm run test -- tests/center-scheduling/membership-class-mode.test.ts`
- Result: exit 0; 1 file and 2 tests passed.
- Decisive comparison: the `individual` fixture returns exactly
  `['student-one']`; adding `student-two` throws
  `individual-class-capacity-exceeded`; converting the two-student group to
  `individual` throws the same error and its public scope remains mode `group`;
  the group returns `['student-one', 'student-two']`.
- Probe change/rationale: the existing AC-002 probe was strengthened only with
  the exact semantic-fail path and its same-invariant mode-conversion entry
  point. Isolation remains a fresh in-memory SQLite composition root closed in
  `afterEach`, with no network, credentials, persistent data, or external side
  effect.

### Attempt 2 required gates and boundary evidence

- `npm run check`: exit 0; `svelte-check found 0 errors and 0 warnings`.
- `npm run build`: exit 0; production bundle built. Adapter-auto emitted its
  existing informational no-production-adapter message.
- `npm run test`: exit 0; 4 files and 15 tests passed.
- `git diff --check`: exit 0.
- Read-only owner scan: all scheduling relation writes remain in
  `src/lib/server/modules/center-scheduling/public.ts`; platform schema
  declarations remain in `src/lib/server/platform/database.ts`; no consumer
  direct write appeared.
- Actual Attempt 2 files:
  `src/lib/server/modules/center-scheduling/public.ts`,
  `tests/center-scheduling/membership-class-mode.test.ts`, and task-owned
  protocol/evidence/report files.
- Hard `write_boundary` remains absent. Neither forbidden Foundation task card
  was touched, center scope and authorization are unchanged, and no stop
  condition fired.
- No reusable receipt is offered because the worktree has broad pre-existing
  tracked and untracked inputs. Lifecycle remains `in_progress`; no `/verify`,
  `/red-verify`, closure, promotion, or `/mb-sync` was run.
