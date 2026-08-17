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
  - .memory-bank/contracts/authentication-transport.md#class-schedule-draft-retention
  - .memory-bank/domains/core-domain.md#ownership-map
  - .memory-bank/states/lifecycle-map.md#scheduling-and-lesson-context
---
# FT-002 — Center, Membership, and Scheduling

## Use Cases
- Admin manages teachers, classes, students, parents, and links within one
  center and chooses individual or group class mode.
- Admin creates a recurring schedule; Admin or assigned teacher changes one
  lesson without rewriting other repetitions.
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
  the owner/domain command leaves Schedule/Lesson state unchanged for an
  own-center Admin. The existing Admin adapter maps that rejection to
  `400 { error: "invalid_schedule" }`; recurring schedule creation is
  Admin-owned.
- Creating a new recurring schedule replaces overlapping `planned` lessons for
  the class and removes empty superseded schedules. Existing `completed` or
  `cancelled` lessons are preserved; if the new dates overlap either status,
  the operation rejects before changing schedules or lessons.

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
- Given an Admin creates a recurring class schedule, then planned lessons are
  created for its repetitions. Given an Admin or assigned Teacher adds, moves or
  cancels one lesson, only that lesson changes. A new recurring schedule
  replaces overlapping `planned` lessons; `completed` and `cancelled` overlap
  rejects atomically.
- Verification: Admin/Teacher schedule lifecycle scenario with unaffected-
  repetition, authorization and protected-history checks.

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
- Given an authenticated, authorized Admin submits a valid
  ISO start/end date range and valid weekday numbers, when no selected weekday
  occurs inside the inclusive range, then Center & Scheduling rejects the
  owner/domain command before Schedule or Lesson persistence/mutation; the state
  before and after is identical. The existing Admin adapter maps the rejection
  to HTTP 400 with `{ error: "invalid_schedule" }`. A range with at least one
  occurrence continues to create its planned lessons unchanged.
- Verification: Admin owner-boundary probe with exact Schedule/Lesson
  state-before/state-after equality; browser draft retention remains AC-008
  supporting evidence only.

### FT-002-AC-010 — Schedule date input uses strict dd/mm/yyyy presentation
- REQ: REQ-004
- Given an Admin opens a recurring-schedule form, then each start/end date
  control presents and accepts the strict user-facing `dd/mm/yyyy` format with
  an explicit invalid-date state for malformed or impossible calendar values.
  The submitted form payload and the existing scoped browser draft continue to
  carry canonical ISO `YYYY-MM-DD` values; no server schedule contract or
  persistence representation changes.
- Verification: SSR/source and focused browser/form checks prove the visible
  `dd/mm/yyyy` controls, strict parse/format behavior, unchanged ISO Form Data,
  unchanged `study-calendar:schedule-draft:${centerId}:${classId}` payload,
  and clean handling of invalid dates.

### FT-002-AC-011 — Role-scoped class entry shell is available for permitted members
- REQ: REQ-003, REQ-014
- Given an authenticated Admin, Teacher, Student, or Parent has permitted
  membership/assignment scope for a class, when they open
  `/center/{centerId}/class/{classId}`, then the server-rendered class entry
  shell exposes the server-resolved role and class context for that principal.
  Unauthenticated, cross-center, non-member, and removed-assignment requests
  are denied or redirected before protected class data is rendered. The
  existing `/admin/{centerId}` management surface remains intact; this outcome
  adds no lesson-context/calendar content, role-changing control, or direct
  database access.
- Verification: SSR/HTTP matrix covers all four permitted roles plus
  unauthenticated, cross-center, non-member, and removed-assignment denials;
  source review confirms `Center & Scheduling` authorization is used and no
  client-supplied role/center/class field or FT-003 lesson-context route is
  trusted.

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
| Strict localized schedule date presentation preserves ISO wire/storage | FT-002-AC-010 |
| Role-scoped class entry for permitted Admin/Teacher/Student/Parent | FT-002-AC-011 |

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
- Fresh independent adversarial review covered AC-001..AC-011 across all seven
  indexed FT-002 tasks, current source and direct contracts, a disposable
  SQLite/Vite runtime, protected Chrome 151, real SSR/HTTP requests, and the
  generated production route.
- Strict `dd/mm/yyyy` inputs produced only ISO Form Data and scoped draft JSON,
  rejected malformed/impossible values explicitly, retained the matching draft
  after zero-occurrence rejection, and cleared only that key after confirmed
  success. Existing Admin and schedule behavior remained intact.
- The role-scoped class shell returned matching server-resolved context for
  permitted Admin, Teacher, Student, and Parent requests; anonymous, revoked,
  cross-center, non-member, unassigned, and removed access failed before
  protected rendering with unchanged read state. The route uses Center &
  Scheduling authorization and introduces no FT-003 calendar/Lesson Context
  content or direct persistence.
- Fresh gates passed: composition regressions 36/36, independent TASK-026 probe
  3/3, `npm run check`, `npm run build`, `npm test` (30 files / 131 tests), and
  `git diff --check`.

SEMANTIC_VERDICT: semantic-pass

No material finding or operator question remains. The explicit lifecycle owner
may consume this current AC-001..AC-011 gate and reconcile FT-002, REQ-003,
REQ-004, shared REQ-014, and EP-001 at the owned `/mb-sync` boundary; this
verifier changed no lifecycle or task status.

- [TASK-032 card](../tasks/TASK-032-T2-FT-002-W16.task.json)
- [TASK-034 retry verification](../../.tasks/TASK-034-T1-FT-002-W18/TASK-034-T1-FT-002-W18-S-VERIFY-RETRY-final-report-docs-02.md)
- [TASK-035 retry verification](../../.tasks/TASK-035-T3-FT-002-W19/TASK-035-T3-FT-002-W19-S-VERIFY-RETRY-final-report-docs-02.md)
- [TASK-035 semantic verification](../../.tasks/TASK-035-T3-FT-002-W19/TASK-035-T3-FT-002-W19-S-RED-VERIFY-final-report-docs-01.md)

## FT-002 final feature-boundary closure — 2026-08-15

The fresh feature-level report records exactly one
`SEMANTIC_VERDICT: semantic-pass` across AC-001..AC-011 with no material
finding or unresolved operator decision. The explicit lifecycle owner now
reconciles FT-002 to `verified`; TASK-026, TASK-031, TASK-032, TASK-034, and
TASK-035 remain `done` with their identities, code, and evidence preserved.
FT-003 and downstream feature ownership are unchanged.

- [feature semantic report](../../.tasks/FT-002/FT-002-S-RED-VERIFY-final-report-docs-01.md)
- [feature sync report](../../.tasks/FT-002/FT-002-S-MB-SYNC-final-report-docs-02.md)
- [fresh feature semantic evidence](../../.tasks/FT-002/FT-002-S-RED-VERIFY-final-report-docs-01.md)

## W18/W19 Planning Reconciliation — 2026-08-14

The operator accepted two new material outcomes after the prior AC-001..AC-009
feature closure. `FT-002-AC-010` adds strict user-facing `dd/mm/yyyy` schedule
date input while preserving canonical ISO Form Data and the existing scoped
draft JSON. `FT-002-AC-011` adds a protected role-scoped class entry shell at
`/center/{centerId}/class/{classId}` for server-authorized Admin, Teacher,
Student, and Parent members, while preserving `/admin/{centerId}` and excluding
Lesson Context/calendar content.

The fresh queue is `rebuild_required`: `TASK-034-T1-FT-002-W18` owns AC-010 and
`TASK-035-T3-FT-002-W19` owns AC-011; both depend on done TASK-032. The accepted
Authentication Transport and Boundary Map concerns are extended in place, with
no new SDD spec or Planning Revision change. FT-002, REQ-003, REQ-004, and
shared REQ-014 remain `planned` until these outcomes are implemented and
verified. TASK-026, TASK-031, TASK-032, their evidence, and all prior code stay
unchanged.

## TASK-034 task closure — 2026-08-14

The explicit owner reconciled `TASK-034-T1-FT-002-W18` to `done` after the
Implementer Attempt 2 and same-Reviewer retry both passed. The accepted
AC-010 evidence proves strict rendered `dd/mm/yyyy` controls, valid-date
native constraint acceptance, canonical ISO Form Data and scoped draft values,
malformed/impossible rejection, and unchanged protected boundaries. The first
reviewer `FAIL` and all retry history remain preserved in the task protocol and
reports.

This task sync does not promote the feature or requirements. `TASK-035` remains
`planned` for AC-011, and FT-002, REQ-003, REQ-004, and shared REQ-014 remain
`planned` pending the remaining task-planning and feature-level semantic gates.

- [TASK-034 card](../tasks/TASK-034-T1-FT-002-W18.task.json)
- [TASK-034 retry verification](../../.tasks/TASK-034-T1-FT-002-W18/TASK-034-T1-FT-002-W18-S-VERIFY-RETRY-final-report-docs-02.md)
- [TASK-034 sync report](../../.tasks/TASK-034-T1-FT-002-W18/TASK-034-T1-FT-002-W18-S-MB-SYNC-final-report-docs-01.md)

## TASK-035 readiness promotion — 2026-08-14

The fresh pre-execution task-plan review returned `APPROVE` for Planning
Revision `2`, with architecture approval and no blocking findings. The strict
doctor gate is `PASS`, so `TASK-035-T3-FT-002-W19` is now `ready` for its
protected AC-011 route execution. Its T3/W19 identity, server-resolved
authorization boundary, direct SDD links, and dependency on done TASK-032 are
unchanged. TASK-034 remains `done`; FT-002 and its mapped requirements remain
`planned` until implementation and semantic verification complete.

- [TASK-035 card](../tasks/TASK-035-T3-FT-002-W19.task.json)
- [fresh pre-execution review](../../.tasks/TASK-MB-REVIEW-TASKS-PLAN/TASK-MB-REVIEW-TASKS-PLAN-S-TASKS-FT-002-PRE035-R2-final-report-docs-01.md)

## TASK-035 T3 closure — 2026-08-14

The explicit owner reconciled `TASK-035-T3-FT-002-W19` to `done` after the
independent Attempt 2 functional `PASS` and required per-task T3
`semantic-pass`. The initial route-wiring `FAIL`, retry correction, real
SSR/HTTP role/denial matrix, and adversarial review remain preserved. FT-002
and REQ-003, REQ-004, and shared REQ-014 remain `planned` pending the
feature-level aggregate red-verify; TASK-034 and earlier completed tasks stay
unchanged.

- [TASK-035 card](../tasks/TASK-035-T3-FT-002-W19.task.json)
- [TASK-035 retry verification](../../.tasks/TASK-035-T3-FT-002-W19/TASK-035-T3-FT-002-W19-S-VERIFY-RETRY-final-report-docs-02.md)
- [TASK-035 semantic verification](../../.tasks/TASK-035-T3-FT-002-W19/TASK-035-T3-FT-002-W19-S-RED-VERIFY-final-report-docs-01.md)
