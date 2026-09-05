---
description: Claim-specific Attempt 1 RED evidence for TASK-101-T3-FT-006-W34.
status: active
---
# Attempt 1 — claim-specific RED

- attempt: `1`
- applicability: applicable
- claim: `FT-006-AC-011 / REQ-013 / REQ-014`
- RED basis: the unchanged production implementation has no Lesson Context
  personal-calendar marker adapter, no Calendar marker view model, and no
  marker presentation. The probe exercises the accepted Student and linked
  Parent projection, shared-role omission, exact amount/factual date,
  week/month placement, and non-mutation outcome.
- command: `npx vitest run tests/lesson-context/personal-payment-markers.test.ts tests/routes/calendar-payment-markers.test.ts`
- cwd: `/home/serg/Projects/study_calendar`
- input state basis: repository `HEAD` was unchanged; pre-existing unrelated
  W33 scheduler/implementation changes remained outside this task boundary;
  the only task-local prospective files present before this command were the
  newly initialized protocol files, task `in_progress` bookkeeping, and the
  two focused RED test files. No generated/runtime database input was used.
- exit_code: `1`
- result: `2` test files and `5` tests failed. Lesson Context raised
  `getPersonalPaymentMarkers is not a function`; Calendar returned no
  `paymentMarkers`; marker amount/date DOM entries were absent. The failures
  are claim-specific and occur against the missing consumer behavior, not
  setup, syntax, or an artificial production break.
- evidence: command output above; no production behavior was changed by the
  RED probe.
