---
description: Execution context for TASK-095-T3-FT-007-W28.
status: active
---
# Context — TASK-095-T3-FT-007-W28

## Purpose

Expose the Center & Scheduling-owned scoped registry facts needed by the later
Lesson Context statistics composition, without crossing into profile, metric,
or neighbor ownership.

## Execution Attempt 1

- attempt: 1
- started: 2026-08-22 05:05:20 +0500
- result: executor GREEN; independent verification FAIL on the provider
  boundary contract. Preserved as supporting evidence for the retry.

## Execution Attempt 2

- attempt: 2
- started: 2026-08-22 05:35:25 +0500
- retry correction basis: accept a server-resolved `ActorContext` at the
  registry provider boundary; remove the registry query's Identity & Access
  call, direct `accounts` read/join, and returned Identity & Access-owned role
  or profile facts.
- prior attempt evidence: retained unchanged as supporting-only evidence;
  this attempt must produce fresh claim-equivalent GREEN for the corrected
  boundary.

## Inputs (what drives this task)

- Task record: `.memory-bank/tasks/TASK-095-T3-FT-007-W28.task.json`
- Task index: `.memory-bank/tasks/index.json`
- Specs: `.memory-bank/contracts/statistics-projection.md#center-and-scheduling-registry-facts-query`; `.memory-bank/contracts/boundary-map.md#calendar-and-membership-query-boundary`; `.memory-bank/contracts/access-control.md#authority-and-scope`; `.memory-bank/domains/core-domain.md#ownership-map`
- Acceptance criteria source: `.memory-bank/features/FT-007-navigation-and-statistics.md#FT-007-AC-009`

## Richer inputs

- Source Artifacts: FT-007-AC-009, REQ-014, REQ-017, IMPL-FT-007, FT-007 plan.
- Normative Inputs: Constitution; Global Backbone Planning Revision 2;
  tier-policy hard boundary, task-scoped evidence, claim-linked RED/GREEN,
  and tier obligations.
- Constraints / Invariants: Admin own-center scope; Teacher current assigned
  classes; Student/Parent center-wide denial; read-only source facts; the
  registry provider accepts server-resolved actor context and does not call
  Identity & Access, read/join `accounts`, or return profile/role facts;
  isolated disposable tests only.
- Verification Targets: exact C&S-owned fields, role/scope matrix,
  removed-assignment denial, no-neighbor-call, and state-before/state-after
  equality.

## Loaded context set

- `AGENTS.md`
- `.agents/skills/exe/SKILL.md`
- `.memory-bank/roles/implementer.md`
- `.memory-bank/constitution.md`
- `.memory-bank/spec-backbone.md`
- `.memory-bank/spec-index.md`
- `.memory-bank/tasks/index.json`
- `.memory-bank/tasks/TASK-095-T3-FT-007-W28.task.json`
- `.memory-bank/features/FT-007-navigation-and-statistics.md`
- `.memory-bank/contracts/statistics-projection.md`
- `.memory-bank/contracts/boundary-map.md`
- `.memory-bank/contracts/access-control.md`
- `.memory-bank/domains/core-domain.md`
- `.memory-bank/workflows/tier-policy.md`
- `.memory-bank/workflows/execute-loop.md`
- `.memory-bank/tasks/plans/IMPL-FT-007.md`
- `.protocols/FT-007/plan.md`
- `.protocols/FT-007/clarification.md`
- `.tasks/TASK-MB-REVIEW-TASKS-PLAN/TASK-MB-REVIEW-TASKS-PLAN-S-TASKS-FT-007-final-report-docs-01.md`
- `.protocols/AUTONOMOUS-RUN/status.md`
- Existing TASK-006 supporting evidence and current C&S source/tests.

## Decisions / assumptions

- Decision: use one `getRegistryFacts({ actor })` public query with a
  server-resolved actor context; caller-supplied center/class scope is not
  accepted.
- Decision: return normalized institution, account IDs, membership,
  parent-link, assignment, class, and count facts only.
- Assumption (needs verification): the existing single-center Admin convention
  (`getAdminEntry`) is the applicable own-center selector for this MVP.

## Commands run / environment notes

- Read-only preflight inspection → OK; no prospective probe or production
  behavior write occurred before Attempt 1 initialization.
- Claim-linked RED → exit 1 on absent `getRegistryFacts`; artifact:
  `.tasks/TASK-095-T3-FT-007-W28/attempt-1-red.md`.
- Claim-equivalent GREEN and all required project-native gates → pass; full
  details: `.tasks/TASK-095-T3-FT-007-W28/execution-evidence.md`.
- `study-calendar.db` exists and remains forbidden/untouched.
- Existing W27/W28 dirty changes were observed and are preserved.
- Attempt 2 focused GREEN and all required native gates passed after the
  boundary correction. Evidence: `.tasks/TASK-095-T3-FT-007-W28/attempt-2-green.md`
  and the appended Attempt 2 section in `execution-evidence.md`.

## Open questions / blockers

- None; implementation stayed within the accepted task/spec boundary and all
  executor gates passed.

## Next session

- Start by reading: `context.md`, `plan.md`, `progress.md`.
- Next action (one concrete step): fresh `/verify
  TASK-095-T3-FT-007-W28` against the corrected provider boundary.
