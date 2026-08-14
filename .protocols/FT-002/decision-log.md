---
description: Durable decisions for FT-002 task planning.
status: active
---
# FT-002 Decision Log

## 2026-08-08 — Task queue created

Membership/authorization and schedule lifecycle are distinct cohesive outcomes and remain sibling tasks. Existing boundary, access, domain, and lifecycle specs are sufficient. Planning Revision remains `1`.

## 2026-08-10 — Planning Revision 2 reconciliation

The accepted provider decision does not change Center & Scheduling ownership,
the accepted graph, or FT-002 task boundaries. TASK-005 and TASK-006 remain
untouched with their identity, status, dependencies, historical evidence, and
retry history preserved.

## 2026-08-14 — Scoped schedule-form draft rebuild

The operator accepted a new material AC after the own-center Admin surface was
completed: persist only `{startDate,endDate,weekdays}` in browser
`localStorage`, key it by `centerId` plus `classId`, restore only the same form,
ignore missing/malformed values to clean defaults, retain on failure, and clear
only after successful schedule creation. Stored dates are canonical ISO values
and weekdays are integers `0..6`. Passwords, sessions, invitation/auth values,
arbitrary fields, server persistence, new dependencies, and server validation
changes are excluded.

This is `rebuild_required`, not repair of done TASK-026. Fresh
`TASK-031-T2-FT-002-W15` owns AC-008 and depends on TASK-026; historical task
identity, lifecycle, evidence, and Planning Revision `2` remain unchanged.
Browser state is a leaf application-shell concern, so the accepted capability
graph does not change.

The retained debug report proves only that an omitted `weekdays` POST reaches
the expected existing 400/`invalid_schedule` path and that supplied `2,4,6`
succeeds. The reported screenshot run lacks its exact Form Data/HAR, so no
current checkbox UI bug is confirmed or claimed by this plan.

## 2026-08-14 — TASK-031 functional closure sync

The explicit T2 closure is already authoritative in
`TASK-031-T2-FT-002-W15.task.json`: status `done`, independent functional
`PASS`, and the linked Chrome/browser, SSR, check, build, test, and diff
evidence. This sync changes no task decision, code, tests, dependency, or
promotion state. TASK-026 remains `done` and unchanged.

The durable feature/RTM state is reconciled to FT-002 `active` /
`implemented` and REQ-004 `implemented`. The existing feature-level semantic
report predates AC-008; therefore `verified` is intentionally deferred until a
fresh `/red-verify --feature FT-002` covers AC-001..AC-008.

## 2026-08-14 — Operator decision 2: reject zero-occurrence schedules

The feature-level semantic review identified that canonical dates plus a valid
weekday that does not occur inside the inclusive range currently persist a
zero-Lesson schedule, return `schedule_created`, and clear the matching
browser draft. The operator selected decision `2`: reject this input before
any schedule or lesson persistence or mutation. The accepted external error
contract is the existing Admin `400` `{ error: 'invalid_schedule' }` envelope;
no new public error shape is introduced and the internal sentinel remains an
implementation detail.

This is material AC-009 / REQ-004 scope and therefore `rebuild_required`, not
a mutation of done TASK-031. `TASK-032-T2-FT-002-W16` owns the Center &
Scheduling validation and no-mutation proof, depends on done TASK-026 and
TASK-031 for execution cohesion, and must leave the localStorage draft and
valid-occurrence behavior unchanged. FT-002 remains unverified until the
follow-up task and a fresh feature-level semantic gate pass.

## 2026-08-14 — TASK-032 review correction: both authorized principals

The task-plan review required AC-009 proof to cover the complete accepted
authority surface, not only the Admin form. TASK-032 now requires the same
valid-but-zero-occurrence command to be exercised independently at the owner
boundary as an own-center Admin and as an assigned Teacher. The owner must
reject before writes and prove exact Schedule/Lesson state-before/state-after
equality for each. The existing Admin adapter maps its rejection to HTTP 400
`{ error: 'invalid_schedule' }`; the assigned Teacher has no schedule HTTP
adapter in this scope, so its private `invalid-schedule-occurrences` sentinel
remains internal and no Teacher transport is added.

This is a proof/contract-surface correction only: no new public error shape,
authorization decision, task identity, dependency, implementation, or test is
introduced. TASK-032 remains `in_progress` for re-execution after the failed
verification; FT-002 remains `planned` and no task is marked `done` here.

## 2026-08-14 — TASK-032 functional closure sync

Attempt 2 and the same-Reviewer re-verification passed the corrected AC-009
contract. The explicit lifecycle owner consumed the current functional PASS and
closed `TASK-032-T2-FT-002-W16` as `done`. The current evidence records exact
Schedule/Lesson state equality for own-center Admin and assigned Teacher, the
existing Admin `400 invalid_schedule` adapter mapping, the Teacher private
`invalid-schedule-occurrences` sentinel, and all required project gates.

At the task-only boundary FT-002, REQ-004, and EP-001 remained `planned` until
the fresh feature-level `/red-verify --feature FT-002` covered AC-001..AC-009.
TASK-026 and TASK-031,
their implementation, and all historical Attempt 1/VERIFY-FAIL evidence remain
unchanged. No implementation, test, dependency, or promotion change occurred
in this sync.

## 2026-08-14 — FT-002 feature semantic closure sync

Fresh `/red-verify --feature FT-002` returned `SEMANTIC_VERDICT: semantic-pass`
across AC-001..AC-009 with no material finding or operator question. The
explicit lifecycle owner reconciled FT-002 and REQ-004 to `verified`; EP-001 is
also `verified` because both of its feature outcomes and applicable REQ
mappings are verified. TASK-026, TASK-031, and TASK-032 remain `done` with all
implementation and evidence unchanged.
