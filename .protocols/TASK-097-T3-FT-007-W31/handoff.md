---
description: Execution handoff for TASK-097 typed Statistics sorting.
status: active
---
# Handoff — TASK-097-T3-FT-007-W31

## Summary

- Attempt 1 remains the current executor handoff. Its bounded evidence completion closes the verifier-identified proof gap: a fresh owned-server disposable browser run clicks both directions for all `18` controls (`8` Students, `6` Teachers, `4` Classes), observes active direction after every click, and proves typed/first-rendered-class ordering without changing the server load, composition, provider semantics, cardinality, scope, or source facts.

## Where to look

- key files: `src/routes/statistics/+page.svelte`, `tests/routes/ft-007-statistics-sorting.test.ts`, `e2e/ft-007-statistics.spec.ts`.
- advisory `touched_files` deviations: none; all production/test paths are literal card entries. Protocol/evidence bookkeeping is skill-owned.
- hard write-boundary compliance: yes; no forbidden provider/runner/config path or `study-calendar.db` was touched.

## How to run / verify

- current-attempt RED/GREEN: `progress.md#claim-linked-red--green` and `progress.md#attempt-1--bounded-browser-evidence-completion`; `.tasks/TASK-097-T3-FT-007-W31/attempt-1-red.md` remains the original honest RED, while `.tasks/TASK-097-T3-FT-007-W31/attempt-1-browser-matrix-green.md` is the current full-matrix browser GREEN.
- executor gates: `.tasks/TASK-097-T3-FT-007-W31/execution-evidence.md`; latest `/exe` report: `.tasks/TASK-097-T3-FT-007-W31/TASK-097-T3-FT-007-W31-S-EXE-final-report-code-02.md`.
- current-attempt reuse candidate: none — unrelated dirty state prevents a bounded input snapshot.
- required route after execution: fresh `/verify TASK-097-T3-FT-007-W31`; only after functional PASS, required T3 `/red-verify TASK-097-T3-FT-007-W31`.

## Known issues

- None task-local. Lifecycle remains `in_progress` under scheduler ownership; TASK-098 remains `ready` and untouched.
