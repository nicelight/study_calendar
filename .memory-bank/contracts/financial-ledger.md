---
description: Financial ledger ownership, exactness, allocation, audit, projection, and replay contract.
status: active
last_updated: 2026-08-08
source_of_truth:
  - .memory-bank/contracts/financial-ledger.md
---
# Financial Ledger Contract

## Owner and source of truth

Financial Ledger is the sole business write owner for price settings, applied
lesson charges, payments, allocations, balances, payment markers, and
financial audit records. The one shared database persists these facts and is
the source of truth; no other slice may write or reconstruct them.

Learning Progress owns attendance. It orchestrates an attendance change and
calls Financial Ledger's reconciliation command for the financial consequence.
Center & Scheduling owns lesson identity/date, class mode, center scope, and
teacher assignment. Identity & Access supplies the authenticated actor.

## Financial facts and invariants

- A Charge stores the applied lesson price at charge time. Later class/default
  or student override changes affect only future charges.
- `absent` creates no charge for either individual or group lessons.
  `absent -> present` creates the historically applicable charge, recalculates
  the affected balance, and records author, time, and financial change.
- A Payment stores the student, exact amount, factual date, and audit-relevant
  author/context. Payment allocation is derived from persisted charges and
  payment facts, not from calendar presentation.
- Allocation consumes the oldest uncovered charges in a stable deterministic
  order. Partial remainder stays on the oldest charge; excess becomes an
  advance. Fully covered charges are `paid`; uncovered completed charges are
  `overdue` according to the accepted lifecycle.
- Monetary arithmetic uses one exact decimal-safe representation end to end;
  binary floating-point arithmetic is never used for persisted or comparison
  values.
- Editing or cancelling a payment and correcting charge eligibility
  deterministically recomputes affected allocations and balance, with an audit
  record describing the actor, time, and before/after change.
- Repeating the same confirmed financial intent does not create a second
  Payment. A new explicit confirmation is a new command.

## Public commands and queries

The exact HTTP route/payload shape remains feature-level. The stable application
boundary is:

- `reconcileLessonCharge(lesson, student, attendanceTransition)`;
- `createPayment(student, amount, factualDate, confirmation)`;
- `editPayment(payment, change, confirmation)`;
- `cancelPayment(payment, confirmation)`;
- `getBalanceProjection(student, range)`;
- `getPaymentMarkers(student, range)`.

Every command re-checks actor scope through Identity & Access and Center &
Scheduling at execution time. Admin may create/edit/cancel for any student and
class in the Admin's center. A Teacher may create only for a student in an
assigned class and may never edit/cancel. Other roles have no payment command
authority.

## Marker projection

- A marker is a calendar projection of a Payment, not a second financial fact.
- If the factual date is a lesson day, placement is the closest previous
  non-lesson day, including a prior week/month when needed.
- The marker displays the factual date and keeps multiple markers discoverable.
- Placement, ordering, or hidden/visible calendar state never changes Payment,
  allocation, charge, or balance.

## Transaction and failure rules

- A public financial command validates authorization and current state inside
  its transaction boundary before writing.
- The attendance reconciliation call may share the orchestration transaction
  with Learning Progress, but Financial Ledger remains the only writer of
  charge, allocation, balance, and financial audit state.
- Provider failure, authorization failure, validation failure, and a rejected
  replay leave no partial financial mutation.
- Recalculation is deterministic from the persisted historical sequence; no
  mutable UI projection or cache is a source of financial truth.

## Verification path

The minimum credible financial proof is an executable deterministic scenario
set before real data is used:

1. historical class/default/override price is fixed in a Charge;
2. present/absent for both class modes and absent-to-present correction create
   the correct charge/audit result;
3. full, partial, and excess payments preserve exact amounts and oldest-first
   allocation;
4. edit/cancel/correction replay yields the same balance and allocation;
5. payment replay does not duplicate a Payment;
6. Admin/Teacher/cross-center authorization and marker projection leave
   financial facts unchanged except for the intended command.

These checks extend the risk-based project testing strategy and belong to the
feature/task evidence records when execution is planned; this contract remains
the normative semantic basis.
