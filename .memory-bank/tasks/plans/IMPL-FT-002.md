---
description: Implementation plan for FT-002 center and scheduling.
status: active
---
# IMPL-FT-002 — Center, Membership, and Scheduling

## Goal

Implement center-scoped participants, class modes, assignments, Admin-owned
recurring schedules, Admin/assigned-Teacher single-lesson operations, stable
lesson identity, and a scoped browser draft for the class schedule form.

## Scope / non-goals

Include admin membership operations, individual/group class representation,
Admin-owned schedule creation, Admin/assigned-Teacher single-lesson operations,
schedule replacement/exception behavior, transfer/cancel behavior,
assignment-based history access, the exact client-only
`{startDate,endDate,weekdays}` schedule draft, and server-side rejection of
zero-occurrence Admin recurring requests. Exclude
authentication provider internals, financial writes, server draft persistence,
new dependencies, and unrelated schedule validation changes.

## Strategy and ownership

`src/lib/server/modules/center-scheduling/` owns all mutable center, membership,
assignment, schedule, and lesson state. Identity & Access is consumed only
through Account Provisioning Boundary. The SvelteKit application shell owns the
disposable browser draft and calls the existing schedule form action; the draft
is not capability state or a second product source of truth. The same owner
rejects a valid date/weekday selection that yields no occurrences before any
Schedule or Lesson persistence for both authorized principals. The existing
Admin route maps its rejection to `400 invalid_schedule`; assigned Teacher
verification remains at the owner/domain boundary and retains the private
sentinel because no Teacher schedule HTTP adapter exists in this scope.

## Ordered tasks

| Wave | Task | Outcome | Dependency |
|---|---|---|---|
| W3 | TASK-005-T3-FT-002-W3 | membership, class modes, and provider-owned authorization facts | TASK-004-T3-FT-001-W3 |
| W4 | TASK-006-T2-FT-002-W4 | Admin recurring schedule creation, Admin/Teacher single-lesson operations, replacement, lesson identity, assignment authorization, and financial identity integration | TASK-005-T3-FT-002-W3; TASK-007-T3-FT-006-W4 |
| W12 | TASK-026-T3-FT-002-W12 | protected own-center Admin class/schedule and teacher-privilege browser surface | TASK-025-T3-FT-001-W11; TASK-006-T2-FT-002-W4 |
| W15 | TASK-031-T2-FT-002-W15 | same-center/class schedule draft save, restore, failure retention, and success cleanup | TASK-026-T3-FT-002-W12 |
| W16 | TASK-032-T2-FT-002-W16 | reject valid zero-occurrence schedules before Schedule/Lesson mutation with existing invalid_schedule failure | TASK-026-T3-FT-002-W12; TASK-031-T2-FT-002-W15 |
| W18 | TASK-034-T1-FT-002-W18 | strict `dd/mm/yyyy` schedule date presentation with unchanged ISO wire/storage/draft values | TASK-032-T2-FT-002-W16 |
| W19 | TASK-035-T3-FT-002-W19 | role-scoped Admin/Teacher/Student/Parent class entry shell at `/center/{centerId}/class/{classId}` | TASK-032-T2-FT-002-W16 |

## Gates and verification

Run `npm run check`, `npm run build`, and `npm run test`; verify AC-001/002 on
TASK-005, AC-003/004/005/006 on TASK-006, AC-007 on done TASK-026, AC-008
on TASK-031, and AC-009 on TASK-032. AC-009's current product claim is the
Admin owner-boundary probe; the preserved TASK-032 evidence is broader because
it also covers the previously accepted assigned-Teacher owner path. Only the
Admin adapter maps to the existing `400 invalid_schedule` envelope. Only the
Admin protected-browser/action probe may observe AC-008 draft retention. TASK-031 adds a real-browser RED/GREEN probe for same-form
restoration, cross-class isolation, malformed fallback, failure retention, and
success cleanup while observing submitted weekday Form Data. AC-010 is verified
on TASK-034 with strict user-facing date parsing plus unchanged ISO Form Data
and draft assertions. AC-011 is verified on T3 TASK-035 with the
role/principal SSR matrix and denial checks before protected class rendering.
Lesson Context,
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
The feature-level semantic gate remains pending; after AC-009 planning,
FT-002 and REQ-004 are `planned`, not `verified`, until TASK-032 closes and a
fresh `/red-verify --feature FT-002` covers AC-001..AC-009.

## W16 zero-occurrence rejection

Operator decision `2` adds AC-009 after TASK-031 closure, so queue action is
`rebuild_required` and the new task identity is separate. TASK-032 is T2 for
the Center & Scheduling domain validation, transaction precondition, and
no-mutation state proof. Its task-local RED/GREEN evidence must compare the
current zero-lesson `schedule_created` path at the owner boundary for both an
own-center Admin and an assigned Teacher with owner rejection before writes,
exact state-before/state-after equality per principal, the Admin adapter's
existing `400 invalid_schedule` mapping, and the Teacher private
`invalid-schedule-occurrences` sentinel. Browser proof is Admin-only and
observes the protected form/action and AC-008 draft retention as a supporting
prerequisite, not a transferred claim. No Teacher HTTP transport, schema
migration, public error shape, dependency, UI, or browser-storage change is
in scope.

The debug report at
`.tasks/TASK-026-T3-FT-002-W12/TASK-026-T3-FT-002-W12-S-DEBUG-final-report-docs-01.md`
proves that POST without `weekdays` still correctly returns the existing 400
`invalid_schedule` result, while a request containing `2,4,6` succeeds. It does
not confirm a current checkbox UI defect; TASK-031 preserves that validation
and addresses only accepted draft retention.

## W16 zero-occurrence closure

`TASK-032-T2-FT-002-W16` is now `done` with current Attempt 2 functional
`PASS`. The owner-boundary probe covers an own-center Admin and an assigned
Teacher with exact Schedule/Lesson state equality; only the existing Admin
adapter maps the private rejection to HTTP 400 `invalid_schedule`, while the
Teacher remains private sentinel-only with no HTTP transport. Check, build,
full test, focused test, and diff gates passed. Attempt 1 VERIFY-FAIL remains
historical correction context. FT-002, REQ-004, and EP-001 remain `planned`
until a fresh feature-level `/red-verify --feature FT-002` passes.

Evidence: `.protocols/TASK-032-T2-FT-002-W16/verification.md`,
`.tasks/TASK-032-T2-FT-002-W16/TASK-032-T2-FT-002-W16-S-VERIFY-final-report-docs-01.md`,
and the current Attempt 2 receipts under `.tasks/TASK-032-T2-FT-002-W16/`.

## FT-002 feature closure

The fresh feature-level `/red-verify --feature FT-002` covers AC-001..AC-009
and records `SEMANTIC_VERDICT: semantic-pass`. The explicit lifecycle owner
reconciles FT-002 and REQ-004 to `verified`, with EP-001 also `verified` after
its FT-001 and FT-002 feature outcomes are complete. TASK-026, TASK-031, and
TASK-032 remain `done`; no task, implementation, dependency, or historical
evidence is changed by this feature-boundary sync.

Evidence: `.tasks/FT-002/FT-002-S-RED-VERIFY-final-report-docs-01.md`.

## W18/W19 accepted UI boundary reconciliation

The operator accepted two new cohesive FT-002 outcomes after the prior
AC-001..AC-009 feature closure, so the queue action is `rebuild_required` and
fresh identities are used. `TASK-034-T1-FT-002-W18` owns only the local Admin
schedule-form presentation/parser: strict user-facing `dd/mm/yyyy` values,
explicit malformed/impossible-date handling, and unchanged canonical ISO
Form Data plus `{startDate,endDate,weekdays}` scoped draft storage. It does
not change Center & Scheduling validation, persistence, or the existing draft
key/shape.

`TASK-035-T3-FT-002-W19` owns the protected role-scoped class entry shell at
`/center/{centerId}/class/{classId}`. It consumes the existing
`AuthorizedClassScope`/Actor Context through Center & Scheduling for Admin,
Teacher, Student, and Parent membership/assignment scope, denies invalid
principal/path combinations before rendering protected class data, and leaves
`/admin/{centerId}` management intact. It does not add Lesson Context/calendar
content, a Teacher transport, direct database access, or role-changing
controls. Both cards depend on the completed TASK-032 prerequisite; neither
changes TASK-026, TASK-031, TASK-032, or their evidence. TASK-034 is now
`done` after Attempt 2 and same-Reviewer retry `PASS`; TASK-035 remains
`planned` for its separate protected route outcome.

The accepted canonical concerns are extensions of the existing Authentication
Transport schedule-draft and Browser/API path contracts plus the existing
Boundary Map Calendar and Membership Query Boundary. Planning Revision remains
`2`; no new SDD spec or global architecture decision is required. FT-002,
REQ-003, REQ-004, and shared REQ-014 remain `planned` until the new outcomes
are implemented and verified.

## TASK-035 readiness promotion — 2026-08-14

Fresh `/review-tasks-plan FT-002` returned `APPROVE` at Planning Revision `2`
with `ARCHITECTURE_VERDICT: APPROVE` and no blocking findings. The strict gate
owner's `mb-doctor --strict` result is `PASS`. Therefore
`TASK-035-T3-FT-002-W19` is promoted from `planned` to `ready` without changing
its identity, T3 tier, W19 wave, AC-011 ownership, direct SDD locators, or
dependency on done `TASK-032-T2-FT-002-W16`. TASK-034 remains `done`; all other
task and feature/requirement lifecycle statuses remain unchanged.

## TASK-035 T3 closure — 2026-08-14

`TASK-035-T3-FT-002-W19` is now `done` after independent Attempt 2 functional
`PASS` and the required per-task T3 `semantic-pass` for AC-011 / REQ-003 /
REQ-014. Attempt 1 functional failure and the bounded retry correction remain
historical evidence. FT-002 and its mapped requirements remain `planned`
pending the feature-level aggregate red-verify; TASK-034, TASK-026, TASK-031,
and TASK-032 remain `done` with identity and evidence preserved.

## FT-002 final feature-boundary closure — 2026-08-15

The fresh feature-level adversarial report records exactly one
`SEMANTIC_VERDICT: semantic-pass` across AC-001..AC-011 with no material
finding. The explicit owner reconciles FT-002, REQ-003, REQ-004, shared
REQ-014, and EP-001 to `verified`; task identities and evidence remain
unchanged, and FT-003 remains outside this boundary.
