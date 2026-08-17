---
description: Execution plan for TASK-038-T3-FT-003-W10.
status: active
---
# Plan — TASK-038-T3-FT-003-W10

## Goal

Render one existing `/lesson-context` anchor per authorized calendar lesson
with exact `date`, `classId`, `lessonId`, and only server-authorized optional
`studentAccountId` context.

## Non-goals

- No change to `/calendar` server load, public `/` fixture, or `src/lib/calendar.ts`.
- No change to the existing Lesson Context route/module or its authorization.
- No persistence, client-selected role/class/student authorization, or downstream
  collaboration/progress/finance work.

## Inputs / source specs

- Task record: `.memory-bank/tasks/TASK-038-T3-FT-003-W10.task.json`
- Feature: `FT-003-AC-008`
- REQs: `REQ-005`, `REQ-006`, `REQ-014`
- Governing specs: Calendar and Membership Query Boundary; Access Control;
  Browser/API path; System Architecture request flow; Lifecycle Map; Testing
  Strategy; tier policy.

## Constraints / invariants (MUST / NEVER)

- MUST consume only the server-rendered lesson identity and authorized scope.
- MUST target existing `/lesson-context` using its current query contract.
- MUST preserve exact date/class/lesson identity and omit an unpermitted student.
- NEVER modify the calendar server load, Lesson Context, or a server module.
- NEVER treat a client-provided role, center, class, lesson, or student as authority.

## Scope

### In scope

- `src/routes/calendar/+page.svelte`
- `tests/routes/calendar-navigation.test.ts`
- Task-owned protocol and evidence artifacts.

### Out of scope

All paths in the task `forbidden_scope`, especially the public fixture, calendar
load, Lesson Context route/module, Center & Scheduling, Collaboration, Learning
Progress, and Financial Ledger.

## Proposed changes

### Touched areas

- `src/routes/calendar/+page.svelte` — add a serializable lesson-context href
  helper and render each lesson fact as the navigation anchor.
- `tests/routes/calendar-navigation.test.ts` — isolated SSR/route probe for
  query preservation, existing route reauthorization, denial minimization, and
  state equality.

### Preflight-confirmed change surface

- Expected hints kept: both task-advisory files only.
- Additional same-outcome files/areas: task-owned protocol/evidence only.
- Hard `write_boundary` present and satisfied: yes.
- `forbidden_scope` / stop-condition check: clear.

## Applicable quality gates

- [ ] `npm run check` — Svelte/TypeScript integration of the calendar change.
- [ ] `npm run test` — targeted navigation behavior and repository regression.
- [ ] `npm run build` — SSR route build.

## Claim-linked RED / GREEN (T2/T3)

- applicability: applicable.
- accepted claim locator(s): FT-003-AC-008 / REQ-005 / REQ-006 / REQ-014.
- planned test/probe and environment: disposable in-memory CompositionRoot,
  real calendar load plus SSR render, then existing Lesson Context load.
- observable RED: rendered calendar has no `/lesson-context` anchor with the
  exact identity.
- corresponding GREEN: real rendered anchor preserves the identity; existing
  route returns permitted context and denies guessed student context without
  private data or state mutation.
- T3 isolation, safe rerun, cleanup, and permission boundary: isolated SQLite
  database closed after each test; only seeded sessions and server routes run.

## MB-SYNC handoff / owner

- Owner identified: none; parent lifecycle workflow owns verification/closure.
- `.memory-bank/` update required by this execution: task status only.
- Task registry/status update owner: `/exe` for `ready -> in_progress`; later
  verifier/lifecycle owner for final state.

## Definition of done

The scoped anchor and isolated test are implemented, RED/GREEN evidence and
required gates are recorded, and the task remains `in_progress` for `/verify`
then T3 `/red-verify`.
