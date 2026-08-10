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
