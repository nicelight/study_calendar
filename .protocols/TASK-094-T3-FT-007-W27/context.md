---
description: Execution context for TASK-094-T3-FT-007-W27.
status: active
---
# Context — TASK-094-T3-FT-007-W27

## Purpose

Complete Identity & Access profile facts and the two accepted profile query
projections across all supported new-account paths.

## Execution Attempt

- attempt: 1
- started: 2026-08-22 02:21:29 +0500

## Inputs (what drives this task)

- Task record: `.memory-bank/tasks/TASK-094-T3-FT-007-W27.task.json`
- Task index: `.memory-bank/tasks/index.json`
- Feature / acceptance: `.memory-bank/features/FT-007-navigation-and-statistics.md#FT-007-AC-008`
- Planning review: `.tasks/TASK-MB-REVIEW-TASKS-PLAN/TASK-MB-REVIEW-TASKS-PLAN-S-TASKS-FT-007-final-report-docs-01.md`

## Loaded context set

- `AGENTS.md`
- `.memory-bank/roles/implementer.md`
- `.agents/skills/exe/SKILL.md`
- `.memory-bank/constitution.md`
- `.memory-bank/spec-backbone.md`
- `.memory-bank/spec-index.md`
- `.memory-bank/contracts/access-control.md#account-profile-facts`
- `.memory-bank/contracts/statistics-projection.md#participant-profile-metadata`
- `.memory-bank/contracts/boundary-map.md#account-provisioning-boundary`
- `.memory-bank/contracts/boundary-map.md#actor-context-boundary`
- `.memory-bank/domains/core-domain.md#ownership-map`
- `.memory-bank/domains/core-domain.md#persistence-and-transaction-rules`
- `.memory-bank/workflows/tier-policy.md#claim-linked-red--green-for-t2t3`

## Decisions / assumptions

- Profile persistence is Identity & Access-owned and must not backfill unnamed
  existing accounts; the implementation will use the existing database
  initialization boundary without touching `study-calendar.db`.
- The C&S and route/CLI seams collect and forward surname/given-name input;
  Identity & Access normalizes and generates `registeredAt`.
- Current-actor and scoped-statistics queries expose only their contract
  projections; existing actor authorization remains unchanged.

## Preflight

- Index/file/ID/tier/wave match: confirmed.
- Dependencies `TASK-015`, `TASK-029`, and `TASK-040`: all `done`.
- Global Backbone: `complete`, Planning Revision `2`.
- Latest FT-007 task-plan review: `APPROVE`, `REVIEWED_PLANNING_REVISION: 2`.
- Hard write boundary: present and limited to task card paths.
- Forbidden scope: clear; no production files were dirty at preflight.

## Open questions / blockers

- None at preflight.

## Next session

- Start by reading `context.md`, `plan.md`, and `progress.md`.
- Next action: execute the isolated claim-linked RED probe before production changes.
