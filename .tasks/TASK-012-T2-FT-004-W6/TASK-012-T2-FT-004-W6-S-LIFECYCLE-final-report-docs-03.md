---
description: Bounded lifecycle reconciliation for the superseded historical TASK-012 T2 handoff.
status: final
---
# Lifecycle Reconciliation — TASK-012-T2-FT-004-W6

## Result

- Lifecycle decision: `in_progress -> failed`.
- Disposition: historical TASK-012 is explicitly superseded by
  `TASK-016-T3-FT-004-W6` and `TASK-017-T3-FT-004-W6`.
- This is a terminal disposition of the under-tiered historical T2 handoff,
  not a semantic failure of the current FT-004 behavior. The corrected
  Attempt 2 behavior is functionally GREEN, but its protected
  cross-center correction is T3 under the tier policy and its own report is
  `NEEDS-CLARIFICATION`; it cannot close as TASK-012.

## Current replacement basis

- TASK-016 is indexed `done` at T3 with functional `PASS` and semantic-pass
  evidence for `FT-004-AC-001`, `FT-004-AC-002`, and `FT-004-AC-005`.
- TASK-017 is indexed `done` at T3 with functional `PASS` and semantic-pass
  evidence for `FT-004-AC-003`, `FT-004-AC-004`, and the threaded-discussion
  `REQ-014` harm path.
- The fresh FT-004 feature semantic result is recorded separately as
  `semantic-pass` in the current feature evidence report; TASK-012 is not
  reused as current T3 proof.

## Preserved history

- TASK-012 identity, `T2` tier, `W6` wave, dependencies, task-owned claims,
  Attempt 1/2 evidence, retry `1/2` history, the original feature
  `semantic-fail`, and Attempt 2 `NEEDS-CLARIFICATION` remain retained.
- The old report
  `.tasks/FT-004/FT-004-S-RED-VERIFY-final-report-docs-01.md` is not edited or
  deleted.
- No code, tests, retry, architecture, dependency, or Planning Revision was
  changed by this reconciliation.

LIFECYCLE_DECISION: failed
DISPOSITION: superseded-by-TASK-016-and-TASK-017
