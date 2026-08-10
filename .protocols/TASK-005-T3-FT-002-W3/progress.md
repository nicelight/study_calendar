---
description: Execution progress for TASK-005-T3-FT-002-W3.
status: active
---
# Progress — TASK-005-T3-FT-002-W3

## Current status

- state: handoff_ready
- last update: 2026-08-08

## What was done

- Completed point-of-use preflight, dependency reconciliation, direct-spec
  review, graph/consumer scan, local-pattern inspection, and strict doctor gate.
- Initialized Attempt 1 before any prospective task probe or production write.
- Added the isolated AC-001/002 probe and obtained honest claim-specific RED
  for the absent participant-management command and absent member-scoped class
  authorization query.
- Added Center & Scheduling-owned schema constraints and protected commands for
  participants, exact class modes, teacher/student membership, parent links,
  and class CRUD.
- Added the public member-scoped class authorization decision for own-center
  Admin, assigned Teacher, member Student, and linked Parent; cross-center,
  unauthenticated, non-member, and unassigned actors receive no scope.
- Removed the obsolete unauthenticated `grantMembership` scaffold seam and
  moved its Foundation fixture setup into test-only SQL.
- Obtained claim-equivalent GREEN and completed every task-required execution
  gate. Lifecycle remains `in_progress` for independent verification.

## Commands run (with results)

- `node scripts/mb-doctor.mjs --strict` -> exit 0; PASS (0 errors, expected
  downstream blocked warnings only).
- AC-001 focused RED -> exit 1; missing `createParticipant` operation.
- AC-002 focused RED -> exit 1; missing `getAuthorizedClassScope` decision.
- `npm run test -- tests/center-scheduling/membership-class-mode.test.ts` ->
  exit 0; 1 file, 2 tests passed after the final negative-matrix probe change.
- `npm run check` -> exit 0; 0 errors and 0 warnings.
- `npm run build` -> exit 0; production bundle built; adapter-auto emitted its
  existing informational no-production-adapter warning.
- `npm run test` -> exit 0; 4 files, 15 tests passed.
- `git diff --check` -> exit 0.

## Claim-linked RED / GREEN (T2/T3)

- attempt: 1
- applicability: applicable
- accepted claim locator(s): `FT-002-AC-001`, `FT-002-AC-002`
- accepted not-applicable reason and alternative proof: none
- RED command/probe: the two focused `npm run test --
  tests/center-scheduling/membership-class-mode.test.ts -t ...` commands stored
  in `execution-evidence.md`.
- RED observation and evidence: AC-001 lacks the accepted Admin participant
  command; AC-002 lacks the public member-scoped class authorization decision;
  both are durable in `execution-evidence.md`.
- GREEN command/probe: `npm run test --
  tests/center-scheduling/membership-class-mode.test.ts`
- GREEN observation and evidence: exit 0; 2/2 tests passed. AC-001 proves
  own-center Admin participant/class/link CRUD, exact modes, unchanged state
  after non-Admin/cross-center/invalid-mode attempts, and owner-preserving
  participant removal. AC-002 proves permitted scope for Admin, assigned
  Teacher, class Student, and linked Parent across individual/group fixtures,
  plus non-member, unassigned, cross-center, and unauthenticated denial.
- claim-equivalent probe changes and rationale: the stalled child's original
  probe was retained; its AC-001 negative matrix was strengthened before final
  GREEN to exercise the new participant command with an own-center non-Admin
  and a cross-center Admin. This is stricter evidence for the same accepted
  claim and adds no behavior branch.
- T3 isolation/cleanup/permission evidence: fresh in-memory SQLite root per
  test, closed in `afterEach`; no external/production state, credentials, or
  network access.

### Attempt 2 — bounded retry 1

- attempt: 2
- retry: 1 of 2
- applicability: applicable
- accepted claim locator(s): `FT-002-AC-002`
- retry correction basis:
  `.protocols/TASK-005-T3-FT-002-W3/red-verification.md` and
  `.tasks/TASK-005-T3-FT-002-W3/TASK-005-T3-FT-002-W3-S-RED-VERIFY-final-report-docs-01.md`
- RED source/result: retained Attempt 1 semantic-fail; the supported public
  path persisted and returned two distinct students for mode `individual`.
  Attempt 1 is supporting-only for this corrected claim and was not replayed.
- implementation correction: owner-side `addStudentToClass` rejects another
  student for a resolved `individual` class; owner-side `updateClass` rejects
  converting a class with more than one student to `individual`. Group mode,
  server-resolved authorization, center scope, and the existing public
  boundary are unchanged.
- GREEN command/probe:
  `npm run test -- tests/center-scheduling/membership-class-mode.test.ts`
- GREEN result: exit 0; 1 file, 2 tests passed. The individual scope contains
  only `student-one`; the second add and invalid multi-student conversion are
  rejected; the group remains mode `group` and returns both students.
- probe changes and rationale: extended only the existing AC-002 isolated test
  with the semantic-fail path and its same-invariant update entry point.
- T3 isolation/cleanup/permission evidence: fresh in-memory SQLite root per
  test, closed in `afterEach`; no network, credentials, persistent/production
  data, or external side effect.

## Attempt 2 gates and scope evidence

- `npm run check` -> exit 0; 0 errors and 0 warnings.
- `npm run build` -> exit 0; production build completed; adapter-auto note was
  informational.
- `npm run test` -> exit 0; 4 files, 15 tests passed.
- `git diff --check` -> exit 0.
- Owner scan found scheduling relation writes only in the Center & Scheduling
  public owner; no consumer bypass appeared.
- Actual retry production file:
  `src/lib/server/modules/center-scheduling/public.ts`.
- Actual retry probe file:
  `tests/center-scheduling/membership-class-mode.test.ts`.
- Hard `write_boundary` is absent; neither forbidden Foundation task card was
  touched; no stop condition fired. No Identity & Access, schema, composition,
  or downstream consumer behavior changed in Attempt 2.

## Reuse Candidates (optional)

- None. No result is offered for reuse because a compliant bounded-input
  snapshot was not captured immediately before the final command sequence.

## Evidence links

- `.tasks/TASK-005-T3-FT-002-W3/execution-evidence.md`
- `.tasks/TASK-005-T3-FT-002-W3/TASK-005-T3-FT-002-W3-S-EXE-final-report-code-01.md`
- `.tasks/TASK-005-T3-FT-002-W3/TASK-005-T3-FT-002-W3-S-EXE-RETRY-final-report-code-02.md`

## Open issues / risks

- No unresolved implementation blocker. Overlapping Identity & Access and
  shared-schema changes remain the completed dependency/baseline work and are
  not part of the Attempt 2 correction.

## Next step (single concrete action)

- Fresh independent `/verify TASK-005-T3-FT-002-W3`.
