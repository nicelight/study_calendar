---
description: Execution progress for TASK-015-T3-FT-001-W2.
status: active
---
# Progress — TASK-015-T3-FT-001-W2

## Current status
- state: implementing
- last update: 2026-08-08

## Claim-linked RED / GREEN
- attempt: 1
- applicability: applicable
- accepted claims: FT-001-AC-005, FT-001-AC-003
- RED: `npm run test -- tests/identity-access/provisioning.test.ts` before production change: 3 failures — public `createAccount`/`issueInvitation` existed and `provisionAccount` was absent.
- GREEN: same focused probe after repair: 1 file, 4 tests passed; unauthorized/forged scope state unchanged, own-center Admin committed account+invitation, duplicate invitation rolled back account, reuse/expired binding preserved state.
- T3 isolation: in-memory SQLite per test with `afterEach` close; no credentials, network, or production DB.

## Changes
- `src/lib/server/modules/center-scheduling/public.ts`: server actor plus own-center Admin authorization before Identity & Access.
- `src/lib/server/modules/identity-access/public.ts`: one atomic account-plus-invitation write.
- `tests/identity-access/provisioning.test.ts`: adversarial authorization, surface, commit, rollback, reuse, expired, and snapshot probes.
- `tests/foundation/index.test.ts`: disposable fixture setup no longer calls removed bypass methods.

## Commands run
- `npm run test -- tests/identity-access/provisioning.test.ts` → RED (pre-change), then GREEN (4/4).
- `npm run check` → OK, 0 errors / 0 warnings.
- `npm run build` → OK; adapter-auto informational warning only.
- `npm run test` → OK, 2 files / 8 tests passed.
- `git diff --check` → OK, no whitespace errors.

## Evidence links
- `.tasks/TASK-015-T3-FT-001-W2/`

## Next step
- `/verify TASK-015-T3-FT-001-W2`, then `/red-verify TASK-015-T3-FT-001-W2`; do not close lifecycle from `/exe`.
