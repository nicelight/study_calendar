# TASK-096 Attempt 2 — Execution Evidence

## Change surface

- production: `src/lib/server/modules/lesson-context/public.ts`
- focused probe: `tests/lesson-context/ft-007-statistics-composition.test.ts`
- workflow bookkeeping: task card, TASK-096 protocol, and TASK-096 evidence
  artifacts only.
- hard boundary: complied with. The two production/test files are literal
  entries in `runtime_context.write_boundary`; no forbidden scope was touched.
- advisory deviation: none. No `/statistics` source change was needed because
  the existing adapter correctly consumes the Lesson Context projection.

## Outcome and boundary evidence

- Lesson Context remains the sole cross-slice composition owner.
- Center & Scheduling scope still precedes Identity & Access profile lookup;
  Learning Progress and Financial Ledger are called only through existing
  public boundaries.
- The correction changes no provider formula, source fact, route transport,
  persistence, graph edge, or source of truth.
- The added probe keeps one Student row per relation while proving shared
  students count once in the Teacher's aggregate.

## Commands

| Command | Result |
| --- | --- |
| `npx vitest run tests/lesson-context/ft-007-statistics-composition.test.ts` | exit 1 — honest pre-change distinct-count RED |
| `npx vitest run tests/lesson-context/ft-007-statistics-composition.test.ts tests/routes/ft-007-statistics.test.ts` | exit 0 — 2 files, 14/14 tests |
| `npm run check` | exit 0 — 0 errors, 0 warnings |
| `npm run test` | exit 0 — 66 files, 224 tests |
| `npm run build` | exit 0 — SvelteKit production build succeeded; non-failing adapter-auto notice |
| `git diff --check` | exit 0 |
| `node scripts/mb-lint.mjs` | exit 0 — 74 files passed; existing advisory metadata warnings |
| `node scripts/mb-doctor.mjs --strict` | exit 0 — 0 errors, 0 warnings, 2 info |

## Handoff

Current task status is `in_progress`; no final lifecycle decision was made.
The next owner is fresh `/verify TASK-096-T3-FT-007-W30`, followed on
functional PASS by fresh `/red-verify TASK-096-T3-FT-007-W30`.
