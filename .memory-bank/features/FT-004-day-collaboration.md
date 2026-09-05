---
description: Product feature for field comments, reactions, and threaded day chat.
status: active
last_updated: 2026-09-05
source_of_truth:
  - .memory-bank/features/FT-004-day-collaboration.md
  - .memory-bank/contracts/collaboration-browser-surface.md
clarification_status: complete
last_clarified: 2026-09-03
clarification_questions: 1
type: feature
id: FT-004
lifecycle: verified
epic: EP-003
requirements: [REQ-006, REQ-007, REQ-008, REQ-014]
spec_design_status: complete
spec_design_links:
  - .memory-bank/architecture/system-architecture.md#accepted-target
  - .memory-bank/contracts/boundary-map.md#day-discussion-query-boundary
  - .memory-bank/contracts/boundary-map.md#actor-context-boundary
  - .memory-bank/contracts/collaboration-browser-surface.md#server-composed-projection
  - .memory-bank/contracts/access-control.md
  - .memory-bank/domains/core-domain.md#domain-relationships
  - .memory-bank/states/lifecycle-map.md#collaboration
---
# FT-004 — Day Collaboration

## Use Cases
- Authorized participant leaves or edits one account-owned comment on a day
  field and sees author/time attribution.
- Participant reacts to fields, comments, or messages and inspects reactors.
- Participant uses the common day chat and arbitrary-depth reply branches.

## Edge / Failure Behavior
- Personal discussion remains separate from the common class discussion.
- A root becomes a branch tab only after its first reply.
- Only the ten most recently active branch tabs are shown; hidden branches and
  messages are retained and return with new activity.

## Acceptance Criteria

### FT-004-AC-001 — Account-owned field comments are attributable
- REQ: REQ-006, REQ-007, REQ-014
- Given an authorized account and a day field, then it can create at most one
  editable comment for that field, and the comment exposes author and last-change
  time to permitted participants.
- Verification: collaboration integration scenario with ownership and visibility
  assertions.

### FT-004-AC-002 — Five reactions expose participants
- REQ: REQ-007
- Given an authorized field, comment, or message, then one of the five standard
  reactions can be applied and the permitted viewer can see who applied each
  reaction.
- Verification: interaction smoke flow for each supported object type.

### FT-004-AC-003 — Threaded chat supports arbitrary depth
- REQ: REQ-008
- Given a root message, then replies can form any depth; the root becomes a
  separate tab after the first reply, while the common tab shows every message
  available to the current user.
- Verification: nested-message integration scenario.

### FT-004-AC-004 — Recent branch tabs are bounded without deletion
- REQ: REQ-008
- Given more than ten active branches, then at most ten most recently active tabs
  are visible; the least recent hidden branch retains all messages and returns to
  the visible set after new activity.
- Verification: ordering/retention scenario with eleven-plus branches.

### FT-004-AC-005 — Shared and personal discussions stay separated
- REQ: REQ-006, REQ-014
- Given shared and personal day contexts, then a user sees and changes only the
  discussion objects allowed by their role and selected student membership.
- Verification: cross-student and cross-context negative authorization scenarios.

## Acceptance Closure
| Material outcome | Coverage |
|---|---|
| One editable comment with attribution | FT-004-AC-001 |
| Reactions and reactor visibility | FT-004-AC-002 |
| Arbitrary-depth replies and common feed | FT-004-AC-003 |
| Ten-tab limit without message loss | FT-004-AC-004 |
| Personal/common discussion privacy | FT-004-AC-005 |

## SDD Design Gate
Global message, comment, reaction, persistence, and privacy contracts are owned
by `/spec-design` and composed here through:

- [.memory-bank/architecture/system-architecture.md](../architecture/system-architecture.md#accepted-target)
- [.memory-bank/contracts/boundary-map.md](../contracts/boundary-map.md#day-discussion-query-boundary)
- [.memory-bank/contracts/access-control.md](../contracts/access-control.md)
- [.memory-bank/domains/core-domain.md](../domains/core-domain.md#domain-relationships)
- [.memory-bank/states/lifecycle-map.md](../states/lifecycle-map.md#collaboration)

Feature-level contract detail remains downstream task-design work.

## Task Coverage at W5 Boundary

- W5 `TASK-011-T3-FT-004-W5` is reconciled through its current functional
  `PASS` and required T3 semantic `semantic-pass` evidence for
  `FT-004-AC-001`, `FT-004-AC-002`, and `FT-004-AC-005`:
  - [current functional report](../../.tasks/TASK-011-T3-FT-004-W5/TASK-011-T3-FT-004-W5-S-VERIFY-final-report-docs-01.md)
  - [current semantic report](../../.tasks/TASK-011-T3-FT-004-W5/TASK-011-T3-FT-004-W5-S-RED-VERIFY-final-report-docs-01.md)
- The combined [W5 boundary sync report](../../.tasks/TASK-011-T3-FT-004-W5/TASK-011-T3-FT-004-W5-S-MB-SYNC-final-report-docs-01.md)
  records the current TASK-009 and TASK-011 reconciliation.
- At the W5 boundary the feature document was still `draft`/`planned`; that
  historical lifecycle note remains unchanged in its original evidence
  context. The current feature document is `active`/`planned` pending the
  browser surface.

## Task Coverage at W6 Rebuild Boundary

- The historical [TASK-012-T2-FT-004-W6 card](../tasks/TASK-012-T2-FT-004-W6.task.json)
  remains exactly `T2`, `W6`, and `in_progress`, with its original identity,
  dependencies, and Attempt 1/2 evidence preserved. Its functional GREEN and
  this feature's semantic-fail are historical rebuild evidence only, not fresh
  T3 proof or a dependency for the replacement cards.
- [TASK-016-T3-FT-004-W6](../tasks/TASK-016-T3-FT-004-W6.task.json) owns
  `FT-004-AC-001`, `FT-004-AC-002`, and `FT-004-AC-005` for T3
  center-lifecycle isolation of comments and reactions.
- [TASK-017-T3-FT-004-W6](../tasks/TASK-017-T3-FT-004-W6.task.json) owns
  `FT-004-AC-003`, `FT-004-AC-004`, and the `REQ-014` harm path for T3
  center-lifecycle isolation of threaded discussions, branches, and tabs.
- At the planning boundary the W6 split was indexed as two fresh T3
  replacements without changing feature status; the prior feature-level
  semantic result remained failed at that historical boundary. The split/review is `APPROVE` at
  `Planning Revision: 1`; the accepted modular-monolith, one-server,
  one-shared-database architecture remains unchanged.

## Task Coverage at W6 Boundary

- Authoritative [TASK-016-T3-FT-004-W6](../tasks/TASK-016-T3-FT-004-W6.task.json)
  is now `done` with current functional `PASS` and required T3 semantic
  `semantic-pass` evidence for `FT-004-AC-001`, `FT-004-AC-002`, and
  `FT-004-AC-005`:
  - [current functional report](../../.tasks/TASK-016-T3-FT-004-W6/TASK-016-T3-FT-004-W6-S-VERIFY-final-report-docs-01.md)
  - [current semantic report](../../.tasks/TASK-016-T3-FT-004-W6/TASK-016-T3-FT-004-W6-S-RED-VERIFY-final-report-docs-01.md)
  - [task-scoped sync report](../../.tasks/TASK-016-T3-FT-004-W6/TASK-016-T3-FT-004-W6-S-MB-SYNC-final-report-docs-01.md)
- [TASK-017-T3-FT-004-W6](../tasks/TASK-017-T3-FT-004-W6.task.json) remains
  authoritative `done` with current functional `PASS` and required T3
  semantic `semantic-pass` evidence for `FT-004-AC-003`, `FT-004-AC-004`, and
  the `REQ-014` threaded-discussion harm path:
  - [current functional report](../../.tasks/TASK-017-T3-FT-004-W6/TASK-017-T3-FT-004-W6-S-VERIFY-final-report-docs-01.md)
  - [current semantic report](../../.tasks/TASK-017-T3-FT-004-W6/TASK-017-T3-FT-004-W6-S-RED-VERIFY-final-report-docs-01.md)
- The full [W6 boundary sync report](../../.tasks/TASK-017-T3-FT-004-W6/TASK-017-T3-FT-004-W6-S-MB-SYNC-final-report-docs-01.md)
  records the combined TASK-016/TASK-017 reconciliation.
- TASK-012 is now a historical terminal `failed` task with an explicit
  `superseded` disposition. Its original `T2` / `W6` identity, dependencies,
  task-owned claims, Attempt 1/2 evidence, retry history, and under-tiered
  `NEEDS-CLARIFICATION` record remain preserved; it is not current T3 proof.
- TASK-016 and TASK-017 provide independent T3 evidence for the backend
  boundary, persistence, and center-lifecycle isolation of AC-001..AC-005;
  this evidence does not prove that a user can perform those outcomes through
  the browser UI.
- The operator's browser-completion decision supersedes the prior
  feature-level completion interpretation. FT-004 remains `planned` until the
  new browser projection, form transport, UI, and disposable Playwright proof
  are complete. No old task identity, lifecycle, evidence, architecture,
  Planning Revision, REQ/epic value, or dependency is changed by this
  reconciliation.

## Historical Semantic Verification

- Historical feature-level adversarial report for the backend-boundary scope:
  [FT-004 semantic-pass report](../../.tasks/FT-004/FT-004-S-RED-VERIFY-final-report-docs-02.md).
- Earlier task-level failure and correction evidence remains preserved in the
  linked TASK-102, TASK-107, and TASK-103 artifacts; the current aggregate
  feature verdict is recorded in the canonical report below.
- Historical feature-level durable reconciliation:
  [FT-004 feature sync report](../../.tasks/FT-004/FT-004-S-MB-SYNC-final-report-docs-01.md).
- Those reports and task cards remain valid evidence for their recorded
  backend claims only. They are not browser-surface evidence and cannot close
  FT-004 under the operator decision.

## Browser Completion Queue

- [Collaboration Browser Surface](../contracts/collaboration-browser-surface.md)
  defines the missing projection, server-authorized form actions, UI state,
  persistence, and disposable browser proof.
- The first new T3 task owns the Lesson Context projection and named mutation
  transport. The second new T3 task owns the complete Collaboration UI and
  the shared/personal Playwright matrix. They are sequential and are planned
  after the existing W6 backend tasks and `TASK-039-T3-FT-003-W10`.
- Feature completion remains pending until both new task cards have their own
  claim-linked functional and semantic evidence.

## Planning Revision 2 Proof-Link Reconciliation

The browser task cards carry the exact acceptance IDs required by the
prospective acceptance trace: `TASK-102` targets `FT-004-AC-005`, while
`TASK-103` targets `FT-004-AC-001` through `FT-004-AC-005`. Their matching
feature locators and RED/GREEN evidence contracts remain unchanged. This is a
planning-link correction only; task identity, tier, wave, dependencies,
lifecycle, implementation scope, and accepted Collaboration ownership are
preserved.

## Feature Doctor — Participant Labels

The browser surface requires display labels for comment authors and reaction
participants, but the current Actor Context Boundary permits profile lookup only
for account IDs selected by Center & Scheduling's statistics composition.
Collaboration currently exposes only account IDs for these participants.
Passing discussion IDs through the statistics query or reading Identity & Access
storage directly is not legal. The bounded owner decision and evidence are
recorded in [FT-004 clarification](../../.protocols/FT-004/clarification.md).

The operator accepted the KISS recommendation: Identity & Access remains the
profile owner and exposes one bounded read-only participant-label projection;
Collaboration requests it only after authorizing the current discussion scope
and selecting the author/reactor IDs. Labels grant no authority. The accepted
contract extension and bounded impact are recorded by `/spec-redesign`; no
acceptance criterion or task identity is changed.

## Historical task-plan reconciliation — 2026-09-05

Fresh Attempt 3 verification of `TASK-102-T3-FT-004-W35` found one concrete
route-scope defect: a forged `lesson-final-one` route edited an owned comment
stored under `lesson-final-two`. The route omitted the current class/lesson
context when calling Collaboration, so the stored comment context was checked
without comparing it to the current route scope. This is a fixed-semantics
correction within the accepted Collaboration Browser Surface contract; no
architecture, ownership, Foundation dependency, or Planning Revision changed.

`TASK-102` remains historical `failed` with all Attempt 1–3 evidence and no
Attempt 4. The minimum new planned T3 follow-up is
[`TASK-107-T3-FT-004-W35`](../tasks/TASK-107-T3-FT-004-W35.task.json), which
owns only current class/lesson validation for `editFieldComment` and its fresh
forged-context RED/GREEN proof. It depends on completed TASK-016, TASK-017,
and TASK-039, not on failed TASK-102 and does not inherit its evidence.

At that planning boundary, `TASK-103-T3-FT-004-W36` remained `blocked`; its
identity, UI scope, and existing lifecycle evidence were preserved, while its
prerequisite was routed to TASK-107. Feature completion was pending TASK-107
and TASK-103, each with independent functional and T3 semantic evidence.

## Clarifications

### 2026-09-03 — Participant-label owner

The operator chose the minimum legal option: extend the existing Actor Context
Boundary with a read-only `{accountId, fullName}` participant-label projection
for IDs selected by Collaboration's server-authorized discussion projection.
Identity & Access owns profile facts; Collaboration owns resource authorization;
Lesson Context only composes and renders the labels. Raw IDs, direct account
storage reads, and broad Center & Scheduling registry labels remain excluded.

Impact is `bounded`: Planning Revision remains `2`, Foundation is unaffected,
and only FT-004 requires task-plan reconciliation. The feature remains planned
until TASK-107 and TASK-103 pass their browser-surface proof.

## TASK-107 W35 correction closure — 2026-09-05

`TASK-107-T3-FT-004-W35` is durably `done` after its fresh Attempt 2
functional `PASS`, required T3 `semantic-pass`, all native gates, and explicit
same-Judge `JUDGE_ASSESSMENT: SUPPORT`. The correction retains the selected
personal student scope through the named action and Collaboration boundary;
fresh proof denies forged cross-lesson, cross-class, wrong-student,
personal-to-shared-route, and other-author edits before mutation while keeping
same-context owner edits functional.

- [TASK-107 card](../tasks/TASK-107-T3-FT-004-W35.task.json)
- [functional evidence](../../.protocols/TASK-107-T3-FT-004-W35/verification.md)
- [functional report](../../.tasks/TASK-107-T3-FT-004-W35/TASK-107-T3-FT-004-W35-S-VERIFY-final-report-docs-02.md)
- [semantic evidence](../../.protocols/TASK-107-T3-FT-004-W35/red-verification.md)
- [semantic report](../../.tasks/TASK-107-T3-FT-004-W35/TASK-107-T3-FT-004-W35-S-RED-VERIFY-final-report-docs-01.md)
- [W35 sync report](../../.tasks/TASK-107-T3-FT-004-W35/TASK-107-T3-FT-004-W35-S-MB-SYNC-final-report-docs-01.md)

At the W35 boundary, `TASK-102` remained failed with all Attempt 1–3 evidence
preserved and no Attempt 4, while `TASK-103` remained blocked pending the
scheduler's post-sync dependent-state pass. FT-004 remained `active` /
`planned`; that W35 task closure did not make a feature-level aggregate
lifecycle decision.

## W36 TASK-103 browser closure reconciliation — 2026-09-05

`TASK-103-T3-FT-004-W36` is durably `done` under the scheduler-written
Attempt 2 closure with current functional `PASS`, required T3
`semantic-pass`, native gates, and explicit same-Judge
`JUDGE_ASSESSMENT: SUPPORT`. Its browser evidence covers the complete
Collaboration surface in `/lesson-context`: attributable comments, all five
reactions and participant labels, common and nested threaded chat, URL-backed
branch selection, ten-tab retention/reactivation, shared/personal privacy, and
disposable reload proof.

- [TASK-103 card](../tasks/TASK-103-T3-FT-004-W36.task.json)
- [functional evidence](../../.protocols/TASK-103-T3-FT-004-W36/verification.md)
- [functional report](../../.tasks/TASK-103-T3-FT-004-W36/TASK-103-T3-FT-004-W36-S-VERIFY-final-report-docs-02.md)
- [semantic evidence](../../.protocols/TASK-103-T3-FT-004-W36/red-verification.md)
- [semantic report](../../.tasks/TASK-103-T3-FT-004-W36/TASK-103-T3-FT-004-W36-S-RED-VERIFY-final-report-docs-01.md)
- [W36 sync report](../../.tasks/TASK-103-T3-FT-004-W36/TASK-103-T3-FT-004-W36-S-MB-SYNC-final-report-docs-01.md)

Attempt 1 functional-fail evidence remains historical and is not reused as
the current closure path. TASK-102 remains `failed` with its Attempt 1–3
history preserved; TASK-107 remains `done` and is the completed prerequisite.
The feature document remains `active` / `planned`, and no feature-level
aggregate lifecycle or promotion decision is made by this task-boundary sync.

## Semantic Verification

Current aggregate feature verification uses the completed W6 backend isolation
evidence plus the fresh W35 route-scope correction and W36 browser-surface
evidence:

- [FT-004 semantic report](../../.tasks/FT-004/FT-004-S-RED-VERIFY-final-report-docs-01.md)
- [TASK-107 semantic report](../../.tasks/TASK-107-T3-FT-004-W35/TASK-107-T3-FT-004-W35-S-RED-VERIFY-final-report-docs-01.md)
- [TASK-103 semantic report](../../.tasks/TASK-103-T3-FT-004-W36/TASK-103-T3-FT-004-W36-S-RED-VERIFY-final-report-docs-01.md)

SEMANTIC_VERDICT: semantic-pass

## Final Lifecycle Reconciliation — 2026-09-05

The scheduler reconciles FT-004 as `lifecycle: verified` after the fresh
feature-level semantic gate. Current implementation coverage is represented by
TASK-107's route-scope correction and TASK-103's browser-surface closure;
their functional and T3 semantic evidence, the current Planning Revision 2
`APPROVE`, W36 boundary gates, and the aggregate report above provide the
accepted FT-004 outcome.

TASK-102 remains terminal `failed` with its complete Attempt 1–3 evidence and
no Attempt 4; historical TASK-012 remains `failed`/`superseded`. Those records
are preserved and are not reused as current proof or reopened by this feature
transition. No task identity, scope, dependency, tier, Planning Revision,
FT-000 state, or shared requirement lifecycle is changed.

Evidence: [aggregate semantic report](../../.tasks/FT-004/FT-004-S-RED-VERIFY-final-report-docs-01.md),
[current task-plan APPROVE](../../.tasks/TASK-MB-REVIEW-TASKS-PLAN/TASK-MB-REVIEW-TASKS-PLAN-S-TASKS-FT-004-TASK-107-R2-final-report-docs-01.md),
[TASK-103 W36 sync](../../.tasks/TASK-103-T3-FT-004-W36/TASK-103-T3-FT-004-W36-S-MB-SYNC-final-report-docs-01.md),
and [W36 tech-debt audit](../../PAPERCUTS/TECHDEBTS/tech-debt-wave-W36-2026-09-05.md).
