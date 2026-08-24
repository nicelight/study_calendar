---
description: Execution plan for TASK-096 Statistics composition.
status: active
---
# Plan — TASK-096-T3-FT-007-W30

## Goal

Expose a complete serializable Students/Teachers/Classes registry from Lesson
Context and render it at `/statistics` using only the four accepted provider
boundaries.

## Non-goals

- No provider formula or provider-internal scope proof.
- No typed sorting, statistics persistence, provider writes, direct table
  access, new capability edge, or source-of-truth change.

## Inputs / source specs

- Task record: `.memory-bank/tasks/TASK-096-T3-FT-007-W30.task.json`
- Feature: `.memory-bank/features/FT-007-navigation-and-statistics.md#FT-007-AC-003`
- REQ IDs: `REQ-014`, `REQ-017`
- Direct contracts: Access Control profile consumer boundary, Statistics
  Projection registry/metadata boundaries, Boundary Map actor/calendar/
  progress/financial query boundaries, and System Architecture AD-005.

## Constraints / invariants

- MUST obtain C&S-scoped account IDs before profile lookup.
- MUST keep cross-slice orchestration in Lesson Context and the route thin.
- MUST return only authorized serializable rows and preserve provider facts.
- NEVER touch provider roots, provider tables, formulas, sorting, persistence,
  or an absent dependency edge.

## Scope

### In scope

- `src/lib/server/modules/lesson-context/public.ts`
- `src/routes/statistics/`
- `tests/lesson-context/ft-007-statistics-composition.test.ts`
- `tests/routes/ft-007-statistics.test.ts`
- task-owned protocol/evidence bookkeeping

### Out of scope

- Identity & Access, Center & Scheduling, Learning Progress, and Financial
  Ledger implementation; Playwright configuration; real database; later
  sorting/Profile tasks; scheduler and Memory Bank closure.

## Proposed changes

- Add explicit serializable registry row types and one Lesson Context query.
- Compose scoped C&S facts, profile metadata, attendance percentages, and
  payment capability without direct SQL/table access.
- Add a thin protected `/statistics` server load and a Svelte 5 read-only page.
- Add isolated composition and route/presentation tests including denial,
  exact calls/order, complete fields, serialization, and non-mutation.

## Preflight-confirmed change surface

- Expected hints kept: Lesson Context public boundary and `/statistics` route.
- Additional same-outcome files: the two literal task-owned focused tests.
- Hard `write_boundary` present and satisfied: yes.
- `forbidden_scope` / stop-condition check: clear.

## Applicable quality gates

- [ ] focused composition/route tests: `npx vitest run tests/lesson-context/ft-007-statistics-composition.test.ts tests/routes/ft-007-statistics.test.ts`
- [ ] check: `npm run check`
- [ ] test: `npm run test`
- [ ] build: `npm run build`
- [ ] diff: `git diff --check`
- [ ] Memory Bank lint: `node scripts/mb-lint.mjs`
- [ ] strict doctor: `node scripts/mb-doctor.mjs --strict`

## Claim-linked RED / GREEN

- applicability: applicable
- accepted claim locator: `FT-007-AC-003 / REQ-014 / REQ-017`
- planned probe: two isolated Vitest files on in-memory/test-double state
- observable RED: missing Lesson Context registry query and `/statistics`
  destination prevent complete rows/exact accepted calls and denial proof
- corresponding GREEN: exact C&S-before-profile call order, complete
  serializable rows, all role/scope denials, thin route, and unchanged provider
  state pass
- T3 isolation: no external system, production database, or real user state;
  safe rerun and deterministic cleanup through test-owned memory/process state

## MB-SYNC handoff / owner

- Owner: scheduler.
- `/exe` will not close, promote, verify, red-verify, sync, or edit the
  AUTONOMOUS-RUN checkpoint.

## Definition of done

- Claim-linked RED and claim-equivalent GREEN are durable.
- The smallest accepted implementation is complete inside the hard boundary.
- All required gates and execution evidence are recorded for fresh `/verify`.
