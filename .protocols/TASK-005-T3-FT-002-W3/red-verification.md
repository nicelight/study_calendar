---
description: Current Attempt 2 adversarial semantic verification for TASK-005-T3-FT-002-W3.
status: final
---
# Red Verification — TASK-005-T3-FT-002-W3 — Attempt 2

## Semantic target

- Task-owned outcome: `FT-002-AC-001` and `FT-002-AC-002` must provide
  center-bounded participant/class relationships, explicit `individual|group`
  modes, and member-scoped authorization facts.
- Canonical meaning and boundaries: individual learning has one student;
  Center & Scheduling owns membership/class/link/assignment state; protected
  commands resolve actor and resource scope server-side.

## Evidence and adversarial coverage

- Current functional input is PASS in
  `.protocols/TASK-005-T3-FT-002-W3/verification.md` and current report-02; it
  was used as an input locator, not semantic proof. Attempt 1 report-01 remains
  stale correction-basis evidence only.
- Independently inspected the indexed T3 task, exact AC/REQ subset, glossary,
  direct task-linked Boundary Map, Access Control and Core Domain contracts,
  actual source/schema/composition wiring, Attempt 2 evidence, and focused
  integration probe.
- The individual one-student adversarial path was checked against the current
  implementation. A second distinct `addStudentToClass` is rejected before
  insertion, and `updateClass` rejects a two-student `group -> individual`
  conversion before mutation. Current public scope retains one student for the
  individual class and both students plus `group` mode for the group class.
- The same current-source review covered supported membership mutations,
  center/role denial, member-scoped Admin/Teacher/Student/Parent results,
  removal effects, write ownership, and the accepted provisioning wiring.
- Fresh command: `npm run test -- tests/center-scheduling/membership-class-mode.test.ts`
  exited 0 with one file and two tests passed.

## Admitted findings

None. No material accepted-outcome break or operator-owned decision remained
after current-source adversarial coverage.

## Verdict

SEMANTIC_VERDICT: semantic-pass

## Owner handoff

- Current evidence/report paths:
  `.protocols/TASK-005-T3-FT-002-W3/red-verification.md` and
  `.tasks/TASK-005-T3-FT-002-W3/TASK-005-T3-FT-002-W3-S-RED-VERIFY-final-report-docs-02.md`.
- Recommended owner action: the active scheduler/lifecycle owner may record
  this current Attempt 2 semantic gate in the indexed task and evaluate T3
  closure/dependent promotion under tier policy. This verifier changed no task,
  lifecycle, dependency, promotion, or scheduler state.
