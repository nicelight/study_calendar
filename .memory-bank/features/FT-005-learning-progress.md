---
description: Product feature for homework status, grading, and attendance.
status: active
type: feature
id: FT-005
lifecycle: planned
last_updated: 2026-09-04
source_of_truth:
  - .memory-bank/features/FT-005-learning-progress.md
  - .memory-bank/contracts/learning-progress-browser-surface.md
clarification_status: complete
last_clarified: 2026-09-04
clarification_questions: 0
epic: EP-004
requirements: [REQ-009, REQ-010, REQ-014, REQ-015]
spec_design_status: complete
spec_design_links:
  - .memory-bank/contracts/boundary-map.md#cross-slice-orchestration
  - .memory-bank/contracts/boundary-map.md#attendance-charge-reconciliation-boundary
  - .memory-bank/contracts/access-control.md
  - .memory-bank/contracts/learning-progress-browser-surface.md#server-composed-homework-projection
  - .memory-bank/contracts/learning-progress-browser-surface.md#authorized-homework-form-actions
  - .memory-bank/contracts/learning-progress-browser-surface.md#browser-user-surface-and-persistence
  - .memory-bank/contracts/financial-ledger.md#financial-facts-and-invariants
  - .memory-bank/domains/core-domain.md#ownership-map
  - .memory-bank/states/lifecycle-map.md#learning-and-finance
  - .memory-bank/runbooks/mvp-verification.md#required-pre-real-data-checks
---
# FT-005 — Learning Progress

## Use Cases
- Student marks their homework complete.
- Teacher records a grade using `α`, `β`, `γ`, or `F`.
- At the end of a lesson, Teacher opens the class lesson day, marks absent
  students with a minus, and saves the attendance list.
- Lesson-day student controls show the student's stored FIO instead of exposing
  the technical account ID as the primary label.
- Lesson dates and factual payment dates are shown/entered as `dd.mm.yyyy`,
  while the payment action continues receiving an ISO date.
- Teacher or admin records/corrects attendance and the financial charge eligibility
  follows the resulting state.

## Edge / Failure Behavior
- Homework completion is class-visible, while the grade remains personal.
- MVP attendance has only `present` and `absent`; late/partial presence does not
  create a separate financial state.
- In the class attendance form, a minus marks the selected student `absent`;
  every student without a minus is saved as `present`.
- An absent student in either class mode is not charged; correcting `absent` to
  `present` creates the applicable historical-price charge, recalculates the
  balance, and records an audit entry.

## Acceptance Criteria

### FT-005-AC-001 — Student completion is visible to the class
- REQ: REQ-009
- Given a student with an assigned homework item, then the student can mark it
  complete and the completion status is visible in the permitted class context.
- Verification: role-based education smoke flow.

### FT-005-AC-002 — Grades use the accepted scale and privacy
- REQ: REQ-009, REQ-014
- Given a teacher with access to the class, then a homework grade can be one of
  `α`, `β`, `γ`, `F`; the corresponding student/family, assigned teacher, and
  admin can see it, while another student/parent cannot.
- Verification: grade integration scenario with positive and negative role cases.

### FT-005-AC-003 — Attendance controls charge eligibility in both class modes
- REQ: REQ-010, REQ-015
- Given an individual or group lesson, then `absent` creates no student charge
  and `present` is charge-eligible at the historically applicable price.
- Verification: ledger-linked attendance scenario for both class modes.

### FT-005-AC-004 — Absent-to-present correction is auditable
- REQ: REQ-010, REQ-015
- Given an individual or group lesson recorded as `absent`, when an authorized
  user corrects attendance to `present`, then the system creates a charge using
  the historically applicable price, deterministically recalculates the
  student's balance, and records the author, time, and financial change in an
  audit record without changing unrelated students' records.
- Verification: correction/recalculation scenario with audit and isolation checks.

### FT-005-AC-005 — Teacher records attendance from the class lesson day
- REQ: REQ-010
- Given an assigned Teacher at the end of an individual or group lesson, when
  the Teacher opens the lesson day and saves the student list with a minus next
  to each absent student, then those students are stored as `absent` and every
  unmarked student is stored as `present`. The resulting attendance remains
  the source for charge eligibility and later correction.
- Verification: browser/integration attendance flow for both class modes with
  persisted state and charge-eligibility assertions.

## Acceptance Closure
| Material outcome | Coverage |
|---|---|
| Homework completion visibility | FT-005-AC-001 |
| Grade scale and privacy | FT-005-AC-002 |
| Absent student in either class mode not charged | FT-005-AC-003 |
| Absent-to-present correction, historical charge, balance, and audit | FT-005-AC-004 |
| Teacher attendance input and default-present save behavior | FT-005-AC-005 |

## SDD Design Gate
Global education state, charge eligibility, audit, storage, and privacy
contracts are owned by `/spec-design` and composed here through:

- [.memory-bank/contracts/boundary-map.md](../contracts/boundary-map.md#cross-slice-orchestration)
- [.memory-bank/contracts/boundary-map.md](../contracts/boundary-map.md#attendance-charge-reconciliation-boundary)
- [.memory-bank/contracts/access-control.md](../contracts/access-control.md)
- [.memory-bank/contracts/financial-ledger.md](../contracts/financial-ledger.md#financial-facts-and-invariants)
- [.memory-bank/domains/core-domain.md](../domains/core-domain.md#ownership-map)
- [.memory-bank/states/lifecycle-map.md](../states/lifecycle-map.md#learning-and-finance)
- [.memory-bank/runbooks/mvp-verification.md](../runbooks/mvp-verification.md#required-pre-real-data-checks)

Feature-level contract detail remains downstream task-design work.

## Applied Global Design Decision

At Planning Revision 2, Learning Progress is the provider owner for
lesson-to-homework selection/relation semantics and the authorized
lesson-scoped personal grade query. The FT-005 grade facts and privacy outcome
remain owned by `TASK-009-T3-FT-005-W5`; the provider-compatible query outcome is
planned separately in `TASK-018-T3-FT-005-W8` so historical TASK-009 evidence is
not broadened retroactively. Lesson Context consumes the named query and does
not persist or resolve a competing `lessonId -> homeworkId` mapping.

## Browser completion and grading reconciliation — 2026-09-04

The operator accepted the minimal browser scope for the missing homework
surface. The existing class-scoped `learning_homework` model is reused: the
provider resolves the single item for the current authorized class, while zero
items produce no item and multiple items fail closed. No `lesson_id` relation,
migration, new mutation API, or consumer-owned homework mapping is added.

The existing `FT-005-AC-001` and `FT-005-AC-002` remain the only product
acceptance criteria for this scope. No additional non-critical AC is
introduced. The work is split into two sequential T3 outcomes: server
projection/actions first, then UI and disposable Playwright proof.

- [TASK-105-T3-FT-005-W37](../tasks/TASK-105-T3-FT-005-W37.task.json) will
  close the server-side `/lesson-context` projection and named form-action
  transport.
- [TASK-106-T3-FT-005-W38](../tasks/TASK-106-T3-FT-005-W38.task.json) will
  close the browser UI and persistence/privacy proof after W37.

Feature lifecycle is kept `planned` until these planned outcomes receive their
own execution and verification evidence; no product promotion is inferred by
task planning.

## Task-plan approval and decomposition closure — 2026-09-04

The fresh `/review-tasks-plan FT-005` returned `APPROVE` at Planning Revision
`2` ([review report](../../.tasks/TASK-MB-REVIEW-TASKS-PLAN/TASK-MB-REVIEW-TASKS-PLAN-S-TASKS-FT-005-R5-final-report-docs-01.md)).
The final sequential queue is `TASK-105-T3-FT-005-W37` →
`TASK-106-T3-FT-005-W38`; decomposition is closed for this revision. The
cards remain `planned` until execution ownership proceeds, and the feature,
EP-004, and REQ-009 remain `planned` until browser outcomes are independently
verified.

## Clarifications

On 2026-09-04, the fresh task-plan review was validated against the accepted
feature intent. The W37/W38 proof contracts must explicitly cover the existing
AC-001/AC-002 paths, duplicate create prevention, server-generated opaque IDs,
isolated-state cleanup, and Admin/assigned-Teacher creation in the browser.
These are execution-proof repairs, not new product behavior. The feature,
EP-004, and REQ-009 therefore remain `planned` until the new browser outcomes
are executed and independently verified; historical backend evidence remains
unchanged.

## Task Coverage at W5 Boundary

- W5 `TASK-009-T3-FT-005-W5` is reconciled through the current Attempt 2
  functional `PASS` and required T3 semantic `semantic-pass` evidence for
  `FT-005-AC-001` and `FT-005-AC-002`:
  - [current functional report](../../.tasks/TASK-009-T3-FT-005-W5/TASK-009-T3-FT-005-W5-S-VERIFY-final-report-docs-02.md)
  - [current semantic report](../../.tasks/TASK-009-T3-FT-005-W5/TASK-009-T3-FT-005-W5-S-RED-VERIFY-final-report-docs-02.md)
- Attempt 1 semantic-fail/report-01 remains preserved only as historical
  correction basis and is not current closure evidence.
- Feature document `status: draft`, feature `lifecycle: planned`, and the
  EP-004/REQ lifecycle values remain unchanged; no product promotion was
  applied by `/mb-sync`.
- The combined [W5 boundary sync report](../../.tasks/TASK-011-T3-FT-004-W5/TASK-011-T3-FT-004-W5-S-MB-SYNC-final-report-docs-01.md)
  records the final reconciliation after TASK-011 while the current TASK-009
  functional and semantic report links above remain the closure evidence.

## Task Coverage at W6 Boundary

- W6 `TASK-010-T3-FT-005-W6` is reconciled through its current functional
  `PASS` and required T3 semantic `semantic-pass` evidence for
  `FT-005-AC-003` and `FT-005-AC-004`:
  - [current functional report](../../.tasks/TASK-010-T3-FT-005-W6/TASK-010-T3-FT-005-W6-S-VERIFY-final-report-docs-01.md)
  - [current semantic report](../../.tasks/TASK-010-T3-FT-005-W6/TASK-010-T3-FT-005-W6-S-RED-VERIFY-final-report-docs-01.md)
- The [W6 boundary sync report](../../.tasks/TASK-010-T3-FT-005-W6/TASK-010-T3-FT-005-W6-S-MB-SYNC-final-report-docs-01.md)
  records the durable reconciliation; current TASK-009 `done` state remains
  preserved from the W5 boundary.
- Feature document `status: draft`, feature `lifecycle: planned`, and the
  EP-004/REQ lifecycle values remain unchanged; no product promotion was
  applied by `/mb-sync`.

## Task Coverage at W8 Boundary

- The authoritative [TASK-018-T3-FT-005-W8 card](../tasks/TASK-018-T3-FT-005-W8.task.json)
  is `done` with current functional `PASS` and required T3 semantic
  `semantic-pass` evidence for the provider-owned lesson-scoped grade query:
  - [functional verification protocol](../../.protocols/TASK-018-T3-FT-005-W8/verification.md)
  - [semantic verification report](../../.tasks/TASK-018-T3-FT-005-W8/TASK-018-T3-FT-005-W8-S-RED-VERIFY-final-report-docs-01.md)
  - [W8 boundary sync report](../../.tasks/TASK-018-T3-FT-005-W8/TASK-018-T3-FT-005-W8-S-MB-SYNC-final-report-docs-01.md)
- The current evidence proves provider-owned lesson resolution and homework
  selection, exact-one/zero/multiple fail-closed cardinality, the accepted
  selected-student grade/privacy path, and read-only state preservation.
  TASK-009 remains the owner of the original homework/grade facts; its evidence
  is not broadened retroactively.
- Executor RED/GREEN and native gate receipts remain supporting evidence; the
  current functional and semantic verifier records above are the closure path.
- Feature document `status: draft`, feature `lifecycle: planned`, EP-004
  lifecycle, and REQ-009/REQ-014 RTM lifecycle values remain unchanged. No
  feature-level semantic verdict or product promotion was inferred.

## W22 fresh attendance-entry closure — 2026-08-18

`TASK-042-T3-FT-005-W22` is now `done` with fresh functional `PASS` and
semantic `semantic-pass` evidence for `FT-005-AC-005` / `REQ-010` / `REQ-014`.
The assigned-Teacher lesson-day flow persists the submitted absent subset and
defaults every other authorized student to present through Learning Progress;
Lesson Context remains an adapter and Financial Ledger remains the charge
consequence owner.

- [TASK-042 card](../tasks/TASK-042-T3-FT-005-W22.task.json)
- [functional verification](../../.tasks/TASK-042-T3-FT-005-W22/TASK-042-T3-FT-005-W22-S-VERIFY-final-report-docs-01.md)
- [semantic verification](../../.tasks/TASK-042-T3-FT-005-W22/TASK-042-T3-FT-005-W22-S-RED-VERIFY-final-report-docs-01.md)
- [W22 boundary sync](../../.tasks/TASK-044-T3-FT-006-W22/TASK-044-T3-FT-006-W22-S-MB-SYNC-final-report-docs-01.md)

The accepted feature and EP-004 lifecycle values remain unchanged by this
sync; the fresh task closure adds evidence and does not infer a new product
promotion.

## W37 server transport closure — 2026-09-05

`TASK-105-T3-FT-005-W37` is durably `done` from its current Attempt 2
implementation, independent functional `PASS`, required T3 `semantic-pass`,
and scheduler closure for `FT-005-AC-001 / FT-005-AC-002 / REQ-009 / REQ-014`.
The Lesson Context server transport now composes the provider-owned
class-scoped homework projection and delegates named create, completion, and
grading actions through Learning Progress. The evidence covers zero/one/
multiple selection with fail-closed ambiguity, class-visible completion
without shared grades, private grade projection, server-generated opaque IDs,
repeat-create idempotency, accepted grades, deny-before-write behavior, and
the unchanged GET-only API boundary.

- [TASK-105 card](../tasks/TASK-105-T3-FT-005-W37.task.json)
- [Attempt 2 functional verification](../../.protocols/TASK-105-T3-FT-005-W37/verification.md)
- [functional report](../../.tasks/TASK-105-T3-FT-005-W37/TASK-105-T3-FT-005-W37-S-VERIFY-final-report-docs-02.md)
- [Attempt 2 semantic verification](../../.protocols/TASK-105-T3-FT-005-W37/red-verification.md)
- [semantic report](../../.tasks/TASK-105-T3-FT-005-W37/TASK-105-T3-FT-005-W37-S-RED-VERIFY-final-report-docs-02.md)
- [W37 boundary sync](../../.tasks/TASK-105-T3-FT-005-W37/TASK-105-T3-FT-005-W37-S-MB-SYNC-final-report-docs-01.md)

Attempt 1 and its semantic finding remain preserved as historical correction
basis only. `TASK-106-T3-FT-005-W38` remains `planned` pending its own UI and
browser proof. FT-005 and EP-004 remain `lifecycle: planned`; REQ-009 and
shared REQ-014 remain `planned`. This task-scoped reconciliation changes no
feature, epic, or requirement lifecycle, dependency, promotion, task-plan
approval, Planning Revision, or scheduler state.

## W38 browser UI closure — 2026-09-05

`TASK-106-T3-FT-005-W38` is durably `done` from its current Attempt 1 UI
implementation, independent functional `PASS`, required T3 `semantic-pass`,
and scheduler closure for `FT-005-AC-001 / FT-005-AC-002 / REQ-009 / REQ-014`.
The existing Lesson Context page now consumes W37's server projection and
named actions for Student completion, class-visible statuses, and Admin/
assigned-Teacher grading. The fresh disposable Playwright proof covers Admin
creation, completion/reload persistence, `α`/`β`/`γ`/`F`, corresponding
Student/linked-Parent visibility, unrelated Student/unlinked-Parent denial,
state preservation, and exact disposable cleanup.

- [TASK-106 card](../tasks/TASK-106-T3-FT-005-W38.task.json)
- [functional evidence](../../.protocols/TASK-106-T3-FT-005-W38/verification.md)
- [functional report](../../.tasks/TASK-106-T3-FT-005-W38/TASK-106-T3-FT-005-W38-S-VERIFY-final-report-docs-01.md)
- [semantic evidence](../../.protocols/TASK-106-T3-FT-005-W38/red-verification.md)
- [semantic report](../../.tasks/TASK-106-T3-FT-005-W38/TASK-106-T3-FT-005-W38-S-RED-VERIFY-final-report-docs-01.md)
- [W38 boundary sync](../../.tasks/TASK-106-T3-FT-005-W38/TASK-106-T3-FT-005-W38-S-MB-SYNC-final-report-docs-01.md)

The W37/W38 task contour is now evidenced, but this task-level sync does not
make the feature-level aggregate lifecycle decision. FT-005 and EP-004 remain
`lifecycle: planned`; REQ-009 and shared REQ-014 remain `planned`. Task
identity, dependencies, Planning Revision `2`, accepted Learning Progress
ownership, promotion, dependent state, and scheduler/Judge state are unchanged.

## Semantic Verification

- Fresh feature-level `/red-verify --feature FT-005` found no reportable
  material semantic break or operator-owned question across AC-001..005,
  REQ-009/010/014/015, the current W5/W6/W8/W22/W37/W38 task evidence, direct
  canonical specs, implementation routes, and sync routes.
- Independent adversarial coverage included server-side role/center/class/
  student/family scope, Learning Progress ownership, homework selection and
  idempotency, grade privacy, attendance/financial state continuity, denied
  state preservation, direct route/API bypass checks, fresh targeted Vitest,
  and disposable Playwright cleanup. The two required fresh `Codex Luna`
  `xhigh` co-reviews were launched with separate focuses; no usable candidate
  payload arrived in their bounded window.
- [Feature-level semantic verification report](../../.tasks/FT-005/FT-005-S-RED-VERIFY-final-report-docs-01.md)

SEMANTIC_VERDICT: semantic-pass
