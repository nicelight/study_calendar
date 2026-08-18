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
