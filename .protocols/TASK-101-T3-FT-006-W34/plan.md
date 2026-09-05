---
description: Execution plan for TASK-101-T3-FT-006-W34.
status: active
---
# Plan — TASK-101-T3-FT-006-W34

## Goal

Render every authorized personal payment marker in the Calendar on its
projection `markerDate`, with exact amount and factual date, while preserving
existing Student paid/unpaid lesson labels and shared-role omission.

## Non-goals

- Do not reimplement marker placement, payment facts, balances, or allocation.
- Do not change payment creation or paid/unpaid derivation.
- Do not expose personal markers in Admin or Teacher calendars.
- Do not add a Parent selector, financial API, persistence, or direct database read.

## Inputs / source specs

- Task record: `.memory-bank/tasks/TASK-101-T3-FT-006-W34.task.json`
- Feature/REQ: `FT-006-AC-011`, `REQ-013`, `REQ-014`
- Canonical contracts: Financial Ledger personal marker consumer/projection, Financial Projection Query Boundary, Access Control authority and permission matrix
- Composition/testing: System Architecture request data flow and Disposable Browser Proof

## Constraints / invariants

- MUST consume `getPaymentMarkers` through Lesson Context with server-resolved Student or Parent scope.
- MUST keep exact `amount` and `factualDate`, preserve multiple markers on one `markerDate`, and leave financial tables unchanged during reads/navigation/rendering.
- MUST keep existing paid/unpaid status source and omit marker data for Admin/Teacher shared calendars.
- NEVER trust URL/form student scope, query financial persistence from Calendar, or write outside the hard boundary/skill-owned protocol evidence.

## Scope

### In scope

- Lesson Context public read adapter for authorized personal marker data.
- Calendar server load view model and Calendar presentation.
- Focused route/component tests and disposable Playwright proof.

### Out of scope

- Financial Ledger, Admin, Lesson Context route, Center & Scheduling, runner/configuration, real database, and all unrelated dirty work.

## Proposed changes

### Touched areas

- `src/lib/server/modules/lesson-context/public.ts` — expose the existing financial marker query only for server-authorized personal scope.
- `src/routes/calendar/+page.server.ts` — load marker projection for permitted personal roles without accepting a student selector.
- `src/routes/calendar/+page.svelte` — render separate amount/date marker entries on projected free days.
- Focused tests/E2E — prove authorization, boundaries, multiple markers, exact display, unchanged paid/unpaid labels, and state equality.

### Preflight-confirmed change surface

- Expected hints kept: yes; no additional project-authored production path is anticipated.
- Additional same-outcome files/areas: none.
- Hard `write_boundary` present and satisfied: yes.
- `forbidden_scope` / stop-condition check: clear.

## Applicable quality gates

- [x] `npm run check` — 0 errors / 0 warnings; proves SvelteKit/TypeScript correctness.
- [x] `npm run test` — 75 files / 256 tests passed; proves project regression suite.
- [x] `npm run build` — production bundle built successfully.
- [x] `node scripts/run-disposable-e2e.mjs --database tmp/ft-006-payment-markers.db --spec e2e/ft-006-payment-markers.spec.ts` — 1/1 passed; proves isolated browser privacy/rendering/non-mutation outcome.
- [x] `git diff --check` — passed.
- [x] `node .memory-bank/scripts/mb-lint.mjs` — passed for 76 files; existing advisory metadata warnings only.
- [x] `node .memory-bank/scripts/mb-doctor.mjs --strict` — passed with 0 errors; one unrelated TASK-102 warning and two info messages.

## Claim-linked RED / GREEN (T2/T3)

- applicability: applicable
- accepted claim locator(s): `FT-006-AC-011 / REQ-013 / REQ-014`
- planned test/probe and environment: focused in-memory Lesson Context/Calendar route and component tests, followed by the task-owned disposable Playwright runner/database.
- observable RED: unchanged Calendar had no personal marker view and did not render marker amount/factual-date entries for Student/Parent; `.tasks/TASK-101-T3-FT-006-W34/attempt-1-red.md`.
- corresponding GREEN: focused 2-file/6-test proof and disposable 1/1 browser proof show Student and server-resolved Parent-linked-child markers on projected dates, multiple discoverability, exact amounts/factual dates, existing paid/unpaid labels, shared-role omission, forged URL immunity, and financial-state equality.
- accepted not-applicable reason and alternative proof: none.
- T3 isolation, safe rerun, cleanup, and permission boundary: focused tests use in-memory SQLite; browser proof uses only `tmp/ft-006-payment-markers.db` through the project runner, which owns startup and exact cleanup; `study-calendar.db` remains untouched.

## MB-SYNC handoff / owner

Scheduler or explicit standalone owner performs lifecycle closure and `/mb-sync` after verification; `/exe` records the forward handoff only.

- Owner identified: scheduler
- `.memory-bank/` docs needing update: scheduler/`/mb-sync` boundary after functional and semantic verification
- `.memory-bank/index.md` router update needed: no
- RTM update in `.memory-bank/requirements.md` needed: scheduler/`/mb-sync` decides at boundary
- Task registry/status update owner: scheduler after `/verify` and `/red-verify`
- Changelog update owner: `/mb-sync`

## Definition of done

The implementation and all listed gates have passed, claim-linked RED/GREEN
evidence is durable, task-owned source writes stayed inside the boundary, and
the task is handed to fresh `/verify TASK-101-T3-FT-006-W34` followed by
`/red-verify` under T3 policy. The required full test gate's separate ignored
real-database mutation is recorded as a project test-isolation papercut.
