---
description: Product feature for homework status, grading, and attendance.
status: draft
type: feature
id: FT-005
lifecycle: planned
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
- Teacher or admin records/corrects attendance and the financial charge eligibility
  follows the resulting state.

## Edge / Failure Behavior
- Homework completion is class-visible, while the grade remains personal.
- MVP attendance has only `present` and `absent`; late/partial presence does not
  create a separate financial state.
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

## Acceptance Closure
| Material outcome | Coverage |
|---|---|
| Homework completion visibility | FT-005-AC-001 |
| Grade scale and privacy | FT-005-AC-002 |
| Absent student in either class mode not charged | FT-005-AC-003 |
| Absent-to-present correction, historical charge, balance, and audit | FT-005-AC-004 |

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
