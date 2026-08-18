# Functional verification report — TASK-044-T3-FT-006-W22

- Fresh verifier-owned probe passed FT-006-AC-004 / REQ-010 / REQ-012 / REQ-015
  in isolated disposable SQLite state.
- Individual payment `11` allocated exactly `6.75` and `4.25`; correction,
  rollback, reactivation, audit actor/action sequence, group charges,
  deterministic second-database replay, unrelated isolation, and denied or
  failed no-mutation paths all passed.
- Fresh gates passed: `npm run check`, `npm run build`, `npm run test` (40 files
  / 159 tests), and `git diff --check`.

VERDICT: PASS
