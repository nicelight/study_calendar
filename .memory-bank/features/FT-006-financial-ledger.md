---
description: Product feature for pricing, payments, allocation, balances, audit, and payment markers.
status: active
type: feature
id: FT-006
lifecycle: verified
last_updated: 2026-08-18
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
- Admin configures class price/default payment and a student-specific price
  override where needed.
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
