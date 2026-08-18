# Functional verification report — TASK-045-T3-FT-006-W23

- Fresh verifier-owned probe passed FT-006-AC-002 / AC-003 / REQ-012 / REQ-015
  in isolated disposable SQLite state.
- Two overdue `8.875` charges accepted `10.125` oldest-first as `8.875` and
  `1.25`, left exact remainder `7.625`, then accepted `7.625` from an `8`
  payment with advance `0.375`; both charges became `paid`.
- Fresh gates passed: `npm run check`, `npm run build`, `npm run test` (43 files
  / 162 tests), and `git diff --check`.

VERDICT: PASS
