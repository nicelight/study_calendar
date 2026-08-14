---
description: Execution plan for TASK-032-T2-FT-002-W16.
status: active
---
# Plan — TASK-032-T2-FT-002-W16

## Goal
Reject zero-occurrence recurring schedules before Schedule/Lesson mutation for
both authorized scheduling principals at the Center & Scheduling owner
boundary. The existing Admin adapter maps its rejection to
`invalid_schedule` 400; assigned Teacher remains domain/sentinel-only because
no Teacher schedule HTTP transport exists in this scope.

## Non-goals
- No changes to TASK-026/TASK-031 artifacts, protected UI, localStorage,
  authorization scope, schema, dependencies, or valid-occurrence behavior.

## Inputs / source specs
- Task record: `.memory-bank/tasks/TASK-032-T2-FT-002-W16.task.json`
- Task index: `.memory-bank/tasks/index.json`
- Feature/Epic: `.memory-bank/features/FT-002-center-and-scheduling.md#FT-002-AC-009`
- REQ IDs: REQ-004

## Richer execution inputs (optional)
- Source Artifacts: `.memory-bank/contracts/boundary-map.md#calendar-and-membership-query-boundary`
- Normative Inputs: Access Control, lifecycle, architecture, testing, tier policy
- Verification Targets: Admin/Teacher owner-boundary no-mutation RED/GREEN;
  Admin adapter 400/browser support; valid recurrence regression; check/build/test

## Constraints / invariants (MUST / NEVER)
- MUST reject an empty inclusive occurrence list before schedule/lesson inserts.
- MUST preserve `400 { error: 'invalid_schedule' }` at the existing Admin
  transport boundary; assigned Teacher MUST retain private
  `invalid-schedule-occurrences` without a new HTTP transport.
- NEVER change authorization, persistence schema, browser draft behavior, or valid-occurrence recurrence.

## Scope
### In scope
- Existing Center & Scheduling public recurrence command for Admin and assigned
  Teacher, plus its existing Admin route error mapping.
- Focused recurring-scheduling and Admin route regression tests.

### Out of scope
- Protected Svelte page, browser draft tests, task cards/protocols/evidence for
  TASK-026/TASK-031, package manifests, migrations, unrelated cleanup.

## Proposed changes
### Touched areas (hypotheses OK)
- `src/lib/server/modules/center-scheduling/public.ts` — reject empty occurrences before writes.
- `src/routes/admin/center-dashboard.server.ts` — only if existing error mapping needs the private sentinel.
- `tests/center-scheduling/recurring-scheduling.test.ts` — domain no-mutation regression.
- `tests/routes/admin-center-management.test.ts` — Admin transport envelope regression if needed.

### Preflight-confirmed change surface
- Expected hints kept: yes; actual surface to be confirmed before edit.
- Additional same-outcome files/areas and rationale: none.
- Hard `write_boundary` present and satisfied: not set.
- `forbidden_scope` / stop-condition check: clear.

## Applicable quality gates
- [ ] `npm run check` — proves project type/Svelte checks remain valid.
- [ ] `npm run build` — proves production build and SSR compatibility.
- [ ] `npm run test` — proves focused and existing regression suite.

## Claim-linked RED / GREEN (T2/T3)
- applicability: applicable
- accepted claim locator(s): FT-002-AC-009 / REQ-004
- planned test/probe and environment: isolated existing owner-boundary fixtures
  for Admin and assigned Teacher, the existing Admin adapter/browser support,
  plus valid-occurrence regression.
- observable RED: zero-occurrence request currently returns `schedule_created`
  and persists a Schedule with zero Lessons.
- corresponding GREEN: the owner rejects before writes with exact
  Schedule/Lesson state equality for both authorized principals; Admin's
  adapter returns 400 `invalid_schedule`, while Teacher exposes only private
  `invalid-schedule-occurrences` and no Teacher HTTP transport is added.
- accepted not-applicable reason and alternative proof: none.
- T3 isolation, safe rerun, cleanup, and permission boundary: not applicable (T2).

## Fan-out plan (if needed)
- None.

## MB-SYNC handoff / owner
Scheduler or explicit standalone owner performs sync after verification/status
decision. `/exe` only records handoff notes.

Checklist:
- [ ] Owner identified: scheduler | explicit standalone owner | human | none
- [ ] Explicit standalone owner basis recorded if manual closure is expected: n/a
- [ ] `.memory-bank/` docs needing update (WHY/WHERE, no pseudocode): lifecycle owner after re-execution/verify
- [ ] `.memory-bank/index.md` router update needed: no
- [ ] RTM update in `.memory-bank/requirements.md` needed: lifecycle owner
- [ ] Task registry/status update owner: lifecycle owner
- [ ] Changelog update owner: lifecycle owner

## Definition of done
- Focused RED/GREEN evidence recorded, project gates pass, and Attempt 2
  re-verification confirms the adapter-specific claim. The explicit lifecycle
  owner consumed that PASS and closed the T2 task; feature-level semantic
  closure remains separate.
