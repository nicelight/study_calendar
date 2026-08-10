---
description: Claim-scoped execution evidence for TASK-006-T2-FT-002-W4.
status: active
---
# Execution Evidence — TASK-006-T2-FT-002-W4

## Attempt 1 — initial claim-specific RED

- claims: `FT-002-AC-003`, `FT-002-AC-004`, `FT-002-AC-005`, `FT-002-AC-006`
- command: `npm run test -- tests/center-scheduling/recurring-scheduling.test.ts`
- cwd: `/home/serg/Projects/study_calendar`
- result: exit code `1`; 1 test file, 4 tests failed.
- input basis: pre-implementation source had no recurring schedule/lesson
  exception commands or queries in `CenterSchedulingBoundary`, and the
  composition root did not expose a `FinancialLedgerBoundary`; no production
  behavior for these claims had been changed before the probe.
- observations:
  - AC-003 failed at the missing `createRecurringSchedule` operation.
  - AC-004 failed at the missing composition-root Financial Ledger integration.
  - AC-005 failed at the missing recurring schedule operation needed to create
    a pre-assignment historical Lesson fixture.
  - AC-006 failed at the same missing owner-side recurring schedule operation
    needed to create the selected Lesson fixture.
- interpretation: this is an honest claim-specific RED for the absent task
  outcome, not setup/syntax/artificial failure.
- output excerpt:

  ```text
  Test Files  1 failed (1)
  Tests  4 failed (4)
  TypeError: scheduling(...).createRecurringSchedule is not a function
  TypeError: Cannot read properties of undefined (reading 'setClassPrice')
  ```

## Implementation evidence

- actual task-owned production files changed:
  - `src/lib/server/platform/database.ts` — added Center & Scheduling-owned
    `schedules` and `lessons` tables, indexes, lifecycle/status and attribution
    persistence. This is the shared schema owner and same-outcome deviation
    from advisory `touched_files`.
  - `src/lib/server/modules/center-scheduling/public.ts` — added weekly
    recurrence generation, explicit add/transfer/cancel commands, scoped lesson
    query, stable Lesson view, current assignment authorization, authored
    attribution, and the Financial Scope/Lesson Fact read boundary.
  - `src/lib/server/composition-root.ts` — wired the existing Financial Ledger
    boundary to Center & Scheduling's accepted scope provider and exposed it for
    the integration path.
  - `tests/center-scheduling/recurring-scheduling.test.ts` — added four fresh
    in-memory claim probes for AC-003..AC-006.
- workflow/evidence files: `.memory-bank/tasks/TASK-006-T2-FT-002-W4.task.json`
  status `ready -> in_progress`, `.protocols/TASK-006-T2-FT-002-W4/`, and
  `.tasks/TASK-006-T2-FT-002-W4/`.
- boundary compliance: Center & Scheduling is the only new schedule/Lesson
  writer; Financial Ledger remains the only charge writer; no Lesson Context,
  Collaboration, or Learning Progress projection was composed or changed.
- hard-scope result: no non-empty `write_boundary`; neither forbidden Foundation
  task record was touched; no stop condition or tier escalation occurred.

## Attempt 1 — claim-equivalent GREEN

- command: `npm run test -- tests/center-scheduling/recurring-scheduling.test.ts`
- cwd: `/home/serg/Projects/study_calendar`
- result: exit code `0`; 1 file, 4 tests passed at 2026-08-08 18:03:28 +05.
- AC-003: generated five planned weekly repetitions; add created only the
  selected extra Lesson; transfer changed only the selected Lesson date; cancel
  changed only the selected Lesson status; all other repetition identities and
  dates remained unchanged.
- AC-004: transfer retained the same Lesson identity, center/class/schedule
  context, planned status, and `createdByAccountId`; Financial Ledger replay
  remained one charge row for that Lesson after a second reconciliation attempt.
- AC-005: a Lesson created before assignment became readable through the
  assigned teacher's current scheduling scope, and its original author remained
  `admin-own`.
- AC-006: after assignment removal, scheduling read/change and Financial Ledger
  projection access were denied at the next server-side check; the Admin still
  read the Lesson with its original author attribution.
- isolation: each test created a fresh `:memory:` SQLite database and closed it
  in `afterEach`; no network, credentials, production data, or external side
  effect was used.

## Gate evidence

- `npm run check` → exit code `0`; `svelte-check found 0 errors and 0 warnings`.
- `npm run build` → exit code `0`; production SSR/client bundle built. The
  existing adapter-auto unsupported-production-environment message was
  informational and did not fail the gate.
- `npm run test` → exit code `0`; 6 files, 21 tests passed.
- `git diff --check` → exit code `0`.
- No execute result is offered as a `/verify` reuse candidate: a compliant
  bounded-input receipt snapshot was not captured immediately around the final
  gate commands. Independent verification remains due.
