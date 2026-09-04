# Attempt 1 claim-scoped GREEN

- Claims: `FT-002-AC-003` / `FT-002-AC-004` / `REQ-004` / `REQ-014`.
- Command: `npx vitest run tests/routes/admin-center-management.test.ts tests/routes/admin-schedule-draft.test.ts`
- CWD: `/home/serg/Projects/study_calendar`
- Result: exit code `0`; 2 test files and 12 tests passed.
- Covered outcome: Admin projection renders lessons and add/transfer/cancel
  controls; add uses a server-generated identity; transfer preserves the
  selected identity and sibling lesson; forged, unauthenticated, non-Admin,
  cross-center, and forged-lesson submissions are denied; completed
  cancellation is denied with unchanged full lesson state.
