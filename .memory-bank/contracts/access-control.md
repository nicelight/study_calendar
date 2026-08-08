---
description: Server-side authentication, authorization scope, and privacy contract.
status: active
last_updated: 2026-08-08
source_of_truth:
  - .memory-bank/contracts/access-control.md
---
# Access Control Contract

## Authority and scope

Identity & Access authenticates the actor and owns the role-bearing account,
external identity, invitation, and session facts. The capability that owns a
requested resource owns the final authorization decision for that resource,
using the actor plus server-resolved center, class, and student scope from its
public boundaries.

Every protected read or command evaluates:

`actor session + role + center scope + class assignment/membership + student/family link + action + target`

The client, route shape, UI visibility, or caller-provided role never supplies
authorization by itself.

## Accepted permission matrix

| Capability/outcome | Admin | Teacher | Student | Parent |
|---|---|---|---|---|
| Create center accounts, roles, invitations | Own center | No | No | No |
| Manage center, classes, links, and assignments | Own center | Assigned-class operations only where the product allows | No | No |
| Read shared class context | Own center | Assigned classes | Own classes | Child's classes |
| Read full assigned-class history | Own center | While assigned | Own records | Child's records |
| Read grades/personal discussions/financial context | Own center | Assigned class | Self only | Linked child only |
| Create/edit shared learning or collaboration data | Own center | Assigned class | Own permitted participation | Own permitted participation |
| Correct attendance | Own center | Assigned class | No | No |
| Create payment | Any student/class in own center | Student in assigned class | No | No |
| Edit or cancel payment | Any payment in own center | No | No | No |

An Admin's center-wide payment authority is an explicit accepted product
exception and is not an authorization failure merely because the target is a
different class in the same center. Cross-center access remains denied for
every role.

## Binding and session rules

- Account provisioning has one authoritative public write command:
  `provisionAccount`. Before any Identity & Access write, Center & Scheduling
  resolves the request's server-side actor and verifies that the actor is an
  Admin in the target's own center. A caller-supplied role, center, or scope is
  never an authorization input.
- `createAccount` and `issueInvitation` MUST NOT be exposed as alternate public
  provisioning writes. Account and invitation creation MUST commit or roll
  back together inside the Identity & Access transaction.
- A role-bearing internal account and its permitted context exist before the
  first provider binding.
- An invitation is one-time, expiring, and revocable. Binding Telegram or
  Google consumes it atomically only after provider verification.
- A provider identity is unique to one internal account. Duplicate identity,
  provider outage, callback failure, or invalid invitation leaves account,
  role, membership, and binding state unchanged.
- A second provider is added only from a re-confirmed authenticated profile.
- Removing a class assignment or membership takes effect at the next server-side
  authorization check; authored records retain attribution.

## Data minimization and failure behavior

- Shared day responses contain shared lesson material only. Personal responses
  contain the selected student's permitted grade, discussion, attendance, and
  financial projection only.
- A denied request returns an authorization failure without leaking whether an
  unrelated student's private target exists.
- Protected authorization is repeated in each public command/query at the
  write/read boundary; it is not a client-only or route-only concern.
- Actor/request state remains request-scoped and serializable; no user state is
  kept in server module scope.

## Verification path

The minimum credible proof is a server-side negative matrix, not a visual
hide/show check:

- unauthenticated and invalid-session requests are denied;
- student/parent guessed URLs cannot read another student's grade, discussion,
  attendance, or finance;
- unassigned teacher access is denied immediately after removal and permitted
  historical access exists while assigned;
- Admin own-center create/edit/cancel payment succeeds across classes, while
  cross-center Admin and unassigned Teacher commands fail;
- provider failure, invitation reuse, duplicate identity, and partial-binding
  cases show unchanged persisted state.
- provisioning authorization tests cover unauthenticated, non-Admin,
  cross-center, and valid own-center Admin actors; alternate public write
  commands are absent and duplicate provisioning rolls back account plus
  invitation together.

Feature acceptance scenarios and the project risk-based testing policy remain
the executable evidence owners; this contract supplies the shared security
boundary they must exercise.
