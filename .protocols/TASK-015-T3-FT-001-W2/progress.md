---
description: Execution progress for TASK-015-T3-FT-001-W2.
status: active
---
# Progress — TASK-015-T3-FT-001-W2

## Current status
- state: retrying
- last update: 2026-08-08

## Claim-linked RED / GREEN
- attempt: 1
- applicability: applicable
- accepted claims: FT-001-AC-005, FT-001-AC-003
- RED: `npm run test -- tests/identity-access/provisioning.test.ts` before production change: 3 failures — public `createAccount`/`issueInvitation` existed and `provisionAccount` was absent.
- GREEN: same focused probe after repair: 1 file, 4 tests passed; unauthorized/forged scope state unchanged, own-center Admin committed account+invitation, duplicate invitation rolled back account, reuse/expired binding preserved state.
- T3 isolation: in-memory SQLite per test with `afterEach` close; no credentials, network, or production DB.

### Retry attempt 2
- applicability: applicable
- accepted claim locator(s): FT-001-AC-003, FT-001-AC-005
- accepted not-applicable reason and alternative proof: none
- correction basis: fresh red-verify HIGH finding that `CompositionRoot.identityAccess.provisionAccount` directly writes account and invitation without actor/center/Admin authorization.
- prior attempt receipt status: supporting-only; it did not exercise the direct provider surface.
- RED: `npm run test -- tests/identity-access/provisioning.test.ts` before production correction: 1 failure in the new direct public-surface probe; `root.identityAccess.provisionAccount` was callable and did not reject. The other 4 focused tests passed.
- RED observation and evidence: 1 of 5 focused tests failed because the direct public-surface probe observed callable `root.identityAccess.provisionAccount` without rejection; current retry artifact: `.tasks/TASK-015-T3-FT-001-W2/TASK-015-T3-FT-001-W2-S-EXE-RETRY-final-report-docs-02.md#commands-and-evidence`; detailed evidence: `.tasks/TASK-015-T3-FT-001-W2/execution-evidence.md#claim-linked-red`.
- GREEN: `npm run test -- tests/identity-access/provisioning.test.ts` after correction: 1 file, 5 tests passed. Direct `root.identityAccess.provisionAccount` is unavailable and the state snapshot is unchanged; own-center Admin success and all existing atomicity/reuse/expiry cases remain green.
- GREEN observation and evidence: focused retry passed with 1 file and 5 tests; direct `root.identityAccess.provisionAccount` is unavailable and the state snapshot is unchanged, while existing authorization, atomicity, reuse, and expiry cases remain green; current retry artifact: `.tasks/TASK-015-T3-FT-001-W2/TASK-015-T3-FT-001-W2-S-EXE-RETRY-final-report-docs-02.md#commands-and-evidence`; detailed evidence: `.tasks/TASK-015-T3-FT-001-W2/execution-evidence.md#claim-equivalent-green`.
- probe change: add one focused assertion that the public composition root exposes no callable direct Identity & Access provisioning write and that the state snapshot remains unchanged.
- isolation: in-memory SQLite per test with `afterEach` close; no credentials, network, or production DB.

## Changes
- `src/lib/server/modules/center-scheduling/public.ts`: preserve server actor plus own-center Admin authorization while accepting an internal Identity & Access write port.
- `src/lib/server/modules/identity-access/internal.ts`: internal-only account-plus-invitation transaction writer used by composition wiring.
- `src/lib/server/modules/identity-access/public.ts`: remove `provisionAccount` from the public Identity & Access boundary.
- `src/lib/server/composition-root.ts`: wire the internal writer only into Center & Scheduling; public root identity surface has no provisioning write.
- `tests/identity-access/provisioning.test.ts`: add the direct public-surface adversarial probe with unchanged-state assertion; preserve existing authorization and atomicity probes.

## Commands run
- Retry RED: `npm run test -- tests/identity-access/provisioning.test.ts` → 1 failure / 5 tests; direct public bypass was callable and did not reject.
- Retry GREEN: `npm run test -- tests/identity-access/provisioning.test.ts` → 1 file / 5 tests passed.
- `npm run check` → OK, 0 errors / 0 warnings.
- `npm run build` → OK; adapter-auto informational warning only.
- `npm run test` → OK, 2 files / 9 tests passed.
- `git diff --check` → OK, no whitespace errors.

## Evidence links
- `.tasks/TASK-015-T3-FT-001-W2/`

## Next step
- `/verify TASK-015-T3-FT-001-W2`, then `/red-verify TASK-015-T3-FT-001-W2`; do not close lifecycle from `/exe`.
