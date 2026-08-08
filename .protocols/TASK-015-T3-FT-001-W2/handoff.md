---
description: Execution handoff for TASK-015-T3-FT-001-W2.
status: active
---
# Handoff — TASK-015-T3-FT-001-W2

## Summary
Repaired the authoritative provisioning boundary. Center & Scheduling resolves the session actor and own-center Admin authorization; Identity & Access performs the account-plus-invitation write atomically. Public `createAccount` and `issueInvitation` writes are removed. Focused adversarial probes and all task gates are GREEN.

## How to run / verify
- gates: `npm run check`, `npm run build`, `npm run test`
- claim-linked evidence: `.protocols/TASK-015-T3-FT-001-W2/progress.md`; `.tasks/TASK-015-T3-FT-001-W2/execution-evidence.md`

## Known issues
- `npm run build` emits the existing adapter-auto informational warning because no production adapter is configured; build exits 0.
- Independent `/verify` and required T3 `/red-verify` remain due; this `/exe` run does not close lifecycle.

## Follow-ups
- `/verify TASK-015-T3-FT-001-W2`, then `/red-verify TASK-015-T3-FT-001-W2`; lifecycle remains open.
