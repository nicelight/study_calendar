---
description: Implementation plan for FT-001 authentication and identity binding.
status: active
---
# IMPL-FT-001 — Authentication and Identity Binding

## Goal

Implement the Identity & Access account/invitation/provider-binding outcome defined by FT-001.

## Scope / non-goals

Scope is role-bearing internal accounts, one-time invitation lifecycle, Telegram/Google binding, confirmed second-provider addition, and atomic failure handling. Do not introduce a second service, client-trusted roles, or consumer-owned identity writes.

## Strategy and ownership

`src/lib/server/modules/identity-access/` is the sole write owner for account,
role, invitation, and identity state. `provisionAccount` is the only public
provisioning write. Center & Scheduling resolves the request actor and
own-center Admin scope before invoking it; adapters and routes may not bypass
that authorization path or write Identity & Access state directly. Center &
Scheduling remains the membership owner.

## Ordered tasks

| Wave | Task | Outcome | Dependency |
|---|---|---|---|
| W2 | TASK-015-T3-FT-001-W2 | repaired authoritative provisioning, authorization matrix, alternate-command removal, account+invitation atomicity, and safe reuse rejection | TASK-002-T3-FT-000-W1 |
| W3 | TASK-004-T3-FT-001-W3 | complete Telegram/Google invitation binding, second-provider binding, and callback atomicity | TASK-015-T3-FT-001-W2 |

## Gates and verification

Use `npm run check`, `npm run build`, and `npm run test`; verify AC-003/005 on TASK-015 and AC-001/002/004 on TASK-004. The complete provider-binding flow has one owner after provisioning; each new task has a claim-linked RED/GREEN contract and state-before/state-after artifact path.

## Planning Revision 2 reconciliation

The global backbone remains `complete` at Planning Revision 2. Revision 2 does
not change FT-001's accepted boundaries or task outcomes; TASK-003, TASK-004,
and TASK-015 retain their identities, tiers, waves, dependencies, statuses,
historical evidence, and retry history. No FT-001 task record was changed.
