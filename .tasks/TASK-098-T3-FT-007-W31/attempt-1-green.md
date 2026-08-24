# TASK-098 attempt 1 — claim-linked GREEN

- Task claim: `FT-007-AC-007 / REQ-014 / REQ-017` — exact canonical shell routes and bounded read-only Profile.
- Focused command: `npx vitest run tests/routes/ft-007-profile-routes.test.ts`
- CWD: `/home/serg/Projects/study_calendar`
- Exit code: `0`
- Result: 1 test file, 3 tests passed. The probe verifies the current-actor-query-only server adapter, exact returned/rendered Profile fields, absent mutations, anonymous redirect, revoked-query `403`, exact four shell hrefs, and the existing `POST /auth/logout` form.
- Scope: supporting executor GREEN only; independent verifier proof remains required.
