---
description: Claim-equivalent Attempt 1 GREEN evidence for TASK-102-T3-FT-004-W35.
status: supporting-only
---
# TASK-102 Attempt 1 — claim-linked GREEN

- claim: `FT-004-AC-005 / REQ-006 / REQ-007 / REQ-008 / REQ-014`, including
  `#server-composed-projection` and `#authorized-mutation-transport`.
- RED basis: `.tasks/TASK-102-T3-FT-004-W35/attempt-1-red.md`; before the
  production change the route exported only `actions.default`, the existing
  forms used the default transport, and the bounded browser projection was
  absent.
- structural GREEN: `./node_modules/.bin/vitest run
  tests/routes/task-102-lesson-context-transport.test.ts` — exit `0`, 1 file /
  4 tests passed.
- isolated route/module GREEN: `./node_modules/.bin/vitest run
  tests/routes/task-102-lesson-context-transport.integration.test.ts` — exit
  `0`, 1 file / 3 tests passed. It proves bounded participant labels, shared /
  personal projection isolation, field comments and reactions, common feed and
  branch projection, all five named Collaboration mutations, forged/no-cookie/
  invalid-session/cross-scope/cross-center/role/revoked-assignment/revoked-
  session denials before mutation, and retained data after membership removal.
- focused regression GREEN: the named-action migration regression command —
  exit `0`, 10 files / 25 tests passed; no `lessonContextActions.default`
  calls remain in `tests/`.
- disposable browser GREEN: `node scripts/run-disposable-e2e.mjs --database
  tmp/ft-004-collaboration-transport.db --spec
  e2e/ft-004-collaboration-transport.spec.ts` — exit `0`, 1/1 Playwright test
  passed. The scenario covers shared and permitted personal loads, named form
  targets, four browser Collaboration mutations, reload-visible route
  success, no-cookie/invalid/revoked-session denial, cross-center denial,
  forged personal mutation, and unchanged Collaboration counts. The runner
  removed exactly the disposable database and `-wal`, `-shm`, and `-journal`
  siblings; all four paths were absent after completion.
- probe rationale: focused tests use in-memory SQLite; browser proof uses only
  the task-declared disposable `tmp/*.db` path. TASK-103 owns Collaboration UI
  controls, so this task verifies the server-rendered route transport and
  public boundary rather than adding UI controls.

This is executor evidence, not the independent `/verify` verdict. The
independent verification file remains `.protocols/TASK-102-T3-FT-004-W35/verification.md`.
