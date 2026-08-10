---
description: Claim-scoped execution evidence for TASK-012-T2-FT-004-W6.
status: active
---
# Execution Evidence — TASK-012-T2-FT-004-W6

## Attempt 1 — initial claim-specific RED

- claims: `FT-004-AC-003`, `FT-004-AC-004`
- command: `npm run test -- tests/collaboration/threaded-discussions.test.ts`
- cwd: `/home/serg/Projects/study_calendar`
- completed at: 2026-08-08T22:51:04+05:00
- result: exit code `1`; 1 test file loaded, 2 task probes failed.
- input basis: the current dependency-complete Collaboration source supported
  comments/reactions/scope but exposed no message/reply/common-feed/branch-tab
  operations, and the shared schema had no Collaboration message table. The
  focused test was the only W6 behavior change before this run; no production
  source had been changed for either claim.
- observations:
  - AC-003 reached the focused test body and failed at the absent
    `root.collaboration.createMessage` operation before any root/reply existed.
  - AC-004 independently reached its focused test body and failed at the same
    absent operation before any recent-tab or retention behavior existed.
- interpretation: both failures are honest claim-specific RED for the absent
  task-owned public behavior, not setup, syntax, unrelated, or artificial
  failures.
- concise output:

  ```text
  Test Files  1 failed (1)
  Tests       2 failed (2)
  TypeError: root.collaboration.createMessage is not a function
  ```

## Implementation evidence

- actual task-owned production files changed:
  - `src/lib/server/modules/collaboration/public.ts` — added retained root/reply
    commands, explicit parent/root projection, scoped common feed, branch
    message query, and recent ten-tab projection. Existing comment/reaction and
    scope behavior is preserved; message reactions now resolve through the
    same retained message surface.
  - `src/lib/server/platform/database.ts` — added the Collaboration-owned
    message table with parent/root relationships and lookup indexes in the
    existing shared schema owner. This is the necessary same-outcome deviation
    from advisory `touched_files`.
  - `tests/collaboration/threaded-discussions.test.ts` — added two focused,
    fresh in-memory integration probes for AC-003 and AC-004.
- workflow/evidence files created or updated:
  - `.protocols/TASK-012-T2-FT-004-W6/{context,plan,progress,verification,handoff}.md`
  - `.tasks/TASK-012-T2-FT-004-W6/execution-evidence.md`
  - `.tasks/TASK-012-T2-FT-004-W6/TASK-012-T2-FT-004-W6-S-EXE-final-report-code-01.md`
- task lifecycle: the scheduler-owned `ready -> in_progress` selection was
  already durable before Attempt 1; `/exe` did not alter final lifecycle state.
- boundary compliance: Collaboration remains the sole writer for messages,
  replies, activity, and projections. Authorization uses the existing Identity
  & Access actor and Center & Scheduling class/student scope boundaries. No
  consumer, route, composition-root, or neighbor-owned state was changed.
- retention/ordering tactic: every reply points to its direct parent and stable
  root; reply depth has no counter or cap. The common feed reads every message
  in the authorized discussion scope. Recent tabs are derived from retained
  message insertion activity, limited to ten, so hidden branches are not
  deleted and any new nested reply reactivates its root.
- hard-scope result: no non-empty `write_boundary`; neither forbidden
  Foundation task record was touched; the branch-retention stop condition did
  not fire and no tier escalation was needed.

## Attempt 1 — claim-equivalent GREEN

- command: `npm run test -- tests/collaboration/threaded-discussions.test.ts`
- cwd: `/home/serg/Projects/study_calendar`
- completed at: 2026-08-08T22:53:01+05:00
- result: exit code `0`; 1 focused file and 2 task tests passed without changing
  the RED probe.
- AC-003: a root had no tab before a reply, became the sole tab after its first
  reply, accepted a 24-level reply chain without a cap, returned all 25 branch
  messages with stable parent/root links, and kept all 26 shared messages in
  the common feed while excluding the personal-scope root. The personal query
  returned only its own scoped message.
- AC-004: eleven active roots projected exactly roots 11 through 2 as the ten
  most recent tabs; hidden root 1 remained publicly queryable with both
  messages. A new nested reply restored root 1 to the first tab, displaced root
  2, retained all three root-1 branch messages, and left all 23 scoped messages
  in the common feed.
- probe changes: none between RED and GREEN.
- isolation: each test created a fresh `:memory:` SQLite database and closed it
  in `afterEach`; no network, credentials, production data, destructive action,
  or other external side effect was used.

## Gate evidence

- `npm run check` → exit code `0`; `svelte-check found 0 errors and 0 warnings`.
- `npm run build` → exit code `0`; client and SSR production bundles built. The
  existing adapter-auto environment note was informational and non-failing.
- `npm run test` → exit code `0`; 11 files and 37 tests passed.
- `git diff --check` → exit code `0`; no output.
- No execute result is offered as a `/verify` reuse candidate because a
  compliant immediately bounded input-state receipt was not captured around
  the final commands. All executor results remain supporting-only.

## Attempt 2 — bounded correction RED

- retry: 1 of 2
- correction basis: current FT-004 feature-level `semantic-fail` in
  `.tasks/FT-004/FT-004-S-RED-VERIFY-final-report-docs-01.md`; Attempt 1
  functional `PASS`, executor RED/GREEN, and gates are supporting-only
  historical evidence and were not replayed.
- constrained claims: task-owned `FT-004-AC-003` and `FT-004-AC-004` under
  the accepted current-user scope constraint, with `FT-004-AC-005`, `REQ-014`,
  Access Control, and the Day Discussion Query Boundary supplying the admitted
  cross-center failed-gate basis.
- command: `npm run test -- tests/collaboration/center-lifecycle-isolation.test.ts`
- cwd: `/home/serg/Projects/study_calendar`
- completed at: 2026-08-08T23:18:37+05:00
- result: exit code `1`; 1 focused file loaded and 2/2 correction tests failed.
- input basis: the new focused test was the only Attempt 2 behavior change;
  `src/lib/server/modules/collaboration/public.ts` and
  `src/lib/server/platform/database.ts` still contained the exact source
  reviewed by the feature semantic-fail. No Attempt 2 production change or
  external side effect preceded this run.
- read observation: after supported center-A class deletion and center-B
  recreation of the same class/schedule/lesson identities,
  `getFieldComments` returned the retained center-A comment, body, author
  identity, and `centerId` instead of an empty center-B projection.
- mutation observation: with one server-resolved Admin account belonging to
  both centers, `editFieldComment` accepted and mutated the retained center-A
  comment through the replacement center lifecycle instead of rejecting it.
- interpretation: both failures are claim-specific RED for the admitted
  center/lifecycle isolation defect, not setup, syntax, artificial, or
  unrelated failures. The probe also contains post-correction assertions for
  reactions, root/reply messages, branch tabs, old-row preservation, and
  independent new-center writes.
- concise output:

  ```text
  Test Files  1 failed (1)
  Tests       2 failed (2)
  expected retained center-A comment projection to equal []
  expected editFieldComment to throw not-authorized
  ```

## Attempt 2 — claim-equivalent correction GREEN

- command: `npm run test -- tests/collaboration/center-lifecycle-isolation.test.ts`
- cwd: `/home/serg/Projects/study_calendar`
- completed at: 2026-08-08T23:20:04+05:00
- result: exit code `0`; 1 focused file and 2/2 correction tests passed without
  changing the RED probe.
- read isolation: after class/schedule/lesson identity reuse, center B receives
  no center-A comments, field reactions, root/reply messages, branch tab, or
  attributable identities; direct access to the retained old branch is denied.
- mutation isolation: the shared attributable author cannot edit the old
  center-A comment, reply to the old message branch, or react to the old
  comment through the center-B lifecycle. The retained comment and field
  reaction remain byte-for-byte behaviorally unchanged.
- new-lifecycle usability: the same authorized actor can create a distinct
  center-B comment on the same field, a distinct center-B field reaction, and
  a new root/reply branch; center-B reads project only those new rows and its
  own active branch tab.
- preservation: prior rows are retained rather than cascaded or deleted;
  message parent/root relationships and tab projection remain Collaboration-
  owned and no reply-depth or activity lifecycle was added.
- probe changes: none between RED and GREEN.
- isolation: each test uses a fresh `:memory:` SQLite composition root closed
  in `afterEach`; no network, credentials, persistent/production state, or
  destructive external action is involved.

## Attempt 2 — implementation and gate evidence

- actual production files changed:
  - `src/lib/server/modules/collaboration/public.ts` — added authorized
    `center_id` constraints to all affected comment, reaction, message, branch,
    and tab reads plus comment edit/target and reaction return paths. Existing
    reply and message-reaction target checks continue through the same
    center-bearing `messageBelongsToTarget` predicate.
  - `src/lib/server/platform/database.ts` — made comment owner-field and
    reaction actor uniqueness center-scoped and replaced the prior index
    definitions at bootstrap without deleting retained Collaboration data.
- focused correction file:
  `tests/collaboration/center-lifecycle-isolation.test.ts` — supported public
  class/schedule delete/recreate coverage for disclosure, attribution,
  mutation denial, old-row retention, independent new-center writes, and
  replacement-center branch/tab projection.
- focused original behavior command:
  `npm run test -- tests/collaboration/comments-reactions.test.ts tests/collaboration/threaded-discussions.test.ts tests/collaboration/center-lifecycle-isolation.test.ts`
  → exit `0`; 3 files and 7 tests passed.
- exact failed-gate replay command:
  `npm run test -- --config .tasks/FT-004/red-feature-vitest.config.ts` → exit
  `0`; the original feature adversarial probe passed 1/1 against corrected
  code. This is executor supporting evidence, not a new feature semantic
  verdict.
- `npm run check` → exit `0`; 0 errors and 0 warnings.
- `npm run build` → exit `0`; production client and SSR bundles built;
  adapter-auto note was informational.
- `npm run test` → exit `0`; 12 files and 39 tests passed.
- `git diff --check` → exit `0`.
- hard-scope result: no non-empty `write_boundary`; both forbidden Foundation
  task records are unchanged; no consumer, route, neighbor-owned business
  state, or accepted dependency edge changed.
- historical evidence: Attempt 1 executor report-01, functional PASS/report-01,
  and the current FT-004 feature semantic-fail/report-01 are preserved as
  correction basis. Attempt 2 did not rewrite their verdict markers.
- reuse candidate: none. Final executor checks are supporting-only because no
  compliant bounded-input receipt was captured immediately around them.
