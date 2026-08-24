---
description: Execution plan for TASK-095-T3-FT-007-W28.
status: active
---
# Plan — TASK-095-T3-FT-007-W28

## Goal

Expose one read-only Center & Scheduling public query that returns only
server-authorized registry source facts and account IDs for the Admin's own
Center or a Teacher's currently assigned classes.

## Non-goals

- No Lesson Context composition or route/presentation work.
- No Identity & Access profile lookup or profile fields.
- No attendance, payment capability, sorting, or final registry payload.
- No Student/Parent center-wide registry access.
- No changes to source facts or `study-calendar.db`.

## Inputs / source specs

- Task record: `.memory-bank/tasks/TASK-095-T3-FT-007-W28.task.json`
- Task index: `.memory-bank/tasks/index.json`
- Feature: `.memory-bank/features/FT-007-navigation-and-statistics.md#FT-007-AC-009`
- REQ IDs: `REQ-014`, `REQ-017`
- Canonical contracts: Statistics Projection registry-facts query; Calendar
  and Membership Query Boundary; Access Control authority/scope; Core Domain
  ownership map.

## Constraints / invariants (MUST / NEVER)

- MUST accept a server-resolved actor context at the provider boundary; the
  provider query must not resolve the actor itself.
- MUST scope Admin to its own Center and Teacher to current assignments.
- MUST deny anonymous/revoked/Student/Parent/Teacher-without-assignment safely.
- MUST return only C&S-owned structural facts and account IDs.
- MUST leave all source state unchanged and use isolated disposable tests.
- NEVER accept client-supplied scope as authority.
- NEVER call Identity & Access from the registry query, read/join the
  Identity & Access `accounts` table, or return Identity & Access-owned role,
  profile, or metric fields.
- NEVER touch forbidden module roots, routes, or `study-calendar.db`.

## Scope

### In scope

- `src/lib/server/modules/center-scheduling/public.ts`
- `tests/center-scheduling/ft-007-registry-facts.test.ts`

### Out of scope

- All other production modules and routes.
- Historical W27/W28 task cards and evidence.

## Proposed changes

### Touched areas (hypotheses OK)

- `src/lib/server/modules/center-scheduling/public.ts` — keep the scoped
  read-only registry-facts public query on a server-resolved actor context,
  remove provider-side Identity & Access/account-table access, and keep the
  private SELECT helpers C&S-owned.
- `tests/center-scheduling/ft-007-registry-facts.test.ts` — add isolated
  role/scope, exact-field, denial, no-neighbor, and non-mutation probes.

### Preflight-confirmed change surface

- Expected hints kept: yes; both advisory paths are the hard boundary.
- Additional same-outcome files/areas and rationale: none.
- Hard `write_boundary` present and satisfied: yes.
- `forbidden_scope` / stop-condition check: clear.

## Applicable quality gates

- [x] `npm run test -- tests/center-scheduling/ft-007-registry-facts.test.ts`
  — proves the task-owned provider claim in isolated state.
- [x] `npm run check` — proves project type correctness.
- [x] `npm run test` — proves regression safety for current source.
- [x] `npm run build` — proves the SvelteKit production build.
- [x] `git diff --check` — proves diff hygiene.
- [x] `node scripts/mb-lint.mjs` — proves Memory Bank/task metadata hygiene.
- [x] `node scripts/mb-doctor.mjs --strict` — proves strict task readiness.

## Claim-linked RED / GREEN (T2/T3)

- applicability: applicable
- accepted claim locator(s): `FT-007-AC-009`, `REQ-014`, `REQ-017`, and the
  exact Statistics Projection registry-facts query contract.
- planned test/probe and environment: fresh Vitest test with `:memory:`
  SQLite, one disposable CompositionRoot, actor resolved before the provider
  call, Identity & Access method spies, and complete source-state snapshots.
- observable RED: the public query was absent and the focused task test failed
  on the missing task-owned operation before production behavior changed.
- corresponding GREEN: the same role/scope matrix passed with exact returned
  fields, removed-assignment denial, no neighbor call, and full source-row
  equality snapshots.
- accepted not-applicable reason and alternative proof: none.
- T3 isolation, safe rerun, cleanup, and permission boundary: every test uses
  fresh in-memory SQLite and closes it; no credentials/network/production DB;
  write boundary is limited to the two task paths.

## Fan-out plan (if needed)

- None; no delegated agents.

## MB-SYNC handoff / owner

Scheduler or explicit standalone owner performs sync after verification/status
decision. `/exe` only records handoff notes.

Checklist:

- [x] Owner identified: scheduler.
- [ ] Explicit standalone owner basis recorded if manual closure is expected: n/a.
- [ ] `.memory-bank/` docs needing update (WHY/WHERE, no pseudocode): scheduler/wave boundary.
- [ ] `.memory-bank/index.md` router update needed: no expected.
- [ ] RTM update in `.memory-bank/requirements.md` needed: scheduler/wave boundary.
- [x] Task registry/status update owner: scheduler/lifecycle owner after `/verify` and `/red-verify`.
- [x] Changelog update owner: scheduler/wave boundary.

## Definition of done

- Current task implementation and isolated claim-equivalent GREEN are recorded.
- All required project-native gates pass or an exact blocker is recorded.
- T3 handoff routes to fresh `/verify TASK-095-T3-FT-007-W28`, then per-task
  `/red-verify` after functional PASS; no lifecycle closure is performed here.
