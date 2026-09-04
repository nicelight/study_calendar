---
description: Attempt 1 pre-implementation RED evidence for TASK-100-T3-FT-006-W33.
status: final
---
# Attempt 1 RED — TASK-100-T3-FT-006-W33

- Claim: `FT-006-AC-010 / REQ-012 / REQ-013 / REQ-014 / REQ-015`.
- Command: `npx vitest run tests/routes/admin-finance-journal.test.ts -t 'loads every own-center payment once with authoritative financial details'`
- CWD: `/home/serg/Projects/study_calendar`
- Exit code: `1`.
- Environment: Vitest `4.1.10`; disposable in-memory SQLite fixture; no external
  server and no production database access.
- Decisive observation: the focused probe created an authorized own-center
  Payment through the existing Financial Ledger and expected its one-time
  exact projection in the Admin page data. The current adapter returned
  `journal: undefined`, failing at
  `tests/routes/admin-finance-journal.test.ts:76`. This directly demonstrates
  the missing journal/correction browser outcome; it is not a setup, syntax,
  import, or artificial failure.
- Production state at RED: no TASK-100 production change had been made. The
  shared page contained only preserved pre-existing W32 precision changes.
