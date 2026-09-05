---
description: Advisory technical-debt report for the W35 TASK-107 correction surface.
status: active
---
# Technical debt — Wave W35 — 2026-09-05

## Checked scope

This report covers the W35 scheduler boundary for
`TASK-107-T3-FT-004-W35`: the current `Lesson Context` named
`editFieldComment` transport, the Collaboration public write boundary, the
task-linked regression callers, and the durable Attempt 2 / verify / semantic
evidence. Repository-wide review was not performed.

Evidence checked:

- `src/routes/lesson-context/+page.server.ts`
- `src/lib/server/modules/collaboration/public.ts`
- `tests/routes/task-102-lesson-context-transport.integration.test.ts`
- `tests/collaboration/comments-reactions.test.ts`
- `.tasks/TASK-107-T3-FT-004-W35/TASK-107-T3-FT-004-W35-S-EXE-final-report-code-02.md`
- `.tasks/TASK-107-T3-FT-004-W35/TASK-107-T3-FT-004-W35-S-VERIFY-final-report-docs-02.md`
- `.tasks/TASK-107-T3-FT-004-W35/TASK-107-T3-FT-004-W35-S-RED-VERIFY-final-report-docs-01.md`

## Confirmed findings

### TD-W35-01 — TASK-102-named regression caller now owns TASK-107 transport proof

- Priority: Low
- Mechanism: the current TASK-107 executor report records a required update to
  `tests/routes/task-102-lesson-context-transport.integration.test.ts` so its
  personal edit caller carries the selected `studentAccountId`. The file name
  and historical test identity still point to failed TASK-102, while the
  current correction and its accepted route/Collaboration semantics belong to
  TASK-107.
- Impact: future maintainers can misattribute the regression contract or
  accidentally treat the failed TASK-102 surface as the owner of current
  student-scope behavior. This increases traceability and regression-edit
  coupling at the next transport change.
- Smallest remediation direction: in a future maintenance-only change, add a
  TASK-107-named focused regression module or split the current scenario while
  preserving the existing coverage. No rename or test restructuring is part of
  this W35 closure.
- Evidence: TASK-107 Attempt 2 report, the `touched_files` scope above, and the
  current test caller's selected-student URL construction.

## Uncertainty and workflow impact

No additional material debt was confirmed from the bounded W35 surface. The
finding is advisory only: it does not alter task status, verdicts, retry
accounting, dependencies, gates, or scheduler routing.
