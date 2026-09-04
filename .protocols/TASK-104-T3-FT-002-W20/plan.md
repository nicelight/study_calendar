---
description: Execution plan for TASK-104-T3-FT-002-W20.
status: active
---
# Plan — TASK-104-T3-FT-002-W20

## Goal

Add a protected Admin lesson projection and browser actions for one-lesson add,
transfer, and cancel while preserving Center & Scheduling ownership and lesson
identity.

## Non-goals

- No change to recurring schedule replacement or owner command semantics.
- No Teacher schedule HTTP surface, Lesson Context/calendar content, financial
  behavior, schema migration, or direct route/component persistence.

## Inputs / source specs

- Task record: `.memory-bank/tasks/TASK-104-T3-FT-002-W20.task.json`
- Feature/REQ: `FT-002`, `REQ-004`, `REQ-014`
- Boundary/transport: `.memory-bank/contracts/boundary-map.md#calendar-and-membership-query-boundary`, `.memory-bank/contracts/authentication-transport.md#protected-admin-provisioning-path`

## Constraints / invariants

- MUST resolve Admin actor and own-center class projection before every action.
- MUST verify `classId`/`scheduleId` consistency and selected lesson scope.
- MUST generate add `lessonId` server-side and use canonical ISO dates.
- MUST leave siblings and full state unchanged on denied/invalid operations.
- MUST reject cancellation of completed lessons through the owner boundary.
- NEVER write scheduling persistence from route or component code.

## Scope

### In scope

- `AdminCenterView` lesson projection.
- Admin port/action map and safe result/error mapping.
- Existing Admin class-card lesson list and three forms.
- Focused route/component tests for positive and denial/state-equality paths.

### Out of scope

- All paths in `runtime_context.forbidden_scope` from the task card.

## Proposed changes

### Touched areas

- `src/lib/server/modules/center-scheduling/public.ts` — return server-owned
  lesson views alongside schedules in the Admin projection.
- `src/routes/admin/center-dashboard.server.ts` — expose protected named owner
  actions and validate selectors from the fresh projection.
- `src/routes/admin/[centerId]/+page.svelte` — render lesson rows and forms.
- `tests/routes/admin-center-management.test.ts` — route/projection/action
  regression proof.

### Preflight-confirmed change surface

- Expected hints kept: yes.
- Additional same-outcome files/areas: `tests/routes/admin-schedule-draft.test.ts`
  keeps the existing synthetic Admin page fixture compatible with the new
  required `lessons` projection field.
- Hard `write_boundary` present and satisfied: yes.
- `forbidden_scope` / stop-condition check: clear.

## Applicable quality gates

- [ ] `npm run check` — Svelte/TypeScript correctness.
- [ ] `npm run build` — production route composition.
- [ ] `npm run test` — route, projection, action, and regression behavior.
- [ ] `git diff --check` — patch hygiene.

## Claim-linked RED / GREEN (T3)

- applicability: applicable
- accepted claim locator(s): `FT-002-AC-003`, `FT-002-AC-004`, `REQ-004`, `REQ-014`
- planned test/probe and environment: disposable in-memory SQLite composition
  root with protected Admin request events and SSR render of the actual page.
- observable RED: current Admin projection/action map has no lessons or
  add/transfer/cancel controls; forged selectors and completed cancellation
  have no route-level proof.
- corresponding GREEN: the protected projection renders lessons; three actions
  call the owner boundary; selector mismatch, forged scope, and completed
  cancellation are denied before mutation; transfer keeps identity/context and
  add identity is server-generated.
- T3 isolation, safe rerun, cleanup, and permission boundary: each test uses a
  fresh in-memory root, snapshots all schedules/lessons before denial probes,
  uses only own-center Admin sessions, and closes the database after each test.

## MB-SYNC handoff / owner

- Owner identified: explicit standalone owner for this manual top-level task.
- Explicit standalone owner basis: top-level manual workflow ownership.
- `.memory-bank/` docs needing update: feature/requirements lifecycle only after
  independent verification and closure owner decision.
- `.memory-bank/index.md` router update needed: no.
- RTM update needed: only at lifecycle sync, not during execution.
- Task registry/status update owner: tier/lifecycle owner after verification.
- Changelog update owner: none unless project workflow requests it.

## Definition of done

Implementation and focused tests pass all task gates; `/verify` can reproduce
the protected Admin flow and independently confirm each mapped claim.
