---
description: Execution plan for TASK-001-T3-FT-000-W0.
status: active
---
# Plan — TASK-001-T3-FT-000-W0

## Goal

Bootstrap one executable SvelteKit server with one composition root, one
configured shared-database path, the Identity & Access and Center & Scheduling
public seams, and isolated Foundation probes without product behavior.

## Non-goals

- Product calendar, collaboration, learning-progress, or financial behavior.
- Future empty capability slices, event bus, second server, cache, or shared cross-slice repository.
- Final Foundation gate, task closure, `/verify`, `/red-verify`, `/mb-sync`, or dependent promotion.

## Inputs / source specs

- Task record: `.memory-bank/tasks/TASK-001-T3-FT-000-W0.task.json`
- Task index: `.memory-bank/tasks/index.json`
- Feature: `.memory-bank/features/FT-000-foundation.md`
- REQ IDs: `REQ-000`
- Plan: `.memory-bank/tasks/plans/IMPL-FT-000.md`

## Richer execution inputs

- Architecture: `.memory-bank/architecture/system-architecture.md#accepted-target`, `#composition-and-request-data-flow`
- Boundaries: `.memory-bank/contracts/boundary-map.md#modules`, `#actor-context-boundary`, `#calendar-and-membership-query-boundary`
- Persistence/access/testing/runbook: `.memory-bank/domains/core-domain.md#persistence-and-transaction-rules`, `.memory-bank/contracts/access-control.md`, `.memory-bank/testing/strategy.md#risk-based-checks`, `.memory-bank/runbooks/mvp-verification.md#foundation-smoke-path`
- Verification Targets: task record

## Constraints / invariants

- MUST use one SvelteKit server, one shared database source of truth, and one composition root.
- MUST keep actor and scope authorization server-side and writes behind owning public boundaries.
- MUST isolate disposable fixture state, clean it up, and make probes safely rerunnable.
- NEVER implement product behavior or write forbidden future capability roots.

## Scope

### In scope

- Project shell/configuration, server hook/routes, composition root, platform seam, Identity & Access seam, Center & Scheduling seam, and focused Foundation tests/evidence.

### Out of scope

- `.agents/skills/`, `.claude/`, `AGENTS.md`, `SVELTE_RULES.md`, all future product slice roots, product feature docs/tasking, and final Foundation gate work.

## Proposed changes

### Touched areas

- `package.json`, SvelteKit/Vite/TypeScript/app shell — executable project baseline.
- `src/hooks.server.ts`, `src/routes/`, `src/lib/server/composition-root.ts` — one request/composition path.
- `src/lib/server/platform/` — shared database/configuration seams.
- `src/lib/server/modules/identity-access/`, `src/lib/server/modules/center-scheduling/` — only accepted public boundary roots.
- `tests/foundation/` — isolated roundtrip, authorization seam, and no-partial transaction probes.
- `.protocols/TASK-001-T3-FT-000-W0/`, `.tasks/TASK-001-T3-FT-000-W0/` — execution evidence.

### Preflight-confirmed change surface

- Expected hints kept: yes; exact adapter/test filenames remain execution-level choices.
- Additional same-outcome files/areas: none known at start.
- Hard `write_boundary` present and satisfied: not set.
- `forbidden_scope` / stop-condition check: clear.

## Applicable quality gates

- [x] `npm run check` — project-native SvelteKit/type check; exit `0`, 0 errors and 0 warnings.
- [x] `npm run build` — executable production build; exit `0`.
- [x] `npm run test` — Foundation-focused isolated probes; exit `0`, 1 file and 4 tests passed.

## Claim-linked RED / GREEN (T2/T3)

- applicability: applicable; three task-owned proof obligations are explicit and all have current-attempt evidence.
- claim 1: `REQ-000` project-native baseline — RED is the recorded absence of `package.json`/scripts; GREEN is all three required npm gates passing.
- claim 2: `.memory-bank/architecture/system-architecture.md#composition-and-request-data-flow` — RED is absence of a composition/request path; GREEN is a focused harness observing one composition root and the two accepted boundary calls without cross-slice table writes.
- claim 3: `.memory-bank/domains/core-domain.md#persistence-and-transaction-rules` — RED is absence of a fixture roundtrip/failure probe; GREEN is state-before/state-after equality after failed binding/transaction with cleanup and safe rerun.
- T3 isolation, safe rerun, cleanup, and permission boundary: each test uses fresh in-memory SQLite and closes it; no credentials or real provider calls; tests invoke only the two allowed public seams.

## Fan-out plan

- None; agent spawning is forbidden for this execution.

## MB-SYNC handoff / owner

Scheduler/lifecycle owner remains responsible for `/verify`, `/red-verify`, task closure, and `/mb-sync`. `/exe` records evidence only.

## Definition of done

Implementation is handed to `/verify` with all required commands run, current-attempt RED/GREEN evidence recorded in `progress.md` and `.tasks/TASK-001-T3-FT-000-W0/execution-evidence.md`, actual files listed, and no lifecycle closure performed.
