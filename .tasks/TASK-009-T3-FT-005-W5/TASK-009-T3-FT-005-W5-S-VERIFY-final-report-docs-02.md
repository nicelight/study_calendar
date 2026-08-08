---
description: Current Attempt 2 functional verification report for TASK-009-T3-FT-005-W5.
status: final
---
# Functional Verification Report — TASK-009-T3-FT-005-W5 — Attempt 2

- findings: none; current Attempt 2 correction and both task-owned acceptance
  outcomes passed fresh functional verification.
- evidence_checked: current source and final handoff; retry report-02 and
  claim-linked RED/GREEN; verifier-owned probe `2/2`; independent disposable
  AC probe; same-center unassigned-teacher denial probe; correction-specific
  probe `1/1`; `npm run check`; `npm run build`; full `npm run test` (`8`
  files / `30` tests); and `git diff --check`.
- claim_result: AC-001 persisted student completion and exposed it in the
  permitted class projection without a grade field. AC-002 stored exactly
  `α`, `β`, `γ`, `F`; rejected `A` without changing the existing grade; allowed
  the selected student, linked parent, assigned teacher, and own-center Admin;
  denied another student, unrelated parent, same-center unassigned teacher,
  and cross-center teacher/Admin access; and denied both teacher/Admin grade
  writes and reads when the target student belonged only to another class.
- correction_result: the current source's `scope.studentAccountIds` check was
  independently observed to block the out-of-class target on both public grade
  paths, with no row created by denied writes.
- findings_detail: preserved Attempt 1 functional and semantic results were
  excluded from the current verdict. Current Attempt 2 source and fresh probes
  supplied the functional evidence.
- risks_or_questions: no functional blocker or unresolved task-scoped
  question. T3 semantic verification and lifecycle ownership remain required
  by policy.
- durable_evidence: `.protocols/TASK-009-T3-FT-005-W5/verification.md`,
  `.tasks/TASK-009-T3-FT-005-W5/verifier-owned-probe.test.ts`,
  `.tasks/TASK-009-T3-FT-005-W5/execution-evidence.md`, and the current
  correction test under `tests/learning-progress/`.

VERDICT: PASS

Task lifecycle was not changed by the Reviewer.
