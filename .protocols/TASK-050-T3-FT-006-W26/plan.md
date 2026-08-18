---
description: Execution plan for TASK-050-T3-FT-006-W26.
status: active
---
# Plan — TASK-050-T3-FT-006-W26

## Goal

Prove the complete browser payment and personal paid/unpaid lesson-day
projection outcome from authoritative Financial Ledger facts.

## Non-goals

- No Financial Ledger ownership or schema change.
- No direct calendar financial writes or second payment-state source.
- No reset/temp database, unrelated fixture mutation, retry redesign, or shared
  calendar payment state.

## Inputs / source specs

- Task record: `.memory-bank/tasks/TASK-050-T3-FT-006-W26.task.json`
- Task index: `.memory-bank/tasks/index.json`
- Feature: FT-006 / REQ-013 / FT-006-AC-008
- Contracts: boundary-map financial projection boundary; Financial Ledger public
  commands/queries; access-control authority and scope.
- Architecture: composition and request data flow.
- Verification: MVP pre-real-data checks and testing strategy.

## Constraints / invariants (MUST / NEVER)

- MUST consume the named balance projection for Student paid/unpaid state.
- MUST prove assigned Teacher success, Student denial, payment/allocation facts,
  paid/unpaid labels/classes, and shared-role omission.
- MUST preserve unrelated local database rows and remove only exact test-created
  session tokens.
- NEVER write financial tables from Calendar or reset `study-calendar.db`.

## Scope

### In scope

- `src/routes/calendar/`
- `tests/routes/calendar-navigation.test.ts`
- `e2e/real-database-payment.spec.ts`
- `playwright.config.ts`
- existing `study-calendar.db` fixture and exact automation-session cleanup

### Out of scope

- Financial Ledger and Lesson Context production modules/routes.
- Identity, Center Scheduling, root page, and unrelated database rows.

## Proposed changes

### Touched areas (hypotheses OK)

- Existing Calendar load/card projection and its route regression coverage — only
  if the focused evidence exposes a task-scoped defect.
- Existing real-database payment E2E — only if its accepted one-intent flow or
  cleanup evidence needs a bounded correction.

### Preflight-confirmed change surface

- Expected hints kept: yes; current scoped files are clean before execution.
- Additional same-outcome files/areas and rationale: none.
- Hard `write_boundary` present and satisfied: yes.
- `forbidden_scope` / stop-condition check: clear.

## Applicable quality gates

- [ ] `npm run check` — proves project type/route consistency.
- [ ] `npm test` — proves regression suite.
- [ ] `npm run build` — proves production bundle.
- [ ] `npm run e2e -- e2e/real-database-payment.spec.ts` — proves AC-008 real
  database browser outcome.
- [ ] `git diff --check` — proves diff hygiene.
- [ ] `node scripts/mb-lint.mjs` — required by task after boundary reconciliation.
- [ ] `node scripts/mb-doctor.mjs --strict` — required by task after closure.

## Claim-linked RED / GREEN (T2/T3)

- applicability: applicable
- accepted claim locator: `FT-006-AC-008 / REQ-013 / real browser payment and personal state`
- planned test/probe and environment: existing real-database Playwright payment
  spec against `study-calendar.db`, plus route source/regression inspection.
- observable RED: pre-implementation baseline is expected to be green from the
  already accepted browser contour; no artificial RED will be manufactured.
- corresponding GREEN: one real Teacher payment produces authoritative rows,
  Student cards show paid/unpaid, shared calendars omit payment state, and
  Student submission is denied.
- accepted not-applicable reason and alternative proof: none.
- T3 isolation, safe rerun, cleanup, and permission boundary: preserve the real
  DB, use only dedicated E2E accounts/fixture, remove only exact test-created
  sessions, and stop on any reset/temp/widened-scope requirement.

## MB-SYNC handoff / owner

Scheduler owns closure and wave-boundary sync after `/verify` and
`/red-verify`.

- Owner identified: scheduler
- Explicit standalone owner basis: n/a
- `.memory-bank/` docs needing update: FT-006 task coverage, changelog, and
  task/evidence links at W26 boundary.
- `.memory-bank/index.md` router update needed: no
- RTM update needed: likely no; REQ-013 is already verified, confirm in sync.
- Task registry/status update owner: scheduler
- Changelog update owner: scheduler `/mb-sync`

## Definition of done

- Focused browser E2E and route semantic evidence pass without forbidden writes;
  all task gates pass; executor evidence and handoff point to `/verify`.
