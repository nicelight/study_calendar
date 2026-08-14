---
description: Product feature for center membership, classes, and lesson scheduling.
status: active
type: feature
id: FT-002
lifecycle: planned
epic: EP-001
requirements: [REQ-003, REQ-004, REQ-014]
spec_design_status: complete
spec_design_links:
  - .memory-bank/architecture/system-architecture.md#main-architecture-units
  - .memory-bank/contracts/boundary-map.md#calendar-and-membership-query-boundary
  - .memory-bank/contracts/access-control.md
  - .memory-bank/contracts/authentication-transport.md#class-schedule-draft-retention
  - .memory-bank/domains/core-domain.md#ownership-map
  - .memory-bank/states/lifecycle-map.md#scheduling-and-lesson-context
---
# FT-002 — Center, Membership, and Scheduling

## Use Cases
- Admin manages teachers, classes, students, parents, and links within one
  center and chooses individual or group class mode.
- Admin or assigned teacher creates a recurring schedule and changes one lesson
  without rewriting other repetitions.
- Admin can leave or reload a partially completed class schedule form and
  resume that same class draft in the same browser.
- Admin assigns or removes a teacher while preserving author attribution and
  enforcing history access.

## Edge / Failure Behavior
- Moving a lesson preserves its identity and context; it does not leave an
  unlinked duplicate.
- Removing a member or teacher closes access immediately while authored records
  retain attribution.
- A teacher can read the full class history only while assigned.
- Missing or malformed browser draft state opens a clean schedule form and
  never crosses center/class scope.
- A valid date range and weekday selection that yields no actual occurrence in
  the inclusive range is rejected before any schedule or lesson persistence;
  the Admin action returns the existing `400 { error: "invalid_schedule" }`
  shape and leaves state unchanged.

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

### FT-002-AC-007 — Admin manages classes and teacher privileges in the browser
- REQ: REQ-003, REQ-004, REQ-014
- Given an authenticated Admin with a center membership, when the Admin opens
  the center Admin UI, then the Admin can create/edit/delete individual or
  group classes, create schedules, invite teachers, and assign or remove
  teachers from classes. Every command is server-authorized for the Admin's own
  center; a teacher can operate only on assigned classes and cannot be promoted
  to Admin or access another center through client fields.
- Verification: running UI/HTTP CRUD flow with own-center success and
  cross-center, non-Admin, invalid-role, and removed-assignment denial.

### FT-002-AC-008 — Schedule form restores a scoped browser draft
- REQ: REQ-004
- Given an unfinished recurring-schedule form, when the Admin reloads or later
  returns to the same center and class form in the same browser, then only
  `{startDate,endDate,weekdays}` is restored from the `localStorage` key scoped
  by that `centerId` and `classId`. Stored dates are canonical ISO
  `YYYY-MM-DD`; weekdays are unique integers `0..6`. Missing, unavailable, or
  malformed storage leaves clean empty defaults without an SSR/render failure;
  another center/class draft is not restored. Failed validation retains the
  matching draft, and successful schedule creation clears only that key.
  Passwords, sessions, invitation/authentication values, arbitrary form fields,
  and other secrets are never stored; the form payload and persistence
  ownership remain unchanged, while the separate AC-009 no-occurrence
  rejection uses the existing server error envelope.
- Verification: real protected-browser RED/GREEN flow covering populated
  reload/return restoration, center/class isolation, malformed fallback,
  retention after expected invalid submission, successful Form Data plus
  exact-key cleanup, and SSR-safe build/check.

### FT-002-AC-009 — Zero-occurrence recurring schedule is rejected atomically
- REQ: REQ-004
- Given an authenticated, authorized Admin or assigned Teacher submits a valid
  ISO start/end date range and valid weekday numbers, when no selected weekday
  occurs inside the inclusive range, then Center & Scheduling rejects the
  command before Schedule or Lesson persistence/mutation, the Admin action
  returns HTTP 400 with the existing `{ error: "invalid_schedule" }` envelope,
  and the state before and after the attempt is identical. A range with at
  least one occurrence continues to create its planned lessons unchanged.
- Verification: server-boundary and protected-browser action probes capture
  the current zero-lesson `schedule_created` RED, then GREEN `invalid_schedule`
  response, schedule/Lesson state-before/state-after equality, and unchanged
  valid-occurrence regression; no AC-008 localStorage claim is transferred.

## Acceptance Closure
| Material outcome | Coverage |
|---|---|
| Cross-center or cross-membership operation | FT-002-AC-001, FT-002-AC-002 |
| Independent schedule exception | FT-002-AC-003 |
| Transfer without duplicate lesson/charge | FT-002-AC-004 |
| Substitute teacher historical access | FT-002-AC-005 |
| Removed teacher/member access revocation | FT-002-AC-006 |
| Unfinished schedule survives same-form return/reload without cross-scope restore | FT-002-AC-008 |
| Zero-occurrence recurring schedule cannot create empty persisted state | FT-002-AC-009 |

## SDD Design Gate
Global membership, scheduling, storage, authorization, and boundary ownership
are owned by `/spec-design` and composed here through:

- [.memory-bank/architecture/system-architecture.md](../architecture/system-architecture.md#main-architecture-units)
- [.memory-bank/contracts/boundary-map.md](../contracts/boundary-map.md#calendar-and-membership-query-boundary)
- [.memory-bank/contracts/access-control.md](../contracts/access-control.md)
- [.memory-bank/contracts/authentication-transport.md#class-schedule-draft-retention](../contracts/authentication-transport.md#class-schedule-draft-retention)
- [.memory-bank/domains/core-domain.md](../domains/core-domain.md#ownership-map)
- [.memory-bank/states/lifecycle-map.md](../states/lifecycle-map.md#scheduling-and-lesson-context)

Feature-level contract detail remains downstream task-design work.

## Semantic Verification

- Report: [.tasks/FT-002/FT-002-S-RED-VERIFY-final-report-docs-01.md](../../.tasks/FT-002/FT-002-S-RED-VERIFY-final-report-docs-01.md): durable feature semantic report
- Fresh independent adversarial review covered AC-001..AC-008, all four
  indexed FT-002 tasks and their evidence, the actual TASK-031 diff, current
  public boundaries, authorization/revocation, recurrence and lesson identity,
  browser-draft scope/cleanup, SSR safety, server authority, and cross-center
  isolation.
- One unresolved material schedule-validation meaning remains: canonical dates
  and a valid weekday that does not occur inside the range currently persist a
  zero-Lesson schedule, return `schedule_created`, and clear the matching
  draft. The report records the exact operator choice required before closure.

SEMANTIC_VERDICT: semantic-concern

FT-002 is now `planned`, not `verified`, because AC-009 is a new unimplemented
material outcome. The active lifecycle owner routed the report's operator
question through the feature/spec repair path and created fresh
TASK-032-T2-FT-002-W16; existing task statuses and historical evidence remain
unchanged. A fresh feature-level `/red-verify --feature FT-002` is still
required after TASK-032 closure.
