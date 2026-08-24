---
description: Adversarial semantic verification for TASK-097 typed Statistics sorting.
status: active
---
# Red Verification — TASK-097-T3-FT-007-W31

## Semantic target
- Task/feature outcome: `FT-007-AC-004 / REQ-017` — every authorized Statistics registry column has visible active ascending/descending state and performs typed presentation sorting; Teacher Classes uses the first rendered ordered class.
- Accepted contract and boundaries: `statistics-projection.md#sorting-and-presentation`, `#registry-cardinality-and-teacher-view-scope`, `access-control.md#authority-and-scope`, `testing/strategy.md#disposable-browser-proof`, and the task card hard boundary. Sorting may consume only the authorized serializable TASK-096 result and may not alter provider/query/scope/cardinality/source facts.

## Evidence and adversarial coverage
- Existing verification verdict: current fresh `VERDICT: PASS` in [verification.md](verification.md) and its task report; old verifier and semantic evidence were not used as current proof.
- Changed files / diff / runtime evidence: the production delta is local to `src/routes/statistics/+page.svelte`; it derives sorted copies from `data.registry.*`, has no provider/database import, and the page server consumes only `LessonContextBoundary.getStatisticsRegistry`.
- Accepted-outcome surfaces covered: source inspection and the current browser matrix cover all `8 + 6 + 4` controls in both directions, `aria-sort` active state, alphabetical text, chronological dates, numeric percentages/counts, and Teacher first-rendered ordered class.
- Supported paths exercised: an independent isolated owned-server run of `node scripts/run-disposable-e2e.mjs --database tmp/ft-007-statistics.db --spec e2e/ft-007-statistics.spec.ts` passed (`1` Playwright test). It retained `study-calendar.db` at `356352:1787567348`, removed the exact disposable DB and all SQLite sidecars, and the spec proved equality of its `15` source/provider-table snapshots before and after all sorting interactions.
- Fresh independent co-review coverage: typed presentation semantics and boundary/isolation behavior were separately reviewed under the finding-adjudication pack; final judgment remains verifier-owned.

## Admitted findings
Only evidenced material breaks of an accepted outcome. Use `none` when no
finding is admitted.
- none

## Operator questions
Only questions required to judge a proved realistic material risk or accepted
outcome. Use `none` when no operator decision is required.
- none

## Verdict
SEMANTIC_VERDICT: semantic-pass

## Owner handoff
- Evidence/report paths: [functional verification](verification.md), [semantic report](../../.tasks/TASK-097-T3-FT-007-W31/TASK-097-T3-FT-007-W31-S-RED-VERIFY-final-report-docs-01.md), and the task-owned Attempt 1 browser-matrix evidence.
- Recommended owner action: scheduler may evaluate T3 closure obligations; this review changes no lifecycle, status, promotion, dependency, planning, or wave state.
- Resume route or `n/a`: scheduler-owned closure route; do not execute or promote TASK-098 from this review.
