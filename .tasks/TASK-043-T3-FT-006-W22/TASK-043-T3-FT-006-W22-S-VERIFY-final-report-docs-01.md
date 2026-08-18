# Functional verification report — TASK-043-T3-FT-006-W22

- Fresh verifier-owned probe passed the complete FT-006-AC-001 / REQ-011
  outcome in isolated disposable SQLite state.
- Exact persisted snapshots: default `19.875` → `21.25`; student override
  `3.125` → `4.5`; earlier charges remained unchanged through later settings
  and charge reactivation.
- Safe rerun, cleanup, public-boundary usage, and Financial Ledger ownership
  checks passed.
- Fresh gates passed: `npm run check`, `npm run build`, `npm run test` (37 files
  / 156 tests), and `git diff --check`.

VERDICT: PASS
