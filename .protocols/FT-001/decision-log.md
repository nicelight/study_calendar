---
description: Durable decisions for FT-001 task planning.
status: active
---
# FT-001 Decision Log

## 2026-08-08 — Task queue created

Accepted architecture and feature ACs fully settle provider ownership, authorization, atomicity, and task boundaries. Reused existing canonical contracts; no new feature spec or behavior example is required. Planning Revision remains `1`.

## 2026-08-08 — Bounded repair

Moved `FT-001-AC-001` to `TASK-004-T3-FT-001-W3`, making the complete provider-binding flow a single Identity & Access owner after provisioning. No canonical spec or architecture changed; tasks remain `planned` and Planning Revision remains `1`.

## 2026-08-08 — Bounded follow-up repair after TASK-003 failure

The current semantic-fail evidence proved that public `createAccount` and
`issueInvitation` remained write bypasses beside `provisionAccount`. The
accepted architecture is unchanged. Extended the existing Account Provisioning
Boundary and Access Control Contract with one authoritative provisioning
command, Center & Scheduling actor/own-center Admin authorization before the
Identity & Access write, caller-scope prohibition, account+invitation
atomicity, and the focused adversarial proof matrix.

Created `TASK-015-T3-FT-001-W2` as the fresh T3 follow-up; it depends directly on
the completed Foundation gate and does not reuse `TASK-003` evidence or
lifecycle. Updated blocked `TASK-004` to depend on the repaired follow-up.
Because that dependency changed on an existing task, the queue action is
`rebuild_required` under the feature-to-tasks reconciliation contract. Planning
Revision remains `1`.
