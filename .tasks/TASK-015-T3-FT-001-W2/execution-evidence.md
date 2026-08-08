---
description: Executor RED/GREEN and gate evidence for TASK-015-T3-FT-001-W2.
status: active
---
# Execution Evidence — TASK-015-T3-FT-001-W2

## Attempt 1 — current

### Claim-linked RED
- Claims: `FT-001-AC-005` and `FT-001-AC-003`.
- Command: `npm run test -- tests/identity-access/provisioning.test.ts`
- Basis: pre-change source with `IdentityAccessBoundary.createAccount`, `issueInvitation`, no `CenterSchedulingBoundary.provisionAccount`.
- Result: 3 focused tests failed for the real boundary defects before production implementation.

### Claim-equivalent GREEN
- Command: `npm run test -- tests/identity-access/provisioning.test.ts`
- Result: 1 test file, 4 tests passed.
- Proof: unauthorized, cross-center, and caller-forged role/center attempts reject with unchanged state; own-center Admin commits one account and invitation; duplicate invitation rolls back; reused and expired binding rejects with unchanged snapshots; alternate write methods are absent.

### Required gates
- `npm run check` — exit 0; 0 errors / 0 warnings.
- `npm run build` — exit 0; bundle built; adapter-auto informational warning only.
- `npm run test` — exit 0; 2 files, 8 tests passed.
- `git diff --check` — exit 0; no whitespace errors.

## Boundary compliance
- Outcome files: `src/lib/server/modules/center-scheduling/public.ts`, `src/lib/server/modules/identity-access/public.ts`, `tests/identity-access/provisioning.test.ts`, and fixture-only `tests/foundation/index.test.ts` adjustment required to remove deleted bypass calls.
- Workflow artifacts: `.memory-bank/tasks/TASK-015-T3-FT-001-W2.task.json`, `.protocols/TASK-015-T3-FT-001-W2/*`, this evidence directory.
- Forbidden TASK-001/TASK-002/TASK-003 records and lifecycle/history were not touched.
- Ownership preserved: Center & Scheduling authorizes; Identity & Access atomically writes account/invitation; no second command or architecture boundary.
- Isolation: in-memory SQLite per test, cleanup after each test, no credentials/network/production DB.

## Handoff
- `/verify TASK-015-T3-FT-001-W2`, then `/red-verify TASK-015-T3-FT-001-W2` after functional PASS.
- Lifecycle remains `in_progress`; `/exe` did not close or promote it.

## Independent functional verification
- `.protocols/TASK-015-T3-FT-001-W2/verification.md` records fresh verifier-owned probes and `VERDICT: PASS`.
