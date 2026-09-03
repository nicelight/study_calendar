---
description: Financial ledger ownership, exactness, allocation, audit, projection, and replay contract.
status: active
last_updated: 2026-09-03
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

- A Charge stores the applied lesson price at charge time. One effective-dated
  class amount serves as both lesson price and default payment amount; a student
  override changes the applied price for that student. Later setting changes
  affect only future charges.
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
- `getPriceSettings({ sessionToken, classId })` (Admin-only history query);
- `getPaymentDefault({ sessionToken, classId })` (authorized current class
  amount query for the existing payment form);
- `getPaymentMarkers(student, range)`.

Every command re-checks actor scope through Identity & Access and Center &
Scheduling at execution time. Admin may create/edit/cancel for any student and
class in the Admin's center. A Teacher may create only for a student in an
assigned class and may never edit/cancel. Other roles have no payment command
  authority.

## Admin browser management surface

The Admin financial page is a server-side adapter over the Financial Ledger
boundary; it does not become a second financial owner.

- The Ledger exposes an authorized `getPriceSettings({ sessionToken, classId })`
  query for an Admin. A returned price-setting view contains the class,
  optional student override, exact `amount`, `effectiveFrom`,
  `createdByAccountId`, and `createdAt`. The result includes the append-only
  class-default and student-override history for that class in deterministic
  `effectiveFrom, id` order. For KISS, the class amount is also the default
  payment amount; there is no second persisted default-amount setting.
- `setClassPrice` and `setStudentPriceOverride` append a new effective-dated
  setting. They MUST NOT update or delete an earlier setting or rewrite an
  existing Charge. The class amount is the default value where the existing
  payment form needs an initial amount, while the actual payment amount remains
  editable. An individual override wins for that student's future Charge.
- `getPaymentDefault` returns the effective current class amount. Lesson Context
  may use this value only to initialize the existing editable payment amount;
  the student override remains a future-Charge rule and does not drive a
  dynamic form update. This does not change `createPayment` semantics or add
  another payment flow. An Admin or assigned Teacher may read the value for an
  authorized class; other roles may not.
- The Admin payment journal composes authorized `getBalanceProjection` results
  for the server-resolved class/student pairs in the Admin's own Center. Each
  recorded or cancelled Payment appears once with its exact amount, factual
  date, status, allocations, current balance/advance, and payment audit
  history. Class and participant labels are display data from their owning
  boundaries, not financial persistence reads.
- Journal edit and cancel forms may invoke only the existing `editPayment` and
  `cancelPayment` commands and MUST carry an explicit confirmation. A
  successful command reloads the authoritative projection so deterministic
  allocation/balance recomputation and the before/after audit are visible.
  Payment creation remains owned by the existing Lesson Context form and is
  not duplicated on the journal page.
- The Admin page MUST reject anonymous, non-Admin, wrong-center, forged-class,
  forged-student, and forged-payment requests before returning financial data
  or invoking a command. Hiding a section in the browser is not an access
  control.

## Personal calendar marker consumer

The personal calendar consumes the named `getPaymentMarkers` projection through
the Lesson Context adapter for a Student or a Parent's server-resolved linked
child. For each visible marker it MUST show the exact amount and factual date at
the projected `markerDate`; multiple markers with the same `markerDate` remain
separately discoverable. A marker is read-only presentation data: calendar
navigation, ordering, and rendering MUST NOT write Payment, Payment Allocation,
Charge, Balance, or Audit state. Shared Admin and Teacher calendars MUST omit
personal payment markers.

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
