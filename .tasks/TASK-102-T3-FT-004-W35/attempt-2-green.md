---
description: Claim-equivalent Attempt 2 GREEN evidence for TASK-102-T3-FT-004-W35.
status: supporting-only
---
# TASK-102 Attempt 2 — claim-linked GREEN

- attempt: `2`
- retry claim: `FT-004-AC-005 / REQ-006 / REQ-007 / REQ-008 / REQ-014`, with
  FAIL-01 native named-form URL preservation and FAIL-02 supported field/target
  validation.
- RED basis: `.tasks/TASK-102-T3-FT-004-W35/attempt-2-red.md` and the fresh
  independent verifier FAIL report. Attempt 1 RED/GREEN/report remain
  supporting-only and were not reconstructed.
- focused correction GREEN: `./node_modules/.bin/vitest run
  tests/routes/task-102-lesson-context-transport.test.ts
  tests/routes/task-102-lesson-context-transport.integration.test.ts` — exit
  `0`, 2 files / 7 tests passed. It proves generated native action URLs retain
  `classId`/`lessonId`, and invalid comment fields/field reaction targets fail
  with unchanged state.
- owner-boundary GREEN: `./node_modules/.bin/vitest run
  tests/collaboration/comments-reactions.test.ts
  tests/routes/task-102-lesson-context-transport.test.ts
  tests/routes/task-102-lesson-context-transport.integration.test.ts` — exit
  `0`, 3 files / 11 tests passed, including direct Collaboration
  `invalid-field-key` fail-before-write assertions.
- browser GREEN: `node scripts/run-disposable-e2e.mjs --database
  tmp/ft-004-collaboration-transport.db --spec
  e2e/ft-004-collaboration-transport.spec.ts` — exit `0`, 1/1 Playwright test
  passed. It clicks a native generated `createHomework` form and verifies the
  route selectors survive, then covers the existing browser transport,
  Collaboration mutations, reload, no-cookie/invalid/revoked-session,
  cross-center and forged-scope denials. The exact disposable DB and
  `-wal`/`-shm`/`-journal` sidecars were absent after runner cleanup.
- required gates: `npm run check` exit `0` with 0 errors/0 warnings;
  `npm run build` exit `0`; `npm test` exit `0` with 78 files / 268 tests;
  `git diff --check` exit `0`; `node .memory-bank/scripts/mb-lint.mjs` exit
  `0` with 9 unrelated advisory metadata warnings; and strict doctor exit `0`
  with 0 errors, 0 warnings, 2 info.

Attempt 2 remains executor evidence only. Fresh independent `/verify` must
assess the corrected task; no executor result is offered for reuse because the
shared worktree remains dirty and runtime-sensitive.
