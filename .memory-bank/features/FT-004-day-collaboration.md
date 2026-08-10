---
description: Product feature for field comments, reactions, and threaded day chat.
status: draft
type: feature
id: FT-004
lifecycle: planned
epic: EP-003
requirements: [REQ-006, REQ-007, REQ-008, REQ-014]
spec_design_status: complete
spec_design_links:
  - .memory-bank/architecture/system-architecture.md#accepted-target
  - .memory-bank/contracts/boundary-map.md#day-discussion-query-boundary
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
- Feature document `status: draft`, feature `lifecycle: planned`, and the
  EP-003/REQ lifecycle values remain unchanged; no product promotion was
  applied by `/mb-sync`.

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
  replacements without changing feature status or
  `SEMANTIC_VERDICT: semantic-fail`. The split/review is `APPROVE` at
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
- The fresh feature-level semantic result is recorded in the current report
  below as `semantic-pass`: TASK-016 and TASK-017 provide the independent T3
  evidence covering FT-004-AC-001..AC-005.
- FT-004 document `status: draft` and feature `lifecycle: planned` remain
  unchanged. No architecture, Planning Revision, REQ/epic promotion, or
  dependent transition was applied by this reconciliation.

## Semantic Verification

- Historical feature-level adversarial report (preserved, not erased):
  [FT-004 semantic-fail report](../../.tasks/FT-004/FT-004-S-RED-VERIFY-final-report-docs-01.md).
- Current feature-level adversarial report:
  [FT-004 semantic-pass report](../../.tasks/FT-004/FT-004-S-RED-VERIFY-final-report-docs-02.md).
- Current feature-level durable reconciliation:
  [FT-004 feature sync report](../../.tasks/FT-004/FT-004-S-MB-SYNC-final-report-docs-01.md).
- The current result covers all five acceptance criteria through the fresh
  feature review and the current T3 task evidence. The prior supported
  class-delete/recreate disclosure remains historical correction evidence only.

SEMANTIC_VERDICT: semantic-pass
