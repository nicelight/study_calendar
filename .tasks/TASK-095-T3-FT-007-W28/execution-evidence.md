---
description: Claim-scoped execution evidence for TASK-095-T3-FT-007-W28.
status: active
---
# Execution Evidence — TASK-095-T3-FT-007-W28

## Preflight

- Exact indexed task: `TASK-095-T3-FT-007-W28`, `T3`, `FT-007`, `W28`.
- Initial lifecycle: `ready`; dependency `TASK-006-T2-FT-002-W4` is `done`.
- Global Backbone: `complete`, Planning Revision `2`.
- Latest FT-007 task-plan review: `APPROVE`,
  `REVIEWED_PLANNING_REVISION: 2`.
- Direct claim: `FT-007-AC-009` / `REQ-014` / `REQ-017`.
- Hard write boundary: `src/lib/server/modules/center-scheduling/public.ts`
  and `tests/center-scheduling/ft-007-registry-facts.test.ts`.
- Forbidden scope check: no TASK-095 change was made under Identity & Access,
  Lesson Context, Learning Progress, Financial Ledger, `src/routes/`, or
  `study-calendar.db`. Those areas had pre-existing shared-worktree changes
  and were preserved.
- Scheduler checkpoint and historical task state were read; TASK-079 remains
  `done`, TASK-080 remains `ready`, and neither card/evidence was modified.

## Attempt 1 — initial claim-specific RED

- command: `npm run test -- tests/center-scheduling/ft-007-registry-facts.test.ts`
- cwd: `/home/serg/Projects/study_calendar`
- result: exit code `1`; 1 test failed.
- input basis: Attempt 1 had an isolated focused test but no TASK-095
  production query; no production behavior had been changed for this claim.
- decisive observation: `TypeError: api.getRegistryFacts is not a function`
  at the first Admin own-center assertion.
- interpretation: honest RED for the missing task-owned public boundary, not a
  setup, syntax, unrelated, or artificial failure.
- artifact: `.tasks/TASK-095-T3-FT-007-W28/attempt-1-red.md`.

## Implementation correction

- `src/lib/server/modules/center-scheduling/public.ts` adds the single public
  `getRegistryFacts({ sessionToken })` query and its serializable C&S-owned
  types/facts.
- The query resolves only the existing server actor, selects Admin own-center
  or Teacher current assigned-class scope, and returns institution, account
  IDs, memberships, parent links, assignments, classes, and class student
  counts. It returns no profile, attendance, payment, sorting, or composed
  registry payload.
- Student/Parent, anonymous/revoked, and Teacher-without-current-assignment
  requests return `null`; removed Teacher assignment is denied on the next
  query. No client center/class scope is accepted as authority.
- SQL is read-only and no neighbor capability is called. Existing dirty W27
  profile changes in the same production file were preserved.
- `tests/center-scheduling/ft-007-registry-facts.test.ts` provides isolated
  role/scope, exact-field, cross-center, removed-assignment, no-neighbor, and
  full relevant source-state equality coverage.

## Attempt 1 — claim-equivalent GREEN

- command: `npm run test -- tests/center-scheduling/ft-007-registry-facts.test.ts`
- cwd: `/home/serg/Projects/study_calendar`
- result: exit code `0`; 1 test file and 1 test passed.
- decisive observations: Admin own-center and other-center facts are scoped;
  assigned Teacher receives only the assigned class; Student/Parent and
  unassigned/removed Teacher requests return `null`; exact C&S-only fields
  match; `getAccountEmail` is never called; relevant source rows are equal
  before and after all query calls.
- probe change: after the first GREEN, the state check was strengthened from
  schema-only equality to full snapshots of accounts, memberships, classes,
  class-student links, teacher assignments, and parent links. This is the same
  claim with stronger non-mutation evidence, not a scope expansion.
- isolation: each run uses fresh `:memory:` SQLite and closes the root in
  `afterEach`; no network, credentials, production state, or `study-calendar.db`.

## Required project-native gates

- `npm run check` → exit `0`; svelte-check found 0 errors and 0 warnings.
- `npm run test` → exit `0`; 60 files and 190 tests passed.
- `npm run build` → exit `0`; SSR/client production build completed. Existing
  adapter-auto unsupported-production-environment note was informational.
- `git diff --check` → exit `0`.
- `node scripts/mb-lint.mjs` → exit `0`; 74 files passed. Existing advisory
  metadata warnings remain outside this task.
- `node scripts/mb-doctor.mjs --strict` → exit `0`; 0 errors, 0 warnings,
  2 informational messages.

## Actual change surface and scope result

- Production outcome file: `src/lib/server/modules/center-scheduling/public.ts`.
- Focused proof file: `tests/center-scheduling/ft-007-registry-facts.test.ts`.
- Required lifecycle/protocol/evidence files:
  `.memory-bank/tasks/TASK-095-T3-FT-007-W28.task.json` (only
  `ready -> in_progress`), `.protocols/TASK-095-T3-FT-007-W28/`, and
  `.tasks/TASK-095-T3-FT-007-W28/`.
- The advisory `touched_files` list was satisfied exactly for implementation
  and focused proof; no same-outcome file outside the hard boundary was needed.
- Forbidden scope was not touched by this Attempt 1. No tier escalation,
  source-of-truth change, graph edge, public neighbor edge, or material design
  branch was introduced.
- No lifecycle closure, scheduler transition, dependent promotion, `/verify`,
  `/red-verify`, `/mb-sync`, or AUTONOMOUS-RUN checkpoint edit was performed.

## Reuse candidate disposition

- None offered. Full project gates have broad/implicit read surfaces and the
  shared worktree contains unrelated tracked/untracked W27/W28 state, so the
  bounded-input reuse-candidate conditions are not met. The gate results above
  remain executor supporting evidence and must be independently repeated by
  `/verify`.

## Next owner

- Fresh independent functional owner: `/verify TASK-095-T3-FT-007-W28`.
- After functional PASS, T3 semantic owner: per-task `/red-verify`.
- Scheduler/lifecycle owner remains responsible for final status and wave
  handling; `/exe` leaves TASK-095 `in_progress`.

## Attempt 2 — corrected boundary evidence

- Retry basis: preserved `/verify` FAIL and Judge `JUDGE_ASSESSMENT: REDIRECT`
  identified provider-side actor resolution and direct Identity & Access
  `accounts.role` access as implementation-only findings. The correction
  basis is recorded in `.tasks/TASK-095-T3-FT-007-W28/attempt-2-red.md`.
- Actual production correction: `getRegistryFacts` now accepts a
  server-resolved `ActorContext`; the registry membership query selects only
  C&S-owned membership identifiers and no longer joins `accounts` or returns
  `role`. No profile fields were added.
- Focused GREEN: `npm run test -- tests/center-scheduling/ft-007-registry-facts.test.ts`
  → exit `0`, 1 file / 1 test passed.
- Boundary checks:
  - registry query source scan for `resolveActor`, `accounts`, `fullName`, and
    `registeredAt` → exit `0`.
  - registry membership helper source scan for `accounts`, `fullName`,
    `registeredAt`, and returned `role` → exit `0`.
- Native gates: `npm run check` exit `0` (0 errors/warnings); `npm run test`
  exit `0` (60 files / 190 tests); `npm run build` exit `0`; `git diff --check`
  exit `0`; `node scripts/mb-lint.mjs` exit `0` (74 files, existing advisory
  metadata warnings); `node scripts/mb-doctor.mjs --strict` exit `0` (0 errors,
  0 warnings, 2 info).
- Attempt 2 evidence is executor supporting evidence only. No reuse candidate
  is offered because the project gates have broad read surfaces and the shared
  worktree remains dirty.
