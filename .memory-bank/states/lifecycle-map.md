---
description: Global lifecycle and transition ownership for access, lessons, collaboration, learning, and finance.
status: active
last_updated: 2026-08-08
source_of_truth:
  - .memory-bank/states/lifecycle-map.md
---
# Lifecycle Map

Each transition is executed by the slice named in the owner column. A
cross-slice consequence is requested through the owner's public boundary; a
neighbor cannot mutate the state directly.

## Access and membership

| Subject | States/transitions | Owner | Contract rule |
|---|---|---|---|
| Invitation | `issued -> consumed`, `issued -> expired`, `issued -> revoked` | Identity & Access | Only one successful provider binding consumes an invitation; all failure paths are atomic. |
| External identity | `unbound -> bound` | Identity & Access | One provider identity maps to one internal account; duplicate binding is rejected. |
| Teacher/class assignment | `active -> removed` | Center & Scheduling | Authorization changes immediately; authored records retain attribution. |
| Membership/link | `active -> removed` | Center & Scheduling | Each server-side read/change rechecks current center/class/student scope. |

## Scheduling and lesson context

| Subject | States/transitions | Owner | Contract rule |
|---|---|---|---|
| Lesson | `planned -> completed`, `planned -> cancelled` | Center & Scheduling | A single transfer changes the lesson date without changing lesson identity or unrelated repetitions. |
| Lesson attendance | `absent <-> present` | Learning Progress | `absent` creates no charge; `absent -> present` calls Financial Ledger reconciliation. |
| Shared material | editable while the owning lesson context allows | Lesson Context | Shared content is visible only in the permitted class context. |
| Personal day view | composed on read | Lesson Context | It reuses shared material and includes only the selected student's permitted projections. |

## Collaboration

| Subject | States/transitions | Owner | Contract rule |
|---|---|---|---|
| Field comment | `absent -> authored -> edited` | Collaboration | At most one editable account-owned comment per field; author/time remain attributable. |
| Message branch | root with no reply -> active branch after first reply | Collaboration | Arbitrary reply depth is retained; branch tabs are a projection of activity. |
| Branch tab | visible/hidden by recent activity | Collaboration | At most ten recent active branches are shown; hidden messages are never deleted. |

## Learning and finance

| Subject | States/transitions | Owner | Contract rule |
|---|---|---|---|
| Homework | incomplete -> complete | Learning Progress | Completion visibility follows the permitted class context. |
| Grade | one of `α`, `β`, `γ`, `F` | Learning Progress | Personal grade visibility is restricted to the student/family, assigned teacher, and Admin. |
| Charge | not created for absent; `open -> partially_paid -> paid` or `open -> overdue`; `open -> cancelled` only by accepted correction | Financial Ledger | Applied price is historical; allocation and cancellation are deterministic and auditable. |
| Payment | recorded -> edited or cancelled | Financial Ledger | Only Admin may edit/cancel; every financial correction carries audit evidence. |
| Allocation/balance | recomputed from historical charges and payments | Financial Ledger | Oldest uncovered charges first; exact partial remainder and advance are preserved. |
| Payment marker | projected to closest previous non-lesson day | Financial Ledger | Projection may move across week/month boundaries but never mutates Payment, allocation, or balance. |

## Cross-slice transition ownership

- `absent -> present`: Learning Progress owns the attendance command and calls
  Financial Ledger's `reconcileLessonCharge`; both state owners commit or roll
  back together when atomicity is required.
- Personal day composition: Lesson Context owns the read workflow and calls
  scoped queries from Learning Progress, Collaboration, and Financial Ledger;
  no provider state changes.
- Payment creation/edit/cancel: Financial Ledger owns the command and asks
  Center & Scheduling for scope/lesson facts; it never changes scheduling state.
- Assignment removal: Center & Scheduling owns the transition; all subsequent
  slice reads/commands re-evaluate authorization rather than relying on a
  copied access flag.

## Verification anchors

The lifecycle contract is exercised through the feature acceptance scenarios,
the security contract, the financial replay contract, and
[.memory-bank/runbooks/mvp-verification.md](../runbooks/mvp-verification.md).
