---
description: Execution plan for TASK-039-T3-FT-003-W10.
status: active
---
# Plan — TASK-039-T3-FT-003-W10

## Goal

Expose one valid lesson link from each authorized DB-backed calendar lesson to
the existing `/lesson-context` route with exactly `date`, `classId`, and
`lessonId`, without `studentAccountId`.

## Non-goals

- Do not change the calendar server loader, public home fixture, or DB-backed authorization.
- Do not change `/lesson-context`, any capability module, or add an API/persistence boundary.
- Do not implement personal student context or trust client role/class/student fields.

## Inputs / source specs
- Task record: `.memory-bank/tasks/TASK-039-T3-FT-003-W10.task.json`
- Task index: `.memory-bank/tasks/index.json`
- Feature/Epic: `.memory-bank/features/FT-003-calendar-and-lesson-context.md#FT-003-AC-008`, EP-002
- REQ IDs: `REQ-005`, `REQ-006`, `REQ-014`

## Richer execution inputs
- Source Artifacts: FT-003 AC-008, Calendar and Membership Query Boundary, Access Control, Authentication Transport `#browserapi-path`, System Architecture request flow, Core Domain read flow, Lifecycle, Testing strategy.
- Normative Inputs: Global Backbone Planning Revision `2`, accepted FT-003 shared-only decision, latest FT-003 task-plan `APPROVE`.
- Verification Targets: real rendered link, exact query identity, existing shared response identity, read-path state equality, and project-native gates.

## Constraints / invariants (MUST / NEVER)
- MUST consume only server-rendered lesson `lessonDate`, `classId`, and `lessonId`.
- MUST target the existing `/lesson-context` route.
- MUST carry exactly `date`, `classId`, and `lessonId` in each lesson link.
- NEVER add or invent `studentAccountId`.
- NEVER move authorization/composition ownership out of Lesson Context or write state from the presentation/test surface.

## Scope
### In scope

- `src/routes/calendar/+page.svelte`: render a non-nested lesson anchor alongside the existing calendar day navigation.
- `tests/routes/calendar-navigation.test.ts`: isolated DB-backed route/SSR/navigation proof for AC-008.
- `.protocols/TASK-039-T3-FT-003-W10/` and `.tasks/TASK-039-T3-FT-003-W10/` execution evidence.

### Out of scope

- All forbidden paths in the task card, including the calendar loader and Lesson Context route/module.
- TASK-038 and completed prerequisite artifacts.
- Memory Bank redesign/sync, verifier lifecycle, `/verify`, `/red-verify`, and `/mb-sync`.

## Proposed changes
### Touched areas
- `src/routes/calendar/+page.svelte` — add exact shared lesson-link construction and valid markup/CSS.
- `tests/routes/calendar-navigation.test.ts` — prove the accepted link and follow-through independently from TASK-037's protected-load matrix.

### Preflight-confirmed change surface
- Expected hints kept: yes; both card `touched_files` remain the only production/test files.
- Additional same-outcome files/areas and rationale: none.
- Hard `write_boundary` present and satisfied: yes.
- `forbidden_scope` / stop-condition check: clear.

## Applicable quality gates
- [ ] `npm run check` — proves Svelte/TypeScript correctness for the changed route/test surface.
- [ ] `npm run test` — proves the complete project test suite and task claim.
- [ ] `npm run build` — proves the SvelteKit production build.
- [ ] `git diff --check` — proves no whitespace errors in the changed diff.

## Claim-linked RED / GREEN (T2/T3)
- applicability: applicable
- accepted claim locator(s): `FT-003-AC-008`, `REQ-005`, `REQ-006`, `REQ-014`
- planned test/probe and environment: `npm run test -- tests/routes/calendar-navigation.test.ts` in Vitest Node, using the real calendar server load with an isolated in-memory DB, Svelte SSR, and the existing Lesson Context boundary/route.
- observable RED: the rendered DB-backed lesson has no `/lesson-context` anchor with the exact three-key query identity.
- corresponding GREEN: the unchanged/claim-equivalent probe follows the rendered href, observes shared Lesson Context identity, and confirms the in-memory DB snapshot is unchanged.
- T3 isolation, safe rerun, cleanup, and permission boundary: disposable in-memory DB per test; close it after each test; no external side effect; only task write boundary plus workflow artifacts.

## MB-SYNC handoff / owner

Scheduler or explicit standalone owner performs sync after verification/status
decision. `/exe` only records handoff notes.

- [ ] Owner identified: scheduler | explicit standalone owner | human | none
- [ ] `.memory-bank/` docs needing update (WHY/WHERE, no pseudocode): feature/task evidence owner after `/verify` and T3 semantic closure
- [ ] `.memory-bank/index.md` router update needed: no
- [ ] RTM update in `.memory-bank/requirements.md` needed: feature/lifecycle owner after verification
- [ ] Task registry/status update owner: lifecycle owner after `/verify` and `/red-verify`
- [ ] Changelog update owner: wave/feature sync owner

## Definition of done

Scoped implementation, claim-linked RED/GREEN, required `check`/`test`/`build`/diff gates, actual-file evidence, and a fresh `/verify TASK-039-T3-FT-003-W10` handoff are recorded without final lifecycle closure.
