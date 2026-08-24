---
description: Execution plan for TASK-097 typed Statistics sorting.
status: active
---
# Plan — TASK-097-T3-FT-007-W31

## Goal

Every authorized Statistics registry column sorts in both typed directions and exposes its active direction.

## Non-goals

- Re-proving or changing TASK-096 composition/cardinality/scope.
- Provider, Lesson Context, server load, runner, Playwright configuration, or persistent database changes.

## Scope

### In scope

- `src/routes/statistics/+page.svelte`
- `tests/routes/ft-007-statistics-sorting.test.ts`
- `e2e/ft-007-statistics.spec.ts`
- `tmp/ft-007-statistics.db` only as runner-owned disposable state

### Out of scope

- Every path in the task `forbidden_scope`, especially `study-calendar.db` and provider modules.

## Preflight-confirmed change surface

- Expected hints kept: all three implementation/test paths are task-card entries.
- Additional same-outcome files: task-owned `.protocols/TASK-097-T3-FT-007-W31/` and `.tasks/TASK-097-T3-FT-007-W31/` evidence only.
- Hard `write_boundary` present and satisfied: yes.
- `forbidden_scope` / stop-condition check: clear.

## Applicable quality gates

- [x] `npm run check` — Svelte/TypeScript validity.
- [x] `npm run test` — route and regression behavior.
- [x] `npm run build` — production SvelteKit build.
- [x] `node scripts/run-disposable-e2e.mjs --database tmp/ft-007-statistics.db --spec e2e/ft-007-statistics.spec.ts` — owned-server disposable browser proof and cleanup.
- [x] `git diff --check` — patch integrity.
- [x] `node scripts/mb-lint.mjs` — Memory Bank integrity.
- [x] `node scripts/mb-doctor.mjs --strict` — required strict readiness gate.

## Claim-linked RED / GREEN (T2/T3)

- applicability: applicable.
- accepted claim locator: `FT-007-AC-004 / REQ-017` and `statistics-projection.md#sorting-and-presentation`.
- planned test/probe and environment: task-local SSR route test first; after production change, the same test plus owned-server disposable Playwright proof using `tmp/ft-007-statistics.db`.
- observable RED: current headers have no direction control and registry order never changes by typed text/date/percentage/count values.
- corresponding GREEN: each registry header has a visible active direction and toggles typed ordering; Teacher classes compare the first rendered ordered class.
- T3 isolation, safe rerun, cleanup, and permission boundary: the browser command uses TASK-079's runner with a new owned server and the exact disposable DB; its `finally` cleanup must remove it and it may never open `study-calendar.db` or reuse a server.

## Definition of done

- Fresh task-owned RED and claim-equivalent GREEN are recorded; all task gates pass; handoff routes to fresh `/verify TASK-097-T3-FT-007-W31` without lifecycle closure.
