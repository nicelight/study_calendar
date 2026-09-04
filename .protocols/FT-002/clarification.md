---
description: Bounded feature-doctor triage for the TASK-104 planning rejection.
status: complete
last_updated: 2026-09-03
source_of_truth:
  - .protocols/FT-002/clarification.md
---
# FT-002 Feature Doctor Clarification

## Findings and semantic validation — 2026-09-03

The fresh task-plan review rejected only the `TASK-104-T3-FT-002-W20`
planning/evidence surface. The accepted feature behavior and its governing
contracts already settle the three findings; no product decision, REQ change,
AC split, or canonical SDD redesign is required.

### F-001 — canonical AC locator format

The task card used long Markdown heading slugs instead of the exact feature
acceptance locators required by the acceptance-trace gate. This is a mechanical
task-planning defect. The valid repair is to use the existing stable IDs through
the existing feature path, for example
`.memory-bank/features/FT-002-center-and-scheduling.md#FT-002-AC-003` and
`#FT-002-AC-004`; changing or renumbering the accepted ACs is not valid.

- Evidence: review report F-001 and
  `.memory-bank/scripts/mb-doctor/acceptance-trace.mjs`.
- Repair owner: `/feature-to-tasks FT-002`.
- `Design impact: none`.
- `Behavior spec impact: none`.

### F-002 — selector consistency and server-generated lesson identity

The existing Authentication Transport and Boundary Map contracts already
require the Admin adapter to resolve its own-center class projection, verify
that the submitted `scheduleId` belongs to the submitted `classId`, and
generate the `addLesson` identity server-side. The task card must make the
negative forged/mismatched-selector proof and the positive server-generated
`lessonId` proof explicit; this does not require changing the accepted feature
behavior or owner boundary.

- Evidence: review report F-002;
  `.memory-bank/contracts/authentication-transport.md#protected-admin-provisioning-path`;
  `.memory-bank/contracts/boundary-map.md#calendar-and-membership-query-boundary`.
- Contract-valid options: reconcile the task's claim-linked RED/GREEN evidence
  (accepted, minimum repair), or reopen the feature/public contract (not
  evidenced and would require `/write-prd` or `/spec-redesign`).
- Repair owner: `/feature-to-tasks FT-002` after this triage.
- `Design impact: none`.
- `Behavior spec impact: none`.

### F-003 — completed-lesson cancellation denial

The accepted Boundary Map explicitly protects completed lessons from
cancellation and requires invalid single-lesson operations to leave unrelated
state unchanged. The task card omitted a claim-linked RED/GREEN observation
that a completed cancellation is rejected and the complete Schedule/Lesson
snapshot remains equal. This is a proof-contract omission, not a product
semantic gap.

- Evidence: review report F-003;
  `.memory-bank/contracts/boundary-map.md#calendar-and-membership-query-boundary`;
  `.memory-bank/states/lifecycle-map.md#scheduling-and-lesson-context`.
- Contract-valid options: add the denial and state-equality proof (accepted,
  minimum repair), or change completed-lesson lifecycle semantics (not
  accepted and would require `/write-prd`).
- Repair owner: `/feature-to-tasks FT-002` after this triage.
- `Design impact: none`.
- `Behavior spec impact: none`.

## Routing state

- Validation status: `complete`.
- No operator-owned decision remains; FT-002-AC-003 and FT-002-AC-004 keep
  their stable identities and existing `REQ: REQ-004` linkage.
- Immediate route: `/feature-to-tasks FT-002` to normalize locators and add
  the selector-consistency, server-generated-identity, completed-cancel, and
  state-equality proof obligations to TASK-104; then run a fresh
  `/review-tasks-plan FT-002`.
