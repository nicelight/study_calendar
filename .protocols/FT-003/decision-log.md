---
description: Durable decisions for FT-003 task planning.
status: active
---
# FT-003 Decision Log

## 2026-08-08 — Task queue created

Calendar presentation and authorized multi-provider day composition are separate owner-valid outcomes. Existing architecture, boundary, access, domain, and lifecycle specs are reused. Planning Revision remains `1`.

## 2026-08-10 — Operator KISS projection decision applied

- The operator accepted the KISS branch for TASK-014 / FT-003: Learning
  Progress owns lesson-to-homework selection/relation semantics and exposes an
  authorized lesson-scoped personal grade query using `lessonId` plus
  server-resolved actor/context.
- Lesson Context remains the read-composition owner. It must not invent
  `homeworkId`, read Learning Progress tables, or introduce an alternative
  consumer-owned persisted relation.
- The durable global backbone advanced from Planning Revision `1` to `2`.
- Task cards, task plans, evidence, retry budgets, and TASK-014 lifecycle remain
  unchanged; `/feature-to-tasks --all` and `/review-tasks-plan --all` are
  required before any product task retry.

## 2026-08-10 — Revision 2 task-plan reconciliation

- `TASK-014-T3-FT-003-W8` retains its `T3`/`W8` identity, `in_progress`
  lifecycle, existing dependencies, historical Attempt 1/2 evidence, and
  bounded retry history. Its card now names the accepted provider-owned query
  contract and adds the new provider prerequisite without changing its
  identity or lifecycle.
- `TASK-018-T3-FT-005-W8` is the minimum fresh T3 provider task for Learning
  Progress. It owns the lesson-scoped query and privacy proof; it does not
  broaden the completed TASK-009 evidence.
- `TASK-013-T2-FT-003-W7` remains untouched. No execute, verify, lifecycle
  closure, promotion, or retry-budget mutation was performed. Fresh review is
  required at Planning Revision `2`.

## 2026-08-15 — Accepted DB-backed calendar route scope

The operator accepted two material FT-003 outcomes after AC-001..AC-006
closure. First, authenticated `/calendar` must render current class lessons
from the shared database through the existing Calendar and Membership Query
Boundary, with server-side role/class authorization and no public-home fixture
usage. Second, each authorized lesson link must navigate to existing
`/lesson-context` while preserving exact date, classId, lessonId, and optional
studentAccountId context; the existing Lesson Context route remains the
composition and authorization owner.

This is `rebuild_required`: AC-007 and AC-008 are one cohesive protected-route
T3 task, `TASK-036-T3-FT-003-W9`, depending on done TASK-013 and TASK-014. The
existing boundary-map, access-control, lesson-context, and Browser/API path
contracts are reused/extended in place; no new SDD spec or Planning Revision
change is required. FT-003 remains `planned` until the new task and aggregate
feature gate pass.

## 2026-08-15 — Reviewer repair: split W9/W10 calendar route claims

The fresh `/review-tasks-plan FT-003` rejected TASK-036 because AC-007's
protected DB-backed calendar load and AC-008's lesson-link/context follow-through
are independently implementable, provable, and retryable. The unexecuted,
unreviewed TASK-036 is retired from the indexed task model under
`rebuild_required`; no completed identity or evidence is rewritten.

Fresh sibling cards now own the claims: `TASK-037-T3-FT-003-W9` owns AC-007
after done TASK-013, and `TASK-038-T3-FT-003-W10` owns AC-008 after done
TASK-014 and TASK-037. The canonical Authentication Transport locator is
`.memory-bank/contracts/authentication-transport.md#browserapi-path`. Existing
contracts are reused in place; Planning Revision remains `2`, and FT-003 stays
`planned` pending both cards plus the aggregate semantic gate.

## 2026-08-15 — TASK-037 readiness promotion

The fresh task-plan review returned `APPROVE`, and strict `mb-doctor` passed.
Only `TASK-037-T3-FT-003-W9` is promoted from `planned` to `ready` for AC-007
after done TASK-013. `TASK-038-T3-FT-003-W10` remains `planned`; no identity,
tier, dependency, scope, code, or unrelated status changed.

## 2026-08-15 — TASK-038 readiness promotion

With TASK-037 now `done`, the prior FT-003 task-plan `APPROVE` and strict
readiness gate authorize only `TASK-038-T3-FT-003-W10` to move from `planned`
to `ready`. AC-008 ownership, dependencies on TASK-014/TASK-037, T3/W10
tiering, navigation write boundary, and all unrelated state remain unchanged.

## 2026-08-15 — Operator selected shared-only AC-008

The operator selected option 1. AC-008 is now limited to shared calendar
navigation: each calendar lesson link carries exactly `date`, `classId`, and
`lessonId` to the existing `/lesson-context` route and MUST NOT carry or invent
`studentAccountId`. Personal student context is deferred to a separate
role-scoped follow-up after dashboard work. The existing Lesson Context
composition and authorization boundary, canonical spec identity, and Planning
Revision `2` remain unchanged.

This is a material target/condition/verification change, so the queue action is
`rebuild_required`. `TASK-038-T3-FT-003-W10` remains indexed and retains its
`in_progress` status, identity, T3/W10 classification, dependencies, protocol
links, old optional-student blocker, and claim-specific RED evidence. It is not
rewritten, closed, or given GREEN evidence. The minimum replacement is fresh
planned `TASK-039-T3-FT-003-W10`, after `TASK-014-T3-FT-003-W8` and
`TASK-037-T3-FT-003-W9`, with independent exact-query/absence/non-mutation
proof for shared-only navigation. No task execution or verification is part
of this reconciliation.
