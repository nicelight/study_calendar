---
description: Execution context for TASK-080-T3-FT-007-W29.
status: active
---
# Context — TASK-080-T3-FT-007-W29

## Purpose

Execute the accepted role-oriented `/home` and `/classes` destination result
for FT-007-AC-002 using the existing server-side Actor Context and Center &
Scheduling query boundaries.

## Execution Attempt
- attempt: 1
- started: 2026-08-22 06:28 +0500
- receipt_status: supporting-only
- outcome: completed for the superseded pre-reconciliation route-only scope;
  its Student/Parent GREEN was query-qualified and is not current proof.

## Execution Attempt
- attempt: 2
- started: 2026-08-22 07:50 +0500
- outcome: current reconciled execution for the C&S-owned accessible-class
  query plus bare canonical Home/Classes result.

## Inputs (what drives this task)
- Task record: `.memory-bank/tasks/TASK-080-T3-FT-007-W29.task.json`
- Task index: `.memory-bank/tasks/index.json`
- Specs: `.memory-bank/features/FT-007-navigation-and-statistics.md#FT-007-AC-002`, `.memory-bank/contracts/boundary-map.md#calendar-and-membership-query-boundary`, `.memory-bank/contracts/access-control.md#authority-and-scope`, `.memory-bank/testing/strategy.md#disposable-browser-proof`
- Acceptance criteria source: `FT-007-AC-002`

## Richer inputs
- Source Artifacts: FT-007 clarification, FT-007 plan, IMPL-FT-007, W28 dependency evidence, current AUTONOMOUS-RUN checkpoint.
- Normative Inputs: Constitution; Global Backbone Planning Revision 2; direct task-linked contracts; execute-loop and tier-policy T3 obligations.
- Constraints / Invariants: routes are read-only adapters; server actor and the
  C&S-owned accessible-class result are decisive; no route table access,
  role/membership/assignment authority, provider formulas, profile/metric
  fields, or new slice/edge/role.
- Verification Targets: positive Admin own-center, Teacher assigned-class, Student/Parent accessible-calendar routes; anonymous/revoked/cross-center/cross-class/non-member/removed-assignment denial on both routes; disposable browser matrix and non-mutation.

## Loaded context set
- `AGENTS.md`
- `.memory-bank/constitution.md`
- `.memory-bank/spec-backbone.md`
- `.memory-bank/spec-index.md`
- `.memory-bank/contracts/boundary-map.md`
- `.memory-bank/contracts/access-control.md`
- `.memory-bank/testing/strategy.md`
- `.memory-bank/workflows/tier-policy.md`
- Fresh FT-007 task-plan review: `APPROVE`,
  `REVIEWED_PLANNING_REVISION: 2`.
- Fresh strict-doctor readiness: `PASS`, 0 errors / 0 warnings / 2 info.

## Resume reconciliation
- Attempt 1 completed a prior route-only scope and is retained as historical
  supporting-only evidence. Its implementation over-denied bare Student/Parent
  routes because it required `classId` before calling C&S.
- The current accepted outcome extends the existing C&S public boundary to a
  read-only `getAccessibleClassList({ actor })` query. Attempt 2 owns only this
  reconciled AC-002 correction and its route/provider/browser proof.
- No retry budget, task status closure, scheduler lifecycle, or historical
  evidence is rewritten by this resume.

## Commands run / environment notes
- Resume preflight completed at Attempt 2; the task was already `in_progress`.
- Existing dirty W27/W28 paths and prior TASK-080 artifacts are preserved.
- No prospective Attempt 2 probe or production implementation occurred before
  this attempt block was durably recorded.

## Open questions / blockers
- None observed. The reconciled query is explicitly assigned to the existing
  Calendar and Membership Query Boundary and needs no new graph edge, slice,
  source owner, role, membership, assignment, or authorization rule.

## Next session
- Start by reading: `context.md`, `plan.md`, `progress.md`, `handoff.md`
- Next action after Attempt 2 handoff: fresh `/verify
  TASK-080-T3-FT-007-W29`; after functional PASS, run the required per-task
  T3 `/red-verify`.
