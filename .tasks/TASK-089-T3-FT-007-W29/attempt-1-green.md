---
description: Attempt 1 claim-equivalent GREEN evidence for TASK-089-T3-FT-007-W29.
status: active
---
# Attempt 1 — Claim-equivalent GREEN

- attempt: 1
- receipt_status: supporting-only
- claim: `FT-007-AC-006 / REQ-014 / REQ-017` — Learning Progress exposes an authorized numeric conducted-slot attendance projection with student/Teacher scope and read-only behavior.
- command: `npx vitest run tests/learning-progress/ft-007-attendance-projection.test.ts`
- cwd: `/home/serg/Projects/study_calendar`
- exit_code: `0`
- completed_at: `2026-08-22 08:38:15 +0500`
- input_state_basis: Attempt 1 after the production change and the bounded negative-probe correction; only `public.ts`, the focused test, and task protocol/evidence files are in the selected execution surface.
- evidence: Vitest reported `1 test file passed` and `4 tests passed`; runtime was `701ms`.

## Result

The same claim-equivalent fixture now proves student percentages over completed
lessons, explicit absence and default-present remainder, correction reflected on
read, Teacher aggregation over all current assigned classes, no-conducted-slot
`0`, planned/cancelled exclusion, private/unassigned/cross-center and removed
assignment denial, and state-before/state-after equality for attendance and
financial facts. The probe uses a fresh in-memory database per test.
