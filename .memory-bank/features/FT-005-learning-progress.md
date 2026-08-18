---
description: Product feature for homework status, grading, and attendance.
status: active
type: feature
id: FT-005
lifecycle: verified
epic: EP-004
requirements: [REQ-009, REQ-010, REQ-014, REQ-015]
spec_design_status: complete
spec_design_links:
  - .memory-bank/contracts/boundary-map.md#cross-slice-orchestration
  - .memory-bank/contracts/boundary-map.md#attendance-charge-reconciliation-boundary
  - .memory-bank/contracts/access-control.md
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
