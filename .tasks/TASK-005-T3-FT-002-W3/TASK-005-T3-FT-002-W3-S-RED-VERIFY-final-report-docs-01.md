---
description: Durable adversarial semantic verification report for TASK-005-T3-FT-002-W3.
status: final
---
# Red Verify — TASK-005-T3-FT-002-W3

## Result

The task's functional `VERDICT: PASS` was used only as an input locator. Fresh
inspection covered the indexed task intent and ACs, canonical class-mode
terminology, direct task-linked SDD contracts, actual source/schema change
surface, tests, and execution/runtime artifacts.

One material semantic break is reproduced through supported public commands in
a disposable in-memory composition root: an authorized own-center Admin can
create an `individual` class, add two different Students, persist both
relationships, and receive both account IDs from `getAuthorizedClassScope`.
The canonical glossary defines individual learning as a class mode with one
student, and `FT-002-AC-002` requires relationships to support the selected
mode. The implementation therefore preserves the label but not its accepted
meaning.

## Evidence

- Semantic protocol:
  `.protocols/TASK-005-T3-FT-002-W3/red-verification.md`.
- Normative basis: `.memory-bank/glossary.md`, `FT-002-AC-001/002`, Calendar
  and Membership Query Boundary, Access Control Contract, and Core Domain
  ownership map.
- Reachable path: `CenterSchedulingBoundary.createClass` followed twice by
  `addStudentToClass`; persisted result and `getAuthorizedClassScope` both
  contained `s1` and `s2` while mode remained `individual`.
- Current functional input:
  `.tasks/TASK-005-T3-FT-002-W3/TASK-005-T3-FT-002-W3-S-VERIFY-final-report-docs-01.md`.

## Owner action

The active lifecycle owner should not close the task. Route the admitted
task-owned defect for repair, then rerun `/verify TASK-005-T3-FT-002-W3` and
`/red-verify TASK-005-T3-FT-002-W3`. This semantic gate changed no task status,
scheduler state, dependency, promotion, or lifecycle record.

SEMANTIC_VERDICT: semantic-fail
