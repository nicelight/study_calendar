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
  the owner/domain command leaves Schedule/Lesson state unchanged for both an
  own-center Admin and an assigned Teacher. The existing Admin adapter maps
  that rejection to `400 { error: "invalid_schedule" }`; no Teacher schedule
  HTTP transport exists in the current scope, so its private owner sentinel is
  not exposed or replaced by a new transport.

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
  owner/domain command before Schedule or Lesson persistence/mutation and the
  state before and after is identical for each principal. The existing Admin
  adapter maps the rejection to HTTP 400 with `{ error: "invalid_schedule" }`;
  an assigned Teacher has no schedule HTTP adapter in the current scope, so
  verification observes the private `invalid-schedule-occurrences` owner
  sentinel and MUST NOT add a Teacher HTTP transport. A range with at least one
  occurrence continues to create its planned lessons unchanged.
- Verification: fresh owner-boundary probes run the same zero-occurrence
  command as both an own-center Admin and an assigned Teacher; Admin also
  traverses the existing adapter and proves HTTP 400 `invalid_schedule`, while
  Teacher proves the private owner/domain rejection. Each principal must show
  exact Schedule/Lesson state-before/state-after equality; the Admin browser
  draft/retention observation remains AC-008 supporting evidence only.

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
- Fresh independent adversarial review covered AC-001..AC-009 across all five
  indexed FT-002 tasks, current source and direct contracts, disposable owner
  and route state, protected Chrome localStorage behavior, authorization and
  cross-center isolation, assignment/history/revocation, valid recurrence,
  lesson identity, adapter-specific failure handling, SSR safety, and secret
  exclusion.
- The accepted zero-occurrence decision now holds end to end: Center &
  Scheduling rejects before Schedule/Lesson writes for an own-center Admin and
  assigned Teacher; the existing Admin adapter alone maps the private sentinel
  to `400 { error: "invalid_schedule" }`, and no Teacher HTTP transport exists.
- Fresh gates passed: focused composition 14/14, independent TASK-026 probe
  3/3, Chrome draft probe, `npm run check`, `npm run build`, `npm test` (29
  files / 116 tests), and `git diff --check`.

SEMANTIC_VERDICT: semantic-pass

No material finding or operator question remains. The explicit lifecycle owner
has consumed this gate and reconciled FT-002, REQ-004, and EP-001 at the owned
`/mb-sync` boundary; this verifier changed no lifecycle or task status.

- [TASK-032 card](../tasks/TASK-032-T2-FT-002-W16.task.json)
- [TASK-032 functional evidence](../../.tasks/TASK-032-T2-FT-002-W16/TASK-032-T2-FT-002-W16-S-VERIFY-final-report-docs-01.md)
- [TASK-032 sync evidence](../../.tasks/TASK-032-T2-FT-002-W16/TASK-032-T2-FT-002-W16-S-MB-SYNC-final-report-docs-01.md)
- [fresh feature semantic evidence](../../.tasks/FT-002/FT-002-S-RED-VERIFY-final-report-docs-01.md)
- [feature sync evidence](../../.tasks/FT-002/FT-002-S-MB-SYNC-final-report-docs-01.md)
