---
description: Execution plan for TASK-014-T3-FT-003-W8.
status: active
---
# Plan — TASK-014-T3-FT-003-W8

## Goal

Deliver authorized shared and personal day context through the accepted Lesson
Context orchestration boundary, with stable navigation identity and no private
cross-student leakage.

## Non-goals

- Do not implement or change progress, collaboration, financial, or scheduling
  write ownership.
- Do not extend or redesign a provider public contract.
- Do not change the dependency graph, architecture, task tier, or Foundation
  scope.
- Do not claim or re-prove the six `done` dependencies.

## Inputs / source specs

- Task record: `.memory-bank/tasks/TASK-014-T3-FT-003-W8.task.json`
- Task index: `.memory-bank/tasks/index.json`
- Feature: `.memory-bank/features/FT-003-calendar-and-lesson-context.md`
- Plan: `.memory-bank/tasks/plans/IMPL-FT-003.md`
- REQ IDs: REQ-005, REQ-006, REQ-014, REQ-016

## Richer execution inputs

- `.memory-bank/architecture/system-architecture.md#composition-and-request-data-flow`
- `.memory-bank/contracts/boundary-map.md#actor-context-boundary`
- `.memory-bank/contracts/boundary-map.md#calendar-and-membership-query-boundary`
- `.memory-bank/contracts/boundary-map.md#personal-progress-query-boundary`
- `.memory-bank/contracts/boundary-map.md#day-discussion-query-boundary`
- `.memory-bank/contracts/boundary-map.md#financial-projection-query-boundary`
- `.memory-bank/contracts/access-control.md`
- `.memory-bank/domains/core-domain.md#read-and-write-data-flow`
- `.memory-bank/states/lifecycle-map.md#scheduling-and-lesson-context`
- `.memory-bank/testing/strategy.md#evidence-and-ownership`
- Verification targets: AC-003, AC-004, AC-005, AC-006 from the task card.

## Constraints / invariants (MUST / NEVER)

- MUST resolve actor and target class/lesson scope server-side for every read.
- MUST reuse one Lesson Context shared-material object in both view modes.
- MUST use only named public provider queries for personal projections.
- MUST preserve authoritative lesson date, class, and selected student identity
  in navigation links and serialized context.
- MUST keep personal data scoped to the selected authorized student.
- NEVER trust client role/student context as authorization.
- NEVER write progress, collaboration, financial, or scheduling state from
  Lesson Context.
- NEVER expose an authorization failure that reveals another student's target.

## Scope

### In scope

- `src/lib/server/modules/lesson-context/`
- `src/lib/server/platform/database.ts` for the Lesson Context-owned table
- `src/lib/server/composition-root.ts`
- `src/routes/lesson-context/`
- `src/routes/api/lesson-context/`
- `tests/lesson-context/`
- `.tasks/TASK-014-T3-FT-003-W8/`
- `.protocols/TASK-014-T3-FT-003-W8/`

### Out of scope

- `.memory-bank/tasks/TASK-001-T3-FT-000-W0.task.json`
- `.memory-bank/tasks/TASK-002-T3-FT-000-W1.task.json`
- all provider module implementation and write paths
- existing unrelated dirty files and W7 calendar surface

## Proposed changes

### Touched areas (hypotheses OK)

- `src/lib/server/modules/lesson-context/public.ts` — owner boundary and
  composition logic.
- `src/lib/server/platform/database.ts` — Lesson Context-owned material table.
- `src/lib/server/composition-root.ts` — wire the accepted owner.
- `src/routes/lesson-context/` and `src/routes/api/lesson-context/` — SSR and
  HTTP adapters that pass request-scoped session context only.
- `tests/lesson-context/` — isolated public-boundary and route-contract proof.

### Preflight-confirmed change surface

- Expected hints kept: server Lesson Context, routes, and lesson-context tests;
  database/composition-root are necessary same-outcome integration files.
- Additional same-outcome files/areas and rationale: none at preflight.
- Hard `write_boundary` present and satisfied: not set.
- `forbidden_scope` / stop-condition check: clear; no forbidden files touched.

## Applicable quality gates

- [x] `npm run check` — executor reported pass; fresh verifier run remains due.
- [x] `npm run build` — executor reported pass; fresh verifier run remains due.
- [x] `npm run test` — executor reported pass; 14 files / 45 tests; fresh
  verifier run remains due.

## Claim-linked RED / GREEN (T2/T3)

- applicability: applicable
- accepted claim locators: FT-003-AC-003, FT-003-AC-004, FT-003-AC-005,
  FT-003-AC-006
- planned test/probe and environment: disposable `:memory:` SQLite fixture,
  public CompositionRoot boundaries, teacher/student/parent sessions, one class
  lesson, distinct student private rows, and SSR/API adapters where practical.
- observable RED: no Lesson Context boundary/route exists; current source
  cannot return common material, compose selected personal projections, or
  preserve/authorize the requested day context.
- corresponding GREEN: role-authorized shared material is identical; personal
  view contains only the selected student's provider projections; navigation
  carries authoritative date/class/lesson/student identity; guessed student,
  wrong class, and invalid session requests fail without private payloads or DB
  mutation.
- accepted not-applicable reason and alternative proof: none; T3 claims require
  isolated disposable proof.
- T3 isolation, safe rerun, cleanup, and permission boundary: one in-memory
  database per test, `afterEach` close, no network/credentials/production data,
  public boundaries only for business reads/writes, and generic 403 route
  failures.

## Fan-out plan

- None; no delegated agents.

## MB-SYNC handoff / owner

Scheduler or explicit standalone owner performs sync after verification/status
decision. `/exe` only records handoff notes.

- Owner identified: explicit standalone owner for this requested task execution;
  lifecycle closure remains with the downstream `/verify`/T3 semantic route.
- `.memory-bank/` docs needing update: none beyond task-owned protocol
  navigation; canonical boundaries remain unchanged.
- `.memory-bank/index.md` router update needed: no.
- RTM update needed: no.
- Task registry/status update owner: lifecycle owner after `/verify` and
  `/red-verify`.
- Changelog update owner: workflow boundary after closure.

## Definition of done

- Claim-linked Attempt 1 RED and claim-equivalent GREEN are recorded.
- Production source and actual changed files are recorded with hard-scope proof.
- `npm run check`, `npm run build`, `npm run test`, and the smallest SSR/API
  negative checks pass or a blocker is recorded.
- Handoff points to fresh `/verify TASK-014-T3-FT-003-W8`; this execution does
  not run verification, semantic verification, sync, or lifecycle closure.
