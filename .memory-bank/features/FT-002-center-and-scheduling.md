---
description: Product feature for center membership, classes, and lesson scheduling.
status: active
type: feature
id: FT-002
lifecycle: verified
epic: EP-001
requirements: [REQ-003, REQ-004, REQ-014]
spec_design_status: complete
spec_design_links:
  - .memory-bank/architecture/system-architecture.md#main-architecture-units
  - .memory-bank/contracts/boundary-map.md#calendar-and-membership-query-boundary
  - .memory-bank/contracts/access-control.md
  - .memory-bank/domains/core-domain.md#ownership-map
  - .memory-bank/states/lifecycle-map.md#scheduling-and-lesson-context
---
# FT-002 — Center, Membership, and Scheduling

## Use Cases
- Admin manages teachers, classes, students, parents, and links within one
  center and chooses individual or group class mode.
- Admin or assigned teacher creates a recurring schedule and changes one lesson
  without rewriting other repetitions.
- Admin assigns or removes a teacher while preserving author attribution and
  enforcing history access.

## Edge / Failure Behavior
- Moving a lesson preserves its identity and context; it does not leave an
  unlinked duplicate.
- Removing a member or teacher closes access immediately while authored records
  retain attribution.
- A teacher can read the full class history only while assigned.

## Acceptance Criteria

### FT-002-AC-001 — Admin manages bounded center membership
- REQ: REQ-003, REQ-014
- Given an admin in a center, when teachers, classes, students, parents, and
  links are managed, then each record remains within that center and a class
  explicitly has `individual` or `group` mode.
- Verification: CRUD smoke flow plus cross-center/membership authorization cases.

### FT-002-AC-002 — Class membership supports both modes
- REQ: REQ-003
- Given a class in either mode, then its permitted teacher, student, and parent
  relationships are represented and the class calendar opens only for members
  with access.
- Verification: role-based scenario for individual and group class.

### FT-002-AC-003 — Recurring schedule creates lessons
- REQ: REQ-004
- Given a recurring class schedule, then planned lessons are created for its
  repetitions and an explicit add/transfer/cancel operation affects only the
  selected lesson.
- Verification: schedule lifecycle scenario with unaffected-repetition check.

### FT-002-AC-004 — Transfer preserves lesson identity
- REQ: REQ-004
- Given a lesson moved to another date, then the same lesson identity, shared
  material, personal contexts, and relevant history remain attached, with no
  duplicate chargeable lesson created.
- Verification: state transition scenario and identity/charge uniqueness check.

### FT-002-AC-005 — Assigned teacher receives historical access
- REQ: REQ-014
- Given a teacher assigned to a class, then the teacher can read that class's
  prior educational data, personal contexts, comments, and chat from before the
  assignment.
- Verification: authorization scenario with pre-assignment historical fixtures.

### FT-002-AC-006 — Removed assignment closes access
- REQ: REQ-014
- Given the teacher or member is removed, then a repeated read/change attempt for
  the class or personal context is denied while existing authored records retain
  attribution.
- Verification: negative authorization scenario immediately after removal.

## Acceptance Closure
| Material outcome | Coverage |
|---|---|
| Cross-center or cross-membership operation | FT-002-AC-001, FT-002-AC-002 |
| Independent schedule exception | FT-002-AC-003 |
| Transfer without duplicate lesson/charge | FT-002-AC-004 |
| Substitute teacher historical access | FT-002-AC-005 |
| Removed teacher/member access revocation | FT-002-AC-006 |

## SDD Design Gate
Global membership, scheduling, storage, authorization, and boundary ownership
are owned by `/spec-design` and composed here through:

- [.memory-bank/architecture/system-architecture.md](../architecture/system-architecture.md#main-architecture-units)
- [.memory-bank/contracts/boundary-map.md](../contracts/boundary-map.md#calendar-and-membership-query-boundary)
- [.memory-bank/contracts/access-control.md](../contracts/access-control.md)
- [.memory-bank/domains/core-domain.md](../domains/core-domain.md#ownership-map)
- [.memory-bank/states/lifecycle-map.md](../states/lifecycle-map.md#scheduling-and-lesson-context)

Feature-level contract detail remains downstream task-design work.

## Semantic Verification

- Report: [.tasks/FT-002/FT-002-S-RED-VERIFY-final-report-docs-01.md](../../.tasks/FT-002/FT-002-S-RED-VERIFY-final-report-docs-01.md): durable feature semantic report
- Independent adversarial review covered the completed AC-001..AC-006 scope,
  current public boundaries, assignment and membership revocation, recurrence
  exception isolation, stable lesson/charge identity, and supported rollback
  behavior.

SEMANTIC_VERDICT: semantic-pass
