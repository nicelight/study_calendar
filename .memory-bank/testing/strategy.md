---
description: Minimal framework baseline policy for risk-based testing and verification evidence.
status: active
---
# Testing Strategy

## Risk-based checks
- Choose checks from concrete product and regression risks in the PRD,
  Constitution, requirements, features, subject specs, and actual project shape.
- Use the cheapest check that reliably proves the required behavior.
- Add a broader or more expensive test level only when a narrower check cannot
  prove the outcome.
- Do not create tests merely to fill unit, integration, or e2e categories.

## Integrity
- Do not weaken assertions, disable failing checks, or replace meaningful
  verification with decorative coverage to obtain a green result.
- Treat a failing applicable check as evidence to investigate or resolve within
  explicit scope.

## Alembic migration ownership
- For an accepted linear Alembic graph, one project-level database contract
  owns dynamic checks for a single head, no branches, and intact ancestry.
  A feature migration test owns only its revision, direct `down_revision`,
  upgrade/downgrade, schema transition, and data preservation.
- A new revision reruns the project-level contract; it does not require literal
  current-head consumers or historical feature-test updates. Resolve current
  head at execution preflight when needed and keep its ID out of durable testing
  specs, feature plans, and task cards.

## Evidence and ownership
- T2/T3 tasks require an executable verification path. T0/T1 may use compact
  evidence or a documented no-runnable-check route when no meaningful check exists.
- Store commands, results, logs, screenshots, and verdicts in the task-selected
  `.protocols/<TASK_ID>/` and `.tasks/<TASK_ID>/` paths, not in this policy.
- Keep product quality targets in requirements/features and simple verification
  methods in feature AC/task records. Use a subject spec only for a non-trivial
  reproducible measurement method or expert rubric; it never supplies a missing
  product target. Keep executable gates in task records.

## Real-database browser smoke
- Playwright is configured in `playwright.config.ts` and runs the real local
  `study-calendar.db` through the existing dev server at `127.0.0.1:5173`.
- The first smoke path uses the real password login, then follows Admin → class
  → calendar → lesson and logs out through the real `/auth/logout` route. It
  does not seed temporary accounts, sessions, databases, or product records.
- Local credentials are kept only in the ignored, mode-600 `.env.e2e.local`;
  never copy that file into task evidence, logs, or repository-authored docs.
- Run with `npm run e2e`. The current smoke test proves real browser login,
  Admin → class → calendar → lesson navigation, shared-material save/reload,
  mobile free-day navigation, the Admin account form, and logout. It restores
  the selected lesson material and removes only the exact session created by
  the test; it does not submit or create a product account.

## Disposable browser proof

- A focused disposable Playwright run uses the project runner
  `node scripts/run-disposable-e2e.mjs --database <tmp/*.db> --spec <spec>`.
  The runner MUST reject `study-calendar.db` and every database path outside
  project `tmp/`, create the parent directory, remove a stale target before the
  run, and remove the exact disposable database in a `finally` path. A tracked
  `tmp/.gitkeep` also guarantees that a fresh checkout has the parent before
  SQLite opens the task database.
- Disposable mode MUST start its own SvelteKit server with the supplied
  `DATABASE_URL`; it MUST NOT reuse a server already listening for the normal
  real-database smoke. Port collision or inability to start the owned server is
  a failing gate, never permission to reuse another process.
- The ordinary `npm run e2e` real-database path remains unchanged. Focused task
  evidence records the disposable path, owned-server startup, cleanup on both
  success and forced failure, and unchanged `study-calendar.db` metadata.

## Direct Admin participant accounts
- The Admin action creates a teacher, student, or parent with normalized email,
  password credential, and center membership through Center & Scheduling.
- Parent creation requires an existing center student; the parent link and
  account state are committed atomically. Duplicate email, invalid role/link,
  non-Admin, and cross-center paths must leave state unchanged.
- Focused route coverage verifies creation, password login, parent link,
  duplicate email, and non-Admin denial. The real browser smoke checks the
  visible form without adding an unrequested real account to `study-calendar.db`.

## Real payment browser path
- `e2e/real-database-payment.spec.ts` runs against the same real local
  `study-calendar.db` and existing dev server. It creates/reuses only the
  explicitly named E2E Teacher and Student through the real Admin flow, assigns
  the Student to an existing class, and prepares the smallest exact price/
  charge fixture needed to make paid and unpaid days observable.
- The test logs in as the assigned Teacher, submits the Lesson Context payment
  form, asserts one recorded payment and one allocation in the database, then
  logs in as the Student and asserts distinct paid/unpaid card colors, labels,
  and lesson identities. Exact automation session tokens are removed in
  `finally`; the requested test accounts and payment remain for inspection.
- Shared Admin/Teacher calendar payloads and Student payment submission are
  covered by route tests so the browser projection cannot become a shared
  guessed status.
