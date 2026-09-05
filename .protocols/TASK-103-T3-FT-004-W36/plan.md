---
description: Execution plan for TASK-103 Collaboration browser UI.
status: active
---
# Plan — TASK-103-T3-FT-004-W36

## Goal

Render the complete accepted Collaboration experience in `/lesson-context`
using the existing server projection and named form actions, with URL-persisted
branch selection and disposable browser proof.

## Non-goals

- No server route, Collaboration module, database, API, or authorization change.
- No new top-level page, frontend-wide store, or alternate mutation transport.
- No deletion or semantic change to comments, reactions, messages, branches, or
  unrelated feature surfaces.

## Inputs / source specs

- Task record: `.memory-bank/tasks/TASK-103-T3-FT-004-W36.task.json`
- Task index: `.memory-bank/tasks/index.json`
- Feature: `.memory-bank/features/FT-004-day-collaboration.md`
- REQ IDs: `REQ-006`, `REQ-007`, `REQ-008`, `REQ-014`

## Richer execution inputs

- Source Artifacts: Collaboration Browser Surface, boundary map, access-control,
  system architecture, core domain, lifecycle map.
- Normative Inputs: direct task-linked canonical paths and current Revision 2
  planning approval `...FT-004-BROWSER-R5...`.
- Verification Targets: AC-001..AC-005, claim-linked Playwright scenarios,
  route/component tests, reload persistence and cleanup proof.

## Constraints / invariants (MUST / NEVER)

- MUST use only the existing `/lesson-context` projection and named actions.
- MUST keep selected branch root in URL state so SSR/reload reproduces it.
- MUST render server-provided labels and timestamps without deriving authority
  from browser fields.
- MUST use `scripts/run-disposable-e2e.mjs` with a separate `tmp/*.db` and
  failure-safe exact cleanup.
- NEVER touch the forbidden route server, backend modules, database platform,
  real `study-calendar.db`, disposable runner, or Playwright config.

## Scope

### In scope

- `src/routes/lesson-context/+page.svelte`
- route/component tests under `tests/lesson-context/` and `tests/routes/`
- `e2e/ft-004-collaboration-ui.spec.ts`
- exact disposable `tmp/ft-004-collaboration-ui.db` runtime artifact only

### Out of scope

- `src/routes/lesson-context/+page.server.ts`
- `src/lib/server/modules/**`
- `src/lib/server/platform/database.ts`
- `scripts/run-disposable-e2e.mjs`, `playwright.config.ts`, real DB

## Proposed changes

### Touched areas (hypotheses OK)

- `src/routes/lesson-context/+page.svelte` — render field collaboration,
  reactions, common/threaded chat, branch navigation and form actions.
- `tests/lesson-context/` — prove server-data rendering and URL-state/source
  constraints without adding a new route contract.
- `tests/routes/` — prove the UI uses the existing named action transport and
  does not introduce authority inputs.
- `e2e/ft-004-collaboration-ui.spec.ts` — disposable real-browser CRUD,
  persistence, branching, and privacy/cleanup proof.

### Preflight-confirmed change surface

- Expected hints kept: yes; all changes support the single UI/browser outcome.
- Additional same-outcome files/areas and rationale: none at preflight.
- Hard `write_boundary` present and satisfied: not set.
- `forbidden_scope` / stop-condition check: clear; server projection/actions
  already provide the required accepted contract.

## Applicable quality gates

- [x] `npm run check` — Svelte/TypeScript validity for the route UI.
- [x] `npm run build` — production compilation of the route.
- [x] `npm run test` — project-native regression suite and route rendering.
- [x] `git diff --check` — whitespace integrity.
- [x] `node .memory-bank/scripts/mb-lint.mjs` — Memory Bank integrity.
- [x] `node .memory-bank/scripts/mb-doctor.mjs --strict` — strict workflow readiness.
- [x] `node scripts/run-disposable-e2e.mjs --database tmp/ft-004-collaboration-ui.db --spec e2e/ft-004-collaboration-ui.spec.ts` — required isolated browser proof and cleanup.

## Claim-linked RED / GREEN (T2/T3)

- applicability: applicable to all five task-owned claims.
- accepted claim locator(s): `FT-004-AC-001`..`FT-004-AC-005`,
  `REQ-006`, `REQ-007`, `REQ-008`, `REQ-014`.
- planned test/probe and environment: route rendering/source tests plus the
  real named-action browser scenario in an owned disposable SQLite database.
- observable RED (Attempt 2): the fresh verifier report records missing
  message/comment reaction rendering, fragment-only branch links, flat
  arbitrary-depth threads, and the absent required UI spec.
- corresponding GREEN (Attempt 2): each accepted control and
  persistence/privacy behavior is exercised through server-rendered
  projection and named forms, with browser assertions and state snapshots for
  denied operations.
- accepted not-applicable reason and alternative proof: none.
- T3 isolation, safe rerun, cleanup, and permission boundary: runner-owned
  server and exact `tmp/ft-004-collaboration-ui.db` plus SQLite sidecars in
  `finally`; no real DB, global reset, or client authority is used.

## Fan-out plan (if needed)

- None; this delegated Implementer executes the selected task sequentially.

## MB-SYNC handoff / owner

Scheduler or explicit standalone owner performs sync after verification/status
decision. `/exe` only records handoff notes.

Checklist:

- [x] Owner identified: scheduler / lifecycle owner after `/verify` and `/red-verify`.
- [x] Explicit standalone owner basis recorded if manual closure is expected: n/a.
- [ ] `.memory-bank/` docs needing update (WHY/WHERE, no pseudocode): feature
  navigation/coverage after task closure, owned by sync/lifecycle workflow.
- [ ] `.memory-bank/index.md` router update needed: no evidence yet.
- [ ] RTM update in `.memory-bank/requirements.md` needed: no evidence yet.
- [ ] Task registry/status update owner: lifecycle owner; this execution keeps
  `TASK-103` `in_progress`.
- [ ] Changelog update owner: sync/lifecycle workflow if broader durable state
  changes.

## Definition of done

- UI implementation and browser proof are complete within scope.
- Claim-linked RED/GREEN evidence and all required gates are recorded by `/exe`.
- Current-attempt handoff points to `/verify TASK-103-T3-FT-004-W36`, with no
  closure or dependent-task promotion by this execution.
