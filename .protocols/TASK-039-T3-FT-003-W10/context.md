---
description: Execution context for TASK-039-T3-FT-003-W10.
status: active
---
# Context — TASK-039-T3-FT-003-W10

## Purpose

Implement shared-only navigation from the DB-backed authorized calendar to the
existing `/lesson-context` route. Every rendered lesson link carries exactly
`date`, `classId`, and `lessonId`; `studentAccountId` remains deferred.

## Execution Attempt
- attempt: 1
- started: 2026-08-15T16:38:54+0500

## Inputs (what drives this task)
- Task record: `.memory-bank/tasks/TASK-039-T3-FT-003-W10.task.json`
- Task index: `.memory-bank/tasks/index.json`
- Specs: `.memory-bank/features/FT-003-calendar-and-lesson-context.md#FT-003-AC-008`, `.memory-bank/contracts/boundary-map.md#calendar-and-membership-query-boundary`, `.memory-bank/contracts/access-control.md#authority-and-scope`, `.memory-bank/contracts/authentication-transport.md#browserapi-path`, `.memory-bank/architecture/system-architecture.md#composition-and-request-data-flow`, `.memory-bank/domains/core-domain.md#read-and-write-data-flow`, `.memory-bank/states/lifecycle-map.md#scheduling-and-lesson-context`, `.memory-bank/testing/strategy.md#evidence-and-ownership`, `.memory-bank/workflows/tier-policy.md#claim-linked-red--green-for-t2t3`
- Acceptance criteria source: `FT-003-AC-008` / `REQ-005` / `REQ-006` / `REQ-014`

## Richer inputs
- Source Artifacts: task card, `IMPL-FT-003`, FT-003 plan/decision log, and the latest FT-003 shared-only task-plan `APPROVE` report.
- Normative Inputs: Global Backbone `complete`, Planning Revision `2`; existing Calendar and Membership Query and Lesson Context boundaries.
- Constraints / Invariants: only `src/routes/calendar/+page.svelte` and `tests/routes/calendar-navigation.test.ts` may change; calendar server loader, Lesson Context, capability modules, completed prerequisite artifacts, TASK-038 artifacts, and outer lifecycle files are forbidden.
- Verification Targets: follow a real DB-backed rendered lesson link, assert exact path/query key set and no `studentAccountId`, observe existing shared Day Context identity, compare read-path state before/after, then run `check`, `test`, and `build`.

## Loaded context set
- `AGENTS.md`
- `.memory-bank/constitution.md`
- `.memory-bank/mbb/index.md`
- `.memory-bank/spec-backbone.md`
- `.memory-bank/spec-index.md`
- `.memory-bank/index.md`
- `.memory-bank/roles/implementer.md`
- `.agents/skills/exe/SKILL.md`
- Task card, FT-003 feature/plan/decision docs, task-plan review, direct canonical specs, and current calendar/Lesson Context source/tests

## Decisions / assumptions
- Decision: implement only the accepted shared-only AC-008 surface; do not add or propagate student context.
- Decision: keep authorization and shared composition in the existing Lesson Context route; the calendar presentation uses only server-rendered lesson identity.
- Assumption: pre-existing untracked calendar route/test files are in-scope user work; preserve their existing behavior and change only the selected outcome.

## Commands run / environment notes
- Exact task/index/dependency/planning/spec/worktree read-only preflight → OK; task is uniquely indexed, currently `in_progress` on resume, T3/W10/FT-003, dependencies are `done`, Planning Revision `2` matches the latest FT-003 `APPROVE` review.
- Source/test/route inspection → OK; current calendar renders lesson facts but no Lesson Context lesson link, and the isolated navigation test is the selected claim surface.
- Worktree has unrelated pre-existing Memory Bank/protocol/task changes and in-scope untracked calendar files; no unrelated file will be edited.

## Open questions / blockers
- None identified during preflight.

## Resume note
- Attempt 1 already has the durable `in_progress` status in the indexed task record; no new status transition or attempt is created.
- Next action: run the initial claim-specific RED probe before production change.
