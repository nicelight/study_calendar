---
description: Execution plan for TASK-015-T3-FT-001-W2.
status: active
---
# Plan — TASK-015-T3-FT-001-W2

## Goal
Repair one server-authorized `provisionAccount` command with atomic account plus invitation persistence and adversarial proof.

## Non-goals
Provider binding/lifecycle beyond the task-owned rejection checks, TASK-003 history, Foundation tasks, other features, or a second provisioning path.

## Scope
- Center & Scheduling resolves session actor and own-center Admin authorization.
- Identity & Access owns atomic account/invitation write; direct public create/issue writes are removed.
- Add isolated task-owned boundary tests and state snapshots.

## Claim-linked RED / GREEN
- applicability: applicable
- claims: FT-001-AC-005 and FT-001-AC-003
- RED: current public API exposes `createAccount`/`issueInvitation` and lacks provisioning orchestration/atomic proof.
- GREEN: focused matrix and project gates pass after repair.
- isolation: in-memory SQLite per test; no credentials/network/production DB.

## Gates
- `npm run check`
- `npm run build`
- `npm run test`

## Handoff
`/exe` leaves lifecycle open for `/verify`, then required `/red-verify` and owner decision.
