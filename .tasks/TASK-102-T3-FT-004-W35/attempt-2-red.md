---
description: Retry correction basis for Attempt 2 of TASK-102-T3-FT-004-W35.
status: supporting-only
---
# TASK-102 Attempt 2 — fresh verifier RED basis

- attempt: `2`
- retry source: `.tasks/TASK-102-T3-FT-004-W35/TASK-102-T3-FT-004-W35-S-VERIFY-final-report-code-01.md`.
- fresh verifier probe: `.tasks/TASK-102-T3-FT-004-W35/verifier-probe.test.ts`,
  executed in the verifier's isolated Vitest configuration. The report states
  that all three probe tests ran, with two task-relevant implementation
  failures below.
- retry-focused pre-correction command: `./node_modules/.bin/vitest run
  tests/routes/task-102-lesson-context-transport.test.ts
  tests/routes/task-102-lesson-context-transport.integration.test.ts` — exit
  `1`, 2 files / 7 tests; 5 passed and the two new correction assertions failed
  at 11:00:05 +05. This confirms the retry RED in the executor-owned probe
  surface without reconstructing Attempt 1.

## FAIL-01 — native named-form URL loses route selectors

Resolving the literal native form action `?/createMessage` against
`/lesson-context?classId=class-probe&lessonId=lesson-probe` drops both route
selectors. The actual named action returned `400 { error: 'message_invalid' }`
and did not write. The existing disposable E2E helper is not proof of native
DOM submission because it manually appends the named-action query segment.

Correction is limited to the existing Lesson Context page action URL helper:
preserve `classId` and `lessonId` in the URL while retaining SvelteKit's named
action segment.

## FAIL-02 — unsupported field key/target is persisted

Named `createFieldComment` accepted `fieldKey=unsupported-field` and persisted
the comment. Named `setReaction` accepted a field target with
`targetId=unsupported-field` and persisted the reaction; projection later hid
both rows. This creates unprojected retained records.

Correction is limited to the existing Collaboration owner boundary: validate
the supported field-key set before comment insert and before field-reaction
insert. No schema, writer, route, API, or UI scope expansion is required.

This is fresh retry correction evidence from the independent verifier. The
original Attempt 1 RED remains preserved as supporting-only evidence and is not
reconstructed or relabeled as Attempt 2 RED.
