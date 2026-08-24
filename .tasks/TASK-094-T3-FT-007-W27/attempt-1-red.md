# Attempt 1 — claim-linked RED

- claim: `FT-007-AC-008 / REQ-014 / REQ-017`
- probe: `npx vitest run tests/identity-access/ft-007-account-profile.test.ts`
- cwd: `/home/serg/Projects/study_calendar`
- result: `FAIL` (1 test, 1 failed)
- observed failure: the pre-implementation bootstrap path accepted a request
  without surname/given name instead of throwing `invalid-name`.
- decisive comparison: incomplete input was accepted, violating the required
  profile facts for the first bootstrap path. The probe stopped before the
  invitation/direct-password assertions because the first claim assertion
  already demonstrated the missing behavior.
- isolation: in-memory database; no `study-calendar.db` access or external side
  effect.
