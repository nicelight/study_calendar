---
description: Execution plan for TASK-037-T3-FT-003-W9.
status: active
---
# Plan — TASK-037-T3-FT-003-W9

## Goal

Serve current DB-backed lessons for an authorized class through protected SSR
`/calendar` without using the public-home fixture.

## Non-goals

- Do not change `/`, `src/lib/calendar.ts`, or `/lesson-context`.
- Do not add lesson-context links, client-supplied authorization, persistence writes, or collaboration/progress/finance UI.

## Inputs / source specs
- Task record: `.memory-bank/tasks/TASK-037-T3-FT-003-W9.task.json`
- Feature/AC: `.memory-bank/features/FT-003-calendar-and-lesson-context.md#ft-003-ac-007--authorized-calendar-uses-db-backed-class-lessons`
- REQs: `REQ-005`, `REQ-014`, `REQ-016`
- Boundary and authorization: `.memory-bank/contracts/boundary-map.md#calendar-and-membership-query-boundary`, `.memory-bank/contracts/access-control.md#accepted-permission-matrix`.

## Constraints / invariants (MUST / NEVER)
- MUST resolve the session actor and authorized class scope server-side before returning lesson data.
- MUST consume `getAuthorizedClassScope` and `getLessons` only through Center & Scheduling's public boundary.
- MUST show current `LessonView` identity/date/status and DB-derived calendar geometry.
- NEVER reuse public fixture weekdays in authenticated `/calendar`, read persistence, expose `studentAccountIds`, or mutate state.

## Scope

### In scope

- `src/routes/calendar/+page.server.ts` — thin protected load.
- `src/routes/calendar/+page.svelte` — presentation of server-returned class and lesson facts.
- `tests/routes/calendar-authorized.test.ts` — disposable SSR/HTTP role/denial matrix.

### Out of scope

- Public home, calendar helper, Center & Scheduling, Lesson Context, and downstream domains.

## Preflight-confirmed change surface
- Expected hints kept: all three advisory paths.
- Additional same-outcome files/areas and rationale: none expected.
- Hard `write_boundary` present and satisfied: yes.
- `forbidden_scope` / stop-condition check: clear; current queries eliminate the need for a new authorization or persistence contract.

## Applicable quality gates
- [ ] `npm run check` — Svelte/TypeScript correctness for the new route.
- [ ] `npm run test` — real SSR/HTTP authorization matrix plus project regression suite.
- [ ] `npm run build` — generated SvelteKit route integration.
- [ ] `git diff --check` — whitespace integrity.

## Claim-linked RED / GREEN (T2/T3)
- applicability: applicable.
- accepted claim locator(s): `FT-003-AC-007 / REQ-005 / REQ-014 / REQ-016`.
- planned test/probe and environment: fresh `:memory:` composition root, four permitted roles, and each named denied branch; render the actual Svelte component from the actual route load.
- observable RED: `/calendar` route does not yet exist, so an authenticated calendar cannot render DB lesson facts.
- corresponding GREEN: real route returns only authorized scope/current lesson facts for Admin, assigned Teacher, permitted Student, and linked Parent; anonymous/revoked/cross-center/non-member/unassigned/removed fail before rendering lessons and state snapshots match.
- accepted not-applicable reason and alternative proof: n/a.
- T3 isolation, safe rerun, cleanup, and permission boundary: each test creates/closes its own in-memory DB; only reads occur during probes; source review excludes direct DB access and client authorization.

## MB-SYNC handoff / owner
- [ ] Owner identified: top-level lifecycle owner after `/verify` and `/red-verify`.
- [ ] Explicit standalone owner basis recorded if manual closure is expected: n/a.
- [ ] `.memory-bank/` docs needing update (WHY/WHERE, no pseudocode): none; the accepted route and boundary are already documented.
- [ ] `.memory-bank/index.md` router update needed: no.
- [ ] RTM update in `.memory-bank/requirements.md` needed: lifecycle owner after verification.
- [ ] Task registry/status update owner: `/exe` started task; lifecycle owner closes only after required gates.
- [ ] Changelog update owner: lifecycle/MB-SYNC owner at wave boundary.

## Definition of done

Production route and focused matrix are implemented inside the hard boundary,
claim-specific RED/GREEN is recorded, required gates pass, and handoff routes
to `/verify TASK-037-T3-FT-003-W9` without closing the task.
