---
description: Claim-linked RED basis for Attempt 3 of TASK-102-T3-FT-004-W35.
status: active
---
# TASK-102 Attempt 3 — fresh verifier correction RED basis

- attempt: `3`
- started: `2026-09-05 11:24:37 +05`
- retry source: `.tasks/TASK-102-T3-FT-004-W35/TASK-102-T3-FT-004-W35-S-VERIFY-final-report-code-02.md`.
- fixed semantics: preserve the current personal `studentAccountId` in the
  existing native `actionHref` URL alongside `classId` and `lessonId`. The
  server action registry, server-resolved authority, and Collaboration owner
  are unchanged.
- claim locator: `FT-004-AC-005 / REQ-014` and Collaboration Browser Surface
  `#authorized-mutation-transport`, specifically personal/shared separation
  after a native named-form submission.
- Attempt 1 and Attempt 2 RED/GREEN/report artifacts remain preserved and
  supporting-only; this is a fresh bounded executor retry, not a reconstructed
  earlier result.

## Fresh verifier observation

The independent report-02 personal-scope probe observed that
`src/routes/lesson-context/+page.svelte` constructs native named-action URLs
with only `classId` and `lessonId`. The browser-resolved URL for a form on
`/lesson-context?...&studentAccountId=student-one-verify-102` therefore has no
`studentAccountId`; the next server load consequently returns shared context.

## Executor RED probe

The executor-owned structural regression will assert that `actionHref` reads
the current personal selector and writes it into the named-action URL before
the production correction. Its exact command and observed failing receipt are
added here immediately after execution. No prospective production correction
is made before that RED observation.

The regression assertions are now present in
`tests/routes/task-102-lesson-context-transport.test.ts`, and the disposable
browser scenario now submits the rendered personal completion form and checks
that the resulting URL retains the student selector.

The exact pre-correction RED command was:

`./node_modules/.bin/vitest run tests/routes/task-102-lesson-context-transport.test.ts`

It exited `1` at `2026-09-05 11:29:08 +05`: 4 tests ran, 3 passed and 1
failed in the named-form migration test because the source contains neither
`const studentAccountId = context?.navigation.studentAccountId;` nor
`params.set('studentAccountId', studentAccountId);`. This is the fresh
Attempt 3 executor-owned RED receipt; no production correction preceded it.

## Fresh GREEN progress

The bounded correction and focused claim-linked regression passed, and the
disposable browser scenario now covers a real personal native form submission;
final gate receipts and the complete Attempt 3 GREEN artifact will be written
after the required native checks.
