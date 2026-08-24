---
description: Execution plan for TASK-098-T3-FT-007-W31.
status: active
---
# Plan — TASK-098-T3-FT-007-W31

## Goal
Provide `/profile` as a protected, server-resolved, read-only view and prove the four canonical shell route identities.

## Non-goals
- No Profile mutations, account recovery, provider/password/membership controls, persistence, aliases, redirects, or logout endpoint changes.
- No Home/Classes/Statistics provider behavior changes.

## Inputs / source specs
- Task record: `.memory-bank/tasks/TASK-098-T3-FT-007-W31.task.json`
- Task index: `.memory-bank/tasks/index.json`
- Feature/Epic: `.memory-bank/features/FT-007-navigation-and-statistics.md#FT-007-AC-007`
- REQ IDs: `REQ-014`, `REQ-017`

## Constraints / invariants (MUST / NEVER)
- MUST: use the current-actor Identity & Access query and server actor context; expose only `fullName`, `role`, `registeredAt`.
- MUST: use the disposable browser runner and preserve `study-calendar.db`.
- NEVER: access Identity & Access persistence from the route, mutate Profile data, or alter protected destination/provider behavior.

## Scope
### In scope
- `src/routes/profile/` route adapter and page.
- Focused route and disposable browser probes.

### Out of scope
- Every path in the task `forbidden_scope`, including Identity & Access, Center & Scheduling, runner, and real database.

## Proposed changes
### Touched areas (hypotheses OK)
- `src/routes/profile/` — protected read-only adapter/page.
- `tests/routes/ft-007-profile-routes.test.ts` — claim-scoped server/render/static-boundary test.
- `e2e/ft-007-profile-routes.spec.ts` — owned-server disposable browser matrix.

### Preflight-confirmed change surface
- Expected hints kept: all implementation and probe paths above; `src/routes/+layout.svelte` is already canonical and will remain unchanged unless a task-owned correction is required.
- Additional same-outcome files/areas and rationale: protocol and `.tasks` evidence are workflow-owned.
- Hard `write_boundary` present and satisfied: yes.
- `forbidden_scope` / stop-condition check: clear.

## Applicable quality gates
- [ ] `npm run check` — validates Svelte/TypeScript route integration.
- [ ] `npm run test` — project-native regression suite.
- [ ] `npm run build` — production build.
- [ ] `node scripts/run-disposable-e2e.mjs --database tmp/ft-007-profile-routes.db --spec e2e/ft-007-profile-routes.spec.ts` — owned-server isolated browser proof.
- [ ] `git diff --check` — whitespace correctness.
- [ ] `node scripts/mb-lint.mjs` and `node scripts/mb-doctor.mjs --strict` — required task gates.

## Claim-linked RED / GREEN (T2/T3)
- applicability: applicable.
- accepted claim locator(s): `FT-007-AC-007 / REQ-014 / REQ-017`.
- planned test/probe and environment: focused route unit test plus disposable Playwright database under `tmp/`.
- observable RED: `/profile` route does not exist, so focused Profile route probe fails before production code.
- corresponding GREEN: route consumes current-actor query only, renders exact fields only, fails closed for anonymous/revoked requests, and browser proof validates exact shell destinations/logout/cleanup.
- accepted not-applicable reason and alternative proof: none.
- T3 isolation, safe rerun, cleanup, and permission boundary: runner starts its own server against `tmp/ft-007-profile-routes.db`, cleans it in `finally`, and does not touch `study-calendar.db`.

## MB-SYNC handoff / owner
- Owner identified: scheduler.
- Explicit standalone owner basis recorded if manual closure is expected: n/a.
- `.memory-bank/` docs needing update: no new design knowledge; task lifecycle remains verifier/scheduler-owned.
- `.memory-bank/index.md` router update needed: no.
- RTM update in `.memory-bank/requirements.md` needed: scheduler at closure if applicable.
- Task registry/status update owner: `/exe` starts only; `/verify` and scheduler own closure.
- Changelog update owner: scheduler/wave sync.

## Definition of done
- Implementation plus claim-linked RED/GREEN and all listed gates are recorded; task remains `in_progress` for `/verify TASK-098-T3-FT-007-W31`.
