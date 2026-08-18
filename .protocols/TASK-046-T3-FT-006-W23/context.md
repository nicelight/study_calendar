---
description: Execution context for TASK-046-T3-FT-006-W23.
status: active
---
# Context — TASK-046-T3-FT-006-W23

Attempt 1 starts on 2026-08-18 at 12:54 +0500 after TASK-045 closure and
strict-doctor PASS. The task owns payment command authority plus Admin
edit/cancel replay inside the Financial Ledger boundary. Existing source and
legacy tests contain the command path; this attempt must add fresh
claim-linked proof and change production only if the probe exposes a gap.

Hard boundary: `src/lib/server/modules/financial-ledger/` and
`tests/financial-ledger/`. Forbidden: routes, Center & Scheduling, and
`study-calendar.db`.
