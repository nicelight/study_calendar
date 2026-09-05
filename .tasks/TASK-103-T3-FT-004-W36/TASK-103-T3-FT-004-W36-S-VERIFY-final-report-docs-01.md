---
description: Fresh independent functional verification report for TASK-103-T3-FT-004-W36.
status: final
---
# Independent Verification — TASK-103-T3-FT-004-W36

## Result

Fresh verifier-owned verification found that the current Collaboration UI does
not satisfy the complete task outcome. The task remains `in_progress`; no
lifecycle transition was made.

## Findings

1. `FT-004-AC-002 / REQ-007` fails in the browser surface. In
   `src/routes/lesson-context/+page.svelte:254-260`, the feed header submits a
   field-topic reaction, but the message loop has no message-target reaction
   form. At `:238-242`, comment reaction participants are not rendered even
   though comment reactions are projected. Thus message reactions cannot be
   applied through the UI and comment reactor visibility is missing.

2. `FT-004-AC-003 / AC-004 / REQ-008` fails the accepted URL-state rule. At
   `src/routes/lesson-context/+page.svelte:273-276`, branch links use only
   `#branch-...` fragments and closed `<details>` elements. There is no
   `branchRootId` query handling or SSR-selected branch state, so the selected
   thread is not reproduced by the server on reload as required.

3. `FT-004-AC-003 / REQ-008` is not rendered as a nested arbitrary-depth
   thread. The common feed uses one flat message list with only a boolean reply
   class, and the branch view renders flat paragraphs without parent/depth
   hierarchy (`+page.svelte:256-276`).

4. The required task-scoped browser proof is absent. The declared
   `e2e/ft-004-collaboration-ui.spec.ts` does not exist; the available
   `e2e/ft-004-collaboration-transport.spec.ts` is a single `TASK-102`
   transport smoke and does not assert the complete UI acceptance matrix.

## Evidence

- Verifier-owned source probe reported no message reaction form, no
  `branchRootId` handling, fragment-only branch links, and no nested rendering
  of parent/depth relationships.
- `npm run check` — passed, 0 Svelte errors/warnings.
- Targeted transport tests — passed, 2 files / 7 tests.
- `npm run build` — passed.
- `npm test` — passed, 78 files / 268 tests.
- `git diff --check` — passed.
- `node .memory-bank/scripts/mb-lint.mjs` — passed with only existing advisory
  metadata warnings.
- `node .memory-bank/scripts/mb-doctor.mjs --strict` — passed with 0 errors and
  0 warnings.
- The existing disposable transport smoke passed 1/1, but is supporting-only
  evidence in the current run and not proof of this task's complete UI outcome.
- Current disposable cleanup confirmed that the exact database and all SQLite
  sidecars were removed.
- The exact declared UI spec command failed with `No tests found` because the
  spec file is absent; disposable DB cleanup removed the exact database and
  sidecars.
- Executor RED/GREEN and handoff artifacts were inspected but not reused as an
  independent verdict: `.protocols/TASK-103-T3-FT-004-W36/` and
  `.tasks/TASK-103-T3-FT-004-W36/`.
- A fresh Codex Luna co-review was attempted for this turn with `xhigh`
  reasoning; it returned no usable output before the evidence write and was not
  used as a substitute for verifier-owned proof.

## Scope safety

No implementation, spec, task, dependency, lifecycle, Judge, scheduler, or
Memory Bank sync changes were made by the verifier. `TASK-102` remains
`failed`, `TASK-103` remains `in_progress`, and `TASK-107` remains `done`.

## Verdict

VERDICT: FAIL

## Required next action

Return to the implementation/evidence owner for the bounded UI and browser-proof
correction. Do not run `/red-verify` until fresh functional verification passes.
