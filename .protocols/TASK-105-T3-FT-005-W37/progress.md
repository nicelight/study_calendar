---
description: Execution progress for TASK-105-T3-FT-005-W37.
status: active
---
# Progress — TASK-105-T3-FT-005-W37

## Current status
- state: verifying
- last update: 2026-09-05

## What was done
- Preflight completed against the indexed task, dependencies, Planning Revision 2, current FT-005 review approval, direct canonical specs, and hard boundaries.
- Attempt 1 initialized and task lifecycle durably transitioned from `ready` to `in_progress` before any prospective probe or implementation.
- Learning Progress now exposes provider-owned zero/one/multiple lesson selection, class-visible completion projection through the existing authorized class-view boundary, and teacher/admin grade projection while retaining the existing class-wide completion command contract.
- Lesson Context now composes homework progress into shared/personal day context and delegates named create, complete, and grade commands through the Learning Progress public boundary.
- The route now accepts only named server-authorized homework actions; it rejects client homework identity, validates approved grades, and leaves `/api/lesson-context` unchanged and GET-only.
- Added isolated route regression coverage for creation, idempotent repeat, opaque server IDs, completion, grading, privacy, authorization, deny-before-write, rerun, and cleanup behavior.
- Attempt 2 corrected only the provider projection: Lesson Context completion
  data now delegates to `LearningProgressBoundary.getHomeworkCompletions`,
  while grade data remains limited to the actor-resolved student scope.
- Attempt 2 added a focused assertion that Student B's shared Lesson Context
  receives Student A's persisted completion and still receives no grade fields.

## Attempt 2 retry basis
- Retry is bounded to the authorized same-task repair after the retained
  Attempt 1 semantic-fail report.
- Failed claim: `FT-005-AC-001 / REQ-009` class-visible completion through the
  Lesson Context projection; the provider incorrectly reused the
  `AuthorizedClassScope.studentAccountIds` list, which is actor-specific for a
  Student.
- Correction basis: reuse the existing Learning Progress
  `getHomeworkCompletions` public class-view boundary for completion projection;
  keep grade projection on the actor-resolved student scope. No
  `CenterScheduling` change, cross-class access, grade-visibility widening,
  Lesson Context adapter change, or TASK-106/UI change is authorized.
- Attempt 1 RED remains historical claim-linked evidence at
  `.tasks/TASK-105-T3-FT-005-W37/attempt-1-red.md` and the semantic-fail report;
  its GREEN and cleanup receipts are supporting-only for Attempt 2.

## Commands run (with results)
- Focused GREEN: `npx vitest run tests/routes/lesson-context-homework-actions.test.ts --reporter verbose` — exit `0`; `1` file and `4` tests passed at `2026-09-05T03:28:10+05:00`.
- `npm run check` — exit `0`; `svelte-check found 0 errors and 0 warnings`.
- `npm run build` — exit `0`; SSR and client production build completed.
- `npm run test` — exit `0`; `76` files and `260` tests passed at `2026-09-05T03:27:49+05:00`.
- `git diff --check` — exit `0`; no whitespace errors.
- Attempt 2 focused route GREEN: `npx vitest run tests/routes/lesson-context-homework-actions.test.ts --reporter verbose` — exit `0`; `1` file and `4` tests passed at `2026-09-05T04:03:43+05:00`, including the Student A → Student B Lesson Context assertion.
- Attempt 2 provider regression: `npx vitest run tests/learning-progress/homework-grades.test.ts --reporter verbose` — exit `0`; `1` file and `3` tests passed at `2026-09-05T04:04:08+05:00`.

## Claim-linked RED / GREEN (T2/T3)
- current attempt: 2
- applicability: applicable
- accepted claim locator(s): `FT-005-AC-001 / REQ-009`; `FT-005-AC-002 / REQ-009 / REQ-014`; Learning Progress Browser Surface `#server-composed-homework-projection`; `#authorized-homework-form-actions`; T3 isolated-state cleanup verification target.
- accepted not-applicable reason and alternative proof: none
- Attempt 1 RED command/probe: `npx vitest run tests/routes/lesson-context-homework-actions.test.ts --reporter verbose`.
- Attempt 1 RED observation and evidence: exit `1`; named `createHomework` returned `400 invalid_request` and `dayContext.homeworkProgress` was `undefined`. Retained at `.tasks/TASK-105-T3-FT-005-W37/attempt-1-red.md`.
- Attempt 1 GREEN receipt status: `supporting-only`; `.tasks/TASK-105-T3-FT-005-W37/attempt-1-green.md`.
- Attempt 1 cleanup receipt status: `supporting-only`; `.tasks/TASK-105-T3-FT-005-W37/cleanup-receipt.md`.
- Attempt 2 RED: retained from Attempt 1; no artificial repeat RED is required by the retry contract.
- RED observation and evidence: the current task claims
  `FT-005-AC-001 / REQ-009` and `FT-005-AC-002 / REQ-009 / REQ-014` had
  claim-linked Attempt 1 RED: the named create action and provider-owned
  projection were absent before implementation. Evidence:
  `.tasks/TASK-105-T3-FT-005-W37/attempt-1-red.md` and the retained Attempt 1
  semantic-fail report.
- Attempt 2 GREEN: exit `0`; fresh focused route proof observes Student A's
  completion in Student B's shared Lesson Context. Receipt:
  `.tasks/TASK-105-T3-FT-005-W37/attempt-2-green.md`.
- GREEN observation and evidence: `FT-005-AC-001 / REQ-009` and
  `FT-005-AC-002 / REQ-009 / REQ-014` are covered by the fresh Attempt 2
  route/provider proof, independent `/verify` PASS, and required T3
  semantic-pass; Student B sees Student A's completion through Lesson
  Context, shared grades remain absent, and authorization/state-before/state-
  after checks pass. Evidence:
  `.tasks/TASK-105-T3-FT-005-W37/attempt-2-green.md`,
  `.protocols/TASK-105-T3-FT-005-W37/verification.md`, and
  `.protocols/TASK-105-T3-FT-005-W37/red-verification.md`.
- Claim-equivalent probe change: the task-owned route test asserts that Student
  B's shared Lesson Context includes Student A's persisted completion while
  grades remain absent; the test remains under the allowed `tests/routes/` root.
- T3 isolation/cleanup/permission evidence: fresh Attempt 2 run used the
  existing per-test `:memory:` database fixtures, state-before/state-after
  assertions, `afterEach` database close, and no filesystem sidecars. Receipt:
  `.tasks/TASK-105-T3-FT-005-W37/cleanup-receipt-attempt-2.md`.
- Environmental note: the exact full-suite gate ran in the shared workspace and
  `study-calendar.db` mtime was observed near that run; attribution is
  unavailable without a pre-run snapshot. No forbidden database cleanup or
  rewrite was attempted; the focused retry proof itself used only `:memory:`.
  This known project hygiene issue is already recorded in
  `PAPERCUTS/gpt-5 __ 09-05-2026 02.08.md`.

## Evidence links
- `.tasks/TASK-105-T3-FT-005-W37/attempt-1-red.md` — pre-change claim-linked RED.
- `.tasks/TASK-105-T3-FT-005-W37/attempt-1-green.md` — supporting-only Attempt 1 GREEN.
- `.tasks/TASK-105-T3-FT-005-W37/cleanup-receipt.md` — supporting-only Attempt 1 isolated-state teardown receipt.
- `.tasks/TASK-105-T3-FT-005-W37/attempt-2-green.md` — current Attempt 2
  claim-linked GREEN, supporting-only for independent verification.
- `.tasks/TASK-105-T3-FT-005-W37/cleanup-receipt-attempt-2.md` — current Attempt
  2 isolated-state cleanup receipt, supporting-only for independent verification.
- `.tasks/TASK-105-T3-FT-005-W37/TASK-105-T3-FT-005-W37-S-EXE-final-report-code-01.md` — final executor report.
- `.tasks/TASK-105-T3-FT-005-W37/TASK-105-T3-FT-005-W37-S-EXE-final-report-code-02.md` — Attempt 2 final executor report and forward handoff.

## Open issues / risks
- Retry repair must preserve unrelated dirty FT-006 changes in
  `lesson-context/public.ts` and must not widen grade or cross-class access.
- The focused probe's disposable cleanup is proven; default database mtime after
  the shared full-suite gate is an environmental attribution note for the next
  verifier, not a claim of task-owned database mutation.

## Next step (single concrete action)
- Hand off the still-open task to `/verify TASK-105-T3-FT-005-W37` for fresh
  independent functional verification; T3 then requires `/red-verify`.
