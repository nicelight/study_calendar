---
description: Execution plan for TASK-005-T3-FT-002-W3.
status: active
---
# Plan — TASK-005-T3-FT-002-W3

## Goal

Allow an own-center Admin to manage center participants, classes, teacher/
student/parent relationships, and return a server-authorized class scope for
Admin, assigned Teacher, member Student, and linked Parent in both class modes.

## Non-goals

- Scheduling/lesson lifecycle, downstream calendar/day composition, provider
  internals, financial state, grades/attendance/discussion, UI/routes, or a new
  cross-slice contract.
- Re-proving TASK-004 provider/account behavior or changing Identity & Access
  write ownership.

## Inputs / source specs

- Task record: `.memory-bank/tasks/TASK-005-T3-FT-002-W3.task.json`
- Task index: `.memory-bank/tasks/index.json`
- Feature: `.memory-bank/features/FT-002-center-and-scheduling.md`
- REQ IDs: `REQ-003`, `REQ-014`

## Richer execution inputs

- Source artifacts: `.memory-bank/tasks/plans/IMPL-FT-002.md`,
  `.protocols/FT-002/plan.md`.
- Normative inputs: Calendar and Membership Query Boundary, Access Control
  Contract, Core Domain ownership map, Global Backbone revision 1.
- Verification targets: exact task-card targets for AC-001 and AC-002.

## Fallback basis

- Not applicable; the indexed richer inputs are complete and current.

## Constraints / invariants (MUST / NEVER)

- MUST keep center, membership, class, parent-link, and teacher/student
  relationship writes inside Center & Scheduling.
- MUST resolve actor plus center/class/member scope on the server for every
  protected command/query and deny cross-center or unauthorized roles.
- MUST constrain class mode to `individual|group` and preserve center-bounded
  relationships at the schema and boundary.
- NEVER expose direct membership-table mutation to consumers, trust route or
  payload scope as authorization, or compose downstream views here.

## Scope

### In scope

- Center & Scheduling participant/class/link/assignment commands and scoped
  class authorization query.
- Shared-database schema for Center & Scheduling-owned state.
- Isolated in-memory AC-001/002 integration probes and task-owned evidence.

### Out of scope

- Both Foundation task cards in `forbidden_scope`, all downstream slice state,
  real data/external effects, migration-framework design, and unrelated cleanup.

## Proposed changes

### Touched areas

- `src/lib/server/modules/center-scheduling/public.ts` — owner-side commands,
  target-scope validation, and public member authorization decision.
- `src/lib/server/platform/database.ts` — minimum relational constraints for
  classes, student membership, parent links, and teacher assignments.
- `tests/center-scheduling/membership-class-mode.test.ts` — isolated task claim
  probes for both ACs and negative paths.
- `tests/foundation/index.test.ts` — replace obsolete scaffold write helpers if
  removal is required to avoid an unauthorized membership-write bypass.

### Preflight-confirmed change surface

- Expected hints kept: `src/lib/server/modules/center-scheduling/` and
  `tests/center-scheduling/`; no Identity & Access production change is needed.
- Additional same-outcome files: shared schema owner
  `src/lib/server/platform/database.ts`; Foundation probe only if needed to
  remove an owner-boundary bypass.
- Hard `write_boundary` present and satisfied: not set.
- `forbidden_scope` / stop-condition check: clear; no consumer needs direct
  membership-table access and neither Foundation task card will be touched.

## Applicable quality gates

- [x] Focused claim probe: `npm run test -- tests/center-scheduling/membership-class-mode.test.ts`
  — proves AC-001/002 in disposable state.
- [x] Check: `npm run check` — required task type/Svelte check.
- [x] Build: `npm run build` — required production build.
- [x] Test: `npm run test` — required regression suite.
- [x] Diff hygiene: `git diff --check` — touched-diff formatting.

## Claim-linked RED / GREEN (T2/T3)

- applicability: applicable
- accepted claim locators: `FT-002-AC-001`, `FT-002-AC-002`
- planned test/probe and environment: one Vitest integration file with a fresh
  in-memory SQLite root per test and no network/credentials/persistent data.
- observable RED AC-001: accepted participant/class/link admin operations are
  absent or fail to reject cross-center/non-Admin mutations.
- corresponding GREEN AC-001: own-center Admin CRUD records only center-bounded
  relationships and exact class modes; all negative attempts leave state
  unchanged.
- observable RED AC-002: relationship facts or member-scoped class
  authorization for either mode are absent/cross scope.
- corresponding GREEN AC-002: Admin, assigned Teacher, member Student, and
  linked Parent receive only permitted individual/group class scope; nonmember
  and cross-center actors are denied.
- accepted not-applicable reason and alternative proof: none.
- T3 isolation, safe rerun, cleanup, and permission boundary: fresh in-memory
  database per test, closed in `afterEach`; no production/external side effect.

## Fan-out plan

- None; the operator assigned no delegation and the Implementer role forbids it.

## MB-SYNC handoff / owner

- [x] Owner identified: scheduler
- [x] Explicit standalone owner basis recorded if manual closure is expected: n/a
- [x] `.memory-bank/` docs needing update: task lifecycle start only
- [x] `.memory-bank/index.md` router update needed: no
- [x] RTM update in `.memory-bank/requirements.md` needed: no
- [x] Task registry/status update owner: `/exe` starts; later lifecycle owner closes
- [x] Changelog update owner: later workflow boundary if required

## Definition of done

- Both task-owned claims have honest RED/pre-implementation GREEN and final
  claim-equivalent GREEN evidence; required gates pass; actual files and hard
  scope compliance are recorded; Implementer handoff and completion report are
  durable; lifecycle remains `in_progress` for independent gates.
