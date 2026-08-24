---
description: Independent Reviewer verification report for TASK-095-T3-FT-007-W28.
status: final
---
# Independent Verification Report — TASK-095-T3-FT-007-W28

## verdict

`REQUEST_CHANGES` — the functional probes and native gates pass, but the
current provider violates two direct task-scoped architecture rules.

## findings

- `HIGH`: `getRegistryFacts` calls `IdentityAccessBoundary.resolveActor` at
  `src/lib/server/modules/center-scheduling/public.ts:310-313`. The direct
  Statistics Projection contract requires this query not to call Identity &
  Access (`.memory-bank/contracts/statistics-projection.md:75-79`), and the
  indexed task repeats the same anti-goal (`TASK-095...task.json:22,32`).
- `HIGH`: the new `getRegistryMemberships` helper directly joins the
  Identity & Access `accounts` table to return `accounts.role` at
  `src/lib/server/modules/center-scheduling/public.ts:988-1008`. This violates
  the task hard stop against direct neighbor-table access
  (`TASK-095...task.json:78-80`) and the accepted ownership boundary.

These findings are current-task violations, not optional improvements. The
second join is confirmed in the current `git diff` as part of the TASK-095
addition. The plan/context's actor-resolution wording conflicts with the
direct canonical query rule; direct task-linked canonical coverage governs the
verification verdict.

## evidence_checked

- Fresh verifier-owned isolated probe:
  `npx vitest run --config .tasks/TASK-095-T3-FT-007-W28/verifier-vitest.config.ts`
  — 1 file / 1 test passed. It covered Admin own-Center, Teacher assigned
  class, cross-Center, Student/Parent/anonymous/unassigned/removed denial,
  exact fields, no mutation, and cleanup.
- Repeated focused provider test — 1 file / 1 test passed.
- `npm run check` — 0 errors / 0 warnings.
- `npm run test` — 60 files / 190 tests passed.
- `npm run build`, `git diff --check`, `node scripts/mb-lint.mjs`, and
  `node scripts/mb-doctor.mjs --strict` passed; only pre-existing advisory
  metadata warnings and informational doctor output remained.
- Executor RED/GREEN and handoff artifacts were inspected as supporting
  evidence only; no executor receipt was reused.
- T3 isolation: fresh `:memory:` SQLite, per-test cleanup, no network,
  credentials, production DB, or `study-calendar.db`.

## risks_or_questions

- The direct canonical contract and the execution plan disagree about where
  actor resolution occurs. The direct contract and task card both prohibit the
  provider query's Identity & Access call; this should be reconciled by the
  owning planning/design route before re-execution.
- The current no-neighbor spy only observes `getAccountEmail` after the
  composition root has bound the method; it is not used to erase the source-
  level violations above.

## handoff

- `VERDICT: FAIL`
- Recommended route: `/feature-doctor FT-007`, then controlled rebuild/review/
  re-execution and a fresh `/verify`.
- Lifecycle remains `in_progress`; no scheduler, AUTONOMOUS-RUN checkpoint,
  `/red-verify`, `/mb-sync`, `/debug`, or lifecycle transition was performed.
