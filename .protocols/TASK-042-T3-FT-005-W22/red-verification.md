---
description: Adversarial semantic verification for TASK-042-T3-FT-005-W22.
status: active
---
# Red Verification — TASK-042-T3-FT-005-W22

## Semantic target
- Outcome: assigned Teacher records the absent subset from an authorized lesson
  day and the server persists every other class student as present.
- Boundaries: Learning Progress owns attendance and calls the existing Financial
  Ledger reconciliation boundary; Lesson Context is a thin adapter; server
  scope is authoritative.

## Evidence and adversarial coverage
- Functional basis: fresh `/verify` PASS in `verification.md`.
- Changed surface: Learning Progress public boundary, Lesson Context server/UI,
  and focused tests; no forbidden module or real DB changes.
- Fresh adversarial probe: `tests/lesson-context/attendance-entry-verifier.test.ts`
  passed 2 tests on a distinct two-center fixture.
- Covered supported paths: individual/group full-list persistence, repeated
  state reads, missing session, unassigned Teacher, cross-center Teacher,
  forged student and lesson scope, Student route submission, route delegation,
  and unchanged attendance state after denial.
- Source inspection confirmed no route direct SQLite access, no new financial or
  scheduling writer, no client-trusted scope, and no second attendance source.

## Admitted findings
- none

## Operator questions
- none

## Verdict
SEMANTIC_VERDICT: semantic-pass

## Owner handoff
- Evidence/report paths: this file and
  `.tasks/TASK-042-T3-FT-005-W22/TASK-042-T3-FT-005-W22-S-RED-VERIFY-final-report-docs-01.md`.
- Recommended owner action: scheduler may close the T3 task after recording
  functional PASS and semantic-pass evidence.
- Resume route: `/autopilot` closure stage.
