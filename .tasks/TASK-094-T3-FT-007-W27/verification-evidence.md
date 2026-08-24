# Independent verification evidence — TASK-094-T3-FT-007-W27

## Review scope

- Target: `TASK-094-T3-FT-007-W27` only, tier `T3`, feature outcome `FT-007-AC-008`.
- Task card preflight: one matching row in `.memory-bank/tasks/index.json`; ID,
  tier, wave, `reqs`, `depends_on`, gates, verify shape, write boundary, and
  forbidden scope are structurally valid. Lifecycle remained `in_progress`.
- Direct claim basis: `.memory-bank/contracts/access-control.md#profile-creation-and-query-obligation`,
  `.memory-bank/contracts/statistics-projection.md#participant-profile-metadata`,
  `.memory-bank/contracts/boundary-map.md#account-provisioning-boundary`,
  `.memory-bank/contracts/boundary-map.md#actor-context-boundary`,
  `.memory-bank/domains/core-domain.md#persistence-and-transaction-rules`,
  and `.memory-bank/features/FT-007-navigation-and-statistics.md#FT-007-AC-008`.

## Executor claim path (supporting only)

- Applicable claim: `FT-007-AC-008 / REQ-014 / REQ-017`.
- Honest RED: `.tasks/TASK-094-T3-FT-007-W27/attempt-1-red.md` records the
  pre-implementation bootstrap incomplete-name acceptance failure.
- GREEN: `.tasks/TASK-094-T3-FT-007-W27/attempt-1-green.md` records the expanded
  isolated matrix and its cleanup conditions.
- Executor evidence and `/exe` handoff were inspected at
  `.tasks/TASK-094-T3-FT-007-W27/execution-evidence.md` and
  `.protocols/TASK-094-T3-FT-007-W27/handoff.md`; neither was used as
  independent proof.

## Reused execute evidence

None. No execute receipt was accepted for reuse; all relevant gates and the
outcome probe were rerun by this Reviewer.

## New verifier-owned outcome probe

Command:

`npx vite-node --config vite.config.ts .tasks/TASK-094-T3-FT-007-W27/verifier-probe.ts`

Result: exit `0`, `VERIFIER_PROBE_PASS`.

The disposable probe independently covered the complete task claim:

- fixed server clock and trimmed profile values for first bootstrap Admin,
  invitation participant, direct-password student, and direct-password parent;
- exact current-actor and statistics projection keys/values, duplicate-ID
  de-duplication, missing-ID omission, revoked-session denial, and unchanged
  `registeredAt` after the clock advanced;
- invalid-name rejection before state change;
- invitation wrapper membership plus account/profile/invitation rollback after
  a forced profile-write failure;
- direct-password parent membership/link creation plus account/profile/
  credential/membership/parent-link rollback after a forced profile-write
  failure;
- duplicate-email rollback across the account/profile/credential boundary;
- an existing unnamed account remaining outside both profile queries;
- all state used `:memory:` databases, and both databases were closed at the
  end of the run.

## Repeated checks

The following fresh commands were run in the current worktree:

| Check | Result |
|---|---|
| `npx vitest run tests/identity-access/ft-007-account-profile.test.ts` | 1 file / 4 tests passed |
| `npx vitest run tests/identity-access/bootstrap-admin.test.ts tests/identity-access/provisioning.test.ts tests/routes/admin-provisioning.test.ts tests/routes/admin-center-management.test.ts tests/scripts/bootstrap-admin.test.ts` | 5 files / 29 tests passed |
| `npm run check` | 0 errors / 0 warnings |
| `npm run test` | 57 files / 181 tests passed |
| `npm run build` | production build completed |
| `git diff --check` | passed |
| `node scripts/mb-lint.mjs` | passed; only existing metadata warnings |
| `node scripts/mb-doctor.mjs --strict` | passed; 0 errors / 0 warnings |

The focused rerun and the targeted regression set were chosen because the task
is a profile schema/query change crossing Identity & Access, C&S, Admin, CLI,
and bootstrap seams. The complete project gates were rerun because the indexed
T3 card marks each as required.

## Architecture and hard-boundary evidence

- Profile schema, writes, and both public projections remain in Identity &
  Access. C&S, Admin, and CLI only collect/forward profile input while retaining
  existing actor authorization and transaction orchestration.
- The accepted inter-module paths are used: `Center & Scheduling -> Identity &
  Access` through `Account Provisioning Boundary`, and the future statistics
  consumer is constrained to `Lesson Context -> Identity & Access` through
  `Actor Context Boundary`.
- Current changed production/test paths are all inside the task's literal
  `runtime_context.write_boundary`. The diff has no changes under
  `lesson-context`, `learning-progress`, `financial-ledger`, `routes/profile`,
  or `study-calendar.db`.
- A current source scan found `account_profiles` access only in the Identity &
  Access owner, database schema, and task test/probe artifacts. No new route,
  C&S consumer, composition route, or other slice reads the profile table.
- No migration/backfill/fallback/legacy compatibility path, authorization
  mutation, second profile source, or profile-field write path was observed.
  Existing unnamed seeded accounts remain query-ineligible as required.

## Independent adjudication

The functional co-review identified two evidence gaps in the executor-focused
matrix: explicit timestamp immutability for invitation/direct-password and full
wrapper rollback coverage. The verifier-owned probe above addressed both. The
architecture co-review found no candidate finding. No unresolved semantic
interpretation affected this functional verdict.

## Result

All task-owned claims, applicable contract rules, required gates, isolation
conditions, and hard-scope checks have fresh reproducible evidence.
