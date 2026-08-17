---
description: Attempt 2 execution evidence for TASK-034 pattern serialization correction.
status: final
---
# TASK-034 — Execute Retry Report

## Correction

The independent verifier found that Svelte consumed quantifier braces in the
literal markup pattern and rendered `[0-9]2/[0-9]2/[0-9]4`. Both controls now
receive the strict pattern as a Svelte string expression:
`[0-9]{2}/[0-9]{2}/[0-9]{4}`.

This allows correctly formatted `29/02/2028` and `31/12/2028` through native
pattern validation. The existing strict parser remains responsible for calendar
validity, and valid values still flow only to the existing hidden ISO Form Data
and ISO-only scoped draft.

## Regression Evidence

- `npm run test -- tests/routes/admin-schedule-draft.test.ts` — PASS, 1 file /
  5 tests. New assertions inspect the SSR-serialized pattern, reject the prior
  malformed serialization, and confirm both leap-day and end-of-year values
  match each visible field's native pattern.
- `npm run check` — PASS, 0 errors and 0 warnings.
- `npm run test` — PASS, 29 files / 120 tests.
- `npm run build` — PASS.
- `git diff --check` — PASS.

## Scope and Handoff

Only the task's permitted component and focused test changed. No Admin server
action, Center & Scheduling behavior, persistence, draft key/JSON shape,
TASK-031/TASK-032 artifact, dependency, or FT-003 path changed.

The task remains `in_progress`. Route to `/verify TASK-034-T1-FT-002-W18` for
an independent browser check of the corrected native constraint behavior; no
verification, closure, semantic verification, promotion, or sync was run here.
