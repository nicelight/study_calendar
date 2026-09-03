---
description: Product feature for pricing, payments, allocation, balances, audit, and payment markers.
status: active
type: feature
id: FT-006
lifecycle: planned
last_updated: 2026-09-03
epic: EP-005
requirements: [REQ-010, REQ-011, REQ-012, REQ-013, REQ-014, REQ-015]
spec_design_status: complete
spec_design_links:
  - .memory-bank/architecture/system-architecture.md#storage-and-data-flow-rules
  - .memory-bank/contracts/boundary-map.md#financial-projection-query-boundary
  - .memory-bank/contracts/financial-ledger.md
  - .memory-bank/contracts/access-control.md
  - .memory-bank/domains/core-domain.md#persistence-and-transaction-rules
  - .memory-bank/states/lifecycle-map.md#learning-and-finance
  - .memory-bank/runbooks/mvp-verification.md#required-pre-real-data-checks
---
# FT-006 — Financial Ledger

## Use Cases
- Admin configures one class lesson price/default payment value and a
  student-specific price override where needed.
- Admin records a payment for any student/class in the Admin's own center, or an
  assigned teacher records one for a student in the assigned class, with amount
  and factual date.
- The ledger allocates money to the oldest debts, exposes partial remainder or
  advance, and projects payment markers in the personal calendar.
- Admin corrects or cancels a payment; the system recalculates with audit history.

## Edge / Failure Behavior
- Price changes do not rewrite historical charges.
- Full, partial, and excess payments retain exact amounts and deterministic order.
- Repeated financial submission does not create a second payment without a new
  explicit confirmation.
- Marker placement across week/month boundaries and multiple markers on one day
  never mutates financial records.
- Cross-center payment access is denied; a teacher cannot edit or cancel a
  payment.

## Acceptance Criteria

### FT-006-AC-001 — Applied price is historical
- REQ: REQ-011
- Given class/default and student-specific pricing, then a charge stores the
  applied price at charge time and later setting changes affect only future
  charges.
- Verification: pricing integration scenario with before/after setting change.

### FT-006-AC-002 — Payments allocate oldest debts deterministically
- REQ: REQ-012, REQ-015
- Given a sequence of charges and a payment with factual date, then the payment
  is allocated to the oldest uncovered charges first, producing the same balance
  and allocation for the same input sequence.
- Verification: financial scenario test with deterministic replay.

### FT-006-AC-003 — Partial and excess money are preserved
- REQ: REQ-012, REQ-015
- Given a payment smaller than a charge or larger than all current debts, then
  the exact remainder stays on the oldest charge or the exact excess becomes an
  advance; fully covered charges are `paid` and uncovered completed charges are
  `overdue`.
- Verification: full/partial/excess ledger scenarios with decimal-precision checks.

### FT-006-AC-004 — Recalculation and audit remain correct
- REQ: REQ-010, REQ-012, REQ-015
- Given an attendance correction or charge cancellation, then allocations and
  balance are deterministically recomputed from the historical sequence and an
  audit record identifies author, time, and change.
- Verification: correction/replay scenario with audit assertions.

### FT-006-AC-005 — Payment authority is role- and center-scoped
- REQ: REQ-012, REQ-013, REQ-014, REQ-015
- Given an admin in a center, then the admin can create, edit, or cancel a
  payment for any student/class in that center, with edit/cancel
  deterministically recomputing allocations and balance and recording an audit
  change. Given a teacher assigned to a class, then the teacher can create a
  payment only for that class but cannot edit or cancel it. All cross-center
  attempts are rejected.
- Verification: positive and negative role/membership authorization scenarios.

### FT-006-AC-006 — Payment marker is a non-financial projection
- REQ: REQ-013
- Given a payment dated on a lesson day, then its marker appears on the closest
  previous non-lesson day, including a prior week/month when needed, shows the
  factual date, and keeps multiple markers discoverable without changing Payment,
  allocation, or balance.
- Verification: calendar/ledger integration scenario with projection invariants.

### FT-006-AC-007 — Repeated submission is safe
- REQ: REQ-012, REQ-015
- Given a repeated financial command, then no second payment is created unless a
  new explicit confirmation is supplied.
- Verification: idempotency/retry scenario with payment-count assertion.

### FT-006-AC-008 — Browser payment entry and personal paid state
- REQ: REQ-013
- Given an assigned teacher and a student with an active lesson charge, when
  the teacher submits the existing lesson-context payment form, then the
  authoritative ledger records and allocates the payment. In the student's
  personal calendar, fully covered lesson days have the paid color/label and
  uncovered lesson days have the unpaid color/label. Admin and teacher shared
  calendars do not expose a guessed student payment state.
- Verification: route authorization tests and real-DB Playwright E2E with a
  created teacher/student, class membership, payment/allocation assertions, and
  paid/unpaid calendar-card assertions.

### FT-006-AC-009 — Admin pricing settings and history
- REQ: REQ-011, REQ-014
- Given an Admin in the own center, when the Admin opens the protected financial
  page, then the Admin can append one class lesson price/default payment value
  and a student-specific price override with an effective date, and can inspect
  the deterministic history with author and timestamp. The single class value
  is the lesson price and the default value for the existing editable payment
  form; the existing form's initial amount is proved from that same value. A
  later setting affects only future charges. The UI does not offer deletion or
  historical-charge rewrite.
  Teacher, Student, Parent, cross-center, forged-class, and forged-student
  requests do not return pricing data or mutate settings.
- Verification: protected route/action tests plus disposable Playwright E2E
  cover default and override history, validation, own-center Admin writes,
  existing payment-form initial amount, future-Charge effect, denied
  roles/scope, and unchanged historical charge rows.

### FT-006-AC-010 — Admin payment journal and correction controls
- REQ: REQ-012, REQ-013, REQ-014, REQ-015
- Given an Admin in the own center, when the Admin opens the protected payment
  journal, then every payment is shown once with student/class, exact amount,
  factual date, status, allocation/balance result, and audit history. The Admin
  can edit amount/date or cancel a recorded payment only with explicit
  confirmation; the existing Financial Ledger commands recompute allocation
  and balance and the refreshed journal shows the audit before/after. No create
  payment form is added to this journal. Teacher, Student, Parent,
  cross-center, forged-payment, and forged-scope requests are rejected before
  financial mutation.
- Verification: protected route/action tests plus disposable Playwright E2E
  cover journal read, Admin edit/cancel, recalculated allocation/balance,
  audit visibility, and negative role/center/payment scope cases.

### FT-006-AC-011 — Personal calendar payment markers
- REQ: REQ-013, REQ-014
- Given recorded payments whose factual date is a lesson day, when the permitted
  Student personal calendar or Parent-linked-child personal calendar is opened
  or navigated to the projected day, then each marker is rendered on the closest
  previous non-lesson day, including a week or month boundary, with amount and
  factual date; multiple markers on one day are separately discoverable.
  Existing paid/unpaid labels remain unchanged, and marker rendering does not
  change Payment, Allocation, Balance, or Audit.
  Shared Admin/Teacher calendars do not expose the personal marker projection.
- Verification: route/component tests plus disposable Playwright E2E cover
  Student and Parent-linked-child access, factual-date labels, week/month
  boundary navigation, multiple markers, and before/after financial-state
  equality.

## Acceptance Closure
| Material outcome | Coverage |
|---|---|
| Historical price and override | FT-006-AC-001 |
| Oldest-debt allocation and determinism | FT-006-AC-002 |
| Partial remainder, advance, paid/overdue states | FT-006-AC-003 |
| Attendance/charge correction and audit | FT-006-AC-004 |
| Teacher/admin payment permissions | FT-006-AC-005 |
| Marker placement, date label, and marker retention | FT-006-AC-006 |
| Duplicate command safety | FT-006-AC-007 |
| Browser payment entry and personal paid/unpaid calendar state | FT-006-AC-008 |
| Admin pricing settings, overrides, and history UI | FT-006-AC-009 |
| Admin payment journal, correction controls, allocation refresh, and audit UI | FT-006-AC-010 |
| Personal calendar payment-marker rendering | FT-006-AC-011 |

## SDD Design Gate
Global monetary source of truth, storage, decimal representation, allocation,
audit, projection, authorization, and verification contracts are owned by
`/spec-design` and composed here through:

- [.memory-bank/architecture/system-architecture.md](../architecture/system-architecture.md#storage-and-data-flow-rules)
- [.memory-bank/contracts/boundary-map.md](../contracts/boundary-map.md#financial-projection-query-boundary)
- [.memory-bank/contracts/financial-ledger.md](../contracts/financial-ledger.md)
- [.memory-bank/contracts/access-control.md](../contracts/access-control.md)
- [.memory-bank/domains/core-domain.md](../domains/core-domain.md#persistence-and-transaction-rules)
- [.memory-bank/states/lifecycle-map.md](../states/lifecycle-map.md#learning-and-finance)
- [.memory-bank/runbooks/mvp-verification.md](../runbooks/mvp-verification.md#required-pre-real-data-checks)

Feature-level contract detail remains downstream task-design work.

## Task Coverage at W5 Boundary

- W4 `TASK-007-T3-FT-006-W4` is reconciled through its current functional
  `PASS` and T3 `semantic-pass` evidence for `FT-006-AC-001` and
  `FT-006-AC-004`.
- W5 `TASK-008-T3-FT-006-W5` is reconciled through the current Attempt 2
  functional report-02 `PASS` and T3 semantic report-02 `semantic-pass` for
  `FT-006-AC-002`, `FT-006-AC-003`, `FT-006-AC-005`, `FT-006-AC-006`, and
  `FT-006-AC-007`:
  - [current functional report](../../.tasks/TASK-008-T3-FT-006-W5/TASK-008-T3-FT-006-W5-S-VERIFY-final-report-docs-02.md)
  - [current semantic report](../../.tasks/TASK-008-T3-FT-006-W5/TASK-008-T3-FT-006-W5-S-RED-VERIFY-final-report-docs-02.md)
- Attempt 1 semantic-fail/report-01 remains preserved only as historical
  correction basis and is not current closure evidence.
- Feature document `status: draft`, feature `lifecycle: planned`, and the
  EP-005/REQ lifecycle values remain unchanged; no product promotion was
  applied by `/mb-sync`.

## W21 browser payment closure — 2026-08-17

TASK-041 closes the browser contour for FT-006-AC-008. The Lesson Context page
now exposes a payment form to Admin and assigned Teacher, backed by
`FinancialLedgerBoundary.createPayment`; students cannot submit it. The
student-only calendar load projects `paid`/`unpaid` from the ledger's balance
projection, while shared Admin/Teacher calendars omit payment state. The real
database E2E created/reused the dedicated test Teacher and Student, assigned
the student to the existing class, recorded a real payment, and asserted the
paid and unpaid card colors/labels. The payment, allocation, accounts, and
membership remain in the local database for manual inspection.

The feature's current front matter is `status: active` / `lifecycle: verified`;
the older W5 note above is historical and does not supersede this W21 closure.

## Current task coverage after rejected-plan rebuild — 2026-08-18

The FT-006 task-plan review rejected the composite W4/W5/W21 slicing. Fresh
current owners are `TASK-043` (AC-001), `TASK-044` (AC-004), `TASK-045`
(AC-002/003), `TASK-046` (AC-005), `TASK-047` (AC-006), `TASK-048` (AC-007),
and `TASK-050` (AC-008). `TASK-049` is the separate Lesson Context adapter
prerequisite for AC-008 and does not own the product AC. Historical done
TASK-007, TASK-008, and TASK-041 retain their status and evidence and are not
reused as fresh proof. Planning Revision remains `2`; no canonical ownership
or contract changed.

## W22 fresh Financial Ledger closure — 2026-08-18

The fresh rebuild owners for the completed W22 slices are now durable:

- `TASK-043-T3-FT-006-W22` is `done` with fresh functional `PASS` and semantic
  `semantic-pass` evidence for `FT-006-AC-001` / `REQ-011` (historical applied
  default and student-specific price snapshots).
- `TASK-044-T3-FT-006-W22` is `done` with fresh functional `PASS` and semantic
  `semantic-pass` evidence for `FT-006-AC-004` / `REQ-010`, `REQ-012`, and
  `REQ-015` (attendance charge correction, deterministic replay, and audit).

- [TASK-043 card](../tasks/TASK-043-T3-FT-006-W22.task.json)
- [TASK-043 functional verification](../../.tasks/TASK-043-T3-FT-006-W22/TASK-043-T3-FT-006-W22-S-VERIFY-final-report-docs-01.md)
- [TASK-043 semantic verification](../../.tasks/TASK-043-T3-FT-006-W22/TASK-043-T3-FT-006-W22-S-RED-VERIFY-final-report-docs-01.md)
- [TASK-044 card](../tasks/TASK-044-T3-FT-006-W22.task.json)
- [TASK-044 functional verification](../../.tasks/TASK-044-T3-FT-006-W22/TASK-044-T3-FT-006-W22-S-VERIFY-final-report-docs-01.md)
- [TASK-044 semantic verification](../../.tasks/TASK-044-T3-FT-006-W22/TASK-044-T3-FT-006-W22-S-RED-VERIFY-final-report-docs-01.md)
- [W22 boundary sync](../../.tasks/TASK-044-T3-FT-006-W22/TASK-044-T3-FT-006-W22-S-MB-SYNC-final-report-docs-01.md)

Financial Ledger ownership, accepted boundaries, Planning Revision `2`, and
the feature lifecycle remain unchanged. W23 payment allocation and later cards
remain governed by their authoritative task records.

## W23 fresh Financial Ledger closure — 2026-08-18

The fresh W23 owners for payment allocation, authority, and marker projection
are now durable:

- `TASK-045-T3-FT-006-W23` is `done` with fresh functional `PASS` and semantic
  `semantic-pass` evidence for `FT-006-AC-002` and `FT-006-AC-003` / `REQ-012`,
  `REQ-015` (deterministic oldest-first allocation, exact partial remainder,
  excess advance, paid/overdue states, and replay).
- `TASK-046-T3-FT-006-W23` is `done` with fresh functional `PASS` and semantic
  `semantic-pass` evidence for `FT-006-AC-005` / `REQ-012`, `REQ-013`, `REQ-014`,
  `REQ-015` (role/center authority, Teacher create-only, Admin edit/cancel,
  deterministic recomputation, and audit).
- `TASK-047-T3-FT-006-W23` is `done` with fresh functional `PASS` and semantic
  `semantic-pass` evidence for `FT-006-AC-006` / `REQ-013` (factual marker
  placement, week/month boundary discovery, and read-only projection).

- [TASK-045 card](../tasks/TASK-045-T3-FT-006-W23.task.json)
- [TASK-045 functional verification](../../.tasks/TASK-045-T3-FT-006-W23/TASK-045-T3-FT-006-W23-S-VERIFY-final-report-docs-01.md)
- [TASK-045 semantic verification](../../.tasks/TASK-045-T3-FT-006-W23/TASK-045-T3-FT-006-W23-S-RED-VERIFY-final-report-docs-01.md)
- [TASK-046 card](../tasks/TASK-046-T3-FT-006-W23.task.json)
- [TASK-046 functional verification](../../.tasks/TASK-046-T3-FT-006-W23/TASK-046-T3-FT-006-W23-S-VERIFY-final-report-docs-01.md)
- [TASK-046 semantic verification](../../.tasks/TASK-046-T3-FT-006-W23/TASK-046-T3-FT-006-W23-S-RED-VERIFY-final-report-docs-01.md)
- [TASK-047 card](../tasks/TASK-047-T3-FT-006-W23.task.json)
- [TASK-047 functional verification](../../.tasks/TASK-047-T3-FT-006-W23/TASK-047-T3-FT-006-W23-S-VERIFY-final-report-docs-01.md)
- [TASK-047 semantic verification](../../.tasks/TASK-047-T3-FT-006-W23/TASK-047-T3-FT-006-W23-S-RED-VERIFY-final-report-docs-01.md)
- [W23 boundary sync](../../.tasks/TASK-047-T3-FT-006-W23/TASK-047-T3-FT-006-W23-S-MB-SYNC-final-report-docs-01.md)

Financial Ledger ownership, accepted boundaries, Planning Revision `2`, and
the feature lifecycle remain unchanged. W24 retry/idempotency and later cards
remain governed by their authoritative task records.

## W24 fresh retry closure — 2026-08-18

The fresh W24 retry owner is now durable:

- `TASK-048-T3-FT-006-W24` is `done` with fresh functional `PASS` and semantic
  `semantic-pass` evidence for `FT-006-AC-007` / `REQ-012`, `REQ-015`
  (identical-confirmation idempotency, changed-payload conflict without
  mutation, explicit new confirmation, and deterministic replay).

- [TASK-048 card](../tasks/TASK-048-T3-FT-006-W24.task.json)
- [TASK-048 functional verification](../../.tasks/TASK-048-T3-FT-006-W24/TASK-048-T3-FT-006-W24-S-VERIFY-final-report-docs-01.md)
- [TASK-048 semantic verification](../../.tasks/TASK-048-T3-FT-006-W24/TASK-048-T3-FT-006-W24-S-RED-VERIFY-final-report-docs-01.md)
- [W24 boundary sync](../../.tasks/TASK-048-T3-FT-006-W24/TASK-048-T3-FT-006-W24-S-MB-SYNC-final-report-docs-01.md)

Financial Ledger ownership, accepted boundaries, Planning Revision `2`, and
the feature lifecycle remain unchanged. W25 Lesson Context adapter and later
cards remain governed by their authoritative task records.

## W25 Lesson Context adapter closure — 2026-08-18

The fresh W25 adapter prerequisite is now durable:

- `TASK-049-T3-FT-006-W25` is `done` with fresh functional `PASS` and semantic
  `semantic-pass` evidence for the protected Lesson Context payment adapter /
  `REQ-013` boundary. Admin and assigned Teacher submissions delegate through
  `FinancialLedgerBoundary.createPayment`; Student, unassigned Teacher,
  cross-center, forged-scope, and malformed submissions fail before financial
  mutation.
- [TASK-049 card](../tasks/TASK-049-T3-FT-006-W25.task.json)
- [TASK-049 functional verification](../../.tasks/TASK-049-T3-FT-006-W25/TASK-049-T3-FT-006-W25-S-VERIFY-final-report-docs-01.md)
- [TASK-049 semantic verification](../../.tasks/TASK-049-T3-FT-006-W25/TASK-049-T3-FT-006-W25-S-RED-VERIFY-final-report-docs-01.md)
- [W25 boundary sync](../../.tasks/TASK-049-T3-FT-006-W25/TASK-049-T3-FT-006-W25-S-MB-SYNC-final-report-docs-01.md)

The route and Lesson Context module do not own financial table persistence.
TASK-050 remains the owner of the personal paid/unpaid calendar projection and
real-database browser E2E. Financial Ledger ownership, accepted contracts,
Planning Revision `2`, RTM lifecycle values, and FT-006 lifecycle remain
unchanged.

## W26 personal calendar projection closure — 2026-08-18

The complete browser contour is now durable:

- `TASK-050-T3-FT-006-W26` is `done` with fresh functional `PASS` and semantic
  `semantic-pass` evidence for `FT-006-AC-008` / `REQ-013`. The real assigned
  Teacher flow records one payment and allocation through the existing adapter;
  the Student personal calendar derives `paid` and `unpaid` from the named
  projection; shared Admin/Teacher calendars omit per-student payment state.
- [TASK-050 card](../tasks/TASK-050-T3-FT-006-W26.task.json)
- [TASK-050 functional verification](../../.tasks/TASK-050-T3-FT-006-W26/TASK-050-T3-FT-006-W26-S-VERIFY-final-report-docs-01.md)
- [TASK-050 semantic verification](../../.tasks/TASK-050-T3-FT-006-W26/TASK-050-T3-FT-006-W26-S-RED-VERIFY-final-report-docs-01.md)
- [W26 boundary sync](../../.tasks/TASK-050-T3-FT-006-W26/TASK-050-T3-FT-006-W26-S-MB-SYNC-final-report-docs-01.md)

The real local database E2E preserved the dedicated Teacher/Student and
payment/allocation fixture and removed only exact automation sessions. No
Financial Ledger or Lesson Context ownership changed; at the W26 boundary
FT-006 lifecycle remained `verified` and no further indexed product task was
then present.

## 2026-09-03 UI-gap tasking after W26 baseline

The W22–W26 records remain closed historical owners for the already-working
financial commands, payment creation adapter, allocation/replay, marker
calculation, and paid/unpaid labels. Current code inspection found no protected
Admin financial page, no Admin-readable pricing history, no journal adapter for
the existing edit/cancel commands, and no calendar consumer for the existing
`getPaymentMarkers` projection. The current feature lifecycle is therefore
`planned` while the three new browser outcomes are implemented.

The current queue adds only:

- `TASK-099-T3-FT-006-W32` for Admin pricing/override settings and history;
- `TASK-100-T3-FT-006-W33` for the Admin payment journal and correction UI;
- `TASK-101-T3-FT-006-W34` for personal payment-marker rendering.

None of these tasks reopens payment creation or the existing paid/unpaid label
behavior; those remain dependencies and regression inputs only.

## 2026-09-03 Task-plan approval and decomposition closure

The fresh `/review-tasks-plan FT-006` returned `APPROVE` at Planning Revision
`2`. The repaired `rebuild_required` queue is accepted with the sequential
planned cards TASK-099, TASK-100, and TASK-101. The decomposition is closed for
this revision; implementation, task verification, and FT-006 lifecycle
promotion remain future execution decisions.
