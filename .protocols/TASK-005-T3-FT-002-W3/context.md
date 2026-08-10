---
description: Execution context for TASK-005-T3-FT-002-W3.
status: active
---
# Context — TASK-005-T3-FT-002-W3

## Purpose

Implement the Center & Scheduling-owned membership, relationship, class-mode,
and member-scoped authorization facts for FT-002 AC-001/002.

## Execution Attempt — 1

- attempt: 1
- started: 2026-08-08T15:22:01+05:00
- disposition: supporting-only; superseded for the individual-class capacity
  claim by bounded retry 1.

## Execution Attempt — 2

- attempt: 2
- started: 2026-08-08T15:45:44+05:00
- retry: 1
- correction_basis: current Attempt 1 semantic-fail — the supported public
  `createClass` plus repeated `addStudentToClass` path permits two students in
  an `individual` class, contradicting the canonical one-student meaning.
- correction_scope: reject a second distinct student through the existing
  Center & Scheduling public command while preserving group membership,
  center scope, authorization, ownership, and registered public boundaries.

## Inputs (what drives this task)

- Task record: `.memory-bank/tasks/TASK-005-T3-FT-002-W3.task.json`
- Task index: `.memory-bank/tasks/index.json`
- Feature: `.memory-bank/features/FT-002-center-and-scheduling.md`
- Requirements: `.memory-bank/requirements.md` (`REQ-003`, `REQ-014`)
- Acceptance criteria: `FT-002-AC-001`, `FT-002-AC-002`

## Richer inputs

- Source artifacts: `.memory-bank/tasks/plans/IMPL-FT-002.md`,
  `.protocols/FT-002/plan.md`.
- Normative inputs: `.memory-bank/spec-backbone.md`, Calendar and Membership
  Query Boundary plus its module/dependency graph, Access Control Contract,
  and Core Domain ownership map.
- Constraints/invariants: Center & Scheduling owns all membership/class/link/
  assignment state; protected operations use server-resolved actor and target
  scope; every relationship remains center-bounded; mode is exactly
  `individual` or `group`.
- Verification targets: task-card AC-001 admin CRUD/negative matrix and AC-002
  individual/group relationship plus member authorization matrix.

## Loaded context set

- `AGENTS.md` and `.memory-bank/roles/implementer.md`
- `.agents/skills/exe/SKILL.md`
- `.memory-bank/workflows/tier-policy.md`
- `.memory-bank/features/FT-002-center-and-scheduling.md`
- `.memory-bank/contracts/boundary-map.md`
- `.memory-bank/contracts/access-control.md`
- `.memory-bank/domains/core-domain.md`
- dependency TASK-004 card, final handoff, functional PASS, and T3 semantic-pass

## Decisions / assumptions

- Completed dependency TASK-004 is the authoritative uncommitted baseline;
  its proof is not adopted by this task.
- Use the existing module-local class boundary and shared schema bootstrap,
  with no new abstraction or public cross-slice edge.
- The public authorization result will expose only Center & Scheduling-owned
  class/member scope facts; downstream day-view composition remains excluded.

## Commands run / environment notes

- `node scripts/mb-doctor.mjs --strict` -> exit 0; readiness PASS with only
  expected downstream-blocked warnings.
- Planning Revision 1 matches FT-002 review approval revision 1.
- Worktree has completed dependency edits in overlapping source files plus
  unrelated workflow artifacts; they are preserved and not claimed.
- No prospective probe, production write, or external side effect occurred
  before this attempt block was written.
- Attempt 2 retained the current semantic-fail as its retry RED, applied the
  correction only in the Center & Scheduling public owner plus its isolated
  test, and obtained fresh focused GREEN (2/2), check (0/0), build, full suite
  (15/15), and diff-hygiene results.

## Open questions / blockers

- None.

## Next session

- Execution Attempt 2 is complete and must not be replayed.
- Next action: fresh independent `/verify TASK-005-T3-FT-002-W3`; after a
  functional PASS, T3 routing requires `/red-verify TASK-005-T3-FT-002-W3`.
