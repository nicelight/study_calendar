---
description: Product feature for elastic calendar navigation and shared/personal lesson views.
status: active
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
  - .memory-bank/contracts/authentication-transport.md#browserapi-path
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
- An authorized lesson without shared material still opens its lesson shell and
  explains that the material is not yet available; `403` remains for invalid or
  unauthorized lesson access.

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

### FT-003-AC-007 — Authorized `/calendar` uses DB-backed class lessons
- REQ: REQ-005, REQ-014, REQ-016
- Given an authenticated Admin, Teacher, Student, or Parent with permitted
  class scope, when `/calendar?classId={classId}&date={YYYY-MM-DD}` is opened,
  then the server-rendered calendar reads current lesson identity/date/status
  through the existing Center & Scheduling Calendar and Membership Query
  Boundary and does not use the public home fixture. Unauthenticated, revoked,
  cross-center, non-member, unassigned, or removed requests fail before lesson
  data renders.
- Verification: disposable SSR/HTTP role and denial matrix with database state
  snapshots, real route wiring, fixture-absence assertion, and project gates.

### FT-003-AC-008 — Calendar lesson navigation preserves context
- REQ: REQ-005, REQ-006, REQ-014
- Given an authorized shared lesson in `/calendar`, then its navigation to the
  existing `/lesson-context` path carries the exact date, classId, and lessonId
  query values and carries no studentAccountId. The existing Lesson Context
  route remains the composition/authorization owner; personal student context
  is deferred to a separate role-scoped follow-up after dashboard work. If the
  lesson has no shared material yet, the same authorized route renders the
  lesson shell rather than an access error.
- Verification: a real route/link/SSR probe follows a calendar lesson link and
  proves exact shared query preservation, absence of studentAccountId, existing
  shared day-context response identity, and read-path non-mutation.

## Acceptance Closure
| Material outcome | Coverage |
|---|---|
| Elastic learning rhythm and exact date access | FT-003-AC-001 |
| Color-independent state meaning | FT-003-AC-002 |
| Shared lesson materials | FT-003-AC-003 |
| Personal context composition | FT-003-AC-004 |
| Wrong-student navigation/access | FT-003-AC-005, FT-003-AC-006 |
| DB-backed authorized class calendar at `/calendar` | FT-003-AC-007 |
| Calendar-to-Lesson-Context navigation context preservation | FT-003-AC-008 |

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

## Applied Global Design Decision

The operator accepted the KISS provider-owned projection on 2026-08-10:
Learning Progress owns lesson-to-homework selection/relation semantics and
exposes an authorized lesson-scoped grade query using `lessonId` plus
server-resolved actor/context. Lesson Context consumes that query and does not
invent `homeworkId`, read Learning Progress tables, or introduce a separate
persisted mapping. The canonical contract is the
[Personal Progress Query Boundary](../contracts/boundary-map.md#personal-progress-query-boundary).

Global design coverage is complete at Planning Revision 2. The task surface is
now reconciled to the accepted provider contract: Learning Progress owns the
lesson-scoped grade query, while Lesson Context remains its read-composition
consumer. Existing task identity, status, historical evidence, retry budget,
and feature lifecycle are preserved; the provider follow-up is indexed as
`TASK-018-T3-FT-005-W8` and `TASK-014-T3-FT-003-W8` now depends on it.

## Task Coverage at W7 Boundary

- The authoritative [TASK-013-T2-FT-003-W7 card](../tasks/TASK-013-T2-FT-003-W7.task.json)
  is `done` with current functional `PASS` evidence for `FT-003-AC-001` and
  `FT-003-AC-002`:
  - [functional verification report](../../.tasks/TASK-013-T2-FT-003-W7/TASK-013-T2-FT-003-W7-S-VERIFY-final-report-docs-01.md)
  - [feature semantic report](../../.tasks/FT-003/FT-003-S-RED-VERIFY-final-report-docs-01.md)
  - [W7 boundary sync report](../../.tasks/TASK-013-T2-FT-003-W7/TASK-013-T2-FT-003-W7-S-MB-SYNC-final-report-docs-01.md)
- [TASK-014-T3-FT-003-W8](../tasks/TASK-014-T3-FT-003-W8.task.json) retains
  ownership of `FT-003-AC-003..AC-006`; its existing task-record status,
  lifecycle, and historical evidence are preserved. Its reconciled Revision 2
  handoff consumes the provider-owned lesson-scoped grade query and does not
  resolve `homeworkId` in Lesson Context.
  - [functional verification report](../../.tasks/TASK-014-T3-FT-003-W8/TASK-014-T3-FT-003-W8-S-VERIFY-final-report-docs-02.md)
  - [semantic verification report](../../.tasks/TASK-014-T3-FT-003-W8/TASK-014-T3-FT-003-W8-S-RED-VERIFY-final-report-docs-01.md)
  - [claim-scoped execution evidence](../../.tasks/TASK-014-T3-FT-003-W8/execution-evidence.md)
- [TASK-018-T3-FT-005-W8](../tasks/TASK-018-T3-FT-005-W8.task.json) is the
  completed provider prerequisite used by FT-003-AC-004/AC-006. Its durable
  claim is limited to Learning Progress ownership of the lesson-scoped query,
  provider-owned selection, privacy, fail-closed cardinality, and read-only
  behavior:
  - [functional verification protocol](../../.protocols/TASK-018-T3-FT-005-W8/verification.md)
  - [semantic verification report](../../.tasks/TASK-018-T3-FT-005-W8/TASK-018-T3-FT-005-W8-S-RED-VERIFY-final-report-docs-01.md)
  - [provider sync report](../../.tasks/TASK-018-T3-FT-005-W8/TASK-018-T3-FT-005-W8-S-MB-SYNC-final-report-docs-01.md)
- At that historical W7/W8 boundary, the FT-003 document had `status: draft`,
  feature `lifecycle: planned`, and the existing RTM lifecycle values remained
  unchanged; the later W9 scope is reconciled below.

## Semantic Verification

- Current standalone adversarial review:
  [FT-003 red verification](../../.tasks/FT-003/FT-003-S-RED-VERIFY-final-report-docs-01.md).
- Fresh evidence passes AC-001..AC-006 for calendar geometry/date navigation,
  shared/personal material reuse, selected-student grade projection/rendering,
  navigation identity, generic API/SSR denial, privacy, and non-mutation. No
  material product-semantic finding was admitted.
- TASK-013, TASK-014, and provider dependency TASK-018 have current indexed
  claim-linked functional/semantic evidence; `node scripts/mb-doctor.mjs
  --strict` passes with 0 errors and 0 warnings.
- Coverage includes provider-owned lesson-scoped grade selection, visible grade
  rendering, privacy/403 behavior, navigation identity, SSR/API adapters, and
  read-path non-mutation. No semantic replan is required.

SEMANTIC_VERDICT: semantic-pass

## Feature-Level Durable Sync

- [FT-003 W8 feature boundary sync report](../../.tasks/FT-003/FT-003-S-MB-SYNC-final-report-docs-01.md)
  records the reconciliation of the current indexed task outcomes and the
  feature-level semantic report.
- The sync carries only claim-linked durable evidence into feature navigation;
  it does not create a new product decision or change task, architecture,
  dependency, retry-budget, or lifecycle state.

## W9 Accepted Calendar Route Reconciliation — 2026-08-15

The operator accepted two material FT-003 follow-ups after the prior AC-001..AC-006
closure: a DB-backed authorized class calendar at `/calendar` with the public
home fixture removed from the authenticated path, and shared-only navigation
from each calendar lesson to the existing `/lesson-context` route while
preserving date, class, and lesson identity. The current calendar link must not
carry or invent `studentAccountId`; personal student context is deferred to a
separate role-scoped follow-up after dashboard work. The existing Calendar and
Membership Query Boundary, Access Control, Lesson Context composition boundary,
and Browser/API path contract are sufficient; no new SDD spec or Planning
Revision change is required.

The initial queue action was `rebuild_required`, with AC-007 and AC-008 drafted
as one T3 route task. The fresh task-plan Reviewer rejected that merge because
the protected calendar load and the lesson-link/context follow-through are
independently implementable, provable, and retryable. The original unexecuted
and unreviewed `TASK-036-T3-FT-003-W9` is therefore retired from the indexed
model rather than silently repaired.

## W9/W10 Calendar Route Repair — 2026-08-15

The repaired queue keeps the accepted contracts and splits the claims into
independent sibling cards: `TASK-037-T3-FT-003-W9` owns AC-007's DB-backed
authorized `/calendar` load and denial matrix; `TASK-038-T3-FT-003-W10`
initially owned AC-008's broader navigation/context proof. Completed TASK-013,
TASK-014, and TASK-018 evidence/code remain unchanged. The later accepted
shared-only narrowing of AC-008 requires a replacement card; it does not repair
or close TASK-038.

## TASK-037 AC-007 closure sync — 2026-08-15

`TASK-037-T3-FT-003-W9` is `done` after independent functional `PASS` and
required T3 `semantic-pass` evidence for AC-007. The closure proves the
DB-backed authorized calendar path and denial matrix only; FT-003 and the
mapped requirement lifecycles remain `planned` pending the reconciled AC-008
card and the aggregate feature gate. TASK-038 retains its `in_progress`
claim-specific RED attempt and is not current GREEN or closure evidence.

## Shared-only AC-008 reconciliation — 2026-08-15

The operator selected option 1: the current FT-003 AC-008 outcome is narrowed
to shared-only calendar navigation. A calendar lesson link carries exact
`date`, `classId`, and `lessonId` to the existing `/lesson-context` route and
does not carry or invent `studentAccountId`. Personal student context is
deferred to a separate role-scoped follow-up after dashboard work. The existing
Lesson Context server authorization boundary remains unchanged.

Because this decision changes the material AC-008 scope and proof obligation,
the queue action is `rebuild_required`. `TASK-038-T3-FT-003-W10` retains its
identity, T3/W10 classification, dependencies, `in_progress` status, protocol
links, and claim-specific RED evidence; it is not rewritten, closed, or given
GREEN evidence. New `TASK-039-T3-FT-003-W10` is the planned shared-only
replacement after `TASK-014-T3-FT-003-W8` and `TASK-037-T3-FT-003-W9`.

## TASK-039 AC-008 closure sync — 2026-08-15

`TASK-039-T3-FT-003-W10` is now `done` after fresh independent functional
`PASS`, required T3 `semantic-pass`, and green project gates. The closure
proves shared-only calendar navigation into the existing `/lesson-context`
route with exact `date`, `classId`, and `lessonId`, without
`studentAccountId`; the existing Lesson Context composition and authorization
boundary remains unchanged.

- [TASK-039 card](../tasks/TASK-039-T3-FT-003-W10.task.json)
- [functional verification](../../.tasks/TASK-039-T3-FT-003-W10/reverification-evidence.md)
- [semantic verification](../../.tasks/TASK-039-T3-FT-003-W10/TASK-039-T3-FT-003-W10-S-RED-VERIFY-final-report-docs-01.md)
- [lifecycle closure](../../.tasks/TASK-039-T3-FT-003-W10/TASK-039-T3-FT-003-W10-S-LIFECYCLE-final-report-docs-02.md)

FT-003 and its mapped RTM requirements remain `planned` pending the
feature-level aggregate gate. TASK-038 remains preserved as terminal
`failed`/`superseded`; personal student context remains deferred.
