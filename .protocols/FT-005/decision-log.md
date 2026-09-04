---
description: Durable decisions for FT-005 task planning.
status: active
---
# FT-005 Decision Log

## 2026-08-08 — Task queue created

Homework/grades and attendance/financial reconciliation have distinct owners and failure surfaces, so they remain sibling tasks. Existing boundary, financial, access, domain, state, and runbook specs are reused. Planning Revision remains `1`.

## 2026-08-10 — Planning Revision 2 reconciliation

Learning Progress now explicitly owns lesson-to-homework selection/relation
semantics and the authorized lesson-scoped personal grade query. Existing
TASK-009 and TASK-010 records remain untouched with their historical evidence,
statuses, dependencies, and retry history preserved. The minimum new provider
task is `TASK-018-T3-FT-005-W8`; it is planned and must pass fresh task-plan
review before execution.

## 2026-08-18 — Teacher lesson-day attendance entry

FT-005-AC-005 is a new material outcome: an assigned Teacher records an absent
subset from the lesson-day student list, with every unmarked student persisted
as present. Existing TASK-010 attendance/reconciliation evidence is unchanged.
Create `TASK-042-T3-FT-005-W22` with a Learning Progress batch command and a
thin lesson-context adapter, depending on TASK-010 and TASK-041; no global
architecture or Planning Revision change.

## 2026-09-04 — Minimal homework browser surface

The operator accepted a minimal class-scoped browser model for the missing
homework surface. Reuse the existing `learning_homework` shape and provider
selection; do not add a `lesson_id` relation, migration, new API, or
consumer-owned mapping. Existing `FT-005-AC-001` and `FT-005-AC-002` remain the
only acceptance criteria for this scope; no doubtful or non-critical AC is
added.

The new work is sequential: `TASK-105-T3-FT-005-W37` closes the server
projection and named `/lesson-context` actions, then
`TASK-106-T3-FT-005-W38` closes the UI and disposable Playwright proof. No
production-only task is required.

## 2026-09-04 — Task-plan approval and decomposition closure

The fresh `/review-tasks-plan FT-005` returned `APPROVE` at Planning Revision
`2` for the repaired W37/W38 delta. The final sequential queue is
`TASK-105-T3-FT-005-W37` → `TASK-106-T3-FT-005-W38`; decomposition is closed
for this revision. Task cards remain `planned` until the readiness/promotion
owner acts; no implementation, verification, or feature lifecycle promotion is
inferred here.
