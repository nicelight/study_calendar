---
description: Implementation plan for FT-005 learning progress.
status: active
---
# IMPL-FT-005 — Learning Progress

## Goal

Implement homework completion, private grades, attendance state, and the authorized financial reconciliation command.

## Scope / non-goals

Include accepted grade values/privacy, present/absent state, charge eligibility, absent-to-present correction, audit, and isolation. Exclude direct financial-table writes and late/partial attendance states.

## Strategy and ownership

Learning Progress owns `src/lib/server/modules/learning-progress/`; it calls the Attendance Charge Reconciliation Boundary after validating attendance and never bypasses Financial Ledger ownership.

## Ordered tasks

| Wave | Task | Outcome | Dependency |
|---|---|---|---|
| W5 | TASK-009-T3-FT-005-W5 | homework and grades | TASK-005-T3-FT-002-W3 |
| W6 | TASK-010-T3-FT-005-W6 | attendance and charge reconciliation | TASK-006-T2-FT-002-W4, TASK-007-T3-FT-006-W4 |

## Gates and verification

Run `npm run check`, `npm run build`, and `npm run test`; verify AC-001/002 on TASK-009 and AC-003/004 on TASK-010. Each claim uses the indexed card’s RED/GREEN role/privacy, attendance, historical replay, audit, atomicity, and isolation evidence path.
