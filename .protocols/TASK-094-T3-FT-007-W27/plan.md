---
description: Execution plan for TASK-094-T3-FT-007-W27.
status: active
---
# Plan — TASK-094-T3-FT-007-W27

## Goal

Make every supported new Internal Account creation path atomically persist a
trimmed required full name and immutable server-generated registration time,
then expose the exact current-actor and scoped statistics profile queries.

## Non-goals

- No migration, backfill, fallback name, or legacy-account compatibility.
- No change to authorization, role, membership, assignment, session, or provider
  lifecycle semantics.
- No direct account-table reads by routes, C&S consumers, or future statistics
  composition.

## Inputs / source specs

- Task: `.memory-bank/tasks/TASK-094-T3-FT-007-W27.task.json`
- Feature / AC: `.memory-bank/features/FT-007-navigation-and-statistics.md#FT-007-AC-008`
- Contracts: `access-control.md#profile-creation-and-query-obligation`,
  `statistics-projection.md#participant-profile-metadata`,
  `boundary-map.md#account-provisioning-boundary`,
  `boundary-map.md#actor-context-boundary`
- Domain: `domains/core-domain.md#ownership-map`,
  `domains/core-domain.md#persistence-and-transaction-rules`

## Constraints / invariants

- MUST keep profile persistence and queries in Identity & Access.
- MUST keep the accepted C&S transaction as the atomic owner of account,
  credential/invitation, membership, and parent-link state.
- MUST generate `registeredAt` once on the server and preserve it on reads.
- NEVER accept incomplete names, mutate profile facts, expose raw rows, or
  grant authority from profile metadata.

## Scope

### In scope

- Identity & Access database/profile write and query seams.
- C&S account-provisioning adapter input propagation.
- Admin provisioning and bootstrap input seams.
- Focused task tests and required existing test fixtures in the declared boundary.

### Out of scope

- Statistics composition, Profile route, other capability slices, persistent
  production database, migrations/backfills, and lifecycle closure.

## Preflight-confirmed change surface

- Expected task hints: Identity & Access, database, C&S adapter, Admin/bootstrap
  seams, and focused tests.
- Additional same-outcome files: existing in-boundary tests must supply the new
  required input so their supported creation paths remain valid.
- Hard `write_boundary` present and satisfied: yes.
- `forbidden_scope` / stop-condition check: clear.

## Applicable quality gates

- [ ] `npm run check` — source/type correctness.
- [ ] `npm run test` — regression and focused behavior.
- [ ] `npm run build` — production build.
- [ ] `git diff --check` — whitespace integrity.
- [ ] `node scripts/mb-lint.mjs` — Memory Bank/task artifact integrity.
- [ ] `node scripts/mb-doctor.mjs --strict` — strict readiness gate.

## Claim-linked RED / GREEN (T2/T3)

- applicability: applicable.
- accepted claim locator: `FT-007-AC-008 / REQ-014 / REQ-017`.
- planned probe: isolated in-memory database test covering bootstrap,
  invitation, direct-password, exact query projections, revoked denial,
  immutable time, and atomic failure state.
- observable RED: current schema/write/query paths do not require or persist
  profile facts and no focused task probe exists.
- corresponding GREEN: same isolated matrix passes after implementation.
- T3 isolation / rerun / cleanup: `:memory:` database per test, no external
  service, no `study-calendar.db`, deterministic clocks where needed, and
  database closed after each test.

## MB-SYNC handoff / owner

- Owner: scheduler / separate lifecycle owner after `/verify` and `/red-verify`.
- `.memory-bank/` docs needing update: none beyond task-owned execution evidence;
  accepted contract and feature docs already describe the outcome.
- Task registry/status update owner: `/verify` then scheduler; `/exe` leaves
  `in_progress`.
- Changelog update owner: wave-boundary `/mb-sync`.

## Definition of done

- Production and focused test changes remain inside the hard boundary.
- Current attempt records honest RED before production behavior change and GREEN
  after it.
- Required gates are run and evidence is linked for a fresh `/verify`.
