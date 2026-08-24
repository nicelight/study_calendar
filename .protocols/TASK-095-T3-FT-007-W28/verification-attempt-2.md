---
description: Fresh independent Focus B verification for TASK-095-T3-FT-007-W28.
status: active
---
# Verification candidate — TASK-095-T3-FT-007-W28 — Attempt 2 / Focus B

## Scope

- Target: `TASK-095-T3-FT-007-W28`, `T3`, `FT-007-AC-009`, `REQ-014`, `REQ-017`.
- Focus: functional privacy and proof — Admin own-center, Teacher assigned-class,
  cross-center isolation, Student/Parent/anonymous/unassigned/removed-assignment
  denial, exact C&S-owned output, non-mutation, disposable isolation, and
  current Attempt 2 evidence/gates.
- Lifecycle observed: task remains `in_progress`; no lifecycle, scheduler,
  AUTONOMOUS-RUN, implementation, or historical evidence was changed.

## Normative basis checked

- Task card: `.memory-bank/tasks/TASK-095-T3-FT-007-W28.task.json`.
- Acceptance and REQs: `.memory-bank/features/FT-007-navigation-and-statistics.md#FT-007-AC-009`;
  `REQ-014` and `REQ-017`.
- Canonical contracts: `.memory-bank/contracts/statistics-projection.md#center-and-scheduling-registry-facts-query`;
  `.memory-bank/contracts/boundary-map.md#calendar-and-membership-query-boundary`;
  `.memory-bank/contracts/access-control.md#authority-and-scope`;
  `.memory-bank/domains/core-domain.md#ownership-map`.
- Workflow rules: `.memory-bank/workflows/tier-policy.md` sections Tier
  Obligations, Hard Write Boundary, Task Claim And Dependency Ownership,
  Task-Scoped Acceptance Evidence, Claim-Linked RED / GREEN For T2/T3, and
  Closure Authority.

The applicable contract requires a server-resolved actor at this provider
boundary; C&S returns only institution, class, membership, parent-link,
assignment/count facts and account IDs; the query does not call Identity &
Access, read/join `accounts`, return profile/metric fields, or mutate source
facts. Admin scope is own center, Teacher scope is assigned classes, and
Student/Parent center-wide access is denied without row disclosure.

## Executor claim path (supporting only)

- Attempt 1 RED and independent FAIL were inspected from
  `.tasks/TASK-095-T3-FT-007-W28/attempt-1-red.md` and the prior verification
  artifacts. The two boundary violations were preserved as retry context.
- Judge REDIRECT and Attempt 2 correction were inspected from
  `.tasks/TASK-095-T3-FT-007-W28/attempt-2-red.md` and
  `.tasks/TASK-095-T3-FT-007-W28/attempt-2-green.md`.
- Attempt 2 claim-equivalent GREEN and native gate results in
  `execution-evidence.md` were treated as executor supporting evidence only;
  no executor receipt was reused as independent proof.

## Reused execute evidence

None. The handoff offered no eligible bounded-input receipt because the broad
native gates and shared dirty worktree do not satisfy the reuse conditions.

## Repeated checks

- `npm run test -- tests/center-scheduling/ft-007-registry-facts.test.ts` —
  PASS, 1 file / 1 test.
- `npm run check` — PASS, 0 errors / 0 warnings.
- `npm run test` — PASS, 60 files / 190 tests.
- `npm run build` — PASS; only the existing adapter-auto environment note and
  plugin timing diagnostics were reported.
- `git diff --check` — PASS.
- `node scripts/mb-lint.mjs` — PASS, 74 files; only existing advisory
  metadata warnings were reported.
- `node scripts/mb-doctor.mjs --strict` — PASS, 0 errors / 0 warnings / 2 info.

These checks were repeated because this is a T3 retry and executor gates are
not verifier-owned proof.

## New targeted probe

- Probe: `.tasks/TASK-095-T3-FT-007-W28/verifier-attempt-2-registry-facts.test.ts`.
- Command: `npx vitest run --config .tasks/TASK-095-T3-FT-007-W28/verifier-attempt-2-vitest.config.ts`.
- Result: PASS, 1 file / 1 test.
- Isolation: fresh `:memory:` SQLite database, closed in `afterEach`, no
  network, credentials, production database, or `study-calendar.db`.
- Actor boundary: actors were resolved before the provider call; the fresh
  provider instance received a throwing Identity & Access port, so any
  provider-side actor/profile call would fail the probe.
- Functional observations:
  - Admin returned exact own-center institution, classes, memberships,
    parent link, assignment/count facts, and account IDs; other-center rows
    were absent.
  - Teacher returned only the assigned own-center class and its related
    student/parent/teacher structural facts; the empty and other-center
    classes were absent.
  - Student, Parent, unassigned Teacher, revoked/invalid actor, and `null`
    actor returned `null` without unrelated rows.
  - Removing the teacher assignment caused the next provider query to return
    `null`.
  - Exact returned keys contain no `role`, `fullName`, `registeredAt`,
    attendance, payment, or composed registry fields.
  - Complete relevant source-row snapshots were equal before and after the
    provider query matrix.
- Source-boundary check: the current registry query and helper slice
  (`public.ts:309-364` and `public.ts:932-1065`) contains no
  `identityAccess`, `accounts`, `getAccountEmail`, `fullName`, or
  `registeredAt` references; only C&S-owned tables are selected.

## Candidate findings

No evidence-backed candidate finding identified for Focus B.

## Risks or questions

- The prior `.protocols/.../verification.md` and
  `TASK-095...-VERIFY-final-report-docs-01.md` remain unchanged historical
  Attempt 1 evidence. The stale prior verifier test was not used as current
  proof; the fresh probe above uses the corrected actor-context API.
- Overall task verdict remains for the owning verification/Judge context; this
  record reports only the selected Focus B evidence.

## Focus result

Focus result: PASS

## Handoff

- Candidate findings: none for Focus B.
- Lifecycle/scheduler/AUTONOMOUS-RUN state changed by this verification: no.
- `/red-verify`, `/debug`, `/mb-sync`, and lifecycle transitions were not run.
