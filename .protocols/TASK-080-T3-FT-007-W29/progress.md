---
description: Execution progress for TASK-080-T3-FT-007-W29.
status: active
---
# Progress — TASK-080-T3-FT-007-W29

## Current status
- state: executor_handoff
- attempt: 2
- last update: 2026-08-22 08:01 +0500

## What was done
- Resume preflight re-confirmed exact indexed identity, T3/FT-007/W29
  alignment, Planning Revision 2, current FT-007 `APPROVE`, strict-doctor
  PASS, done dependencies, direct contracts, hard/forbidden scopes, and
  dirty-worktree overlap.
- Attempt 1 is preserved as supporting-only historical evidence: it completed
  the pre-reconciliation route-only result and its semantic fail identified the
  bare Student/Parent over-denial.
- Attempt 2 was durably opened before its first prospective probe or
  production write. Its RED observed the absent C&S accessible-class query.
- Implemented the accepted C&S `getAccessibleClassList({ actor })` read query,
  which returns only server-resolved class identity, center, name, and mode
  facts for Student/Parent membership/link scope.
- Updated both route adapters so bare Student/Parent `/home` and `/classes`
  consume the complete C&S list. Existing Admin/Teacher registry destinations,
  canonical owners, read-only behavior, denial boundaries, and no-direct-table
  rules remain intact.
- Added isolated C&S provider proof, focused bare-route proof, and disposable
  browser proof. No forbidden module/route, real database, or AUTONOMOUS-RUN
  file was changed by Attempt 2.

## Commands run (with results)
- `npm run test -- tests/center-scheduling/ft-007-accessible-class-list.test.ts`
  → Attempt 2 RED exit `1` before production correction, then GREEN exit `0`,
  1 file / 1 test.
- `npm run test -- tests/routes/ft-007-home-classes.test.ts` → exit `0`,
  1 file / 13 tests.
- `npm run check` → exit `0`, 0 errors / 0 warnings.
- `npm run test` → exit `0`, 62 files / 204 tests.
- `npm run build` → exit `0`; existing adapter-auto deployment advisory only.
- `node scripts/run-disposable-e2e.mjs --database tmp/ft-007-home-classes.db --spec e2e/ft-007-home-classes.spec.ts`
  → exit `0`, Playwright 1/1; exact DB and all sidecars absent afterward.
- `git diff --check` → exit `0`.
- `node scripts/mb-lint.mjs` → exit `0`, 74 files; pre-existing advisory
  metadata warnings only.
- `node scripts/mb-doctor.mjs --strict` → exit `0`, 0 errors / 0 warnings / 2
  info.

## Claim-linked RED / GREEN (T2/T3)
- attempt: 2
- applicability: applicable
- accepted claim locator(s): `FT-007-AC-002 / REQ-014 / REQ-017` and the task verification target.
- accepted not-applicable reason and alternative proof: none.
- RED command/probe: `npm run test -- tests/center-scheduling/ft-007-accessible-class-list.test.ts`.
- RED observation and evidence: fixture setup passed, then exit `1` with
  `TypeError: api.getAccessibleClassList is not a function`; see
  `.tasks/TASK-080-T3-FT-007-W29/attempt-2-red.md`.
- GREEN command/probe: provider/route focused tests, owned disposable E2E,
  and all indexed native gates.
- GREEN observation and evidence: provider 1/1, route 13/13, browser 1/1,
  full test 62/204, check/build/diff/mb-lint/strict-doctor all passed; see
  `.tasks/TASK-080-T3-FT-007-W29/attempt-2-green.md` and
  `execution-evidence.md`.
- claim-equivalent probe changes and rationale: only reconciled bare-route and
  C&S list assertions were added/updated; historical Attempt 1 evidence was
  not backfilled or relabeled.
- T3 isolation/cleanup/permission evidence: provider/route tests used
  `:memory:`; browser proof used only `tmp/ft-007-home-classes.db`; exact DB,
  `-wal`, `-shm`, and `-journal` sidecars were absent after cleanup; forbidden
  scope and `study-calendar.db` were untouched.

## Reuse Candidates (optional)
- none proposed; the shared worktree contains unrelated dirty W27/W28 changes
  and runtime-sensitive inputs.

## Evidence links
- Historical supporting-only: `.tasks/TASK-080-T3-FT-007-W29/attempt-1-red.md`,
  `attempt-1-green.md`, prior execution evidence, functional PASS, and
  semantic-fail report.
- Current Attempt 2: `.tasks/TASK-080-T3-FT-007-W29/attempt-2-red.md`,
  `attempt-2-green.md`, `execution-evidence.md`, and this protocol.

## Open issues / risks
- No executor blocker or unresolved material branch. The previous
  `classId`-required assumption is explicitly superseded by the accepted C&S
  list query; any query parameter now filters only an already provider-
  authorized result.

## Next step (single concrete action)
- Fresh `/verify TASK-080-T3-FT-007-W29`; after functional PASS, required
  per-task T3 `/red-verify TASK-080-T3-FT-007-W29`.
