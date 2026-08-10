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

Lesson Context owns composition at `src/lib/server/modules/lesson-context/`; it consumes named read boundaries and never reconstructs authorization from UI routes.

## Ordered tasks

| Wave | Task | Outcome | Dependency |
|---|---|---|---|
| W7 | TASK-013-T2-FT-003-W7 | calendar geometry and navigation | TASK-006-T2-FT-002-W4 |
| W8 | TASK-014-T3-FT-003-W8 | authorized day-context composition | TASK-008, TASK-009, TASK-010, TASK-016, TASK-017, TASK-013 |

## W7 Boundary Reconciliation

- `TASK-013-T2-FT-003-W7` is the authoritative completed W7 task with current
  functional `PASS` and feature-level `semantic-pass` evidence for AC-001/002;
  the durable links are recorded in the FT-003 feature document and the
  [W7 boundary sync report](../../../.tasks/TASK-013-T2-FT-003-W7/TASK-013-T2-FT-003-W7-S-MB-SYNC-final-report-docs-01.md).
- `TASK-014-T3-FT-003-W8` remains `blocked` and keeps its accepted dependency
  set; no dependent transition is applied here.
- The accepted Planning Revision 1 and architecture remain unchanged.

## Gates and verification

Use `npm run check`, `npm run build`, and `npm run test`; verify AC-001/002 on TASK-013 and AC-003/004/005/006 on TASK-014. Use the cards’ separate RED/GREEN visual, role/privacy, context-preservation, projection-composition, and non-mutation evidence paths.
