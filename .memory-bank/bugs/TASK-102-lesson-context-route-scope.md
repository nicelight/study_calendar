---
description: Scheduler failure note for TASK-102 Attempt 3 route-scope mutation failure.
status: archived
last_updated: 2026-09-05
source_of_truth:
  - .memory-bank/bugs/TASK-102-lesson-context-route-scope.md
---
# TASK-102 — forged lesson route can edit another lesson's comment

## Evidence

Fresh independent Attempt 3 functional verification returned exactly
`VERDICT: FAIL`. The isolated probe invoked the named `editFieldComment` action
through a forged `lesson-final-one` route for a comment stored under
`lesson-final-two`; the action returned success and changed the stored body
instead of denying before mutation.

Current evidence:

- `.protocols/TASK-102-T3-FT-004-W35/verification.md:99-119,131-142`
- `.tasks/TASK-102-T3-FT-004-W35/TASK-102-T3-FT-004-W35-S-VERIFY-final-report-code-03.md:19-35`
- `.tasks/TASK-102-T3-FT-004-W35/verifier-attempt-3-final-probe.test.ts:506-533`
- `src/routes/lesson-context/+page.server.ts:498-514`
- `src/lib/server/modules/collaboration/public.ts:237-272`

The route passes only `sessionToken`, `commentId`, and `body` to the existing
Collaboration public method. The method authorizes the stored comment context
and does not enforce the current route `classId`/`lessonId`.

The `classId`/`lessonId` equality expectation was an over-specified task-local
check, not a requirement of role/context privacy. The accepted REQ-014
semantics require actor membership, target authorization, ownership, and
privacy; they do not require an already authorized target to match a URL
`lessonId` navigation selector.

## Scheduler disposition

Attempts 1–3 and their original evidence remain preserved. The sole Attempt 3
failure was the now-removed route-selector equality assertion; the other
task-scoped assertions and native gates passed. The finding is accepted as out
of scope under the clarified REQ-014 semantics; the historical task remains
`failed` because its exhausted T3 attempt record cannot be converted to `done`
without fresh closure-eligible verification. No Attempt 4 or implementation
replay is required.

## Current disposition

The finding is archived as out of scope by the operator's clarification of
REQ-014. Preserve this report as historical evidence; do not create a
correction task or retry for the removed route-selector assertion.
