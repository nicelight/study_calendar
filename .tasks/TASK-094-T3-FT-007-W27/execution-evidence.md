# Execution evidence — TASK-094-T3-FT-007-W27

## Execution identity

- role: Implementer
- task: `TASK-094-T3-FT-007-W27`
- tier: `T3`
- attempt: `1`
- lifecycle at handoff: `in_progress`
- source revision before final focused GREEN: `fd867181985b28fc3b1bba661e50cddbbfb38e7d`

## Outcome implemented

- Added an Identity & Access-owned `account_profiles` schema with required
  trimmed `full_name` and server-generated `registered_at`; no migration,
  backfill, fallback, or legacy-account compatibility was added.
- Required surname/given-name input now crosses bootstrap, invitation, direct
  password, C&S, Admin route/API/page, and CLI seams.
- Account, profile, credential/invitation, membership, and parent-link writes
  remain inside the existing transaction owners.
- Added exact `getCurrentActorProfile` and `getStatisticsProfiles` projections;
  revoked sessions return no current-actor profile and existing unnamed
  accounts remain outside the target population.

## Actual task change surface

Production:

- `src/lib/server/platform/database.ts`
- `src/lib/server/modules/identity-access/internal.ts`
- `src/lib/server/modules/identity-access/public.ts`
- `src/lib/server/modules/center-scheduling/public.ts`
- `scripts/bootstrap-admin.mjs`
- `src/routes/admin/provisioning.server.ts`
- `src/routes/admin/center-dashboard.server.ts`
- `src/routes/admin/participants-page.server.ts`
- `src/routes/admin/participants-api.server.ts`
- `src/routes/admin/[centerId]/+page.svelte`
- `src/routes/admin/[centerId]/participants/+page.svelte`

Tests:

- `tests/identity-access/ft-007-account-profile.test.ts`
- `tests/identity-access/bootstrap-admin.test.ts`
- `tests/identity-access/password-login.test.ts`
- `tests/identity-access/provisioning.test.ts`
- `tests/center-scheduling/membership-class-mode.test.ts`
- `tests/routes/admin-provisioning.test.ts`
- `tests/routes/admin-center-management.test.ts`
- `tests/routes/login-password.test.ts`
- `tests/scripts/bootstrap-admin.test.ts`

Advisory `touched_files` entries not needed: `src/lib/server/composition-root.ts`,
`src/routes/admin/[centerId]/+page.server.ts`, and
`src/routes/admin/[centerId]/participants/+page.server.ts`; composition wiring
already passed the existing boundary and the route seams were covered by the
listed Admin transport files. The focused test and all updated fixtures are
inside the declared hard boundary.

## Hard boundary and ownership evidence

- Every task outcome file above is inside `runtime_context.write_boundary`.
- `forbidden_scope` was not touched; `study-calendar.db` was not opened or
  modified by the focused probe.
- Profile persistence/query ownership stays in Identity & Access.
- C&S and Admin/CLI seams only validate/forward required profile input and keep
  their existing authorization/transaction orchestration.
- No new graph edge, public owner, authorization source, or profile mutation
  path was introduced.

## Claim-linked RED / GREEN

- Claim: `FT-007-AC-008 / REQ-014 / REQ-017`.
- RED: `.tasks/TASK-094-T3-FT-007-W27/attempt-1-red.md` — the original focused
  probe showed bootstrap accepted incomplete profile input.
- GREEN: `.tasks/TASK-094-T3-FT-007-W27/attempt-1-green.md` — the expanded same
  probe passed 1 file / 4 tests covering all three creation paths, exact
  projections, immutable timestamp, revoked denial, invalid/duplicate/forced
  rollback, C&S direct-password propagation, and no-legacy behavior.
- Probe changes: the initial incomplete-input assertions were retained and
  expanded with the accepted all-path matrix; no production behavior was hidden
  or weakened to obtain GREEN.
- Isolation: per-test `:memory:` databases, deterministic bootstrap clock where
  needed, no network/external service, and afterEach database cleanup.

## Required gates

| Gate | Exact command | Result | Evidence |
|---|---|---|---|
| focused claim probe | `npx vitest run tests/identity-access/ft-007-account-profile.test.ts` | 1 file / 4 tests passed | `attempt-1-green.md` |
| check | `npm run check` | 0 errors / 0 warnings | command output, current attempt |
| test | `npm run test` | 57 files / 181 tests passed | command output, current attempt |
| build | `npm run build` | production build completed | command output, current attempt |
| diff | `git diff --check` | clean | command exit 0 |
| mb-lint | `node scripts/mb-lint.mjs` | passed, 74 files | pre-existing advisory warnings only |
| strict-doctor | `node scripts/mb-doctor.mjs --strict` | PASS, 0 errors / 0 warnings | command output, current attempt |

## Handoff state

- `/exe` has not run `/verify`, `/red-verify`, `/mb-sync`, or any scheduler
  lifecycle decision.
- Current task record is `in_progress`; T3 closure remains with fresh
  `/verify` and the lifecycle owner.
- Recommended next action: `/verify TASK-094-T3-FT-007-W27` in a fresh Reviewer
  context, using this evidence and the task-linked normative specs.
