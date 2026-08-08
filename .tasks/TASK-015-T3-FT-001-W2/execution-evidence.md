---
description: Executor RED/GREEN and gate evidence for TASK-015-T3-FT-001-W2.
status: active
---
# Execution Evidence — TASK-015-T3-FT-001-W2

## Attempt 1 — supporting-only after retry

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

## Attempt 2 — current retry

### Retry basis and boundary correction
- Fresh independent T3 red-verify found HIGH direct public bypass: `CompositionRoot.identityAccess.provisionAccount` was callable and wrote account plus invitation without Center & Scheduling actor/own-center Admin authorization.
- Required correction: keep the authorized Center & Scheduling path as the only composition-root provisioning path; make the Identity & Access write internal and absent from `root.identityAccess`.
- No new capability, alternate API, caller-trusted scope, architecture boundary, task, or lifecycle mutation is authorized.

### Claim-linked RED
- Claims: `FT-001-AC-005` and the public-surface portion of `FT-001-AC-005`.
- Command: `npm run test -- tests/identity-access/provisioning.test.ts`
- Result: RED; 1 of 5 tests failed. The new direct public-surface probe observed callable `root.identityAccess.provisionAccount` and it did not reject; the other 4 focused tests passed.
- Evidence: fresh retry output from the task-scoped command; no production change existed before this probe.

### Claim-equivalent GREEN
- Focused retry command: `npm run test -- tests/identity-access/provisioning.test.ts` — exit 0; 1 file / 5 tests passed.
- Required task gates: `npm run check` — exit 0 with 0 errors/0 warnings; `npm run build` — exit 0 with existing adapter-auto informational warning; `npm run test` — exit 0 with 2 files / 9 tests passed.
- `git diff --check` — exit 0 with no whitespace errors.

### Current-attempt evidence and boundary compliance
- Actual task-owned files changed: `src/lib/server/composition-root.ts`, `src/lib/server/modules/center-scheduling/public.ts`, `src/lib/server/modules/identity-access/public.ts`, `src/lib/server/modules/identity-access/internal.ts`, `tests/identity-access/provisioning.test.ts`, and retry protocol/evidence files under `.protocols/TASK-015-T3-FT-001-W2/` and `.tasks/TASK-015-T3-FT-001-W2/`.
- `tests/foundation/index.test.ts` was not changed in this retry; its existing fixture remains green.
- Hard scope: no forbidden task records or histories were touched; TASK-003 failed history/Foundation/other features remain unchanged.
- Boundary: Center & Scheduling remains the only composition-root provisioning path and resolves actor plus own-center Admin before calling its internal Identity & Access writer. Identity & Access remains the sole account/invitation write owner. No caller-trusted scope or alternate public capability was added.
- Exact current-attempt evidence: this section and `.protocols/TASK-015-T3-FT-001-W2/progress.md` retry attempt 2. No execute receipt is offered for reuse as independent verification evidence.

## Handoff
- Execution status: retry GREEN; task lifecycle remains `in_progress`.
- Required next owner: `/verify TASK-015-T3-FT-001-W2`, followed by the required T3 `/red-verify TASK-015-T3-FT-001-W2`.
- `/exe` did not run verification, semantic verification, lifecycle closure, promotion, or synchronization.
