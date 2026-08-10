---
description: Execution plan for TASK-017-T3-FT-004-W6.
status: active
---
# Plan — TASK-017-T3-FT-004-W6

## Goal

Prove and, only if required, implement center-lifecycle isolation for
threaded messages, arbitrary replies, message reactions, common feed, and
recent branch tabs while preserving the accepted Collaboration behavior.

## Non-goals

- Do not edit, re-tier, close, or reuse TASK-012.
- Do not edit TASK-016 or claim its comment/field-reaction outcome.
- Do not delete retained messages, cap reply depth, add a second writer, or
  change the public boundary, modular-monolith graph, or shared database.
- Do not run `/verify`, `/red-verify`, `/mb-sync`, or lifecycle closure.

## Inputs / source specs

- Task record: `.memory-bank/tasks/TASK-017-T3-FT-004-W6.task.json`
- Task index: `.memory-bank/tasks/index.json`
- Feature/Epic: `.memory-bank/features/FT-004-day-collaboration.md`,
  `.memory-bank/epics/EP-003-day-collaboration.md`
- REQ IDs: `REQ-006`, `REQ-008`, `REQ-014`
- Direct specs: `.memory-bank/contracts/boundary-map.md`,
  `.memory-bank/contracts/access-control.md`,
  `.memory-bank/domains/core-domain.md`,
  `.memory-bank/states/lifecycle-map.md`,
  `.memory-bank/architecture/system-architecture.md`,
  `.memory-bank/testing/strategy.md`

## Richer execution inputs

- Global Backbone: complete, Planning Revision `1`.
- Feature planning: latest FT-004 review is `APPROVE`, reviewed revision `1`.
- Dependency: `TASK-011-T3-FT-004-W5` is `done`.
- Collaboration remains the sole writer; actor and center/class/student scope
  are resolved through accepted public boundaries.

## Constraints / invariants (MUST / NEVER)

- MUST combine actor session, role, server-resolved center/class/student scope,
  action, and target at every protected read/command.
- MUST retain prior-center rows and hidden branches; tabs remain a projection.
- MUST preserve arbitrary reply depth, first-reply tab activation, complete
  scoped common feed, shared/personal separation, ten-tab ordering, and
  reactivation.
- NEVER expose, attribute, target, or mutate retained prior-center discussion
  objects after supported class identity reuse.
- NEVER move threaded-discussion ownership outside Collaboration.

## Scope

### In scope

- `src/lib/server/modules/collaboration/`
- `src/lib/server/platform/database.ts`
- `tests/collaboration/`
- `.tasks/TASK-017-T3-FT-004-W6/`
- `.protocols/TASK-017-T3-FT-004-W6/`
- selected task status transition in its task card

### Out of scope

- TASK-012/TASK-016 artifacts and lifecycle
- comments/field reactions as an owned outcome
- consumer changes, architecture/spec changes, product lifecycle, and closure

## Proposed changes

### Touched areas (hypotheses OK)

- Collaboration public/database source only if the isolated claim probe is
  RED; otherwise no production file change.
- Task-scoped evidence and protocol files for reproducible T3 handoff.

### Preflight-confirmed change surface

- Expected hints kept: Collaboration source, shared database, collaboration
  tests, and task-scoped evidence/protocols.
- Additional same-outcome files/areas and rationale: none confirmed.
- Hard `write_boundary` present and satisfied: not set; `forbidden_scope` clear.
- `forbidden_scope` / stop-condition check: clear.

## Applicable quality gates

- [ ] `npm run check` — required card gate for type/check correctness.
- [ ] `npm run build` — required card gate for build correctness.
- [ ] `npm run test` — required card gate for project regression coverage.
- [ ] `git diff --check` — cheap changed-file whitespace check.

## Claim-linked RED / GREEN (T2/T3)

- applicability: applicable
- accepted claim locators: `FT-004-AC-003`, `FT-004-AC-004`, and `REQ-014` /
  Access Control `#authority-and-scope` for threaded discussions.
- planned test/probe and environment: isolated disposable in-memory SQLite
  composition root; supported class identity reuse; current-center and
  prior-center reads/target/mutation checks; no network, credentials, or
  production data.
- observable RED: prior-center threaded messages, replies, authors, message
  reactions, common-feed entries, or branch tabs are projected/targetable/
  mutable after replacement, or accepted depth/tab/retention behavior fails.
- corresponding GREEN: current-center projection contains only current-center
  rows, cross-center reads/targets/mutations deny without existence leakage,
  retained old rows remain present, and depth/feed/tab/retention/reactivation
  behavior remains complete.
- accepted not-applicable reason and alternative proof: none planned.
- T3 isolation, safe rerun, cleanup, and permission boundary: each probe uses
  an in-memory database and closes it in teardown; only task-owned disposable
  evidence is written; no external state is touched.

## MB-SYNC handoff / owner

- Owner identified: fresh `/verify TASK-017-T3-FT-004-W6` owner after this
  execution; T3 `/red-verify` remains after functional PASS.
- `.memory-bank/` docs needing update: none for implementation if source is
  already GREEN; durable navigation remains unchanged.
- `.memory-bank/index.md` router update needed: no.
- RTM update in `.memory-bank/requirements.md` needed: no.
- Task registry/status update owner: `/verify` and lifecycle owner.
- Changelog update owner: lifecycle sync owner.

## Definition of done

- Task remains `in_progress` after `/exe`.
- Current attempt has honest claim-linked RED or accepted pre-implementation
  GREEN, exact receipts, required gates, actual touched files, hard-scope
  evidence, and fresh `/verify` handoff.
- No verification, semantic verification, sync, closure, or dependent
  promotion is performed here.
