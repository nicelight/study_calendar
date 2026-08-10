---
description: Execution context for TASK-017-T3-FT-004-W6.
status: active
---
# Context — TASK-017-T3-FT-004-W6

## Purpose

Establish fresh T3 execution evidence for center-lifecycle isolation of
threaded messages, replies, message reactions, common feed, and branch tabs
after supported class identity reuse.

## Execution Attempt

- attempt: 1
- started: 2026-08-10 00:17 +05

## Inputs (what drives this task)

- Task record: `.memory-bank/tasks/TASK-017-T3-FT-004-W6.task.json`
- Task index: `.memory-bank/tasks/index.json`
- Feature: `.memory-bank/features/FT-004-day-collaboration.md`
- REQ IDs: `REQ-006`, `REQ-008`, `REQ-014`
- Acceptance criteria: `FT-004-AC-003`, `FT-004-AC-004`, and the task-owned
  `REQ-014` threaded-discussion harm path.

## Richer inputs

- Source artifacts: accepted architecture target, Day Discussion Query
  Boundary, Access Control, Core Domain, and Collaboration lifecycle specs.
- Normative inputs: `.memory-bank/spec-backbone.md`, `.memory-bank/spec-index.md`,
  `.memory-bank/contracts/access-control.md`,
  `.memory-bank/contracts/boundary-map.md`,
  `.memory-bank/domains/core-domain.md`,
  `.memory-bank/states/lifecycle-map.md`,
  `.memory-bank/testing/strategy.md`, and the applicable tier policies.
- Historical context only: TASK-012/TASK-016 artifacts are not current proof,
  are not dependencies, and are not modified by this execution.

## Loaded context set

- `AGENTS.md`
- `.memory-bank/roles/implementer.md`
- `.agents/skills/exe/SKILL.md`
- `.memory-bank/tasks/TASK-017-T3-FT-004-W6.task.json`
- `.memory-bank/features/FT-004-day-collaboration.md`
- `.memory-bank/tasks/plans/IMPL-FT-004.md`
- `.protocols/FT-004/plan.md`
- direct canonical contracts, domain, lifecycle, architecture, testing, and
  tier policy docs linked from the task

## Decisions / assumptions

- The accepted Collaboration public boundary, shared database, retained-row
  behavior, arbitrary reply depth, and ten-tab projection remain unchanged.
- The current task is `ready`; dependency `TASK-011-T3-FT-004-W5` is `done`,
  Planning Revision `1` has a matching FT-004 `APPROVE`, and the task is
  executable.
- A minimal in-memory lifecycle probe will determine whether a production
  correction is needed. A pre-implementation GREEN is valid and will result
  in no production change for the claim.

## Commands run / environment notes

- Read-only preflight commands resolved the selected card, dependency, review
  approval, direct specs, source surface, and current worktree deviations.
- Repository revision at attempt start: `697f44b4b4ac6fa9f8e6e094de7844c4e95bfcbd`.
- Existing unrelated/user-owned dirty and untracked Memory Bank/TASK-016
  artifacts are preserved and excluded from this task's claim.

## Open questions / blockers

- None at preflight.

## Next session

- Start by reading `context.md`, `plan.md`, and `progress.md`.
- Next action: run the smallest isolated claim-scoped lifecycle probe after
  the task is durably `in_progress`.
