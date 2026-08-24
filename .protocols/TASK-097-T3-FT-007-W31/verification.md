---
description: Verification handoff for TASK-097 typed Statistics sorting.
status: active
---
# Verification — TASK-097-T3-FT-007-W31

## Verification basis

- Task-owned `FT-007-AC-004 / REQ-017`; direct rules in `statistics-projection.md#sorting-and-presentation`, `#registry-cardinality-and-teacher-view-scope`, `access-control.md#authority-and-scope`, and `testing/strategy.md#disposable-browser-proof`.
- Current Attempt 1 `/exe` handoff/evidence was read only as supporting input: `context.md`, `plan.md`, `progress.md`, `handoff.md`, `.tasks/TASK-097-T3-FT-007-W31/attempt-1-{red,green}.md`, and `execution-evidence.md`. No old verifier or semantic evidence was used as current proof.

## Historical Attempt 1 verifier result

- The earlier verifier result remains historical evidence only: it found that the
  then-current browser flow counted all `18` controls but executed only `12`
  clicks. Its historical result was `NEEDS-CLARIFICATION`; it is not reused as
  this verification's outcome.

## Fresh co-review focuses

- UI semantics: typed ordering, both directions, visible active direction, and first-rendered Teacher class ordering.
- Isolation and scope: authorized serializable rows, source non-mutation, hard boundary, disposable owned-server cleanup, and gates.
- Two new independent `Codex Luna` / `xhigh` reviews found no candidate
  finding. The UI focus independently counted `18` helper invocations and the
  helper's two clicks each; the isolation focus confirmed the direct
  serializable input and disposable-server path. Their observations inform but
  do not replace the verifier-owned probes below.

## Executor claim path

- Attempt 1 records applicable honest RED and claim-equivalent GREEN at the two `attempt-1` artifacts above. They support, but do not establish, this independent result.

## Reused execute evidence

- None. The current attempt declares no bounded-input reusable receipt because of unrelated dirty work.

## Historical repeated checks

- `npm run check` — PASS: `0` errors, `0` warnings.
- `npm run test` — PASS: `67` files / `225` tests.
- `npm run build` — PASS.
- `git diff --check` — PASS.
- `node scripts/mb-lint.mjs` — PASS: `74` files; pre-existing advisory metadata warnings only.
- `node scripts/mb-doctor.mjs --strict` — PASS: `0` errors, `0` warnings, `2` info.

## Historical targeted probes

- `npx vitest run tests/routes/ft-007-statistics-sorting.test.ts` — PASS: `1` file / `1` test; rendered all `18` accessible sort controls (`8` Students, `6` Teachers, `4` Classes).
- `node scripts/run-disposable-e2e.mjs --database tmp/ft-007-statistics.db --spec e2e/ft-007-statistics.spec.ts` — PASS twice in fresh verifier runs: `1` Playwright test each time. The runner supplied a new disposable server with the exact `tmp/` DB; the database plus `-wal`, `-shm`, and `-journal` files were absent after both runs. No Vite server remained. The browser probe snapshots `15` source/provider tables before and after sort interaction, proving no source mutation for its exercised path.
- Current code inspection maps the rendered matrix and typed path: `src/routes/statistics/+page.svelte` has `18` headers, generic asc/desc toggling and visible arrows, collated text, epoch dates, numeric percentage/count comparison, and `orderedNames(row.classNames)[0]` aligned with the first rendered Teacher class. It reads only `data.registry.*`, copies rows before sorting, and does not import a provider or database.
- Evidence remains inadequate for the task's full browser claim. `e2e/ft-007-statistics.spec.ts` asserts the `18` control count but has only `12` clicks. It exercises both directions only for a subset and does not execute both directions for every column (including most text columns and Teacher Classes descending). Therefore it cannot prove the required all-column/both-direction matrix, even though the implemented shared sorting path and representative text/date/percentage/count/count cases pass.

## Fresh repeated checks

- `npm run check` — PASS: `0` errors, `0` warnings.
- `npm run test` — PASS: `67` files / `225` tests.
- `npm run build` — PASS.
- `git diff --check` — PASS.
- `node scripts/mb-lint.mjs` — PASS: `74` files; only pre-existing metadata
  advisories.
- `node scripts/mb-doctor.mjs --strict` — PASS: `0` errors, `0` warnings,
  `2` info.

## Fresh verifier-owned targeted probes

- `node scripts/run-disposable-e2e.mjs --database tmp/ft-007-statistics.db --spec e2e/ft-007-statistics.spec.ts`
  — PASS twice, `1` Playwright test each time. The second run was bracketed by
  read-only metadata observations of `study-calendar.db`, unchanged at
  `356352` bytes / mtime `1787567348`; it used the new disposable server on
  port `5174`, not an existing one. No listener remained afterwards and
  `tmp/ft-007-statistics.db` plus `-wal`, `-shm`, and `-journal` sidecars were
  absent.
- The browser fixture asserted `8` Students + `6` Teachers + `4` Classes
  controls. Its `assertBothDirections` helper clicks the named direction and
  asserts the active header's `aria-sort` after each click; the `18` calls
  execute `36` directional interactions. It observes alphabetic text,
  chronological dates, numeric percentages/counts, and Teacher Classes by the
  first rendered alphabetized class. The fixture snapshots and compares all
  `15` listed source/provider tables before and after the complete matrix.
- Current source inspection confirms presentation-only sorting: the page reads
  only `data.registry.*`, copies rows before ordering, uses numeric epochs and
  numeric values where required, and derives Teacher Classes from
  `orderedNames(row.classNames)[0]`. `+page.server.ts` only receives the
  serializable `getStatisticsRegistry` output from Lesson Context; no provider
  or database path is introduced.
- The task's production/test delta remains within the literal hard boundary.
  The current diff has no TASK-097 change under forbidden provider roots,
  runner/config, `study-calendar.db`, or TASK-098. The accepted TASK-096
  relationship-row cardinality, distinct Teacher `studentCount`, and Teacher
  viewer registry scope remain prerequisite row-shape constraints, not claims
  re-proved by this task.

## Current verdict

VERDICT: PASS

Fresh verifier-owned browser proof covers every task-owned AC-004 directional
interaction and the required typed, visible-direction, source-non-mutation,
authorized-serialization, owned-server, and cleanup conditions. Executor
gates are supporting evidence only; this result does not change lifecycle,
planning, dependencies, implementation, or TASK-098.

## Handoff

- Recommended scheduler route: `/red-verify TASK-097-T3-FT-007-W31`.
- T3 functional PASS is not closure eligibility. Task lifecycle changed by
  verifier: no.
