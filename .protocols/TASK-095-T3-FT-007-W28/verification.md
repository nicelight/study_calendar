---
description: Independent Attempt 2 verification for TASK-095-T3-FT-007-W28.
status: active
---
# Verification — TASK-095-T3-FT-007-W28

## What was verified

- `FT-007-AC-009` / `REQ-014` / `REQ-017`: the corrected Center & Scheduling
  registry-facts provider boundary.
- Server-resolved actor input, exact C&S-owned fields, Admin own-center and
  Teacher assigned-class scope, Student/Parent/anonymous/unassigned/removed
  assignment denials, no Identity & Access call, no `accounts` read/join,
  no profile/metric/composed fields, read-only behavior, and T3 isolation.
- Task lifecycle observed as `in_progress` and unchanged. Attempt 1 FAIL,
  Judge REDIRECT, and Attempt 2 handoff/evidence remain historical/supporting
  inputs; the preserved Attempt 1 report was not modified.

## Verification basis

- Task card: `.memory-bank/tasks/TASK-095-T3-FT-007-W28.task.json`.
- Feature/REQ: `.memory-bank/features/FT-007-navigation-and-statistics.md#FT-007-AC-009`,
  `REQ-014`, `REQ-017`.
- Direct canonical specs:
  `.memory-bank/contracts/statistics-projection.md#center-and-scheduling-registry-facts-query`,
  `.memory-bank/contracts/boundary-map.md#calendar-and-membership-query-boundary`,
  `.memory-bank/contracts/access-control.md#authority-and-scope`, and
  `.memory-bank/domains/core-domain.md#ownership-map`.
- T3 policy sections applied: `#tier-obligations`, `#hard-write-boundary`,
  `#task-claim-and-dependency-ownership`, `#task-scoped-acceptance-evidence`,
  `#claim-linked-red--green-for-t2t3`, and `#closure-authority` in
  `.memory-bank/workflows/tier-policy.md`.
- Task preflight passed: exactly one indexed task record, matching `T3` ID,
  string-array requirements/dependency, six valid required gates, and valid
  verification entries. Dependency `TASK-006-T2-FT-002-W4` is `done`;
  Global Backbone is complete at Planning Revision 2.

## Executor claim path

- Attempt 1 honest RED and independent FAIL established the original
  provider-boundary defects. Judge REDIRECT authorized the bounded correction.
- Attempt 2 retained that RED, supplied fresh claim-equivalent GREEN, and
  removed provider-side actor resolution, direct `accounts` access, and
  Identity & Access-owned role output.
- Attempt 2 RED/GREEN and native gate artifacts were inspected as supporting
  evidence only. No executor receipt was reused because the handoff offered no
  eligible bounded-input current-attempt candidate.

## Task-scoped checklist

- [x] C&S returns institution, account IDs, memberships, parent links,
  assignments, classes, and counts only.
  - Method: fresh isolated provider probe plus bounded source inspection.
  - Evidence: `.tasks/TASK-095-T3-FT-007-W28/verifier-attempt-2.test.ts` and
    `TASK-095-T3-FT-007-W28-S-VERIFY-RETRY-final-report-docs-03.md`.
- [x] Admin own-center, Teacher assigned-class, cross-center isolation, and
  Student/Parent/anonymous/unassigned/removed-assignment denials.
  - Method: direct `ActorContext` role/scope matrix in disposable SQLite.
  - Evidence: fresh probe result, Focus A/B supporting reports, and Attempt 2
    GREEN artifact.
- [x] No Identity & Access call, no `accounts` read/join, no profile/metric
  fields, no final composition, and no source mutation.
  - Method: throwing Identity & Access port, exact-key assertions, bounded
    source check, and before/after snapshots.
  - Evidence: fresh probe and source-boundary PASS output recorded in the
    final report.

## Regression / non-goals

- [x] No FT-007-AC-003 final registry composition, route presentation,
  attendance calculation, payment capability, or sorting was attributed to
  TASK-095.
- [x] Hard implementation/proof paths remain the task's literal entries:
  `src/lib/server/modules/center-scheduling/public.ts` and
  `tests/center-scheduling/ft-007-registry-facts.test.ts`.
- [x] Existing unrelated W27/W28 shared-worktree changes were observed and
  preserved; this verification did not edit forbidden module roots, routes,
  `study-calendar.db`, lifecycle, scheduler, or AUTONOMOUS-RUN state.
- [x] Applicable boundary and ownership rules were checked only for this
  registry query surface, not as a repository-wide audit.

## Quality gates evidence

- `npm run check`: PASS, 0 errors / 0 warnings.
- `npm run test`: PASS, 60 files / 190 tests.
- `npm run build`: PASS.
- `git diff --check`: PASS.
- `node scripts/mb-lint.mjs`: PASS, 74 files; existing advisory warnings.
- `node scripts/mb-doctor.mjs --strict`: PASS, 0 errors / 0 warnings / 2 info.

## Reused execute evidence

- Receipt locator: none.
- Supporting Attempt 2 handoff/evidence was read but not reused as independent
  proof; broad gates and shared dirty state fail the bounded-input reuse basis.

## Repeated checks

- Focused provider test: `npm run test --
  tests/center-scheduling/ft-007-registry-facts.test.ts` — PASS, 1/1.
- All six required task gates were rerun and passed as listed above.
- Repetition was required because T3 executor observations cannot satisfy
  verifier independence.

## New targeted probes

- Verifier-owned command:
  `npx vitest run --config
  .tasks/TASK-095-T3-FT-007-W28/verifier-attempt-2.vitest.config.ts` — PASS,
  1 file / 1 test.
- Claim mapping: actor boundary; exact C&S field ownership; role/scope and
  denial matrix; no-neighbor/no-accounts behavior; non-mutation; disposable
  cleanup. The probe used direct actors, a throwing Identity & Access port, and
  snapshots covering centers, accounts, sessions, memberships, classes,
  class-student links, assignments, parent links, schedules, and lessons.
- Source-boundary command: bounded slices of `getRegistryFacts` and registry
  helpers — PASS; no `resolveActor`, `getAccountEmail`, `identityAccess`,
  `accounts`, `fullName`, `registeredAt`, or returned `role` references.
- Fresh co-review support: Codex Luna `xhigh` Focus A and Focus B each returned
  no evidence-backed candidate finding. The caller independently adjudicated
  the complete claim set.

## Verdict

VERDICT: PASS

## Handoff

- Recommended next owner/action: `/red-verify TASK-095-T3-FT-007-W28`.
- T3 is not closure-eligible from `/verify` alone; scheduler/lifecycle owner
  remains unchanged.
- Task lifecycle changed by verifier: no.
- `/red-verify`, `/mb-sync`, `/debug`, and scheduler transitions were not run.

## Notes

- The stale prior verifier probe using `{ sessionToken }` and membership `role`
  was excluded from current proof and left unchanged. Fresh probes use the
  corrected `{ actor }` boundary.
