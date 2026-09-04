---
description: Bounded feature-doctor clarification for the FT-005 browser-surface review findings.
status: complete
last_updated: 2026-09-04
source_of_truth:
  - .protocols/FT-005/clarification.md
---
# FT-005 Feature Doctor Clarification

## Validated findings

The fresh reviewer report is semantically valid for the new planned delta:

1. W37 names AC-001/AC-002 in `verification_targets`, but its prospective
   RED/GREEN evidence strings did not contain the exact AC IDs.
2. W37 did not make repeat-create count and identity comparison a decisive
   GREEN result.
3. W37 did not make server-side opaque ID generation and uniqueness a decisive
   GREEN result.
4. W37 did not expose isolated-state teardown and cleanup as a T3 evidence
   result.
5. W38 mentioned create in general, but its AC-001 proof did not identify
   Admin/assigned-Teacher creation as a GREEN result.
6. FT-005 was `planned` while EP-004 and the sole FT-005 mapping for REQ-009
   remained `verified`.

The first five findings are task-proof omissions. They do not change the
accepted product behavior or require new acceptance criteria. The sixth is a
metadata consistency defect: the browser outcome is part of the existing
FT-005/REQ-009 intent, so the affected feature, epic, and sole requirement
mapping must remain `planned` until browser evidence exists. Existing backend
task identities and evidence remain historical/supporting evidence only.

Evidence basis: `.tasks/TASK-MB-REVIEW-TASKS-PLAN/TASK-MB-REVIEW-TASKS-PLAN-S-TASKS-FT-005-R4-final-report-docs-01.md`,
the FT-005 browser contract, the current W37/W38 cards, and the REQ-009/EP-004
RTM mapping.

## Decision and route

The operator requested repair of genuine findings with no overengineering.
There is no unresolved product or architecture decision and no behavior-spec
change is needed.

- `Design impact: none`; Planning Revision and the accepted class-scoped
  ownership model remain unchanged.
- `Behavior spec impact: none`.
- Immediate route: the `/feature-to-tasks FT-005` repair updated the W37/W38
  proof contracts, plans, and lifecycle navigation; the fresh R5
  `/review-tasks-plan FT-005` returned `APPROVE`. Decomposition is closed for
  Planning Revision 2; next route is the applicable readiness/promotion and
  execution workflow.
