---
description: Execution context for TASK-049-T3-FT-006-W25.
status: active
---
# Context — TASK-049-T3-FT-006-W25

Attempt 1 starts on 2026-08-18 at 16:40 +0500 after W24 boundary sync,
advisory, and strict-doctor PASS. The task owns only the protected Lesson
Context transport adapter that validates server scope and delegates to the
Financial Ledger public `createPayment` command. Existing route code contains
the adapter; this attempt adds fresh route-owned proof and changes production
only if the bounded probe exposes a gap.

Hard boundary: `src/routes/lesson-context/`,
`src/lib/server/modules/lesson-context/`, `tests/routes/`, and
`tests/lesson-context/`. Forbidden: Financial Ledger production, calendar
routes, the real payment E2E, and `study-calendar.db`.
