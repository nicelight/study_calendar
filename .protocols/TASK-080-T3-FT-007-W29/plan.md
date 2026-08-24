---
description: Execution plan for TASK-080-T3-FT-007-W29.
status: active
---
# Plan — TASK-080-T3-FT-007-W29

## Goal

Implement the C&S-owned accessible-class query and keep both canonical routes
as thin server-scoped adapters that expose only the current actor's
own-center, assigned-class, or complete accessible-calendar destinations.

## Non-goals

- No Statistics, Profile, provider formulas, or new navigation shell.
- No direct Center & Scheduling table reads from routes; the provider query
  owns accessible-class enumeration.
- No new role, membership, assignment, authorization, persistence, or graph
  edge; the accepted public boundary gets only its scoped read query.
- Existing `/admin/{centerId}`, class-entry, and `/calendar` routes remain destination owners.

## Inputs / source specs
- Task: `.memory-bank/tasks/TASK-080-T3-FT-007-W29.task.json`
- Feature: `.memory-bank/features/FT-007-navigation-and-statistics.md#FT-007-AC-002`
- REQ IDs: `REQ-014`, `REQ-017`
- Canonical boundaries: `.memory-bank/contracts/boundary-map.md#actor-context-boundary`, `.memory-bank/contracts/boundary-map.md#calendar-and-membership-query-boundary`, `.memory-bank/contracts/access-control.md#authority-and-scope`
- Testing: `.memory-bank/testing/strategy.md#disposable-browser-proof`

## Constraints / invariants (MUST / NEVER)
- MUST consume `event.locals.actor` and the Center & Scheduling public
  accessible-class query for Student/Parent destinations.
- MUST deny anonymous, revoked, mismatched, non-member, and removed-assignment requests before protected destination data renders.
- MUST preserve read-only behavior and route ownership of existing Admin/class-entry/calendar destinations.
- NEVER read provider tables, client role/scope, or Identity & Access
  persistence from route code; a caller-supplied `classId` may not authorize a
  bare route.

## Scope
### In scope
- `src/lib/server/modules/center-scheduling/public.ts` — read-only public
  accessible-class result over existing membership, parent-link, assignment,
  and class facts.
- `src/routes/home/`
- `src/routes/classes/`
- `tests/center-scheduling/ft-007-accessible-class-list.test.ts`
- `tests/routes/ft-007-home-classes.test.ts`
- `e2e/ft-007-home-classes.spec.ts`
- exact disposable runtime target `tmp/ft-007-home-classes.db`

### Out of scope
- All modules under `src/lib/server/modules/` except the declared C&S
  `public.ts` extension.
- Existing `/admin`, `/center`, `/calendar`, `/statistics`, `/profile`, auth, shell, runner, and real database.

## Proposed changes
### Touched areas (hypotheses OK)
- `src/lib/server/modules/center-scheduling/public.ts` — C&S query and
  C&S-owned class-only result type.
- `src/routes/home/` — server load and Home presentation.
- `src/routes/classes/` — server load and Classes presentation.
- `tests/routes/ft-007-home-classes.test.ts` — focused route/authority/non-mutation proof.
- `e2e/ft-007-home-classes.spec.ts` — owned disposable browser role/scope matrix.
- `tests/center-scheduling/ft-007-accessible-class-list.test.ts` — isolated
  provider role/scope and non-mutation proof.

### Preflight-confirmed change surface
- Expected hints reconciled: the C&S public file and Attempt 1 route files
  already existed as dirty task/dependency work; Attempt 2 changed only the
  accepted query/adapter behavior and added the declared provider proof.
- Additional same-outcome files/areas and rationale: nested `destination.server.ts`
  and `DestinationPage.svelte` keep both route adapters on one server-resolved
  destination projection; both remain under `src/routes/home/`.
- Current Attempt 2 adds only the declared C&S `public.ts` extension and
  provider test from the reconciled card; it does not widen into another
  capability module or route.
- Hard `write_boundary` present and satisfied: yes.
- `forbidden_scope` / stop-condition check: clear at preflight.

## Applicable quality gates
- [x] `npm run check` — PASS, 0 errors/0 warnings.
- [x] `npm run test` — PASS, 62 files/204 tests.
- [x] `npm run build` — PASS; existing adapter-auto advisory only.
- [x] `npm run test -- tests/center-scheduling/ft-007-accessible-class-list.test.ts` — PASS, 1 file/1 test.
- [x] `node scripts/run-disposable-e2e.mjs --database tmp/ft-007-home-classes.db --spec e2e/ft-007-home-classes.spec.ts` — PASS, 1/1 with exact cleanup.
- [x] `git diff --check` — PASS.
- [x] `node scripts/mb-lint.mjs` — PASS, 74 files with pre-existing advisory warnings.
- [x] `node scripts/mb-doctor.mjs --strict` — PASS, 0 errors/0 warnings/2 info.

## Claim-linked RED / GREEN (T2/T3)
- applicability: applicable
- attempt: 2
- accepted claim locator(s): `FT-007-AC-002 / REQ-014 / REQ-017` and the task verification target.
- planned test/probe and environment: isolated in-memory C&S provider matrix,
  focused in-memory bare-route matrix, then owned disposable Playwright matrix
  against `tmp/ft-007-home-classes.db`.
- observable RED: `.tasks/TASK-080-T3-FT-007-W29/attempt-2-red.md`; provider
  fixture passed setup, then the absent `getAccessibleClassList` claim failed
  with exit `1` before production correction.
- corresponding GREEN: `.tasks/TASK-080-T3-FT-007-W29/attempt-2-green.md` and
  `execution-evidence.md`; provider/route tests, owned browser proof, and all
  indexed gates pass for the reconciled bare-route result.
- claim-equivalent probe changes and rationale: Attempt 2 expands only the
  task-owned provider/route assertions to the reconciled bare-route outcome;
  Attempt 1 remains supporting-only.
- accepted not-applicable reason and alternative proof: none.
- T3 isolation, safe rerun, cleanup, and permission boundary: the browser run
  uses the existing owned disposable runner and only
  `tmp/ft-007-home-classes.db`; the route/provider tests use `:memory:`; no
  real database or external side effect is used.

## MB-SYNC handoff / owner
- Owner identified: scheduler
- Explicit standalone owner basis: n/a; scheduler mode remains authoritative.
- `.memory-bank/` docs needing update: scheduler-owned wave sync after verification/closure; `/exe` does not mutate feature/requirements/changelog docs.
- `.memory-bank/index.md` router update needed: no.
- RTM update in `.memory-bank/requirements.md` needed: scheduler sync owner.
- Task registry/status update owner: scheduler for closure; `/exe` owns only `ready -> in_progress`.
- Changelog update owner: scheduler sync owner.

## Definition of done

Attempt 2 implementation and task-owned RED/GREEN plus all indexed gates are
recorded; the task remains `in_progress` and hands off to fresh `/verify` (then
T3 `/red-verify`) without lifecycle closure or scheduler/AUTONOMOUS-RUN edits.
