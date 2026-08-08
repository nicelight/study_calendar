---
description: Execution context for TASK-012-T2-FT-004-W6.
status: active
---
# Context — TASK-012-T2-FT-004-W6

## Purpose

Complete the Collaboration-owned threaded discussion model so arbitrarily nested
replies remain durable, the scoped common feed remains complete, and only the
ten most recently active branch tabs are projected without deleting messages.

## Execution Attempt

- attempt: 1
- started: 2026-08-08T22:47:31+05:00

## Inputs (what drives this task)

- Task record: `.memory-bank/tasks/TASK-012-T2-FT-004-W6.task.json`
- Task index: `.memory-bank/tasks/index.json`
- Feature/acceptance: `.memory-bank/features/FT-004-day-collaboration.md#ft-004-ac-003` and `#ft-004-ac-004`
- Requirements: `.memory-bank/requirements.md` (`REQ-006`, `REQ-008`, `REQ-014`)
- Canonical specs: `.memory-bank/contracts/boundary-map.md#day-discussion-query-boundary`, `.memory-bank/domains/core-domain.md#domain-relationships`, `.memory-bank/states/lifecycle-map.md#collaboration`

## Richer inputs

- Source artifacts: accepted architecture target, Access Control contract, feature and FT-004 implementation plan.
- Constraints / invariants: Collaboration remains the sole writer; branch tabs are a projection over retained messages; reply depth is not capped; the common feed is scoped through current server-side actor/class/student facts; only ten recent branches are visible.
- Verification targets: nested reply depth and first-reply transition; scoped common-feed completeness; eleven-plus branch ordering; hidden-message retention and reactivation.

## Loaded context set

- `AGENTS.md`, `.memory-bank/constitution.md`, `.memory-bank/mbb/index.md`
- `.memory-bank/spec-backbone.md`, `.memory-bank/spec-index.md`, `.memory-bank/index.md`
- `.memory-bank/roles/implementer.md`, `.agents/skills/exe/SKILL.md`
- `.memory-bank/workflows/tier-policy.md`
- `.memory-bank/tasks/TASK-012-T2-FT-004-W6.task.json`
- `.memory-bank/features/FT-004-day-collaboration.md`, `.memory-bank/requirements.md`
- `.memory-bank/contracts/boundary-map.md`, `.memory-bank/contracts/access-control.md`
- `.memory-bank/domains/core-domain.md`, `.memory-bank/states/lifecycle-map.md`, `.memory-bank/architecture/system-architecture.md`

## Decisions / assumptions

- The scheduler already durably selected `ready -> in_progress`; its checkpoint states that protocol, RED, production implementation, GREEN, and final handoff were still pending. Attempt 1 therefore starts without replaying any side effect.
- The smallest accepted representation is a retained Collaboration message row with explicit parent/root links; recent-tab visibility is derived from insertion activity and is not a second persisted lifecycle.
- Existing dirty changes in `src/lib/server/modules/collaboration/public.ts` and `src/lib/server/platform/database.ts` are authoritative dependency outcomes from completed tasks; they are preserved and only the W6 integration delta is added.
- No non-empty hard `write_boundary` is configured. The two Foundation task records in `forbidden_scope` remain untouched.

## Commands run / environment notes

- Read-only index/task/dependency/review/spec/source/worktree inspection completed before the first prospective probe.
- Global Planning Revision `1` matches the current FT-004 task-plan review `REVIEWED_PLANNING_REVISION: 1` with `APPROVE`.
- `TASK-011-T3-FT-004-W5` is `done` with current functional and T3 semantic evidence.
- Current accepted `ready` T2/T3 task `TASK-013-T2-FT-003-W7` has non-empty claim-linked prospective evidence and verification targets.

## Open questions / blockers

- None after implementation and required gates.

## Current handoff

- Attempt 1 implementation, claim-equivalent GREEN, and required gates are complete.
- Start by reading: `context.md`, `plan.md`, `progress.md`, `handoff.md`.
- Next action: fresh independent `/verify TASK-012-T2-FT-004-W6`.
