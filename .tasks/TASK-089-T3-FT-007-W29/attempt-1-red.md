---
description: Attempt 1 claim-linked RED evidence for TASK-089-T3-FT-007-W29.
status: active
---
# Attempt 1 — Claim-linked RED

- attempt: 1
- receipt_status: supporting-only
- claim: `FT-007-AC-006 / REQ-014 / REQ-017` — Learning Progress exposes an authorized numeric conducted-slot attendance projection with student/Teacher scope and read-only behavior.
- command: `npx vitest run tests/learning-progress/ft-007-attendance-projection.test.ts`
- cwd: `/home/serg/Projects/study_calendar`
- exit_code: `1`
- completed_at: `2026-08-22 08:36:31 +0500`
- input_state_basis: Attempt 1 after durable `ready -> in_progress`; focused test was added inside the hard boundary, while `src/lib/server/modules/learning-progress/public.ts` had no task implementation change.
- evidence: Vitest reported `4 tests | 4 failed`; each claim path reached `TypeError: attendance.getAttendancePercentage is not a function`.

## Result

This is honest claim-specific RED: the accepted provider query is absent, so the
student ratio, Teacher aggregate, no-slot/read-only, and authorization paths
cannot yet be observed. The failure is not setup, syntax, or an artificial
assertion. No production behavior was changed by this probe.
