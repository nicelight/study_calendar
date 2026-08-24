---
description: Fresh Attempt 2 independent verification report for TASK-095-T3-FT-007-W28.
status: final
---
# Independent Verification Report — TASK-095-T3-FT-007-W28

## Verification scope

- Reviewer command: `/verify TASK-095-T3-FT-007-W28`; task tier: `T3`.
- Attempt: scheduler-authorized Attempt 2 / retry 1 of 2.
- Owned outcome: `FT-007-AC-009` / `REQ-014` / `REQ-017`; only the
  Center & Scheduling registry-facts provider boundary is assessed.
- Lifecycle observed as `in_progress` and left unchanged. No scheduler,
  AUTONOMOUS-RUN, implementation, spec, task-scope, or prior Attempt 1
  evidence was changed by this verification.

## Normative basis

- Task card: `.memory-bank/tasks/TASK-095-T3-FT-007-W28.task.json`.
- Feature/REQ: `.memory-bank/features/FT-007-navigation-and-statistics.md#FT-007-AC-009`,
  `REQ-014`, `REQ-017`.
- Direct canonical contracts:
  `.memory-bank/contracts/statistics-projection.md#center-and-scheduling-registry-facts-query`,
  `.memory-bank/contracts/boundary-map.md#calendar-and-membership-query-boundary`,
  `.memory-bank/contracts/access-control.md#authority-and-scope`, and
  `.memory-bank/domains/core-domain.md#ownership-map`.
- Applicable T3 policy: `.memory-bank/workflows/tier-policy.md` sections
  `#tier-obligations`, `#hard-write-boundary`,
  `#task-claim-and-dependency-ownership`, `#task-scoped-acceptance-evidence`,
  `#claim-linked-red--green-for-t2t3`, and `#closure-authority`.
- Attempt 1 FAIL/evidence, Judge REDIRECT, and Attempt 2 handoff/RED/GREEN
  were inspected as supporting retry history only.

## Executor claim path

- Attempt 1's honest RED, independent functional FAIL, and the two confirmed
  boundary findings were retained as the retry basis.
- Judge REDIRECT authorized the bounded correction: accept a server-resolved
  `ActorContext`, remove provider-side Identity & Access resolution, remove
  direct `accounts` access, and omit Identity & Access-owned role/profile
  output.
- Attempt 2 claim-equivalent GREEN at
  `.tasks/TASK-095-T3-FT-007-W28/attempt-2-green.md` and the executor gates
  were read as supporting evidence only. No execute receipt was reused.

## Fresh verifier-owned evidence

### Corrected actor and ownership boundary

The fresh probe
`.tasks/TASK-095-T3-FT-007-W28/verifier-attempt-2.test.ts`, run with
`npx vitest run --config .tasks/TASK-095-T3-FT-007-W28/verifier-attempt-2.vitest.config.ts`,
passed `1 file / 1 test` in a fresh `:memory:` SQLite database.

- The provider was constructed with actor objects already resolved outside the
  query. Its Identity & Access `resolveActor` and `getAccountEmail` ports throw
  if called; both observed call counts remained zero.
- The public signature is `getRegistryFacts({ actor: ActorContext | null })`;
  it accepts no client-supplied center/class scope or session token.
- Exact output keys are limited to `centerId`, `institution`, `accountIds`,
  `memberships`, `parentLinks`, `assignments`, and `classes`. Memberships have
  only `centerId`/`accountId`; class facts have only C&S structural fields and
  `studentCount`. No `role`, `fullName`, `registeredAt`, attendance, payment,
  sorting, or composed registry fields were returned.
- Narrow source-boundary inspection of `getRegistryFacts` and its registry
  helpers passed with no `resolveActor`, `getAccountEmail`, `identityAccess`,
  `accounts`, `fullName`, `registeredAt`, or returned `role` references. The
  membership query selects only `center_memberships`.

### Role, scope, denials, and non-mutation

- Admin received only own-center institution, memberships, parent links,
  assignments, classes, counts, and account IDs; the other Admin received only
  the other center.
- Teacher received only the currently assigned class and related structural
  accounts; empty/unassigned class rows and other-center rows were excluded.
- Student, Parent, anonymous/null actor, invalid/revoked actor, and unassigned
  Teacher returned `null` without unrelated rows. After assignment removal,
  the next Teacher query returned `null`.
- Snapshots of centers, accounts, sessions, memberships, classes,
  class-student links, assignments, parent links, schedules, and lessons were
  equal before and after the provider query matrix. The assignment removal was
  performed separately as the intentional authorization-state transition; the
  subsequent denied read also preserved the snapshot.
- Each probe used disposable in-memory state, closed it in `afterEach`, and
  used no network, credentials, production database, or `study-calendar.db`.

## Repeated checks and gates

The focused provider test and every required task gate were independently
repeated:

- `npm run test -- tests/center-scheduling/ft-007-registry-facts.test.ts` —
  PASS, 1 file / 1 test.
- `npm run check` — PASS, 0 errors / 0 warnings.
- `npm run test` — PASS, 60 files / 190 tests.
- `npm run build` — PASS; adapter-auto environment note was informational.
- `git diff --check` — PASS.
- `node scripts/mb-lint.mjs` — PASS, 74 files; existing advisory metadata
  warnings only.
- `node scripts/mb-doctor.mjs --strict` — PASS, 0 errors / 0 warnings / 2 info.

Repetition was necessary because T3 executor GREEN and executor gates are
supporting evidence, not independent verification proof. The current shared
worktree contains unrelated W27/W28 dirty paths; they were preserved and not
treated as TASK-095 changes.

## Co-review adjudication

- Fresh `Codex Luna` `xhigh` Focus A (provider boundary/ownership): no
  evidence-backed candidate finding.
- Fresh `Codex Luna` `xhigh` Focus B (privacy/runtime proof): no
  evidence-backed candidate finding.
- The caller independently reproduced and mapped both focuses to the complete
  AC-009 claim set; co-review agreement was supporting input, not a vote.

## Findings

None. The corrected server-resolved actor boundary, exact C&S-owned fields,
role/scope denials, no-neighbor behavior, no `accounts` read/join,
non-mutation, isolation, and all required gates are independently evidenced.

## Handoff

- Task remains `in_progress`; no lifecycle or scheduler transition was made.
- T3 next owner after functional success: `/red-verify TASK-095-T3-FT-007-W28`.
- `/red-verify`, `/mb-sync`, `/debug`, and lifecycle transitions were not run.

VERDICT: PASS
