---
description: Execution plan for TASK-035-T3-FT-002-W19.
status: active
---
# Plan — TASK-035-T3-FT-002-W19

## Goal
Serve a small SSR class entry shell at `/center/{centerId}/class/{classId}` only to the server-authorized Admin, Teacher, Student, or Parent in the matching class scope.

## Non-goals
- Do not alter `/admin/{centerId}`.
- Do not add Lesson Context, calendar, lessons, personal day data, HTTP APIs, role mutation, persistence, or direct database access.

## Inputs / source specs
- Task record: `.memory-bank/tasks/TASK-035-T3-FT-002-W19.task.json`
- Task index: `.memory-bank/tasks/index.json`
- Feature/Epic: `FT-002` / `EP-001`
- REQ IDs: `REQ-003`, `REQ-014`

## Richer execution inputs (optional)
- Source Artifacts: `FT-002-AC-011`, Access Control permission matrix, Center & Scheduling query boundary, and Authentication Transport browser/API path.
- Normative Inputs: System Architecture, Boundary Map, Access Control, Authentication Transport, and testing strategy.
- Verification Targets: four-role SSR/HTTP success plus unauthenticated, cross-center, non-member, unassigned, and removed-assignment denials with unchanged read state.

## Constraints / invariants (MUST / NEVER)
- MUST: resolve the request session through existing request Actor Context and use the existing `getAuthorizedClassScope` public query; compare returned and path center/class IDs.
- MUST: return only serializable role/class presentation facts from the server load.
- NEVER: authorize in the component, trust client scope/role fields, query persistence from the route, or modify Admin/FT-003/downstream sources.

## Scope
### In scope
- `src/routes/center/[centerId]/class/[classId]/+page.server.ts`
- `src/routes/center/[centerId]/class/[classId]/+page.svelte`
- `tests/routes/center-class-entry.test.ts`

### Out of scope
- `src/routes/admin/[centerId]/`, Lesson Context/calendar, all direct database/module implementations, and downstream projections.

## Proposed changes
### Touched areas (hypotheses OK)
- protected route server load — adapt the request to Actor Context and Center & Scheduling `AuthorizedClassScope`.
- protected route component — SSR-render only returned role/class context.
- isolated route test — use disposable in-memory data for the required role/denial matrix and source boundary assertions.

### Preflight-confirmed change surface
- Expected hints kept: all three task-card paths.
- Additional same-outcome files/areas and rationale: none expected.
- Hard `write_boundary` present and satisfied: yes.
- `forbidden_scope` / stop-condition check: clear; the accepted query already exists and no widened contract is needed.

## Applicable quality gates
- [ ] `npm run check` — Svelte/TypeScript route and component correctness.
- [ ] focused route matrix test — AC-011 SSR/HTTP role and denial behavior.
- [ ] `npm run test` — regressions including existing Admin and TASK-032 tests.
- [ ] `npm run build` — production SSR route build.
- [ ] `git diff --check` — whitespace/integrity boundary.

## Claim-linked RED / GREEN (T2/T3)
- applicability: applicable
- accepted claim locator(s): `FT-002-AC-011 / REQ-003 / REQ-014`
- planned test/probe and environment: first use a disposable Vite/SvelteKit HTTP server with an isolated SQLite filename to prove the absent protected route is 404; then run a disposable in-memory `RequestEvent` matrix against the new server load and SSR component.
- observable RED: current `/center/center-own/class/class-own` receives 404, so no protected shell exists.
- corresponding GREEN: all four server-authorized role fixtures receive status 200-equivalent load data and an SSR body containing only role/class context; unauthenticated redirects, and mismatched/non-member/unassigned/removed requests throw the expected denial before body render and preserve state.
- accepted not-applicable reason and alternative proof: n/a.
- T3 isolation, safe rerun, cleanup, and permission boundary: the pre-change HTTP server uses a unique `/tmp` `DATABASE_URL` and is terminated after its one request; test fixtures use `:memory:` roots closed in `afterEach`, with no production DB or external service.

## MB-SYNC handoff / owner
Scheduler or explicit standalone owner performs sync after verification/status decision. `/exe` only records handoff notes.

Checklist:
- [x] Owner identified: none — this delegated Implementer leaves the T3 task for independent verification.
- [x] Explicit standalone owner basis recorded if manual closure is expected: n/a
- [x] `.memory-bank/` docs needing update (WHY/WHERE, no pseudocode): none expected; the accepted route is already registered.
- [x] `.memory-bank/index.md` router update needed: no
- [x] RTM update in `.memory-bank/requirements.md` needed: verification/sync owner decides after task closure.
- [x] Task registry/status update owner: `/exe` owns only `ready -> in_progress`; verifier/lifecycle owner owns closure.
- [x] Changelog update owner: lifecycle sync owner.

## Definition of done
- One bounded route and focused isolated evidence satisfy AC-011 without changing forbidden sources; all required gates and RED/GREEN receipts are recorded for `/verify`, then per-task `/red-verify`.
