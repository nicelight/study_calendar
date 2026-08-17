---
description: Implementation plan for FT-003 calendar and lesson context.
status: active
---
# IMPL-FT-003 — Elastic Calendar and Lesson Context

## Goal

Implement the weekly calendar and the authorized shared/personal day projections.

## Scope / non-goals

Include geometry, exact date navigation, shared lesson material, personal data composition, context preservation, and server-side privacy. Exclude provider-owned writes and financial mutation from projection reads.

## Strategy and ownership

Lesson Context owns composition at `src/lib/server/modules/lesson-context/`; it consumes named read boundaries and never reconstructs authorization from UI routes. The accepted Revision 2 Personal Progress Query is provider-owned by Learning Progress: Lesson Context passes `lessonId` and server-resolved actor/context and never resolves `homeworkId`.

## Ordered tasks

| Wave | Task | Outcome | Dependency |
|---|---|---|---|
| W7 | TASK-013-T2-FT-003-W7 | calendar geometry and navigation | TASK-006-T2-FT-002-W4 |
| W8 | TASK-014-T3-FT-003-W8 | authorized day-context composition using the provider-owned lesson-scoped grade query | TASK-008, TASK-009, TASK-010, TASK-016, TASK-017, TASK-013, TASK-018 |
| W9 | TASK-037-T3-FT-003-W9 | DB-backed authorized `/calendar` route and denial matrix (AC-007) | TASK-013-T2-FT-003-W7 |
| W10 | TASK-039-T3-FT-003-W10 | shared-only context-preserving links from `/calendar` to existing `/lesson-context` (AC-008) | TASK-014-T3-FT-003-W8; TASK-037-T3-FT-003-W9 |

## W7 Boundary Reconciliation

- `TASK-013-T2-FT-003-W7` is the authoritative completed W7 task with current
  functional `PASS` and feature-level `semantic-pass` evidence for AC-001/002;
  the durable links are recorded in the FT-003 feature document and the
  [W7 boundary sync report](../../../.tasks/TASK-013-T2-FT-003-W7/TASK-013-T2-FT-003-W7-S-MB-SYNC-final-report-docs-01.md).
- `TASK-014-T3-FT-003-W8` retains its `in_progress` lifecycle, historical
  evidence, and existing dependencies; its Revision 2 reconciliation adds the
  indexed provider prerequisite `TASK-018-T3-FT-005-W8` without changing its
  identity, tier, wave, or retry history.
- `TASK-013-T2-FT-003-W7` remains untouched with its completed Revision 1
  evidence; the accepted modular-monolith, one-server, and shared-database
  architecture remains unchanged.

## Gates and verification

Use `npm run check`, `npm run build`, and `npm run test`; verify AC-001/002 on
TASK-013, the provider contract on TASK-018, and AC-003/004/005/006 on
TASK-014. The cards carry separate claim-linked RED/GREEN, role/privacy,
context-preservation, lesson-scoped projection, composition, and non-mutation
evidence paths. No execution or verification is part of this reconciliation.

## Planning Revision 2 reconciliation

The global backbone is `complete` at Planning Revision 2. Existing FT-003 task
identity, tier, wave, lifecycle, historical evidence, and retry history remain
preserved. The provider outcome is split to Learning Progress because Lesson
Context cannot own or bypass that boundary. The Revision 2 plan review was
approved before the current W8 execution; its planning decision is retained as
historical basis and is not reopened by feature sync.

## W8 Feature Boundary Reconciliation

- `TASK-013-T2-FT-003-W7`, `TASK-014-T3-FT-003-W8`, and the provider prerequisite
  `TASK-018-T3-FT-005-W8` are indexed `done` with current claim-linked
  functional/semantic evidence. The feature-level report is
  [FT-003 W8 sync](../../../.tasks/FT-003/FT-003-S-MB-SYNC-final-report-docs-01.md).
- AC-001/002 remain owned by TASK-013; AC-003..006 remain owned by TASK-014;
  the lesson-scoped grade provider claim remains owned by TASK-018.
- The current dependency set, task identities, retry history, accepted
  architecture, feature/epic lifecycle, and RTM lifecycle values are preserved.

## W9 Accepted Calendar Route Reconciliation

The operator initially accepted a material follow-up after AC-001..AC-006
closure:
`/calendar` must render the authorized class lesson calendar from the shared
database through the existing Center & Scheduling Calendar and Membership Query
Boundary, while the public home fixture remains outside the authenticated
calendar path. Each lesson link must navigate to the existing
`/lesson-context` route with exact date/class/lesson context preserved. The
earlier optional-student wording is historical and is superseded for the
calendar link by the shared-only decision below.

The accepted owner is Lesson Context's SvelteKit transport/presentation adapter;
it consumes existing public queries and does not change Center & Scheduling or
the existing Lesson Context composition module. AC-007 and AC-008 were
initially drafted as one execution-cohesive T3 task because the protected route
load, lesson-link projection, and real-route authorization/navigation proof
share one boundary.
The initial one-task draft was rejected by the fresh task-plan Reviewer because
AC-007's protected route load and AC-008's navigation/context proof can
complete and retry independently.

## W9/W10 Calendar Route Repair

The unexecuted, unreviewed `TASK-036-T3-FT-003-W9` is retired from the indexed
model under `rebuild_required`. Fresh sibling cards own the independent claims:
`TASK-037-T3-FT-003-W9` owns AC-007 after done TASK-013, while the historical
`TASK-038-T3-FT-003-W10` owns the superseded broader AC-008 scope and remains
`in_progress` with its RED evidence. Fresh planned
`TASK-039-T3-FT-003-W10` owns the accepted shared-only AC-008 after done
TASK-014 and TASK-037. Their implementation, RED/GREEN proof, and retry
boundaries remain separate; no historical identity, code, evidence, or
dependency is changed. FT-003 and REQ-005/006/014/016 remain `planned`; Planning
Revision remains `2`.

## Shared-only AC-008 reconciliation

The accepted AC-008 implementation result is one standard link per rendered
calendar lesson into the existing `/lesson-context` route. Its query contains
exactly `date`, `classId`, and `lessonId`; `studentAccountId` is absent. The
route/module remains the composition and authorization owner, and personal
student context is outside this task and deferred to a separate role-scoped
follow-up after dashboard work.

The material scope change requires `rebuild_required`: preserve TASK-038's
`in_progress` identity and claim-specific RED without mutation, and execute
the fresh planned TASK-039 only after a fresh `/review-tasks-plan FT-003`.
No source, test, prerequisite, outer-run, closure, verification, or sync work
is included in this planning reconciliation.
