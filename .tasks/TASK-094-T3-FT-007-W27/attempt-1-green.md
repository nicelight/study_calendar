# Attempt 1 — claim-linked GREEN

- claim: `FT-007-AC-008 / REQ-014 / REQ-017`
- probe: `npx vitest run tests/identity-access/ft-007-account-profile.test.ts`
- cwd: `/home/serg/Projects/study_calendar`
- repository basis: `fd867181985b28fc3b1bba661e50cddbbfb38e7d` plus the current
  task-scoped working changes listed in `.protocols/TASK-094-T3-FT-007-W27/context.md`.
- result: `PASS` — 1 file, 4 tests.
- observed proof: the isolated matrix covers bootstrap, invitation, and
  direct-password profile creation; trimmed fullName and immutable timestamp;
  exact current-actor and statistics projections; revoked denial; invalid,
  duplicate, and forced profile-write rollback; and unnamed existing accounts
  remaining outside the target population.
- isolation: per-test `:memory:` databases, no external service, no
  `study-calendar.db` access, and afterEach cleanup.
