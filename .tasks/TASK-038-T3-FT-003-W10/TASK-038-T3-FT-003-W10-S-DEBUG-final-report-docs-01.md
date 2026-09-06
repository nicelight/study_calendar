---
description: Read-only diagnosis of the terminal failure of TASK-038.
status: final
---
# Debug — TASK-038-T3-FT-003-W10

## Symptom and reproduction

The current execution attempt was Attempt 1. The claim-specific SSR probe
failed because a rendered calendar lesson had no link to
`/lesson-context?date=...&classId=...&lessonId=...`.

The original card additionally required an optional `studentAccountId` link
context and proof both with and without a permitted student. The current
`CalendarPageData` did not contain a server-authorized student identity, while
the task hard boundary forbade changing the calendar loader or inventing a
student ID from the URL, role, or client state.

Evidence:

- `.tasks/TASK-038-T3-FT-003-W10/attempt-1-red.md`
- `.protocols/TASK-038-T3-FT-003-W10/progress.md`
- `.protocols/TASK-038-T3-FT-003-W10/handoff.md`

## Attempt and change surface

- Current attempt: Attempt 1.
- Production change surface: none; execution stopped before production code.
- Probe surface: `tests/routes/calendar-navigation.test.ts` and SSR-rendered
  `src/routes/calendar/+page.svelte` output.
- The diagnosis is read-only; no implementation, lifecycle, or scheduler state
  was changed.

## Root cause and first violated invariant

Root cause: the original acceptance target and the task's hard implementation
boundary were inconsistent. The required student context was unavailable from
the server-rendered calendar data, but the task prohibited the only plausible
boundary change (extending the loader/output contract). This was not a bug that
could be safely fixed inside the two-file presentation boundary.

The first violated invariant was that calendar navigation may carry only
server-authorized context; it must not invent or trust a client-selected
student identity, and the existing Lesson Context route remains the final
authorization owner. The task's own stop condition correctly prevented a fake
GREEN result.

## Minimum correction

The minimum correction was to reconcile AC-008 to shared-only navigation:
carry exactly `date`, `classId`, and `lessonId`, with no `studentAccountId`, and
create a fresh replacement task. That was done as
`TASK-039-T3-FT-003-W10`, which is `done` with fresh functional PASS,
semantic-pass, exact-query proof, guessed-student denial, and unchanged
read-path state.

TASK-038 itself should remain historical `failed`/`superseded`; changing its
implementation or replaying its RED against the narrowed contract would erase
the reason the replacement was needed.

## Regression check

The sufficient current check is TASK-039's disposable SSR/route probe:
follow a real DB-backed calendar link, assert exact query keys
`date/classId/lessonId`, assert no `studentAccountId`, verify existing Lesson
Context authorization denies a guessed student with `403`, and compare state
before/after. Its native check, build, and test gates passed.

## Recurrence

`no_prior_evidence` within the inspected TASK-038 attempt, FT-003 decision log,
replacement card, and TASK-039 verification evidence. The failure was a single
accepted-contract/boundary mismatch, not a repeated implementation mechanism;
no durable recurrence guardrail is admitted.

## Residual uncertainty and next owner

No uncertainty remains for the accepted shared-only outcome. Personal student
context is intentionally deferred to a separate role-scoped follow-up after
dashboard work. TASK-039 and the FT-003 aggregate gate own the current result;
no owner action is required against TASK-038 itself.

DIAGNOSIS: CONFIRMED
