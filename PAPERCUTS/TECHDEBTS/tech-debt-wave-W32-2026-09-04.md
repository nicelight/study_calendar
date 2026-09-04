# Technical-debt advisory — Wave W32

Date: 2026-09-04
Review mode: fresh bounded Reviewer advisory. This report changes no
implementation, tests, task or product lifecycle, scheduler checkpoint,
verification artifact, route, gate, verdict, Judge state, or debt lifecycle.

## Review disposition

- verdict: `APPROVE` for scheduler continuation; this advisory cannot block or
  route workflow state;
- material findings: one `MEDIUM`;
- finding scope: inconsistent monetary lower-bound validation across the W32
  browser and Financial Ledger boundary.

## Exact checked scope

The review was limited to wave W32 and its single indexed task,
`TASK-099-T3-FT-006-W32`. It resolved the task through the authoritative card,
the actual combined Attempt 1 plus Attempt 2 change, the current functional and
semantic evidence, scheduler closure evidence, and the W32 `/mb-sync` routes.
It did not widen to W33/W34 implementation or a repository-wide audit.

The complete task-listed production/test surface checked was:

- `src/lib/server/modules/financial-ledger/public.ts`;
- `src/routes/admin/[centerId]/+page.svelte`;
- `src/routes/admin/[centerId]/finance/+page.server.ts`;
- `src/routes/admin/[centerId]/finance/+page.svelte`;
- `src/routes/lesson-context/+page.server.ts`;
- `src/routes/lesson-context/+page.svelte`;
- `tests/financial-ledger/price-settings.test.ts`;
- `tests/routes/admin-finance.test.ts`;
- `tests/routes/lesson-context-payment-default.test.ts`;
- `e2e/ft-006-admin-pricing.spec.ts`.

The exact durable W32 synchronization surface checked was
`.memory-bank/features/FT-006-financial-ledger.md`,
`.memory-bank/epics/EP-005-financial-ledger.md`,
`.memory-bank/requirements.md`,
`.memory-bank/tasks/plans/IMPL-FT-006.md`,
`.protocols/FT-006/plan.md`, and `.memory-bank/changelog.md`. The task-index
mapping and the current W32 sections of `.protocols/AUTONOMOUS-RUN/status.md`
and `decision-log.md` were inspected as adjacent closure/routing evidence but
were not treated as `/mb-sync`-authored durable product routes.

## Evidence and precise locations

- Authoritative card and hard surface:
  `.memory-bank/tasks/TASK-099-T3-FT-006-W32.task.json:2-29,31-88,90-139`.
- Actual implementation baseline and correction: commit `f2842fa` plus the
  current W32 worktree diff for the ten task-listed files. Attempt 1 and Attempt
  2 receipts are under `.tasks/TASK-099-T3-FT-006-W32/`, including
  `TASK-099-T3-FT-006-W32-S-EXE-final-report-code-02.md:8-62` and
  `attempt-2-green.md:1-73`.
- Current independent evidence:
  `.protocols/TASK-099-T3-FT-006-W32/verification.md:5-130` records functional
  `PASS`; `.protocols/TASK-099-T3-FT-006-W32/red-verification.md:5-74` records
  `semantic-pass`.
- Accepted exactness behavior:
  `.memory-bank/features/FT-006-financial-ledger.md:35-40,115-134` requires the
  supported browser amount inputs not to narrow Financial Ledger's exact
  decimal values; `.memory-bank/contracts/financial-ledger.md:22-45,68-90`
  defines exact decimal-safe Ledger behavior and the Admin/default surfaces.
- Server validation:
  `src/lib/server/modules/financial-ledger/public.ts:1319-1329` accepts every
  syntactically valid non-zero positive decimal, including `0.001`.
- Browser validation:
  `src/routes/admin/[centerId]/finance/+page.svelte:80-108` and
  `src/routes/lesson-context/+page.svelte:220-232` independently set
  `min="0.01"` on all three supported amount inputs.
- Regression boundary:
  `e2e/ft-006-admin-pricing.spec.ts:106-150` proves `10.125` and `15.125`, but
  does not exercise the lower-bound disagreement;
  `tests/routes/lesson-context-payment-default.test.ts:92-100` positively
  snapshots the independent `min="0.01"` browser rule.
- Read-only reproduction: a headless Chromium input with the production
  attributes `type=number min=0.01 step=any required value=0.001` returned
  `{valid:false, rangeUnderflow:true, stepMismatch:false, formValid:false}`.
  The exact Ledger predicate and normalization at `public.ts:1319-1329`
  returned `{ok:true, normalized:"0.001", positive:true}` for the same value.
- W32 reconciliation:
  `.tasks/TASK-099-T3-FT-006-W32/TASK-099-T3-FT-006-W32-S-MB-SYNC-final-report-docs-01.md:8-69`,
  `.memory-bank/features/FT-006-financial-ledger.md:408-431`,
  `.memory-bank/epics/EP-005-financial-ledger.md:30-41`,
  `.memory-bank/requirements.md:181-198`,
  `.memory-bank/tasks/plans/IMPL-FT-006.md:157-168`,
  `.protocols/FT-006/plan.md:105-115`, and
  `.memory-bank/changelog.md:7-21` agree on TASK-099 `done`, current functional
  and semantic evidence, TASK-100/TASK-101 `planned`, and FT-006 `planned`.

## Confirmed findings

### TD-W32-01 — MEDIUM: browser and Ledger independently define incompatible valid monetary ranges

The W32 correction changed three amount inputs from `step="0.01"` to
`step="any"`, resolving the confirmed higher-precision rejection for values
such as `10.125`. The same inputs still carry an independent
`min="0.01"`, while Financial Ledger accepts every positive exact decimal.
Consequently `0.001` is a valid Ledger value but cannot be submitted through
any of the three supported W32 browser inputs. This is an observed validation
contract split, not a style preference or a coverage-percentage concern.

The repeated-change cost is also evidenced within W32: the first browser rule
already diverged from Ledger precision and required F-001 clarification, a
second implementation attempt, renewed browser evidence, and fresh functional
and semantic review
(`.memory-bank/features/FT-006-financial-ledger.md:382-406` and
`.protocols/TASK-099-T3-FT-006-W32/red-verification.md:35-50`). The remaining
lower-bound split leaves the same regression mechanism active.

Practical impact: one accepted entry path rejects values that the owning
financial boundary accepts, while non-browser callers can persist them. This
creates channel-dependent financial behavior and makes future validation
changes require coordinated edits and proof across three inputs, route tests,
browser tests, and the Ledger boundary. Priority is `MEDIUM`: the mismatch is
reproducible on a financial correctness surface, but the inspected evidence
does not show that sub-cent amounts occur in current center usage.

Smallest remediation direction: at a future authorized product/task boundary,
decide and state one minimum-amount invariant, then align the Ledger predicate
and all three browser attributes to it and add one boundary case that exercises
the same value through browser and Ledger. Reuse the existing task-owned route
and Playwright patterns; no validation framework or new abstraction is
justified by this finding.

## Uncertainty and non-findings

- The evidence does not establish whether the intended business minimum is
  `0.01` or merely `> 0`. That owner decision determines which side changes;
  it does not remove the confirmed current mismatch.
- The Admin finance load performs two authorized Ledger queries per class and
  renders complete append-only history. No observed class/history scale,
  latency, or reliability failure was present in the checked evidence, so this
  was not admitted as debt.
- The known non-authoritative receipt typo omitting `-W32` is already recorded
  at `PAPERCUTS/gpt-5.6-sol __ 09-04-2026 20.30.md`; all authoritative W32
  routes use the correct path. It is not a material technical-debt finding.
- No material debt was confirmed in Financial Ledger ownership,
  authorization/scope checks, append-only history, future-charge selection,
  historical-charge immutability, disposable E2E isolation, or the W32 durable
  lifecycle/evidence routes.

This report is advisory only. It does not reopen TASK-099, alter its accepted
verdicts, or change any task, feature, requirement, epic, scheduler, Judge,
gate, checkpoint, or route state.
