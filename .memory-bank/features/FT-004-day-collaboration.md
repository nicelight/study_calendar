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
