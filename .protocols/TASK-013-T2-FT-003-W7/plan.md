---
description: Execution plan for TASK-013-T2-FT-003-W7.
status: active
---
# Plan — TASK-013-T2-FT-003-W7

## Goal

Deliver a reachable weekly calendar where lesson days receive more geometry
independently within each week, the standard date picker selects the exact date,
and lesson meaning remains perceivable without color alone.

## Non-goals

- No shared/personal day composition owned by `TASK-014`.
- No authorization, provider integration, server-side writes, schedule mutation,
  or financial behavior.
- No new public server boundary or architecture change.

## Inputs / source specs

- Task record: `.memory-bank/tasks/TASK-013-T2-FT-003-W7.task.json`
- Task index: `.memory-bank/tasks/index.json`
- Feature/Epic: `.memory-bank/features/FT-003-calendar-and-lesson-context.md`, `EP-002`
- REQ IDs: `REQ-005`, `REQ-016`

## Richer execution inputs

- Source Artifacts: FT-003 AC-001/002, composition/request data flow, Calendar and Membership Query Boundary, Access Control, core domain read/write flow, scheduling and lesson context lifecycle.
- Normative Inputs: `.memory-bank/architecture/system-architecture.md#composition-and-request-data-flow`, `.memory-bank/contracts/boundary-map.md#calendar-and-membership-query-boundary`, `.memory-bank/states/lifecycle-map.md#scheduling-and-lesson-context`.
- Verification Targets: calendar UI smoke, exact date-picker navigation, independent-week geometry, operator visual criterion, and color-independent lesson-state review.

## Fallback basis

- Feature doc: `.memory-bank/features/FT-003-calendar-and-lesson-context.md`
- Requirements / RTM: `.memory-bank/requirements.md`
- Related plan: `.memory-bank/tasks/plans/IMPL-FT-003.md`

## Constraints / invariants (MUST / NEVER)

- MUST use Svelte 5 runes and keep universal calendar logic SSR-safe.
- MUST keep exact selected date in URL state because it survives reload and controls navigation.
- MUST keep each week’s geometry computed from that week’s own lesson states.
- MUST keep every day, including non-lesson days, reachable.
- MUST provide a non-color lesson cue through label, symbol, or equivalent semantic text.
- NEVER put authorization or provider writes in the presentation component.

## Scope

### In scope

- Replace the foundation placeholder route with the FT-003 calendar presentation.
- Add a small universal calendar geometry/date helper.
- Add focused claim-specific tests for independent weekly geometry, exact date identity, day reachability, and the non-color cue contract.

### Out of scope

- Server loaders, actions, database changes, provider calls, authorization, and downstream day-context composition.
- Changes to existing server modules or dependency graph.

## Proposed changes

### Touched areas (hypotheses OK)

- `src/routes/+page.svelte` — calendar route and URL-backed date picker.
- `src/lib/calendar.ts` — deterministic date/geometry functions shared by UI and focused tests.
- `tests/calendar/elastic-calendar.test.ts` — claim-linked deterministic probe.

### Preflight-confirmed change surface

- Expected hints kept: `src/routes/`, `src/lib/`, `tests/calendar/`.
- Additional same-outcome files/areas and rationale: none expected.
- Hard `write_boundary` present and satisfied: not set.
- `forbidden_scope` / stop-condition check: clear; both forbidden Foundation task records remain untouched.

## Applicable quality gates

- [ ] `npm run check` — proves Svelte/TypeScript correctness and SSR-compatible route compilation.
- [ ] `npm run build` — proves the production client/SSR bundle builds.
- [ ] `npm run test` — proves the focused calendar claim probe and preserves existing regressions.

## Claim-linked RED / GREEN (T2/T3)

- applicability: applicable
- accepted claim locator(s): `FT-003-AC-001`, `FT-003-AC-002`
- planned test/probe and environment: `npm run test -- tests/calendar/elastic-calendar.test.ts` in the project Vitest Node environment, using pure calendar helpers and explicit route contract assertions where needed.
- observable RED: before implementation, the focused probe must fail at the accepted calendar behavior (missing helper/UI contract, equal/coupled geometry, non-exact selection, unreachable day, or color-only cue); setup/import failure does not qualify.
- corresponding GREEN: the unchanged focused probe passes after the route/helper implementation and the three required gates pass.
- accepted not-applicable reason and alternative proof: none planned.
- T3 isolation, safe rerun, cleanup, and permission boundary: not applicable; this is T2 and the probe has no external state.

## Fan-out plan (if needed)

- None; no delegated agents.

## MB-SYNC handoff / owner

Scheduler or explicit standalone owner performs sync after verification/status decision. `/exe` only records handoff notes.

Checklist:

- [ ] Owner identified: scheduler
- [ ] Explicit standalone owner basis recorded if manual closure is expected: n/a
- [ ] `.memory-bank/` docs needing update (WHY/WHERE, no pseudocode): no durable design/navigation update identified; task protocol/evidence records the implementation handoff.
- [ ] `.memory-bank/index.md` router update needed: no
- [ ] RTM update in `.memory-bank/requirements.md` needed: no
- [ ] Task registry/status update owner: scheduler after `/verify`; `/exe` owns only `ready → in_progress` already recorded.
- [ ] Changelog update owner: scheduler/MB-SYNC at lifecycle boundary.

## Definition of done

- Both task-owned claims have honest RED or accepted pre-implementation GREEN and claim-equivalent GREEN in `progress.md` with artifacts.
- Actual changed files, exact commands, gate results, runtime/UI evidence, and scope compliance are recorded.
- Handoff recommends fresh `/verify TASK-013-T2-FT-003-W7`; task remains open for scheduler lifecycle.
