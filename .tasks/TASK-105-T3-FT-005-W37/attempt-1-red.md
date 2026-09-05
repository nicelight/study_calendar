# TASK-105-T3-FT-005-W37 — Attempt 1 claim-specific RED

- attempt: 1
- claims: `FT-005-AC-001 / REQ-009`, `FT-005-AC-002 / REQ-009 / REQ-014`, Learning Progress Browser Surface `#server-composed-homework-projection` and `#authorized-homework-form-actions`
- command: `npx vitest run tests/routes/lesson-context-homework-actions.test.ts --reporter verbose`
- cwd: `/home/serg/Projects/study_calendar`
- exit_code: `1`
- input_state_basis: repository revision `43780aad1b024fbbf8e89e7b2b15c55719a2368a`; pre-existing unrelated FT-006 changes were present, plus the task-local RED test; no TASK-105 production files had been changed.
- completed_at: `2026-09-05T03:13:36+05:00`

## Observable result

- Named `createHomework` action returned `ActionFailure { status: 400, data: { error: 'invalid_request' } }` instead of `{ homeworkSuccess: true }`.
- Loaded day context had `homeworkProgress === undefined` instead of the provider-owned `{ homework: null, completions: [], grades: [] }` projection.
- Both failures are functional absence of the accepted server transport/projection, not setup, syntax, or artificial failures.

## Isolation / cleanup

- Each test created a fresh `:memory:` `CompositionRoot`.
- `afterEach` cleared the route root and called `root.database.close()`; no filesystem database or sidecar was created.
