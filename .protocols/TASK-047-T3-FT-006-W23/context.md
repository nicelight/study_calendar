---
description: Execution context for TASK-047-T3-FT-006-W23.
status: active
---
# Context — TASK-047-T3-FT-006-W23

Attempt 1 starts on 2026-08-18 at 13:00 +0500 after TASK-046 closure and
strict-doctor PASS. The task owns only the Financial Ledger read projection
for factual payment markers. Existing source contains marker placement and
range filtering; this attempt adds fresh claim-linked proof and changes
production only if the bounded probe exposes a gap.

Hard boundary: `src/lib/server/modules/financial-ledger/` and
`tests/financial-ledger/`. Forbidden: calendar routes, Lesson Context, and
`study-calendar.db`.
