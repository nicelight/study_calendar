---
description: Execution plan for TASK-105-T3-FT-005-W37.
status: active
---
# Plan — TASK-105-T3-FT-005-W37

## Goal

Expose Learning Progress homework selection, class-scoped completion status,
and permitted grades through the existing Lesson Context server projection;
add named create/complete/grade form actions with server-side authorization.

## Non-goals

- No `lesson_id` relation, migration, new mutation API, second homework source,
  or consumer-owned mapping.
- No grade fields in shared Student/Parent completion data.
- No UI, API route, attendance, payment, database-platform, or unrelated slice changes.

## Inputs / source specs
- Task: `.memory-bank/tasks/TASK-105-T3-FT-005-W37.task.json`
- Feature/REQ: `FT-005-AC-001`, `FT-005-AC-002`, `REQ-009`, `REQ-014`
- Canonical browser contract: `.memory-bank/contracts/learning-progress-browser-surface.md`
- Public boundary: `.memory-bank/contracts/boundary-map.md#personal-progress-query-boundary`
- Access: `.memory-bank/contracts/access-control.md#authority-and-scope`
- Architecture/data flow: `.memory-bank/architecture/system-architecture.md#AD-007`, `#composition-and-request-data-flow`
- Domain/state/testing: `.memory-bank/domains/core-domain.md#domain-relationships`, `.memory-bank/states/lifecycle-map.md#learning-and-finance`, `.memory-bank/testing/strategy.md#evidence-and-ownership`

## Constraints / invariants
- MUST keep Learning Progress as the only homework/completion/grade writer and selection owner.
- MUST resolve actor, center, class, lesson, role, and student scope on the server before mutation.
- MUST generate opaque homework identity server-side and make repeat create idempotent for the selected class.
- MUST constrain completion projection to the resolved viewer student scope and keep grades separate/private.
- NEVER trust browser `homeworkId`, `studentAccountId`, role, or scope as authorization.
- NEVER modify `src/routes/lesson-context/+page.svelte`, `/api/lesson-context`, platform database, financial/center-scheduling slices, or FT-000/previous task records.

## Scope
### In scope
- `src/lib/server/modules/learning-progress/public.ts`
- `src/lib/server/modules/lesson-context/public.ts`
- `src/routes/lesson-context/+page.server.ts`
- focused provider/route tests under the task card's allowed test roots
- task-local protocol and evidence artifacts

### Out of scope
- browser UI and Playwright proof owned by TASK-106
- final verification, semantic verification, lifecycle closure, and MB-SYNC

## Claim-linked RED / GREEN (T2/T3)
- applicability: applicable
- accepted claim locators: `FT-005-AC-001 / REQ-009`, `FT-005-AC-002 / REQ-009 / REQ-014`, and Learning Progress Browser Surface `#server-composed-homework-projection`, `#authorized-homework-form-actions`; T3 isolated-state cleanup verification target
- planned test/probe and environment: focused Vitest provider/route tests with fresh `:memory:` CompositionRoot per test and explicit database teardown
- observable RED: current route rejects named homework actions and current context has no homework-progress projection; current provider create accepts caller identity and allows duplicate class items
- corresponding GREEN: isolated tests prove zero/one/multiple selection, scoped completion projection, server-generated opaque IDs, repeat-create count/identity equality, Admin/assigned-Teacher create and grade, Student completion, accepted grades, deny-before-write, and GET-only API preservation
- T3 isolation, safe rerun, cleanup, and permission boundary: each test creates an isolated in-memory DB, records state before/after rejected/repeated actions, can rerun from fresh fixtures, closes the database in `afterEach`, and leaves no filesystem DB/sidecars; source writes stay inside the task boundary

## MB-SYNC handoff / owner
- Owner: outer scheduler/explicit workflow owner; `/exe` does not sync or close T3.
- `.memory-bank/` docs needing update: none; current feature/spec/task-plan navigation already records the accepted W37 outcome.
- Task registry/status update owner: outer lifecycle owner after `/verify` and `/red-verify`.
- Changelog update owner: MB-SYNC/lifecycle owner if required by the wave.

## Definition of done
- Production implementation and focused tests are inside the hard boundary.
- Indexed gates pass or their exact blocker is recorded.
- Current Attempt 1 RED/GREEN evidence, artifacts, cleanup, and next verification targets are linked from `progress.md` and `handoff.md`.
- Task remains `in_progress`; next route is `/verify TASK-105-T3-FT-005-W37`, then `/red-verify` per T3 policy.
