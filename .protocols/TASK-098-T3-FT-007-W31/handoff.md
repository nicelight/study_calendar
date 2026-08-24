---
description: Executor handoff for TASK-098-T3-FT-007-W31.
status: active
---
# Handoff — TASK-098-T3-FT-007-W31

## Summary
- Added `/profile` as a server-owned read-only adapter over Identity & Access's existing current-actor query.
- Added task-owned focused and disposable browser proof for canonical route integration and Profile privacy/denial behavior.

## Where to look
- key files:
  - `src/routes/profile/+page.server.ts`
  - `src/routes/profile/+page.svelte`
  - `tests/routes/ft-007-profile-routes.test.ts`
  - `e2e/ft-007-profile-routes.spec.ts`
- advisory `touched_files` deviations and rationale: `src/routes/+layout.svelte` was inspected but unchanged because its canonical hrefs and logout form were already correct; workflow evidence/protocol files are skill-owned bookkeeping.
- hard write-boundary compliance: yes. Only the four task-owned code/probe paths and `tmp/ft-007-profile-routes.db` were used; no forbidden production path was modified. The disposable file was removed by the runner.

## How to run / verify
- gates:
  - `npm run check`
  - `npm run test`
  - `npm run build`
  - `node scripts/run-disposable-e2e.mjs --database tmp/ft-007-profile-routes.db --spec e2e/ft-007-profile-routes.spec.ts`
  - `git diff --check`
  - `node scripts/mb-lint.mjs`
  - `node scripts/mb-doctor.mjs --strict`
- claim-linked RED/GREEN evidence: attempt 1 in `.protocols/TASK-098-T3-FT-007-W31/progress.md#claim-linked-red--green-t2t3`, artifacts `.tasks/TASK-098-T3-FT-007-W31/attempt-1-red.md`, `.tasks/TASK-098-T3-FT-007-W31/attempt-1-green.md`, and `.tasks/TASK-098-T3-FT-007-W31/execution-evidence-attempt-1.md`.
- current Attempt 1 hydrated-shell browser evidence: `.tasks/TASK-098-T3-FT-007-W31/attempt-1-hydrated-shell-browser-evidence.md`. It observes all four exact hrefs and the existing `POST /auth/logout` form in the hydrated shell, exercises all menu links and the visible Logout submission, and proves final disposable cleanup plus unchanged real-DB metadata.
- current-attempt reuse candidate locators: none proposed.
- superseded/supporting-only receipt locators: none.

## Known issues
- The prior verifier-only runtime evidence gap is addressed by the current Attempt 1 browser artifact. No production defect or unresolved task-scoped branch was observed.

## Follow-ups
- Exact next route: `/verify TASK-098-T3-FT-007-W31`. Keep lifecycle `in_progress`; verifier and scheduler own all later closure steps.
