---
description: Bounded task-planning resume state for FT-003.
status: active
---
# FT-003 Task Planning Plan

## Outcome and scope

Deliver elastic weekly calendar navigation and authorized shared/personal lesson context without cross-student leakage.

## Canonical inputs and ownership

- Feature: [.memory-bank/features/FT-003-calendar-and-lesson-context.md](../../.memory-bank/features/FT-003-calendar-and-lesson-context.md)
- Primary owner: Lesson Context at `src/lib/server/modules/lesson-context/`.
- Consumer boundaries: Calendar and Membership Query, Personal Progress Query, Day Discussion Query, and Financial Projection Query in [boundary-map](../../.memory-bank/contracts/boundary-map.md).
- Composition spine: [.memory-bank/architecture/system-architecture.md#composition-and-request-data-flow](../../.memory-bank/architecture/system-architecture.md#composition-and-request-data-flow)
- Planning authority: [.memory-bank/spec-backbone.md](../../.memory-bank/spec-backbone.md), Global Backbone `complete`, Planning Revision `2`.

## Boundary and waves

1. `TASK-013-T2-FT-003-W7` owns calendar geometry, date selection, and perceivable lesson state (AC-001, AC-002), after scheduling.
2. `TASK-018-T3-FT-005-W8` is the Learning Progress provider prerequisite for
   the authorized lesson-scoped personal grade query.
3. `TASK-014-T3-FT-003-W8` owns shared/personal composition, context-preserving
   navigation, and server-side privacy (AC-003..AC-006), after all provider
   slices including TASK-018. It passes `lessonId` and server-resolved
   actor/context and never resolves `homeworkId`.
4. `TASK-037-T3-FT-003-W9` owns the protected DB-backed `/calendar` route and
   its server-side role/class denial matrix (AC-007). It consumes Center &
   Scheduling's authorized class scope/lessons and removes the public-home
   fixture from the authenticated calendar path.
5. `TASK-039-T3-FT-003-W10` owns the shared-only lesson links and exact
   navigation context into the existing `/lesson-context` route (AC-008),
   after TASK-037 and the existing TASK-014 Lesson Context outcome. It carries
   exactly date/class/lesson query context and no `studentAccountId`, without
   changing the existing Lesson Context owner. `TASK-038` remains the
   historical `in_progress` card for the superseded optional-student scope.

Cross-slice business orchestration remains in Lesson Context; provider data remains owned by its source slice.

## Verification

Run native gates with claim-linked paths: AC-001 geometry/date navigation, AC-002 color-independent cue, the AD-007 provider query on TASK-018, AC-003 shared material, AC-004 personal composition, AC-005 context preservation, and AC-006 guessed-student denial. The T2/T3 cards carry separate RED/GREEN observations and artifacts for every owned claim.

## Revision 2 reconciliation

TASK-013 remains untouched. TASK-014 keeps its identity, tier, wave, status,
historical evidence, and retry budget; only its provider prerequisite and
lesson-scoped query handoff were reconciled. No dependent unblock, retry,
closure, promotion, or verification was performed.

## W9 Accepted Calendar Route Reconciliation

The fresh material scope adds AC-007/AC-008 after the prior FT-003 semantic
closure, so queue action is `rebuild_required` and a new identity is required.
The initial one-task draft was rejected by the fresh task-plan Reviewer: the
protected server load and the lesson-link/context follow-through have separate
useful implementation, RED/GREEN proof, and retry completions. The unexecuted,
unreviewed TASK-036 is retired from the indexed model under `rebuild_required`.

## W9/W10 Calendar Route Repair

`TASK-037-T3-FT-003-W9` now owns AC-007 after done TASK-013. Sequential
`TASK-038-T3-FT-003-W10` owns AC-008 after done TASK-014 and TASK-037. The
public `/` fixture, completed TASK-013/TASK-014/TASK-018 evidence, and all
downstream ownership remain unchanged; FT-003 remains `planned` until both
fresh cards and the aggregate semantic gate pass.

## TASK-037 AC-007 closure sync — 2026-08-15

TASK-037 is now `done` with independent functional `PASS` and T3
`semantic-pass` evidence. This closes only AC-007; TASK-038 remains `planned`,
and FT-003/REQ-005/006/014/016 remain planned until AC-008 and the aggregate
feature gate close.

## TASK-038 readiness promotion — 2026-08-15

After TASK-037 closed AC-007, the existing FT-003 task-plan `APPROVE` covers
the unchanged AC-008 card. Only `TASK-038-T3-FT-003-W10` is promoted from
`planned` to `ready`; its dependencies on TASK-014 and TASK-037, T3/W10 tiering,
navigation hard boundary, and all other statuses remain unchanged.

## TASK-037 readiness promotion — 2026-08-15

The fresh FT-003 task-plan review returned `APPROVE`, and strict
`mb-doctor` passed after the canonical plain-path metadata repair. Only
`TASK-037-T3-FT-003-W9` is promoted from `planned` to `ready` for AC-007;
`TASK-038-T3-FT-003-W10` remains historical and is not a current planning
candidate; its indexed lifecycle is `in_progress` and its RED handoff is
preserved pending the replacement review.

## Shared-only AC-008 reconciliation — 2026-08-15

The operator selected option 1 for AC-008. The current accepted outcome is
shared-only: a calendar lesson link targets the existing `/lesson-context`
route with exactly `date`, `classId`, and `lessonId`, and carries no
`studentAccountId`. Personal student context is deferred to a separate
role-scoped follow-up after dashboard work. The existing Lesson Context
server-side composition/authorization boundary and Planning Revision `2` are
unchanged.

This material target and proof change requires `rebuild_required`. Preserve
`TASK-038-T3-FT-003-W10` as-is with its `in_progress` lifecycle, historical
claim-specific RED, protocol links, and old optional-student blocker; do not
close it or add GREEN evidence. The minimum fresh replacement is planned
`TASK-039-T3-FT-003-W10`, with the same T3/W10 boundary and dependencies on
`TASK-014-T3-FT-003-W8` and `TASK-037-T3-FT-003-W9`. Fresh
`/review-tasks-plan FT-003` is the next action; no execution, verification,
semantic verification, or sync is performed here.
