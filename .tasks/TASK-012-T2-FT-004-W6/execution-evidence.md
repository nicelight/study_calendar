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
