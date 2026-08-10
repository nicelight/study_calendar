---
description: Independent adversarial semantic verification report for TASK-009-T3-FT-005-W5 Attempt 1.
status: final
---
# Red Verification — TASK-009-T3-FT-005-W5

## Accepted outcome and evidence

- T3 task card and direct normative inputs were inspected: FT-005 AC-001/AC-002,
  Personal Progress Query Boundary, Access Control Contract, Core Domain
  ownership map, and Learning and Finance lifecycle.
- Current functional verification is `VERDICT: PASS`; its evidence and current
  Attempt 1 source were independently inspected.
- A fresh disposable runtime probe confirmed class-scoped completion, accepted
  `α`/`β`/`γ`/`F`, no invalid-grade mutation, and positive/negative privacy
  cases for student, linked parent, assigned teacher, own-center Admin, other
  student/parent, unassigned teacher, and cross-center Admin.

## Findings

- **HIGH — cross-class grade target bypass.** The public `recordGrade` and
  `getGrade` paths validate the homework's class but permit any target student
  for teacher/Admin scopes because `requireClassStudent` returns true for those
  roles. The fresh probe used an assigned teacher in class A to record and then
  read a grade for a student enrolled only in another same-center class; a
  `GradeView` was returned. This is a reachable material break of server-side
  class/student authorization and private-grade isolation. Relevant source:
  `src/lib/server/modules/learning-progress/public.ts:183-226,280-285` and
  `src/lib/server/platform/database.ts:128-135`.

## Reviewer report

- verdict: `REQUEST_CHANGES`.
- findings: one HIGH semantic finding; repair must enforce that the target
  student belongs to the requested class before grade write/read.
- evidence_checked: indexed T3 task, direct canonical contracts, functional
  PASS, Attempt 1 source/diff surface, task tests, verifier-owned probe, and a
  fresh disposable public-boundary runtime probe.
- risks_or_questions: no operator decision is needed; the accepted contract is
  unambiguous. T3 semantic closure is not eligible while this finding stands.

## Handoff

- Recommended owner action: lifecycle owner routes the finding to repair or
  follow-up, then reruns `/verify` and `/red-verify`.
- This review did not run `/execute`, `/verify`, `/mb-sync`, lifecycle closure,
  promotion, or any other workflow skill, and changed no scheduler/task status.

SEMANTIC_VERDICT: semantic-fail
