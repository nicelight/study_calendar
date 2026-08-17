---
description: Independent functional verification for TASK-037-T3-FT-003-W9.
status: active
---
# Verification — TASK-037-T3-FT-003-W9

## What was verified

- Task-owned outcome: `FT-003-AC-007` under `REQ-005`, `REQ-014`, and
  `REQ-016`.
- An authorized Admin, assigned Teacher, permitted Student, and linked Parent
  can open the protected database-backed `/calendar`; anonymous, revoked,
  cross-center, non-member, unassigned, and removed requests expose no lesson
  facts.
- The route remains a thin Actor Context plus Center & Scheduling consumer,
  uses DB lesson facts to derive calendar geometry, performs no write, and
  preserves the public `/` fixture, `/lesson-context`, and the FT-002 class
  entry boundary.

## Verification basis

- Task card and indexed identity:
  `.memory-bank/tasks/TASK-037-T3-FT-003-W9.task.json` and the single matching
  `.memory-bank/tasks/index.json` entry.
- Normative claim: `.memory-bank/features/FT-003-calendar-and-lesson-context.md#ft-003-ac-007--authorized-calendar-uses-db-backed-class-lessons`.
- Direct task-linked architecture: Actor Context and Calendar and Membership
  Query boundaries, Access Control permission matrix, Authentication Transport
  Browser/API path, composition/request data flow, domain read/write flow, and
  scheduling/access lifecycle rules.
- Dependency: `TASK-013-T2-FT-003-W7` is indexed `done`; its geometry outcome
  was treated as a prerequisite/regression, not re-adopted by this task.
- T3 classification is sufficient and required by the authorization/privacy
  path. No higher-tier trigger or unresolved canonical coverage was observed.

## Executor claim path

- Attempt 1 uses the task-accepted route-absence RED. The route files were
  absent before production work; the read-only probe exited `1` and is recorded
  at `.tasks/TASK-037-T3-FT-003-W9/attempt-1-red.md`.
- Claim-equivalent GREEN is recorded at
  `.tasks/TASK-037-T3-FT-003-W9/attempt-1-green.md`: 11 actual route-load/SSR
  cases passed with disposable in-memory databases and complete table
  snapshots.
- The RED is claim-linked rather than a setup/syntax failure, and the GREEN
  exercises the same AC-007 route, authorization, lesson-fact, geometry, denial,
  non-mutation, and boundary outcome.

## Reused execute evidence

- None. The executor declared no eligible receipt, and T3 requires new
  verifier-owned functional observations.

## Repeated checks

- `npx vitest run tests/routes/calendar-authorized.test.ts` — PASS twice in
  fresh verifier execution; `1` file / `11` tests each run.
- Focused sibling regression execution — PASS: `8` files / `42` tests covering
  the calendar, public fixture, FT-002 class/admin schedule surfaces, and the
  existing Lesson Context route/module.
- `npm run check` — PASS, `0` errors and `0` warnings.
- `npm run test` — PASS, `31` files / `142` tests.
- `npm run build` — PASS; generated output contains both protected calendar
  page entries and only the named `getAuthorizedClassScope` / `getLessons`
  calls in the calendar server entry.
- `git diff --check` — PASS.

## New targeted probes

- Built the current application and ran `vite preview` on
  `http://127.0.0.1:4179` against a verifier-created disposable SQLite file.
  Four cookie-authenticated HTTP requests (Admin, assigned Teacher, permitted
  Student, linked Parent) each returned `200`, `class-own`, both current DB
  facts (`lesson-own-planned` / `2026-08-10` / `planned` and
  `lesson-own-completed` / `2026-08-11` / `completed`), and DB-derived
  `lesson-day` geometry. Every response excluded `lesson-other-secret` and the
  public `Ритм обучения` fixture.
- Anonymous and revoked requests returned `303 /login`; cross-center Admin,
  same-center non-member Student, and unassigned Teacher returned `403`. No
  denied body contained class or lesson facts.
- A Teacher returned `200` while assigned. After a deliberate fixture-only
  assignment deletion, the next request and its safe rerun returned `403` with
  no lesson facts.
- Complete canonical snapshots of all `29` non-system tables matched before and
  after the allow/deny HTTP matrix:
  `0c050af75db4dc468aa69e918a02a5d523a89c6d9f1d924b36641d72715c8fb0`.
  After the deliberate assignment-removal fixture transition, snapshots matched
  before/after the denied read and safe rerun:
  `7bff2f9849732d9c492a82de277dfa886be0503c8d0dd18de514b45fc2e2e32c`.
- The same server returned `200` for public `/` with the fixture and `/login`
  entry, preserved `/lesson-context` anonymous denial (`403` without protected
  facts), and returned `200` for the FT-002 own-center class entry.
- Source inspection confirms `src/routes/calendar/+page.server.ts` resolves
  request actor/session, calls only `getAuthorizedClassScope` and `getLessons`,
  and cross-checks class/account/role. `+page.svelte` derives weekdays from
  `LessonView.lessonDate`, uses Svelte 5 runes, and imports neither server code,
  fixture weekdays, nor Lesson Context. No route/component direct SQLite or
  provider-table access exists.
- The disposable server was stopped and its temporary database/body/header
  directory was removed after the observations were recorded.

## Scope and regressions

- The task implementation surface is confined to
  `src/routes/calendar/+page.server.ts`, `src/routes/calendar/+page.svelte`, and
  `tests/routes/calendar-authorized.test.ts`; protocol/report writes are
  workflow-owned. No direct database/provider bypass or second source of truth
  appeared.
- The working tree contains unrelated in-progress feature/task changes. They
  were not attributed to TASK-037 and did not invalidate the focused source,
  generated-build, HTTP, or regression observations above.
- No task-owned code, lifecycle status, dependency, spec, or acceptance record
  was changed by this verification.

## Co-review limitation

- The mandatory semantic pack requested two fresh `Codex Luna` co-reviewers.
  Both prescribed launches were attempted twice and rejected because this
  runtime exposes no `Codex Luna` model. Per the pack, verification continued
  without substituting another model; final judgment remains the verifier's.

## Verdict

VERDICT: PASS

## Handoff

- Required next gate: `/red-verify TASK-037-T3-FT-003-W9`.
- Task lifecycle remains `in_progress`; the explicit top-level lifecycle owner
  decides closure only after the required T3 semantic verdict.
- Durable functional report:
  `.tasks/TASK-037-T3-FT-003-W9/TASK-037-T3-FT-003-W9-S-VERIFY-final-report-docs-01.md`.
