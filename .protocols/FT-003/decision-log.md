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
