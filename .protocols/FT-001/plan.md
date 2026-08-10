---
description: Bounded task-planning resume state for FT-001.
status: active
---
# FT-001 Task Planning Plan

## Outcome and scope

Deliver center-created role-bearing accounts, one-time invitations, and safe Telegram/Google identity binding. Out of scope: UI polish beyond the binding flow, provider credentials, and unrelated membership/scheduling behavior.

## Canonical inputs and ownership

- Feature: [.memory-bank/features/FT-001-authentication-and-binding.md](../../.memory-bank/features/FT-001-authentication-and-binding.md)
- Owner: Identity & Access at `src/lib/server/modules/identity-access/`.
- Public boundary: [.memory-bank/contracts/boundary-map.md#account-provisioning-boundary](../../.memory-bank/contracts/boundary-map.md#account-provisioning-boundary)
- Security contract: [.memory-bank/contracts/access-control.md](../../.memory-bank/contracts/access-control.md)
- Foundation prerequisite: `TASK-002-T3-FT-000-W1`.

## Boundary and waves

1. `TASK-003-T3-FT-001-W2` remains the failed historical attempt and is not reused as proof or a dependency.
2. `TASK-015-T3-FT-001-W2` owns the repaired authoritative provisioning command, server-side actor/own-center Admin authorization, alternate-command removal, account+invitation atomicity, and safe reuse/rejection (AC-003, AC-005), after Foundation.
3. `TASK-004-T3-FT-001-W3` owns the complete Telegram/Google invitation binding flow, confirmed second-provider binding, and callback atomicity (AC-001, AC-002, AC-004), after the repaired provisioning task.

The product tasks use the existing Identity & Access owner and do not write membership state owned by Center & Scheduling. Center & Scheduling remains the authorization resolver/orchestrator for provisioning; Identity & Access owns the atomic account+invitation write.

## Verification

Run the project-native check/build/test gates and the claim-linked paths: AC-001 valid invitation binding plus role-choice denial; AC-002 reconfirmed second-provider binding; AC-003/AC-005 provisioning authorization, alternate-command absence, expired/revoked/reused/duplicate rejection, and account+invitation rollback; AC-004 outage/callback atomic failure. Each new task records concrete RED and equivalent GREEN with state-before/state-after evidence for its owned claims.

## Revision 2 reconciliation

Global Backbone `complete`, Planning Revision `2`; FT-001 canonical concerns
remain satisfied by the existing task set. No FT-001 task record, lifecycle,
evidence, dependency, or retry history changed. Fresh review remains required
for the current global revision.
