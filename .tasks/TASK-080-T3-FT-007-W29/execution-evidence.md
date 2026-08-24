---
description: Claim-scoped execution evidence for TASK-080-T3-FT-007-W29.
status: active
---
# Execution Evidence — TASK-080-T3-FT-007-W29

## Resume preflight and ownership

- Exact indexed task: `TASK-080-T3-FT-007-W29`, tier `T3`, feature `FT-007`,
  wave `W29`; one matching index record was resolved.
- Current task status was already `in_progress`; dependencies
  `TASK-079-T3-FT-007-W28`, `TASK-095-T3-FT-007-W28`,
  `TASK-035-T3-FT-002-W19`, and `TASK-026-T3-FT-002-W12` were authoritative
  `done`.
- Global Backbone is `complete` at Planning Revision `2`; the latest FT-007
  task-plan review is `APPROVE` with standalone
  `REVIEWED_PLANNING_REVISION: 2`; the fresh strict-doctor readiness evidence
  is `PASS` with 0 errors, 0 warnings, and 2 info.
- Direct task context was read from FT-007-AC-002, REQ-014/REQ-017, the
  Calendar and Membership Query Boundary, Actor Context Boundary, Access
  Control authority/scope, disposable-browser strategy, and T3 tier policy.
- Existing dirty W27/W28 changes were inspected and preserved. No unrelated
  dirty file was used as a task outcome or overwritten.

## Resume reconciliation and attempts

- Historical Attempt 1 remains preserved in `attempt-1-red.md`,
  `attempt-1-green.md`, the prior executor report/evidence, functional PASS,
  and semantic-fail/Judge REDIRECT artifacts. Those records describe the
  superseded route-only scope and are supporting-only for the current result.
- Attempt 1's material semantic finding was the bare Student/Parent
  over-denial caused by requiring `classId` before calling C&S.
- Attempt 2 was durably created in the current protocol at
  `2026-08-22 07:50 +0500` before its first prospective probe or production
  write. It owns only the reconciled `FT-007-AC-002 / REQ-014 / REQ-017`
  correction.
- Attempt 2 RED is
  [attempt-2-red.md](attempt-2-red.md); Attempt 2 GREEN is
  [attempt-2-green.md](attempt-2-green.md). No retry budget, task status,
  scheduler lifecycle, closure, or historical verdict was rewritten.

## Implemented reconciled outcome

- `CenterSchedulingBoundary.getAccessibleClassList({ actor })` is a read-only
  C&S public query over existing center membership, class membership,
  parent-link, and class facts. Student eligibility uses server-side class
  membership; Parent eligibility uses server-side parent link plus the linked
  student's class membership. Empty or unsupported scope fails closed.
- The returned public result contains only C&S-owned
  `{ classId, centerId, name, mode }` facts, ordered by class name/id. It does
  not return Identity & Access profile fields, attendance, payment, metrics,
  registry composition, or caller authority.
- `/home` and `/classes` consume `event.locals.actor` and the public C&S query.
  Bare Student/Parent routes enumerate the complete returned list. A supplied
  `classId` can only filter an already provider-authorized result; it never
  authorizes or expands scope. Admin/Teacher retain the existing C&S registry
  path for own-center/assigned-class destinations.
- Existing `/admin/{centerId}`, `/center/{centerId}/class/{classId}`, and
  `/calendar?classId=...` destinations remain destination owners. Routes do
  not read provider tables or write state.

## Actual change surface

Current Attempt 2 code/test changes:

- `src/lib/server/modules/center-scheduling/public.ts`
- `src/routes/home/destination.server.ts`
- `tests/center-scheduling/ft-007-accessible-class-list.test.ts`
- `tests/routes/ft-007-home-classes.test.ts`
- `e2e/ft-007-home-classes.spec.ts`

Attempt 1 route/presentation files were retained and adapted only where the
reconciled result required it:

- `src/routes/home/+page.server.ts`
- `src/routes/home/+page.svelte`
- `src/routes/home/DestinationPage.svelte`
- `src/routes/classes/+page.server.ts`
- `src/routes/classes/+page.svelte`

Required task protocol/evidence files were updated or added under
`.protocols/TASK-080-T3-FT-007-W29/` and
`.tasks/TASK-080-T3-FT-007-W29/`. The exact disposable database was created
only by the owned runner and was cleaned up. No forbidden path was touched:
`src/lib/server/modules/identity-access/`,
`src/lib/server/modules/learning-progress/`,
`src/lib/server/modules/financial-ledger/`, `src/routes/statistics/`,
`src/routes/profile/`, and `study-calendar.db` remain outside this outcome.

## Hard boundary and contract compliance

- All Attempt 2 production/test/E2E changes are inside the literal
  `runtime_context.write_boundary`; the public C&S file is explicitly declared
  by the reconciled card. Protocol/evidence bookkeeping uses the skill-owned
  task artifacts.
- No forbidden scope was touched. No new capability slice, dependency graph
  edge, source-of-truth owner, role, membership, assignment, authorization
  rule, persistence, or production side effect was introduced.
- The C&S public boundary owns the eligibility/list selection. Home/Classes are
  transport/presentation adapters and preserve dependency direction. The
  accessible query stays separate from AC-009 registry facts and later AC-003
  statistics composition.
- Browser proof remained disposable and used only the declared temporary
  database. After the final E2E, `tmp/ft-007-home-classes.db` and its `-wal`,
  `-shm`, and `-journal` sidecars were all absent.

## Claim-linked execution evidence

- Attempt 2 RED: `attempt-2-red.md`; the isolated provider fixture loaded, then
  `npm run test -- tests/center-scheduling/ft-007-accessible-class-list.test.ts`
  exited `1` with `TypeError: api.getAccessibleClassList is not a function`
  before production correction.
- Attempt 2 GREEN: `attempt-2-green.md`; provider, route, disposable browser,
  and all required native gates passed after the correction.
- No execute reuse candidate is proposed. The shared worktree has unrelated
  dirty W27/W28 inputs and runtime-sensitive/generated state that cannot be
  conservatively bounded as a reusable receipt.

## Final task-owned gates

| Gate | Exact command | Result | Evidence |
|---|---|---|---|
| accessible-class-provider | `npm run test -- tests/center-scheduling/ft-007-accessible-class-list.test.ts` | exit `0`, 1 file / 1 test | provider test and Attempt 2 GREEN |
| focused route | `npm run test -- tests/routes/ft-007-home-classes.test.ts` | exit `0`, 1 file / 13 tests | route test and Attempt 2 GREEN |
| check | `npm run check` | exit `0`, 0 errors / 0 warnings | final executor run |
| test | `npm run test` | exit `0`, 62 files / 204 tests | final executor run |
| build | `npm run build` | exit `0` | final SSR/client build; adapter-auto advisory only |
| e2e-home-classes | `node scripts/run-disposable-e2e.mjs --database tmp/ft-007-home-classes.db --spec e2e/ft-007-home-classes.spec.ts` | exit `0`, Playwright 1 passed | disposable runner; exact DB/sidecars cleaned |
| diff | `git diff --check` | exit `0` | final executor run |
| mb-lint | `node scripts/mb-lint.mjs` | exit `0`, 74 files | pre-existing metadata warnings only |
| strict-doctor | `node scripts/mb-doctor.mjs --strict` | exit `0`, 0 errors / 0 warnings / 2 info | final executor run |

The build emitted the existing adapter-auto deployment advisory and plugin
timing information; neither changed the exit result. The E2E emitted the
already-known non-blocking `NO_COLOR`/`FORCE_COLOR` warning.

## Handoff

- Task lifecycle remains `in_progress`; `/exe` did not run `/verify`,
  `/red-verify`, `/debug`, `/mb-sync`, scheduler lifecycle, promotion, or
  status closure.
- Next exact owner/action: fresh `/verify TASK-080-T3-FT-007-W29`; after
  functional PASS, required per-task T3 `/red-verify
  TASK-080-T3-FT-007-W29`. Scheduler retains final lifecycle and later wave
  sync ownership.
