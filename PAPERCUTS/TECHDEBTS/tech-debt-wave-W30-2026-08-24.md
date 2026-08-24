# Technical-debt advisory — Wave W30

Date: 2026-08-24
Review mode: advisory only; this report does not change implementation,
lifecycle, scheduler, queue, planning, or debt state.

## Checked scope

Only completed `TASK-096-T3-FT-007-W30` was reviewed, using its authoritative
card, current Attempt 2 evidence, actual W30 code/test and durable change
surface, and the W30 sync report. The review did not widen to W27–W29, W31,
or a repository-wide audit.

Actual W30 production/test change:

- `src/lib/server/modules/lesson-context/public.ts:337-437` — the Statistics
  projection keeps relationship-level Student rows and derives a Teacher's
  `studentCount` from the distinct `studentAccountIds` of assigned classes
  (lines 398-413);
- `tests/lesson-context/ft-007-statistics-composition.test.ts:230-250` — the
  shared-Student regression assertion retains two relationship rows while
  requiring `studentCount: 1`.

The durable W30 surface checked was the reconciled cardinality/scope contract
at `.memory-bank/contracts/statistics-projection.md:46-81`, the FT-007 W30
closure route at `.memory-bank/features/FT-007-navigation-and-statistics.md:314-332`,
the TASK-096 requirement/index links, and the W30 sync report.

## Evidence reviewed

- Authoritative task card:
  `.memory-bank/tasks/TASK-096-T3-FT-007-W30.task.json` — `status: done`,
  current closure is Attempt 2 and its literal hard boundary contains the two
  changed production/test files.
- Current Attempt 2 functional and semantic evidence:
  `.protocols/TASK-096-T3-FT-007-W30/verification.md:1-69` and
  `.protocols/TASK-096-T3-FT-007-W30/red-verification.md:1-57`.
  These record the 7/7 verifier probe, 14/14 focused composition/route suite,
  provider-boundary/denial/non-mutation checks, and `semantic-pass`.
- Actual current code, target test, and route adapter:
  `src/lib/server/modules/lesson-context/public.ts:337-437`,
  `tests/lesson-context/ft-007-statistics-composition.test.ts:119-354`, and
  `src/routes/statistics/+page.server.ts:15-36`.
  The route delegates to Lesson Context; the composition uses the existing
  public boundaries and does not persist or mutate facts.
- Focused re-run in this review:
  `npx vitest run tests/lesson-context/ft-007-statistics-composition.test.ts tests/routes/ft-007-statistics.test.ts`
  — PASS, 2 files / 14 tests.
- W30 synchronization:
  `.tasks/TASK-096-T3-FT-007-W30/TASK-096-T3-FT-007-W30-S-MB-SYNC-final-report-docs-01.md:8-40`.
  It agrees that TASK-096 is closed from current Attempt 2 evidence and
  preserves Attempt 1 only as historical evidence.

## Confirmed findings

None. No inspected evidence establishes a material repeated-change cost,
coupling, regression risk, reliability failure, or maintenance burden in the
current W30 implementation or its durable change surface.

## Uncertainty and non-findings

- The projection performs per-row metric boundary calls and relationship
  scans, but the checked evidence provides no observed scale, latency, or
  repeated-change impact. This is not admitted as debt.
- Attempt 1's superseded clarification/semantic history was excluded from the
  finding basis, as required by the authoritative card and W30 sync. It does
  not demonstrate a current debt mechanism after the reconciled contract and
  Attempt 2 proof.
- No conclusion is drawn from code size, test count, style, coverage, or
  documentation preferences alone.

This report is advisory only and does not block, repair, promote, route, or
mutate any task, feature, requirement, scheduler, or lifecycle state.
