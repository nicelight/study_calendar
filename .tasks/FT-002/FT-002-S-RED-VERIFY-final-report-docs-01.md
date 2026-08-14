---
description: Current independent feature-level adversarial semantic verification report for FT-002.
status: final
---
# Red Verify — FT-002

## Accepted semantic target

FT-002 AC-001..AC-008 must keep center/class membership, authorization,
recurring Lesson creation and exceptions, teacher assignment/revocation, the
protected Admin surface, and the scoped browser draft mutually consistent.
Center & Scheduling remains the server source of truth; browser storage may
retain only the exact disposable center/class draft and may clear it only after
a semantically successful schedule creation.

## Evidence and adversarial coverage

- Inspected all indexed FT-002 cards and current functional/semantic evidence
  for TASK-005, TASK-006, TASK-026, and TASK-031; prior PASS and the historical
  AC-001..AC-006 feature report were supporting context only.
- Inspected AC-001..AC-008, REQ-003/004/014, the actual current diff, and the
  direct architecture, Calendar/Membership, Access Control, Authentication
  Transport draft, Core Domain, Lifecycle, and Testing contracts.
- Inspected the current Center & Scheduling owner boundary, Admin route/action
  adapters, schema constraints, Svelte page, focused tests, TASK-026 hostile
  evidence, and TASK-031 fresh Chrome artifact. The TASK-031 production diff is
  confined to the Admin page; TASK-026 server/owner scope, authorization,
  persistence, packages, and retained evidence are unchanged.
- Hostile review covered center/class ownership and isolation, individual/group
  capacity, recurring exceptions and lesson identity, assignment/history
  access and immediate revocation, Admin/Teacher authority, server-side scope,
  exact localStorage key/payload isolation, malformed/unavailable storage,
  failure retention, exact-key success cleanup, SSR safety, secret/session
  exclusion, and cross-center identity reuse.
- Fresh disposable `:memory:` owner-boundary probe used an authorized Admin,
  one class, `2026-08-10..2026-08-10`, and weekday `[2]` (Tuesday). The public
  command returned zero Lessons, persisted one schedule row, and persisted no
  Lesson row. Current `createSchedule` nevertheless returns
  `schedule_created`; TASK-031 then clears that class draft on this result.

## Admitted material concern

**Zero-occurrence schedule is reported as created and destroys the recoverable
draft.** This is a supported browser/server path: canonical dates, a valid
weekday, and an authorized own-center Admin pass every current validation, but
the selected weekday need not occur inside the date range. The result is a
durable schedule with no planned Lesson, a success banner, and exact-key draft
cleanup. This creates a realistic false success at the AC-003/AC-008 boundary.

The accepted text does not unambiguously decide whether an empty recurrence is
an invalid schedule or a valid zero-Lesson schedule, so the verifier cannot
choose the favorable interpretation.

## Operator question

Must recurring schedule creation require at least one matching date inside the
submitted range? If yes, the owner boundary must reject/roll back the empty
recurrence and the browser must retain the draft. If no, the canonical feature
and transport contracts must explicitly accept a zero-Lesson schedule and its
success cleanup. FT-002 verification closure and dependents relying on created
Lesson facts remain affected until this choice is durable and reverified.

## Failure / Blocker

- status: `semantic-concern`
- where: `CenterSchedulingBoundary.createRecurringSchedule` -> Admin
  `createSchedule` action -> schedule-draft success cleanup
- expected/observed: product meaning is unresolved; current supported path
  persists an empty schedule, reports success, and removes its draft
- likely category: feature-level schedule-validation/acceptance ambiguity
- next action: operator decision through `/feature-doctor FT-002`, durable
  application through `/feature-to-tasks FT-002` (or the owning spec route),
  then affected functional verification and `/red-verify --feature FT-002`
- replan required: conditional on the decision; required for a reject/rollback
  behavior change, otherwise a durable accepted-contract clarification is due

## Owner handoff

The active scheduler/explicit lifecycle owner should keep FT-002 at
`implemented`, not `verified`, and must not treat this feature gate as closure.
This verifier changed no task status, dependency, promotion, implementation, or
scheduler state.

SEMANTIC_VERDICT: semantic-concern
