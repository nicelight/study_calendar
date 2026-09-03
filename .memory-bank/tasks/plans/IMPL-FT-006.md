---
description: Implementation plan for FT-006 financial ledger and its remaining browser contour.
status: active
---
# IMPL-FT-006 — Financial Ledger

## Goal

Close the missing Admin and personal-calendar user flows over the already
verified Financial Ledger commands: Admin pricing/override history, an Admin
payment journal with correction controls, and visible personal payment
markers. Keep one effective-dated class amount as both lesson price and default
payment value, and pass that value only as the initial amount in the existing
Lesson Context payment form.

## Scope / non-goals

Include the protected Admin finance page, server form actions, Admin-only
pricing history and payment-journal access, reuse of existing edit/cancel
recalculation and audit commands, and Student/Parent-linked-child marker
rendering. Exclude a second persisted default-payment setting, new payment
creation flow, allocation/replay logic, paid/unpaid label logic, attendance or
charge ownership, and any direct route/consumer financial-table writes. The
existing `createPayment` action remains unchanged; only its initial form value
is added to the TASK-099 consumer surface.

## Canonical inputs and ownership

- Feature: [.memory-bank/features/FT-006-financial-ledger.md](../../features/FT-006-financial-ledger.md)
- Product requirements: `FR-FIN-001`–`FR-FIN-003` and Parent scope in [.memory-bank/prd.md](../../prd.md)
- Requirements: `REQ-010`–`REQ-015` in [.memory-bank/requirements.md](../../requirements.md)
- Financial owner: `src/lib/server/modules/financial-ledger/`
- Admin route adapter: `src/routes/admin/[centerId]/finance/`
- Existing payment-form consumer: `src/routes/lesson-context/+page.server.ts` and `src/routes/lesson-context/+page.svelte`
- Personal calendar consumer: `src/lib/server/modules/lesson-context/` and `src/routes/calendar/`
- Contracts: [.memory-bank/contracts/financial-ledger.md](../../contracts/financial-ledger.md),
  [.memory-bank/contracts/boundary-map.md](../../contracts/boundary-map.md),
  [.memory-bank/contracts/access-control.md](../../contracts/access-control.md)
- Architecture/data/state: [.memory-bank/architecture/system-architecture.md](../../architecture/system-architecture.md),
  [.memory-bank/domains/core-domain.md](../../domains/core-domain.md),
  [.memory-bank/states/lifecycle-map.md](../../states/lifecycle-map.md)
- Verification: [.memory-bank/testing/strategy.md](../../testing/strategy.md),
  [.memory-bank/runbooks/mvp-verification.md](../../runbooks/mvp-verification.md)

The accepted Financial Ledger module remains the sole writer. Admin route
actions adapt to its public commands; the marker path adapts through the
existing Lesson Context → Financial Ledger projection edge. Planning Revision
remains `2`; Foundation dependency is inherited through the existing product
task DAG ending at `TASK-002-T3-FT-000-W1`.

## Boundary pass and ordered tasks

The three unmerged implementation outcomes are independently completable:

1. Admin pricing settings/history: the command path exists, but the price
   history query and protected browser surface do not; the existing payment
   form also does not initialize its amount from the class value.
2. Admin payment journal/correction: payment edit/cancel/replay exists, but no
   center-scoped journal read or server/UI adapter exposes it.
3. Personal markers: marker calculation exists, but Calendar does not consume
   or render it.

The outcomes stay separate because they have different view models, actions,
privacy surfaces, and proof fixtures. The journal depends on the finance-page
shell from pricing; marker rendering remains a separate Lesson Context/Calendar
consumer outcome. Existing payment creation and paid/unpaid labels are
dependencies/regression inputs, not new task claims.

| Wave | Task | Outcome | Dependency |
|---|---|---|---|
| W32 | TASK-099-T3-FT-006-W32 | Admin class price/student override settings, append-only history, and existing payment-form initial amount (AC-009) | TASK-043-T3-FT-006-W22; TASK-005-T3-FT-002-W3; TASK-049-T3-FT-006-W25 |
| W33 | TASK-100-T3-FT-006-W33 | Admin payment journal with edit/cancel actions, refreshed allocations/balance, and audit UI (AC-010) | TASK-099-T3-FT-006-W32; TASK-046-T3-FT-006-W23; TASK-048-T3-FT-006-W24 |
| W34 | TASK-101-T3-FT-006-W34 | Personal calendar payment-marker consumption and rendering (AC-011) | TASK-047-T3-FT-006-W23; TASK-050-T3-FT-006-W26; TASK-039-T3-FT-003-W10 |

No production-only configuration or checks are introduced, so no extra final
production-acceptance task is needed.

## Expected advisory change surface

- `src/lib/server/modules/financial-ledger/public.ts`: add only the
  Admin-authorized price-settings history and current payment-default queries
  needed by AC-009; preserve the existing price/payment command semantics. The
  same task proof reconciles a future lesson through the existing command and
  checks the selected class/override `applied_price`.
- `src/routes/admin/[centerId]/+page.svelte`: link the protected finance page.
- `src/routes/admin/[centerId]/finance/`: page load, pricing/journal form
  actions, and presentation.
- `src/routes/lesson-context/+page.server.ts` and
  `src/routes/lesson-context/+page.svelte`: initialize the existing editable
  payment amount from the authorized current class value; do not alter the
  existing create-payment action.
- `src/lib/server/modules/lesson-context/public.ts`: expose the authorized
  Student/Parent-linked-child personal-calendar marker projection without
  financial persistence access.
- `src/routes/calendar/`: add marker view data and accessible multi-marker
  rendering without changing paid/unpaid status derivation.
- `tests/financial-ledger/`, `tests/routes/`, and focused disposable
  `e2e/` specs: claim-linked RED/GREEN and privacy/non-mutation proof.

Exact filenames inside these accepted roots remain executor-confirmed; the
route/page roots and module ownership are fixed by this plan.

## Acceptance, gates, and UAT

Each T3 task carries its own protected route/action tests, disposable
Playwright E2E, `npm run check`, `npm run build`, `npm run test`, `git diff
--check`, `node .memory-bank/scripts/mb-lint.mjs`, and
`node .memory-bank/scripts/mb-doctor.mjs --strict`.
Disposable E2E
uses the project runner with a `tmp/` database and owned server; it never uses
`study-calendar.db` or an existing server.

UAT covers: Admin sees and appends the single class price/default value and
student override history, then the existing Lesson Context payment form opens
with the current amount initially populated; Admin edits/cancels a journal
payment and sees the resulting allocation, balance, and audit; Student and
Parent navigate to a marker day and see multiple factual-date labels. Shared
Admin/Teacher calendars expose no personal markers.

## Invariants and verification targets

- Historical Charges remain immutable after settings changes.
- Admin pricing/journal reads and writes are own-center only; Teacher,
  Student, forged scope, cross-center, and anonymous requests fail before
  financial mutation. Parent gets only the linked-child personal projection.
- Journal edit/cancel invokes the existing Financial Ledger commands and shows
  their deterministic replay/audit result; it does not add a second create
  payment flow.
- Marker placement and rendering are read-only, retain multiple markers, show
  factual dates, and do not change Payment, Allocation, Charge, Balance, or
  Audit state.
- Existing creation and paid/unpaid behavior remains covered by
  `TASK-049`/`TASK-050` dependencies and is not claimed by W32–W34.
- The only creation-adjacent claim in TASK-099 is the initial form value; the
  submitted payment still follows the existing `createPayment` action.

## Planning Revision 2 reconciliation

The Global Backbone is `complete` at Planning Revision `2`. The Foundation
gate is complete, all direct and transitive task dependencies are valid, and
the accepted module graph and write ownership do not change. Historical
FT-006 task identities/evidence (`TASK-007`, `TASK-008`, `TASK-041`, and
`TASK-043`–`TASK-050`) remain preserved; the new queue is additive browser-gap
coverage only.

## Task-plan approval and decomposition closure — 2026-09-03

The fresh `/review-tasks-plan FT-006` returned `APPROVE` at Planning Revision
`2` ([review report](../../../.tasks/TASK-MB-REVIEW-TASKS-PLAN/TASK-MB-REVIEW-TASKS-PLAN-S-TASKS-FT-006-20260903-final-report-docs-01.md)).
The queue action remains `rebuild_required` because the rejected planned cards
were materially repaired; the final identities are `TASK-099`, `TASK-100`, and
`TASK-101`. The decomposition is closed. These T3 cards remain `planned` until
the applicable readiness/promotion owner acts; FT-006 and its requirements
remain `planned`, and no implementation or verification status is implied.
