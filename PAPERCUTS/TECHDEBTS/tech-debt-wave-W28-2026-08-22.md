# Technical-debt advisory — Wave W28

Date: 2026-08-22
Review mode: advisory only; no closure, lifecycle, promotion, selection, or checkpoint decision.

## Checked scope

Only the completed FT-007 W28 boundary was reviewed:

- `TASK-079-T3-FT-007-W28`: protected shell, logout integration, disposable
  browser runner, Playwright mode selection, and their focused tests.
- `TASK-095-T3-FT-007-W28`: Center & Scheduling registry-facts provider and
  its focused boundary test.
- `TASK-094-T3-FT-007-W27`: predecessor profile boundary only where it
  overlaps the current FT-007 ownership/evidence surface.
- Preserved attempt/retry/failure artifacts, W27/W28 sync evidence, current
  FT-007 feature/plan boundary, and the read-only W28
  `.protocols/AUTONOMOUS-RUN/status.md` checkpoint.

The review did not expand to W29+ implementation surfaces or repository-wide
debt.

## Evidence reviewed

- Task cards: `.memory-bank/tasks/TASK-079-T3-FT-007-W28.task.json`,
  `TASK-094-T3-FT-007-W27.task.json`, and
  `TASK-095-T3-FT-007-W28.task.json`.
- Current FT-007 boundary and sequencing:
  `.memory-bank/features/FT-007-navigation-and-statistics.md:198-229` and
  `.memory-bank/tasks/plans/IMPL-FT-007.md:49-109`.
- TASK-079 failure/retry history and current verification:
  `.tasks/TASK-079-T3-FT-007-W28/TASK-079-T3-FT-007-W28-S-VERIFY-final-report-docs-01.md:34-70`,
  `.tasks/TASK-079-T3-FT-007-W28/TASK-079-T3-FT-007-W28-S-VERIFY-RETRY-final-report-docs-02.md:36-80`,
  and `.tasks/TASK-079-T3-FT-007-W28/TASK-079-T3-FT-007-W28-S-VERIFY-final-report-docs-03.md:18-68`.
- TASK-095 boundary failure and corrected verification:
  `.tasks/TASK-095-T3-FT-007-W28/TASK-095-T3-FT-007-W28-S-VERIFY-final-report-docs-01.md:7-29`
  and `.tasks/TASK-095-T3-FT-007-W28/TASK-095-T3-FT-007-W28-S-VERIFY-RETRY-final-report-docs-03.md:34-127`.
- TASK-094 independent evidence and executor-proof gaps:
  `.tasks/TASK-094-T3-FT-007-W27/verification-evidence.md:59-105`.
- W28 sync and caller-owned gate/checkpoint evidence:
  `.tasks/TASK-095-T3-FT-007-W28/TASK-095-T3-FT-007-W28-S-MB-SYNC-final-report-docs-01.md:17-68`
  and `.protocols/AUTONOMOUS-RUN/status.md:16-24,68-73`.
- Current implementation/test surfaces:
  `scripts/run-disposable-e2e.mjs:73-85,133-143`,
  `playwright.config.ts:16-43`,
  `tests/scripts/run-disposable-e2e.test.ts:58-106`,
  `src/lib/server/modules/center-scheduling/public.ts:309-364,932-1065`,
  and `tests/center-scheduling/ft-007-registry-facts.test.ts:110-221`.

## Confirmed findings and recurrence risks

### TD-W28-01 — MEDIUM: dual-mode disposable E2E proof has a costly regression surface

The disposable runner spans path validation, four SQLite sidecar cleanup
paths, environment-based Playwright mode selection, server reuse, and the
ordinary real-database smoke contract. Independent verification found two
different material defects after executor GREEN: failure cleanup left
`-journal` (`.tasks/TASK-079-T3-FT-007-W28/TASK-079-T3-FT-007-W28-S-VERIFY-final-report-docs-01.md:34-38,66-70`), then ordinary
`npm run e2e -- --list` selected the disposable-only spec
(`.tasks/TASK-079-T3-FT-007-W28/TASK-079-T3-FT-007-W28-S-VERIFY-RETRY-final-report-docs-02.md:51-64`). TASK-079 consumed the initial
attempt plus two bounded retries (`.protocols/AUTONOMOUS-RUN/status.md:68-70`).

The current Attempt 3 evidence passes: exact ordinary/disposable selection,
all four sidecar cleanup paths, unchanged `study-calendar.db`, and four
sequential owned runs (`.tasks/TASK-079-T3-FT-007-W28/TASK-079-T3-FT-007-W28-S-VERIFY-final-report-docs-03.md:20-46`). The debt is
therefore a recurrence risk, not a current cleanup or selection failure.
It matters because the accepted FT-007 plan explicitly reuses this runner for
later browser tasks (`.memory-bank/tasks/plans/IMPL-FT-007.md:74-78,103-109`):
a regression can either contaminate disposable state or widen an ordinary
real-database run.

Smallest remediation direction: retain the existing exact selection and
four-sidecar failure tests as the canonical guard for any runner/config change,
and keep later browser-task reuse behind the same explicit disposable mode.
No new task or workflow change is proposed here.

### TD-W28-02 — MEDIUM: C&S provider-boundary correctness was detected only after GREEN

TASK-095 initially passed functional probes and native gates while violating
two direct boundary rules: provider-side `resolveActor` and a direct
`accounts.role` read/join. The independent report records the exact locations
and HIGH findings at `src/lib/server/modules/center-scheduling/public.ts:310-313`
and `:988-1008` (`.tasks/TASK-095-T3-FT-007-W28/TASK-095-T3-FT-007-W28-S-VERIFY-final-report-docs-01.md:14-29`).
This required the Judge REDIRECT and a bounded retry.

The current implementation is corrected: `getRegistryFacts` receives a
server-resolved `ActorContext`
(`src/lib/server/modules/center-scheduling/public.ts:309-364`), registry
helpers read only C&S-owned structural tables
(`src/lib/server/modules/center-scheduling/public.ts:932-1005`), and the focused test
uses pre-resolved actors plus throwing Identity & Access spies
(`tests/center-scheduling/ft-007-registry-facts.test.ts:110-124,205-220`).
The retry verifier independently confirmed the exact projection, no-neighbor
calls, no `accounts` access, and non-mutation (`.tasks/TASK-095-T3-FT-007-W28/TASK-095-T3-FT-007-W28-S-VERIFY-RETRY-final-report-docs-03.md:50-86`).

The remaining risk is boundary drift when another registry read is added to the
same C&S public surface, which also contains existing Identity & Access-backed
provisioning methods. Smallest remediation direction: preserve the caller-
resolved `ActorContext` signature and the throwing-port/source-boundary checks
as the local proof pattern for subsequent provider additions; do not infer a
module split from this report.

### TD-W28-03 — MEDIUM: claim proof is repeatedly strengthened late in the pipeline

Across the W27/W28 boundary, broad native gates did not cover all material
claim edges early enough. TASK-094's independent verifier had to add explicit
timestamp-immutability and wrapper-rollback coverage after identifying gaps in
the executor matrix (`.tasks/TASK-094-T3-FT-007-W27/verification-evidence.md:99-105`).
TASK-079 then required two independent correction cycles, and TASK-095 required
an independent boundary correction, despite passing check/test/build/lint/
strict-doctor gates in the earlier attempts. Executor receipts were repeatedly
not reusable because the evidence was broad and the shared worktree was dirty
(`.tasks/TASK-095-T3-FT-007-W28/TASK-095-T3-FT-007-W28-S-VERIFY-RETRY-final-report-docs-03.md:90-106`).

Impact is measurable in repeated focused probes, full gate reruns, and consumed
retry budget before the wave could reach its current PASS evidence. Smallest
remediation direction: make the claim-specific edge probe the first-class
GREEN artifact before relying on broad native gates—especially failure cleanup,
no-neighbor ownership, exact projections, and atomicity/immutability—while
keeping the existing independent Reviewer route.

## Gate and uncertainty notes

- Current W28 functional/semantic/Judge evidence is reconciled by the W28 sync
  as PASS / `semantic-pass` / SUPPORT; this report does not reinterpret or
  change that state (`.tasks/TASK-095-T3-FT-007-W28/TASK-095-T3-FT-007-W28-S-MB-SYNC-final-report-docs-01.md:19-33`).
- Caller-owned post-sync `mb-lint` and strict doctor passed in the checkpoint;
  the recorded result is `mb-lint: 5 warnings`; strict doctor: `0 errors`,
  `0 warnings`, `2 info`
  (`.protocols/AUTONOMOUS-RUN/status.md:16-24`). Task-level evidence separately
  records `mb-lint` as passing with pre-existing advisory metadata warnings and
  strict doctor as `0 errors / 0 warnings / 2 info`. No warning is mapped to a
  W28 implementation or FT-007 contract defect, so none is admitted as debt.
- TASK-094 and TASK-095 both touch
  `src/lib/server/modules/center-scheduling/public.ts`, and the evidence
  confirms shared dirty-worktree/no-reuse cost. That is recorded above as
  contributing context to TD-W28-03, not as a separate production coupling
  finding: the reviewed evidence does not establish a functional defect or
  justify a speculative refactor.

No implementation, task record, lifecycle, promotion/selection state,
AUTONOMOUS-RUN checkpoint, or follow-up task was created or changed.
