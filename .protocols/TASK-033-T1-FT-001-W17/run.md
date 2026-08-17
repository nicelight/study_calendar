---
description: Compact execution evidence for TASK-033 public home login entry.
status: active
---
# Compact Run

## Metadata
- task: TASK-033-T1-FT-001-W17
- tier: T1
- finished: 2026-08-14T22:00:09+05:00
- local evidence verdict: PASS
- closure owner: none
- manual /exe decision: status unchanged
- scheduler decision: none

## Execution Attempt
- attempt: 1
- started: 2026-08-14T21:55:27+05:00

## Goal
- Make the public `/` page visibly expose a keyboard-reachable ordinary `Вход` anchor with exact `href="/login"`, without changing authentication or the calendar fixture.

## Scope
- preflight-confirmed change surface:
  - `src/routes/+page.svelte`
  - `tests/calendar/elastic-calendar.test.ts`
- hard allowed-write boundary: both files above; workflow evidence and this task card status are skill-owned bookkeeping.
- non-goals:
  - `/login`, provider routes, hooks, server modules, sessions, cookies, roles, authorization, and persistence.
  - replacing or data-backing the public calendar fixture.

## Context Used
- TASK-033 card: T1, `planned -> ready` after preflight; dependency `TASK-030-T3-FT-001-W14` is `done`.
- Fresh FT-001 W17 task-plan review: `VERDICT: APPROVE`, `REVIEWED_PLANNING_REVISION: 2`, matching the complete Global Backbone Planning Revision 2.
- FT-001-AC-012 / REQ-001 and Authentication Transport require a public, presentation-only anchor from `/` to `/login`.
- Existing home route uses Svelte 5 runes and contains the protected FT-003 fixture/date navigation; its source and test were clean before this attempt.

## Changes
- Added the visible, native `<a class="login-link" href="/login">Вход</a>` in the public home introduction, including a visible focus style.
- Added a focused source smoke that asserts the exact ordinary anchor and rejects imperative `/login` navigation; existing calendar assertions remain unchanged.
- No session, provider, account, role, cookie, persistence, route, server, or calendar-fixture behavior changed.

## Checks
- `npm run test -- tests/calendar/elastic-calendar.test.ts` — pass: 1 file, 3 tests (final run after the completed test edit).
- `npm run check` — pass: Svelte diagnostics found 0 errors and 0 warnings.
- `npm run test` — pass: 29 files, 117 tests.
- `npm run build` — pass: production client and SSR build completed successfully.
- Local SSR UI smoke on Vite dev server — pass: `GET /` rendered `tag=a href=/login text=Вход`; `GET /login` returned HTTP 200. The required `ui_qa` launcher was unavailable, so this was the reproducible fallback; focus visibility and absence of imperative navigation are covered by the focused source smoke.
- `git diff --check` — pass. Diff review shows only the two hard-boundary code/test files; no forbidden scope was touched.

## Evidence
- Outcome compliance: the public home contains one visible ordinary link with exact `/login` href and native keyboard reachability; the link has no action handler or imperative navigation.
- Boundary compliance: actual product/test changes are exactly `src/routes/+page.svelte` and `tests/calendar/elastic-calendar.test.ts`; workflow bookkeeping is task-owned. No file in `runtime_context.forbidden_scope` was touched.
- Regression compliance: the retained calendar test assertions and full project test suite pass; source/diff inspection shows the fixture and date navigation are unchanged.

## Evidence Verdict
This marker records local evidence only. It is not task closure and does not set
final task status.

VERDICT: PASS

## Closure Decision

### Manual `/exe`

- explicit standalone owner present: no
- owner basis: none
- decision: status unchanged
- compact PASS and every fast-lane condition satisfied: no — this delegated executor has no explicit closure owner.
- task record evidence updated in `verify`: no

### Scheduler

- decision: none
- reason/evidence link: none

## MB-SYNC Handoff
- owner: none
- reason: T1 execution evidence only; `/verify TASK-033-T1-FT-001-W17` is the next required independent functional route.
- files/docs likely needing sync:
  - none before independent verification and an explicit lifecycle decision.

## Notes / Follow-ups
- No task-specific protocol existed before this attempt. The task is `in_progress` with local `PASS` evidence and is ready for independent `/verify TASK-033-T1-FT-001-W17`; no closure authority was supplied to this delegated executor.

## Closure reconciliation — 2026-08-14

- Explicit top-level lifecycle owner: `/root`.
- Owner decision: `TASK-033-T1-FT-001-W17` is `done` after the Implementer PASS
  and independent Reviewer PASS supplied for this bounded T1 outcome.
- Closure basis: the current `verify` entries in the indexed task card and this
  compact protocol's execution checks. The prior executor note that it lacked
  closure authority remains historical context and is not rewritten.
- Feature decision: FT-001, REQ-001, and EP-001 remain `planned`; this task
  closes only AC-012 and does not promote the feature or absorb remaining UI
  gaps. All earlier task identities, statuses, evidence, and code remain
  unchanged.
