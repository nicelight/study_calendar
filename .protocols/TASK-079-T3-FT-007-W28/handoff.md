---
description: Executor handoff for TASK-079-T3-FT-007-W28.
status: active
---
# Handoff — TASK-079-T3-FT-007-W28

## Summary

Attempt 3 is the Judge-authorized final bounded retry. Its correction is
limited to Playwright spec selection and the minimum selection regression
proof; no source implementation, logout/session owner, ordinary real-database
smoke, or forbidden scope is authorized to change.

Attempt 3 completed with claim-equivalent GREEN: ordinary selection is exactly
the two existing real-database specs, disposable explicit selection is exactly
the task spec, and the owned browser run remains 1/1 with all-four cleanup and
unchanged real-database fingerprint. All executor gates pass. The task remains
`in_progress` for fresh independent verification.

## Where to look

- key files: `src/routes/+layout.server.ts`, `src/routes/+layout.svelte`,
  `playwright.config.ts`, `scripts/run-disposable-e2e.mjs`,
  `tests/scripts/run-disposable-e2e.test.ts`.
- advisory `touched_files` deviations and rationale: none; all task outcome
  files match the advisory list.
- hard write-boundary compliance: yes; transient exact `tmp/ft-007-navigation.db`
  was created and removed.

### Attempt 3 correction surface

- `playwright.config.ts`: ordinary `testMatch` contains only
  `real-database-payment.spec.ts` and `real-database-smoke.spec.ts`; disposable
  mode retains wildcard matching for the explicit task spec.
- `tests/scripts/run-disposable-e2e.test.ts`: exact ordinary/disposable list
  regression, plus existing runner cleanup assertions.
- No forbidden scope, `study-calendar.db`, ordinary smoke implementation, or
  logout/session owner changed.

## How to run / verify

- Attempt 3 current gates/evidence: exact ordinary selection is `2 tests in 2
  files` for `real-database-payment.spec.ts` and
  `real-database-smoke.spec.ts`; disposable explicit selection is `1 test in 1
  file` for `ft-007-navigation.spec.ts`; owned disposable E2E is `1/1`;
  success and forced-failure cleanup leave database, `-wal`, `-shm`, and
  `-journal` absent; the real DB fingerprint is unchanged at
  `size=356352`, `mtimeMs=1787353343584.7817`,
  `sha256=ae1f1b9d2b5f87fce77f5b7dea4a30b5635fe80e56080df461aff390246ec494`.
- Attempt 3 project gates: `npm run check`, `npm run test` (`59 files / 189
  tests`), `npm run build`, `git diff --check`, `node scripts/mb-lint.mjs`, and
  `node scripts/mb-doctor.mjs --strict` all pass; detailed current receipt is
  `.tasks/TASK-079-T3-FT-007-W28/attempt-3-green.md`.
- Attempt 2 gates: focused runner test (`1 file / 4 tests`), forced-failure
  cleanup probe (`result=1`, database and journal absent), `npm run check`,
  `npm run test` (`59 files / 188 tests`), `npm run build`, disposable E2E
  (`1/1`), `git diff --check`, `node scripts/mb-lint.mjs`, and
  `node scripts/mb-doctor.mjs --strict` — all passed.
- fresh isolation wrapper preserved the real database fingerprint and observed
  both the exact disposable database and `<database>-journal` absent after
  the owned browser run.
- claim-linked RED/GREEN evidence: Attempt 1 RED at
  `.tasks/TASK-079-T3-FT-007-W28/attempt-1-red.md`; GREEN at
  `.tasks/TASK-079-T3-FT-007-W28/attempt-1-green.md`; both are preserved
  supporting-only for the retry.
- current Attempt 2 RED: `.tasks/TASK-079-T3-FT-007-W28/attempt-2-red.md`.
- current Attempt 2 GREEN receipt: `.tasks/TASK-079-T3-FT-007-W28/attempt-2-green.md`.
- Attempt 3 RED: `.tasks/TASK-079-T3-FT-007-W28/attempt-3-red.md`.
- current Attempt 3 GREEN receipt: `.tasks/TASK-079-T3-FT-007-W28/attempt-3-green.md`.
- current-attempt reuse candidate: none proposed; the shared worktree has
  unrelated dirty/runtime-sensitive inputs.

## Known issues

- No executor blocking condition. Existing W27 dirty changes are unrelated
  and were preserved. Fresh independent `/verify` remains required; T3
  `/red-verify` is gated on functional PASS.

## Follow-ups

- Run `/verify TASK-079-T3-FT-007-W28`; do not run it from this execution.
- T3 semantic route is `/red-verify TASK-079-T3-FT-007-W28` after functional PASS.
