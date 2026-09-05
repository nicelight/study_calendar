---
description: Execution plan for TASK-102-T3-FT-004-W35.
status: active
---
# Plan — TASK-102-T3-FT-004-W35

## Goal
Make `/lesson-context` expose the complete server-composed Collaboration
projection and five named Collaboration actions while migrating every existing
Lesson Context form to a named action in the same route change.

## Non-goals
- Collaboration UI controls owned by TASK-103.
- New route/API, frontend store, persistence schema, or Collaboration writer.
- Changes to forbidden modules, historical TASK-012/TASK-016/TASK-017 cards, or
  unrelated FT-002/FT-005/FT-006 surfaces.

## Inputs / source specs
- Task record: `.memory-bank/tasks/TASK-102-T3-FT-004-W35.task.json`
- Task index: `.memory-bank/tasks/index.json`
- Feature/Epic: `.memory-bank/features/FT-004-day-collaboration.md`
- REQ IDs: `REQ-006`, `REQ-007`, `REQ-008`, `REQ-014`
- Direct contract: `.memory-bank/contracts/collaboration-browser-surface.md`
- Boundaries: `.memory-bank/contracts/boundary-map.md`,
  `.memory-bank/contracts/access-control.md`

## Constraints / invariants
- MUST resolve actor and class/lesson/student scope server-side before every
  Collaboration read or write.
- MUST use Identity & Access only for bounded participant labels selected by
  Collaboration after authorization.
- MUST keep `/api/lesson-context` GET-only and Collaboration as sole writer.
- MUST migrate existing homework, attendance, material, and payment forms to
  named actions with no remaining default action.
- MUST use isolated/disposable SQLite and preserve state before/after denials.
- NEVER trust client role, center, author, scope, or student authority fields.

## Scope
### In scope
- Identity & Access bounded `getParticipantLabels` projection.
- Collaboration browser projection and labels through its public boundary.
- Lesson Context projection composition and five named Collaboration actions.
- Named migration of existing Lesson Context action callers and focused tests.

### Out of scope
- UI rendering of Collaboration content; that is TASK-103.
- Database schema/platform changes and direct route SQL.
- Production database or external server use.

## Preflight-confirmed change surface
- Expected hints kept: existing identity-access/collaboration/lesson-context
  public files, Lesson Context route/page, route and module tests, and task
  disposable evidence.
- Additional same-outcome files/areas: existing Lesson Context route tests that
  still call `actions.default` must migrate to named action exports so the
  route contract remains executable.
- Hard `write_boundary` present and satisfied: no hard boundary set.
- `forbidden_scope` / stop-condition check: clear at start.

## Applicable quality gates
- [ ] `npm run check` — Svelte/TypeScript correctness.
- [ ] `npm run build` — production route/build correctness.
- [ ] `npm run test` — project regression and task-scoped integration checks.
- [ ] `git diff --check` — diff hygiene.
- [ ] `node .memory-bank/scripts/mb-lint.mjs` — durable documentation hygiene.
- [ ] `node .memory-bank/scripts/mb-doctor.mjs --strict` — strict readiness.
- [ ] disposable route/browser transport gate — exact task browser proof path,
  if the existing runner/spec can be completed within this task.

## Claim-linked RED / GREEN (T2/T3)
- applicability: applicable.
- accepted claim locator(s): `FT-004-AC-005`; Collaboration Browser Surface
  `#server-composed-projection`; `#authorized-mutation-transport`; bounded
  Identity & Access participant-label projection; named-action migration target.
- planned test/probe and environment: isolated in-memory SQLite route/module
  integration tests, plus disposable browser transport smoke.
- observable RED: current route exposes only `actions.default`, forms post to
  default, Collaboration projection is not composed by Lesson Context, and no
  named route transport exists.
- corresponding GREEN: named action registry and all form targets are present;
  server-composed projection contains required scoped content and labels; all
  five mutations delegate after server authorization and preserve denied state.
- T3 isolation, safe rerun, cleanup, and permission boundary: in-memory or
  exact `tmp/ft-004-collaboration-transport.db`; no `study-calendar.db`; test
  fixtures cleaned in `finally`; no external server reuse.

## MB-SYNC handoff / owner
- Owner identified: none in this delegated execution; leave lifecycle
  `in_progress` and hand off to `/verify`, then `/red-verify` and lifecycle
  owner according to T3 policy.
- `.memory-bank/` docs needing update: likely FT-004 navigation only if the
  final route evidence is a durable feature-level link; no spec change planned.
- `.memory-bank/index.md` router update needed: no, unless durable doc routing
  changes.
- RTM update in `.memory-bank/requirements.md` needed: no, unless the accepted
  evidence requires a lifecycle reconciliation.
- Task registry/status update owner: current execution owns only `ready ->
  in_progress`; closure remains external.
- Changelog update owner: wave/feature sync owner.

## Definition of done
Production implementation and claim-linked supporting evidence are complete,
all required native gates are recorded, current handoff points to exact
receipts, lifecycle remains `in_progress`, and `/verify TASK-102-T3-FT-004-W35`
is the next functional owner.
