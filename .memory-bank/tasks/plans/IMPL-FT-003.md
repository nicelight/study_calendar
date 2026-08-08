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
| W8 | TASK-014-T3-FT-003-W8 | authorized day-context composition | TASK-008, TASK-009, TASK-010, TASK-012, TASK-013 |

## Gates and verification

Use `npm run check`, `npm run build`, and `npm run test`; verify AC-001/002 on TASK-013 and AC-003/004/005/006 on TASK-014. Use the cards’ separate RED/GREEN visual, role/privacy, context-preservation, projection-composition, and non-mutation evidence paths.
