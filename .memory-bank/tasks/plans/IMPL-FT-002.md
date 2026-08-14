---
description: Implementation plan for FT-002 center and scheduling.
status: active
---
# IMPL-FT-002 — Center, Membership, and Scheduling

## Goal

Implement center-scoped participants, class modes, assignments, recurring
schedules, stable lesson identity, and a scoped browser draft for the class
schedule form.

## Scope / non-goals

Include admin membership operations, individual/group class representation,
schedule exceptions, transfer/cancel behavior, assignment-based history access,
the exact client-only `{startDate,endDate,weekdays}` schedule draft, and
server-side rejection of zero-occurrence recurring requests. Exclude
authentication provider internals, financial writes, server draft persistence,
new dependencies, and unrelated schedule validation changes.

## Strategy and ownership

`src/lib/server/modules/center-scheduling/` owns all mutable center, membership,
assignment, schedule, and lesson state. Identity & Access is consumed only
through Account Provisioning Boundary. The SvelteKit application shell owns the
disposable browser draft and calls the existing schedule form action; the draft
is not capability state or a second product source of truth. The same owner
rejects a valid date/weekday selection that yields no occurrences before any
Schedule or Lesson persistence, while the route preserves the existing
`400 invalid_schedule` transport shape.

## Ordered tasks

| Wave | Task | Outcome | Dependency |
|---|---|---|---|
| W3 | TASK-005-T3-FT-002-W3 | membership, class modes, and provider-owned authorization facts | TASK-004-T3-FT-001-W3 |
| W4 | TASK-006-T2-FT-002-W4 | schedule lifecycle, lesson identity, assignment authorization, and financial identity integration | TASK-005-T3-FT-002-W3; TASK-007-T3-FT-006-W4 |
| W12 | TASK-026-T3-FT-002-W12 | protected own-center Admin class/schedule and teacher-privilege browser surface | TASK-025-T3-FT-001-W11; TASK-006-T2-FT-002-W4 |
| W15 | TASK-031-T2-FT-002-W15 | same-center/class schedule draft save, restore, failure retention, and success cleanup | TASK-026-T3-FT-002-W12 |
| W16 | TASK-032-T2-FT-002-W16 | reject valid zero-occurrence schedules before Schedule/Lesson mutation with existing invalid_schedule failure | TASK-026-T3-FT-002-W12; TASK-031-T2-FT-002-W15 |

## Gates and verification

Run `npm run check`, `npm run build`, and `npm run test`; verify AC-001/002 on
TASK-005, AC-003/004/005/006 on TASK-006, AC-007 on done TASK-026, and AC-008
on TASK-031. TASK-031 adds a real-browser RED/GREEN probe for same-form
restoration, cross-class isolation, malformed fallback, failure retention, and
success cleanup while observing submitted weekday Form Data. Lesson Context,
Collaboration, and Learning Progress projections remain downstream
consumer-owned outcomes; adding dependencies on those consumers would create
cycles.

## Planning Revision 2 reconciliation

The global backbone remains `complete` at Planning Revision 2. The accepted
Center & Scheduling boundary and its downstream consumer topology are
unchanged; TASK-005 and TASK-006 retain their identities, tiers, waves,
dependencies, statuses, historical evidence, and retry history. No FT-002 task
record was changed by this historical planning reconciliation. TASK-031 was
added later as the explicit AC-008 follow-up and is reconciled below.

## W15 schedule-draft closure

New AC-008 is material behavior introduced after TASK-026 completed, so queue
action is `rebuild_required` and a fresh identity is used. TASK-005, TASK-006,
and TASK-026 retain their identities, done lifecycle, dependencies, evidence,
and scope. TASK-031 is T2 because it changes bounded browser state/data
behavior without auth, permissions, secret handling, server runtime, or durable
product data. It is `ready`: TASK-026 and the transitive Foundation gate are
done. The authoritative card is now `done` with independent functional
`PASS`; its verification report proves the real-browser RED/GREEN path and
project gates. Planning Revision remains `2`.

Evidence: `.protocols/TASK-031-T2-FT-002-W15/verification.md` and
`.tasks/TASK-031-T2-FT-002-W15/TASK-031-T2-FT-002-W15-S-VERIFY-final-report-docs-01.md`.
The feature-level semantic gate remains pending, so FT-002 and REQ-004 are
`implemented`, not `verified`.

## W16 zero-occurrence rejection

Operator decision `2` adds AC-009 after TASK-031 closure, so queue action is
`rebuild_required` and the new task identity is separate. TASK-032 is T2 for
the Center & Scheduling domain validation, transaction precondition, and
no-mutation state proof. Its task-local RED/GREEN evidence must compare the
current zero-lesson `schedule_created` path with the required `400
invalid_schedule` rejection, exact state-before/state-after equality, and a
valid-occurrence regression. Browser proof observes the protected form/action
failure while leaving AC-008 localStorage behavior as a prerequisite, not a
transferred claim. No schema migration, public error shape, dependency, UI,
or browser-storage change is in scope.

The debug report at
`.tasks/TASK-026-T3-FT-002-W12/TASK-026-T3-FT-002-W12-S-DEBUG-final-report-docs-01.md`
proves that POST without `weekdays` still correctly returns the existing 400
`invalid_schedule` result, while a request containing `2,4,6` succeeds. It does
not confirm a current checkbox UI defect; TASK-031 preserves that validation
and addresses only accepted draft retention.
