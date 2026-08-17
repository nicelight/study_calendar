---
description: Fresh independent functional verification report for TASK-034 strict schedule-date presentation.
status: final
---
# Independent Verification — TASK-034-T1-FT-002-W18

## Result

The task-owned `FT-002-AC-010` / `REQ-004` outcome does not pass. Svelte
interprets the `{2}` and `{4}` fragments in the two markup `pattern`
attributes as template expressions. SSR and Chrome therefore receive
`[0-9]2/[0-9]2/[0-9]4`, not the intended strict date pattern.

In fresh Chrome 151 at a `1280x800` desktop viewport, entering valid
`29/02/2028` and `31/12/2028` did invoke the strict parser, populate native
Form Data as `2028-02-29` and `2028-12-31`, and persist the exact ISO-only draft
JSON. Both visible controls nevertheless returned `checkValidity() === false`
with `Please match the requested format.`, and the combined form remained
invalid. The visible controls consequently do not accept valid
`dd/mm/yyyy` values as required.

Malformed `2/2/2028`, impossible `31/02/2028`, and incomplete `12/` values did
show the explicit invalid state, clear the corresponding hidden ISO field, and
keep the draft free of the non-ISO literal. A seeded canonical draft restored
as visible `29/02/2028` / `31/12/2028` while Form Data and localStorage remained
ISO. Those passing branches do not compensate for rejecting every correctly
formatted valid date through native constraint validation.

## Evidence

- Independent runtime: disposable SQLite fixture, Vite at
  `http://127.0.0.1:5175`, Headless Chrome 151, desktop `1280x800`; fixture and
  browser profile were deleted after the probe.
- Reproducible driver:
  `.tasks/TASK-034-T1-FT-002-W18/verifier-browser-probe.mjs`.
- Authenticated SSR returned both visible placeholders but serialized both
  patterns as `pattern="[0-9]2/[0-9]2/[0-9]4"`.
- Source locator: `src/routes/admin/[centerId]/+page.svelte:383` and `:400`.
  The focused test at `tests/routes/admin-schedule-draft.test.ts:51` checks the
  placeholder and field shape, but not the rendered pattern or valid native
  constraint result.
- Fresh focused test passed: 1 file / 4 tests.
- `npm run check` passed with 0 errors and 0 warnings.
- Full `npm run test` passed: 29 files / 119 tests.
- `npm run build` and `git diff --check` passed.
- Targeted forbidden-scope diff was empty for the Admin server action,
  Center & Scheduling module, lesson-context routes, dependencies, and all
  protected TASK-031/TASK-032 paths. The product implementation diff remains
  limited to the two hard-boundary source/test files.

## Evidence separation

- Executor claim path: Attempt 1 local PASS and gates are recorded in
  `.protocols/TASK-034-T1-FT-002-W18/run.md`; no T1 RED/GREEN path is required.
- Reused execute evidence: none. All required inexpensive gates were rerun.
- Repeated checks: focused test, check, full test, build, diff check, and hard
  boundary inspection were repeated because they are cheap and deterministic.
- New targeted probes: authenticated SSR plus fresh Chrome DOM, native
  constraint, Form Data, invalid-state, draft-write, and draft-restore checks.
- The two model-pinned `Codex Luna` co-review focuses required by the
  finding-adjudication pack could not launch: the orchestrator rejected that
  unavailable model on both permitted attempts for each focus. The skill's
  fallback permits the caller to continue without substitutes.

## Handoff

Task status remains `in_progress`. No implementation, dependency, feature,
requirement, completed-task artifact, scheduler state, or lifecycle status was
changed. Return the task to its executor/owner to correct the rendered pattern
and add an outcome-level browser-equivalent assertion that a valid strict date
passes native constraint validation.

VERDICT: FAIL
