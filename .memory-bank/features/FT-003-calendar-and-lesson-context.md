---
description: Product feature for elastic calendar navigation and shared/personal lesson views.
status: draft
type: feature
id: FT-003
lifecycle: planned
epic: EP-002
requirements: [REQ-005, REQ-006, REQ-014, REQ-016]
spec_design_status: complete
spec_design_links:
  - .memory-bank/architecture/system-architecture.md#composition-and-request-data-flow
  - .memory-bank/contracts/boundary-map.md#personal-progress-query-boundary
  - .memory-bank/contracts/access-control.md
  - .memory-bank/domains/core-domain.md#read-and-write-data-flow
  - .memory-bank/states/lifecycle-map.md#scheduling-and-lesson-context
---
# FT-003 — Elastic Calendar and Lesson Context

## Use Cases
- User opens a class calendar and reads the learning rhythm directly from its
  weekly geometry.
- User opens a date using the date picker and enters the authorized shared day
  form.
- Student, parent, teacher, or admin moves to the permitted personal calendar
  without changing the selected class or student context.

## Edge / Failure Behavior
- A non-lesson day remains visually compact but navigable.
- Color is never the only state signal.
- A class-to-personal transition cannot open another student's personal context.

## Acceptance Criteria

### FT-003-AC-001 — Elastic weekly geometry and exact navigation
- REQ: REQ-005, REQ-016
- Given a calendar week, then lesson days occupy more space than non-lesson days,
  each week may have independent geometry, and the standard date picker reaches
  the selected date.
- Verification: UI smoke flow plus operator visual review against the stated
  qualitative criterion.

### FT-003-AC-002 — State remains perceivable without color alone
- REQ: REQ-005
- Given lesson and non-lesson states, then their meaning is conveyed by geometry
  together with a label, symbol, or other distinguishable cue in addition to
  color.
- Verification: accessibility-oriented UI review with color-independent check.

### FT-003-AC-003 — Shared day form exposes common lesson material
- REQ: REQ-006
- Given an authorized class lesson day, then the shared form exposes topic,
  practical work, and homework to the permitted class context.
- Verification: role-based smoke flow for teacher, student, and parent.

### FT-003-AC-004 — Personal day reuses shared material
- REQ: REQ-006
- Given an authorized student context, then the personal form shows the same
  lesson's common material plus only that student's personal data.
- Verification: personal-context UI scenario with selected-student assertions.

### FT-003-AC-005 — Calendar transitions preserve context
- REQ: REQ-005, REQ-006
- Given a class calendar and an allowed student link, then navigation to and from
  the personal calendar preserves date/class/student identity and returns to the
  corresponding shared day.
- Verification: navigation smoke flow with URL/session context assertions.

### FT-003-AC-006 — Personal data is not cross-student visible
- REQ: REQ-006, REQ-014
- Given a student or parent session, then another student's grade, private
  discussion, or financial data is unavailable even if the other calendar URL or
  UI element is guessed; server-side authorization is decisive.
- Verification: negative role/membership/student access scenarios.

## Acceptance Closure
| Material outcome | Coverage |
|---|---|
| Elastic learning rhythm and exact date access | FT-003-AC-001 |
| Color-independent state meaning | FT-003-AC-002 |
| Shared lesson materials | FT-003-AC-003 |
| Personal context composition | FT-003-AC-004 |
| Wrong-student navigation/access | FT-003-AC-005, FT-003-AC-006 |

## SDD Design Gate
Global calendar runtime, temporal source of truth, shared/personal boundaries,
authorization, and UI contracts are owned by `/spec-design` and composed here
through:

- [.memory-bank/architecture/system-architecture.md](../architecture/system-architecture.md#composition-and-request-data-flow)
- [.memory-bank/contracts/boundary-map.md](../contracts/boundary-map.md#personal-progress-query-boundary)
- [.memory-bank/contracts/access-control.md](../contracts/access-control.md)
- [.memory-bank/domains/core-domain.md](../domains/core-domain.md#read-and-write-data-flow)
- [.memory-bank/states/lifecycle-map.md](../states/lifecycle-map.md#scheduling-and-lesson-context)

Feature-level contract detail remains downstream task-design work.
