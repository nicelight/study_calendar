---
description: Execution plan for TASK-089-T3-FT-007-W29.
status: active
---
# Plan — TASK-089-T3-FT-007-W29

## Goal

Expose authorized numeric attendance percentages for conducted student/lesson
slots, including student and assigned-Teacher aggregates, with no projection
writes.

## Non-goals

- No route tables, sorting, or Statistics composition.
- No writes to attendance, financial, class, lesson, or assignment facts.
- No re-proof or implementation of C&S source facts or AC-003 composition.

## Inputs / source specs

- Task record: `.memory-bank/tasks/TASK-089-T3-FT-007-W29.task.json`
- Feature/Epic: `FT-007` / `EP-006`
- REQ IDs: `REQ-014`, `REQ-017`
- Canonical contract: `.memory-bank/contracts/statistics-projection.md#attendance-percentage-query`
- Boundary rules: `.memory-bank/contracts/boundary-map.md#actor-context-boundary`, `#calendar-and-membership-query-boundary`, `#personal-progress-query-boundary`
- Access/lifecycle: `.memory-bank/contracts/access-control.md#authority-and-scope`, `.memory-bank/states/lifecycle-map.md#learning-and-finance`

## Constraints / invariants

- MUST resolve actor and current authorization server-side.
- MUST obtain lesson status and class/assignment scope through C&S public seams.
- MUST count every conducted student/lesson slot and use attendance facts owned by Learning Progress.
- MUST return numeric `0` when the authorized scope has no conducted slots.
- MUST preserve source state before/after every projection read.
- NEVER read C&S persistence directly, accept caller-supplied authorization scope, mutate source facts, touch forbidden paths, or touch `study-calendar.db`.

## Scope

### In scope

- `src/lib/server/modules/learning-progress/public.ts`
- `tests/learning-progress/ft-007-attendance-projection.test.ts`

### Out of scope

- All routes and other capability roots, including C&S, Identity & Access,
  Financial Ledger, and Lesson Context.

## Proposed changes

### Touched areas

- `public.ts` — add the provider-owned attendance aggregate and keep all source reads behind existing injected public boundaries.
- `ft-007-attendance-projection.test.ts` — isolated RED/GREEN proof for scope, formulas, default-present/absence/correction, and read-only behavior.

### Preflight-confirmed change surface

- Expected hints kept: yes; the implementation and focused test are the two hard-boundary paths.
- Additional same-outcome files/areas: none planned.
- Hard `write_boundary` present and satisfied: yes.
- `forbidden_scope` / stop-condition check: clear at start.

## Applicable quality gates

- [ ] `npm run check` — type correctness and SvelteKit project check.
- [ ] `npm run test` — full regression plus task-scoped attendance proof.
- [ ] `npm run build` — production build.
- [ ] `git diff --check` — whitespace integrity.
- [ ] `node scripts/mb-lint.mjs` — Memory Bank link/metadata consistency after protocol/evidence writes.
- [ ] `node scripts/mb-doctor.mjs --strict` — strict task/scheduler readiness consistency without changing scheduler state.

## Claim-linked RED / GREEN (T2/T3)

- applicability: applicable
- accepted claim locator: `FT-007-AC-006 / REQ-014 / REQ-017`
- planned probe: isolated Vitest fixture with in-memory database, server sessions,
  completed/planned/cancelled lessons, class membership/assignment, attendance
  rows, and state-before/state-after snapshots.
- observable RED: the focused claim test fails because the attendance projection
  query is absent or does not satisfy the accepted matrix.
- corresponding GREEN: the same claim-equivalent fixture proves student and
  Teacher ratios, no-slot `0`, default-present/absence/correction, scope denial,
  and source-state equality after the implementation.
- T3 isolation/safe rerun/cleanup: `:memory:` database per test; no real DB,
  external service, secret, route, or production write.

## MB-SYNC handoff / owner

Scheduler or explicit lifecycle owner performs sync after `/verify` and
`/red-verify`; `/exe` records only the handoff. The scheduler checkpoint remains
untouched by this task execution.

- Owner identified: scheduler / lifecycle owner, not `/exe`
- `.memory-bank/` docs needing update: none; canonical boundary/spec wording already covers this outcome
- `.memory-bank/index.md` router update needed: no
- RTM update needed: no
- Task registry/status update owner: `/exe` owns only `ready -> in_progress`; later lifecycle owner owns closure
- Changelog update owner: `/mb-sync` at the wave boundary

## Definition of done

- Production query and isolated task proof satisfy the accepted claim and hard
  boundary; all required task gates are recorded; current-attempt handoff points
  to evidence and recommends `/verify TASK-089-T3-FT-007-W29` followed by the
  required T3 `/red-verify` route. No final lifecycle decision is made here.
