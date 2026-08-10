# Execution Evidence — TASK-017-T3-FT-004-W6

## Attempt 1 — claim mapping

- task: `TASK-017-T3-FT-004-W6`
- tier: `T3`
- attempt: `1`
- applicability: applicable
- claims: `FT-004-AC-003`, `FT-004-AC-004`, and `REQ-014` /
  `.memory-bank/contracts/access-control.md#authority-and-scope` for threaded
  discussion reads, targets, and mutations.
- pre-implementation result: accepted pre-GREEN on the current source.
- production implementation: none; no production change was justified or
  invented after the isolated probe was already green.

## Claim-linked RED / GREEN

The initial task-scoped probe was run against the pre-implementation source
after the task was durably transitioned to `in_progress`. A claim-specific RED
was not manufactured: the current source already satisfied the smallest
credible probe. The root Vitest invocation did not discover hidden `.tasks`
files; that was a test-discovery setup issue, not a claim failure, and the
task-local config was used for the actual probe.

### Attempt 1 — accepted pre-implementation GREEN: lifecycle harm path

- claim: `REQ-014` authority/scope; `FT-004-AC-003` and `FT-004-AC-004` center
  identity-reuse isolation.
- command: `node_modules/.bin/vitest run --config .tasks/TASK-017-T3-FT-004-W6/vitest.config.ts --reporter=verbose`
- cwd: `/home/serg/Projects/study_calendar`
- exit_code: `0`
- input_state_basis: repository `697f44b4b4ac6fa9f8e6e094de7844c4e95bfcbd`;
  current Collaboration source and database schema; task-owned probe and
  task-local config; broad pre-existing user-owned Memory Bank, TASK-016,
  review, protocol, and papercut deviations listed in `context.md`; no source
  changes in `src/lib/server/` or `tests/collaboration/`.
- completed_at: `2026-08-10 00:21:48 +05` (Vitest output start `00:21:48`)
- evidence: `.tasks/TASK-017-T3-FT-004-W6/threaded-discussion-isolation.probe.test.ts`
  — 1 file, 2 tests passed.
- observed proof: retained center-A shared/personal messages and message
  reaction rows remained in the database; replacement center projections were
  empty; old branch reads, message-reaction reads/targets, and reply mutation
  were denied; replacement-center shared/personal messages and message
  reaction remained usable.

### Attempt 1 — accepted pre-implementation GREEN: behavior preservation

- claim: `FT-004-AC-003` arbitrary depth/common feed/first-reply activation and
  `FT-004-AC-004` ten-tab ordering/retention/reactivation.
- command: `node_modules/.bin/vitest run tests/collaboration/threaded-discussions.test.ts --reporter=verbose`
- cwd: `/home/serg/Projects/study_calendar`
- exit_code: `0`
- input_state_basis: same repository revision and relevant source basis as the
  lifecycle probe; no production file changes; existing collaboration test
  surface unchanged.
- completed_at: `2026-08-10 00:21:25 +05` (Vitest output start `00:21:25`)
- evidence: `tests/collaboration/threaded-discussions.test.ts` — 1 file, 2
  tests passed.
- observed proof: arbitrary nested replies through depth 24, first-reply tab
  activation, complete shared common feed with personal separation, eleven
  branches projected as ten recent tabs, hidden branch retained, and new
  activity reactivated the hidden branch.

## Scope and ownership

- actual production files changed: none
- actual task-owned evidence/protocol files changed: task card status,
  `.protocols/TASK-017-T3-FT-004-W6/*`, and
  `.tasks/TASK-017-T3-FT-004-W6/*`
- advisory `touched_files` deviation: no production deviation; the card's
  source hints were inspected but did not need changes because pre-GREEN held.
- hard allowed-write boundary: not set
- forbidden scope touched: no; TASK-012 and TASK-016 were not edited
- boundary followed: Collaboration remains sole writer/public boundary;
  actor plus server-resolved center/class/student scope is preserved; shared
  database retains rows; no consumer or architecture change was made.

## Gate receipts

Required `check`, `build`, and `test` receipts are now recorded below.
`git diff --check` is an additional cheap changed-file gate. No current
receipt is offered for `/verify` reuse: broad workspace deviations keep these
executor receipts supporting-only.

## Attempt 1 — required gate receipts

For each receipt below, the declared input snapshot was captured immediately
before the command. All four snapshots had the same relevant basis:

- repository revision: `697f44b4b4ac6fa9f8e6e094de7844c4e95bfcbd`
- staged changes: none; deleted changes: none
- tracked unstaged changes: pre-existing user-owned changes in
  `.memory-bank/changelog.md`, `.memory-bank/features/FT-004-day-collaboration.md`,
  `.memory-bank/tasks/TASK-014-T3-FT-003-W8.task.json`,
  `.memory-bank/tasks/index.json`, `.memory-bank/tasks/plans/IMPL-FT-003.md`,
  `.memory-bank/tasks/plans/IMPL-FT-004.md`,
  `.protocols/AUTONOMOUS-RUN/status.md`, `.protocols/FT-004/decision-log.md`,
  `.protocols/FT-004/plan.md`, and
  `.tasks/TASK-MB-REVIEW-TASKS-PLAN/REQUEST.md`
- relevant untracked changes: TASK-016 artifacts, the TASK-017 task card,
  TASK-017 protocol/evidence files, review artifacts, and the existing
  `PAPERCUTS/GPT-5 __ 08-09-2026 23.47.md`; no `src/lib/server/` or
  `tests/collaboration/` source/test changes
- generated/runtime basis: local `node_modules` and SvelteKit/Vite toolchain;
  `.svelte-kit` output remained generated/ignored and was not claimed

### `check`

- attempt: `1`; receipt_status: `supporting-only`
- claim: required card gate for task-scoped type/check correctness
- command: `npm run check`
- cwd: `/home/serg/Projects/study_calendar`
- exit_code: `0`
- completed_at: `2026-08-10 00:23:52 +05`
- evidence: `svelte-check found 0 errors and 0 warnings`

### `build`

- attempt: `1`; receipt_status: `supporting-only`
- claim: required card gate for build correctness of current source
- command: `npm run build`
- cwd: `/home/serg/Projects/study_calendar`
- exit_code: `0`
- completed_at: `2026-08-10 00:23:57 +05`
- evidence: Vite client and SSR builds completed successfully. The existing
  adapter-auto environment notice was non-fatal and did not change task scope.

### `test`

- attempt: `1`; receipt_status: `supporting-only`
- claim: required card project regression gate for the selected outcome
- command: `npm run test`
- cwd: `/home/serg/Projects/study_calendar`
- exit_code: `0`
- completed_at: `2026-08-10 00:24:00 +05`
- evidence: `12` test files passed; `39` tests passed

### `git diff --check`

- attempt: `1`; receipt_status: `supporting-only`
- claim: changed-file whitespace integrity for this handoff
- command: `git diff --check`
- cwd: `/home/serg/Projects/study_calendar`
- exit_code: `0`
- completed_at: `2026-08-10 00:24:00 +05`
- evidence: no output; command passed

## Final actual change surface

- production source changed: none
- task card: `.memory-bank/tasks/TASK-017-T3-FT-004-W6.task.json` status
  `ready -> in_progress`
- protocol: `.protocols/TASK-017-T3-FT-004-W6/{context,plan,progress,verification,handoff}.md`
- evidence: `.tasks/TASK-017-T3-FT-004-W6/{execution-evidence.md,threaded-discussion-isolation.probe.test.ts,vitest.config.ts}`
- current task status: `in_progress`
- forbidden scope: untouched, including TASK-012 and TASK-016
- evidence hashes at checkpoint:
  - `execution-evidence.md`: `b2c870398391be63d41159de5d5807da3285bca43beb098ad2c17ef0db77012e`
  - `threaded-discussion-isolation.probe.test.ts`:
    `2cf4e01a8db5e72bc2909549966ba04a8299c6a5b69d678f5dd8118388c24cdf`
  - `vitest.config.ts`:
    `8bb8fe8d5a29ace62c0da50e96d86e2ae0d4bb6bd9e09140d5c73cbfa3e30771`

No executor receipt is proposed as a `/verify` reuse candidate: the broad
workspace has unrelated dirty/untracked inputs, and executor evidence is
self-attested supporting evidence only.
