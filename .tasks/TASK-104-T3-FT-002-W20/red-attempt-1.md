# Attempt 1 claim-scoped RED

- Claim: `FT-002-AC-003` / `REQ-004` — the Admin surface must project lessons
  and expose individual add/transfer/cancel operations.
- Command: `npx vitest run tests/routes/admin-center-management.test.ts`
- CWD: `/home/serg/Projects/study_calendar`
- Result: exit code `1`; 6 existing tests passed, the new focused test failed
  at `expect(initialLessons).toHaveLength(2)` because the current Admin
  projection had no `lessons` field. The subsequent action/control assertions
  were therefore not reachable.
- This is an honest pre-implementation RED for the missing browser-boundary
  outcome, not a setup or syntax failure.
