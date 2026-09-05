---
description: Execution plan for TASK-107-T3-FT-004-W35.
status: active
---
# Plan — TASK-107-T3-FT-004-W35

## Goal

Make named `editFieldComment` enforce current server-resolved Lesson Context
class/lesson and optional selected-student scope at the existing Collaboration
public boundary.

## Non-goals

- Do not replay or alter TASK-102 evidence or identity.
- Do not implement TASK-103 UI.
- Do not add a route, mutation API, schema, writer, or frontend state layer.
- Do not touch unrelated modules or `study-calendar.db`.

## Inputs / source specs

- Task record: `.memory-bank/tasks/TASK-107-T3-FT-004-W35.task.json`
- Task index: `.memory-bank/tasks/index.json`
- Feature: `.memory-bank/features/FT-004-day-collaboration.md#FT-004-AC-005`
- REQ IDs: `REQ-006`, `REQ-007`, `REQ-014`
- Direct contracts: `collaboration-browser-surface.md#authorized-mutation-transport`,
  `#ownership-and-route`, `boundary-map.md#day-discussion-query-boundary`,
  `boundary-map.md#calendar-and-membership-query-boundary`,
  `access-control.md#authority-and-scope`, and
  `access-control.md#data-minimization-and-failure-behavior`.
- Direct architecture/domain/state/testing anchors are listed in the task
  record and were loaded during preflight.

## Constraints / invariants (MUST / NEVER)

- MUST pass current `classId`, `lessonId`, and optional selected
  `studentAccountId` from the server-resolved route context into the existing
  Collaboration writer.
- MUST reject a stored target from another class, lesson, or selected student
  scope before UPDATE,
  with the existing `comment_forbidden` route envelope.
- MUST preserve same-context owner edit success and unchanged denied state.
- MUST keep Collaboration as the sole discussion writer and Lesson Context as
  the adapter.
- NEVER trust client authority fields or use a client-supplied target context.
- NEVER touch forbidden scope, shared production database, or historical task
  records.

## Scope

### In scope

- `src/routes/lesson-context/+page.server.ts`
- `src/lib/server/modules/collaboration/public.ts`
- Focused task-local isolated route/public-boundary probe and evidence.
- Required `.protocols/TASK-107-T3-FT-004-W35/` and `.tasks/TASK-107-T3-FT-004-W35/`
  artifacts.

### Out of scope

- `src/routes/lesson-context/+page.svelte`, `/api/lesson-context`, unrelated
  modules, database platform code, real DB, and historical task records.

## Proposed changes

### Touched areas (hypotheses OK)

- `+page.server.ts` — include route-resolved `classId`/`lessonId` and optional
  selected `studentAccountId` in the named edit command.
- `collaboration/public.ts` — accept current context, derive the current
  shared/personal scope, and compare it with the stored comment context before
  owner UPDATE.
- `.tasks/TASK-107-T3-FT-004-W35/` — isolated RED/GREEN proof and receipts.

### Preflight-confirmed change surface

- Expected hints kept: yes; route/public boundary are the task's exact
  correction surface.
- Additional same-outcome files/areas and rationale: task-local disposable
  probe and protocol/report files only; required evidence bookkeeping.
- Hard `write_boundary`: no non-empty boundary applies; the task's
  `forbidden_scope` remains untouched.
- `forbidden_scope` / stop-condition check: clear; no forbidden path will be
  changed and no new contract/schema/API is required.

## Applicable quality gates

- [x] `npm run check` — proves SvelteKit/TypeScript consistency after the
  boundary signature and route call change.
- [x] `npm run build` — proves production build remains valid.
- [x] `npm run test` — proves the project regression suite, including the
  focused route/public behavior.
- [x] `git diff --check` — proves no whitespace errors in the change.
- [x] `node .memory-bank/scripts/mb-lint.mjs` — proves durable docs/artifacts
  retain required Memory Bank structure.
- [x] `node .memory-bank/scripts/mb-doctor.mjs --strict` — required task gate.

## Claim-linked RED / GREEN (T2/T3)

- applicability: applicable
- accepted claim locators: `FT-004-AC-005 / REQ-014`,
  `collaboration-browser-surface.md#authorized-mutation-transport`,
  `access-control.md#authority-and-scope`, and the Day Discussion Query
  Boundary/composition flow.
- planned test/probe and environment: task-local Vitest probe with an
  in-memory SQLite composition root; no `study-calendar.db`, no existing
  server, deterministic state snapshots, and cleanup in `afterEach`.
- observable RED: the named action can currently edit an owned personal
  comment stored for another selected student because it discards the current
  `studentAccountId` before the public boundary.
- corresponding GREEN: forged cross-lesson, cross-class, and cross-student
  requests return 403 `comment_forbidden` before mutation, while shared and
  same-context personal owner edits succeed.
- T3 isolation, safe rerun, cleanup, and permission boundary: disposable
  in-memory fixture, task-local probe, per-test database close, no external
  process or real DB.

## MB-SYNC handoff / owner

Scheduler or lifecycle owner performs status/closure and wave sync after fresh
`/verify` and required T3 `/red-verify`. `/exe` leaves the task `in_progress`.

- [ ] Owner identified: scheduler
- [ ] Explicit standalone owner basis: n/a
- [ ] `.memory-bank/` docs needing update: lifecycle/changelog only if the
  scheduler's accepted closure requires them
- [ ] `.memory-bank/index.md` router update needed: no
- [ ] RTM update needed: no
- [ ] Task registry/status owner: scheduler/lifecycle owner
- [ ] Changelog update owner: scheduler/MB-SYNC boundary

## Definition of done

The production correction, honest RED/GREEN evidence, native task gates,
cleanup, and durable T3 handoff/report are complete; final functional and
semantic verdicts remain with `/verify` and `/red-verify`.
