---
description: Product feature for center-created accounts and external identity binding.
status: draft
type: feature
id: FT-001
lifecycle: planned
epic: EP-001
requirements: [REQ-001, REQ-002, REQ-014]
spec_design_status: complete
spec_design_links:
  - .memory-bank/architecture/system-architecture.md#accepted-target
  - .memory-bank/contracts/access-control.md
  - .memory-bank/contracts/boundary-map.md#account-provisioning-boundary
  - .memory-bank/domains/core-domain.md#ownership-map
  - .memory-bank/states/lifecycle-map.md#access-and-membership
---
# FT-001 — Authentication and Identity Binding

## Use Cases
- Admin creates an internal account with role and membership and issues a
  one-time invitation.
- User chooses Telegram or Google from the invitation and enters the permitted
  context.
- Authenticated user adds the second provider from a confirmed profile.

## Edge / Failure Behavior
- Expired, revoked, reused, or duplicate invitations/identities reject without
  account, role, membership, or binding mutation.
- Provider callback failure does not create a partial binding.
- Provider outage returns an explicit error and does not bypass authorization.

## Acceptance Criteria

### FT-001-AC-001 — Invitation binds one role-bearing account
- REQ: REQ-001, REQ-014
- Given a valid one-time invitation, when the user confirms Telegram or Google,
  then exactly the pre-created account is bound, its invitation-defined role and
  membership are retained, and no user role selection is accepted.
- Verification: integration scenario for each provider plus negative role-choice
  and cross-center access checks.

### FT-001-AC-002 — Second provider requires confirmed profile
- REQ: REQ-001
- Given an authenticated account, when its owner re-confirms the current session
  and adds the other provider, then both providers resolve to the same account;
  an unauthenticated add attempt is rejected.
- Verification: provider-binding integration scenario and session negative case.

### FT-001-AC-003 — Invitation and identity reuse are rejected safely
- REQ: REQ-001, REQ-002
- Given an expired, revoked, or already-used invitation, or an identity already
  bound elsewhere, then binding is rejected with no new account, merge, role,
  membership, or existing-binding mutation.
- Verification: negative integration scenarios with state-before/state-after
  assertions.

### FT-001-AC-004 — Provider callback failure is atomic
- REQ: REQ-002
- Given a provider outage or failed callback, then the user receives an explicit
  failure and no partial account or identity binding is persisted.
- Verification: provider failure simulation with persistence inspection.

### FT-001-AC-005 — Provisioning is server-authorized and atomic
- REQ: REQ-001, REQ-002, REQ-014
- Given an unauthenticated actor, a non-Admin actor, or an Admin from another
  center, when account provisioning is requested, then it is rejected before
  any Identity & Access write. Given an Admin in the target's own center, then
  the single authoritative `provisionAccount` command creates the requested
  role-bearing account and invitation using server-resolved actor/scope; caller
  role or center values are not trusted. Duplicate or failed provisioning rolls
  back account and invitation together, and public `createAccount`/
  `issueInvitation` write bypasses are unavailable.
- Verification: focused adversarial boundary tests with state-before/state-after
  assertions for unauthenticated, non-Admin, cross-center, valid own-center
  Admin, duplicate, reuse, rollback, and alternate-command absence cases.

## Acceptance Closure
| Material outcome | Coverage |
|---|---|
| Provider unavailable without auth bypass | FT-001-AC-004 |
| Reused/revoked/expired invitation | FT-001-AC-003 |
| Duplicate provider identity without merge | FT-001-AC-003 |
| Failed callback without partial state | FT-001-AC-004 |
| Provisioning authorization and account/invitation atomicity | FT-001-AC-005 |

## SDD Design Gate
Global authentication, security, storage, provider, and runtime contracts are
owned by `/spec-design` and composed here through:

- [.memory-bank/architecture/system-architecture.md](../architecture/system-architecture.md#accepted-target)
- [.memory-bank/contracts/access-control.md](../contracts/access-control.md)
- [.memory-bank/contracts/boundary-map.md](../contracts/boundary-map.md#account-provisioning-boundary)
- [.memory-bank/domains/core-domain.md](../domains/core-domain.md#ownership-map)
- [.memory-bank/states/lifecycle-map.md](../states/lifecycle-map.md#access-and-membership)

Feature-level contract detail remains downstream task-design work.
