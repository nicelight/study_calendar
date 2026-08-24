# Technical-debt advisory — Wave W29

Date: 2026-08-22
Review mode: advisory only; no implementation, lifecycle, queue, checkpoint, or
planning state is changed by this report.

## Checked scope

Only the completed FT-007 W29 boundary was reviewed:

- `TASK-080-T3-FT-007-W29`: C&S-owned accessible-class enumeration, shared
  Home/Classes destination loading and presentation, route tests, and
  disposable browser proof;
- `TASK-089-T3-FT-007-W29`: Learning Progress conducted-lesson attendance
  projection and its isolated provider proof;
- `TASK-090-T3-FT-007-W29`: Financial Ledger factual payment-capability
  projection and its isolated provider proof;
- the three indexed task cards, execution evidence, functional and semantic
  verification, preserved retry/stall/fixture history, W29 MB-SYNC handoff, and
  scheduler-owned post-sync lint/strict-doctor evidence.

The actual production/test surface checked was:

- `src/lib/server/modules/center-scheduling/public.ts:373-416`,
  `src/routes/home/destination.server.ts:1-146`, the Home/Classes route and
  shared presentation modules, `tests/center-scheduling/ft-007-accessible-class-list.test.ts`,
  `tests/routes/ft-007-home-classes.test.ts`, and
  `e2e/ft-007-home-classes.spec.ts`;
- `src/lib/server/modules/learning-progress/public.ts:279-345,617-655` and
  `tests/learning-progress/ft-007-attendance-projection.test.ts`;
- `src/lib/server/modules/financial-ledger/public.ts:548-593,792-812` and
  `tests/financial-ledger/ft-007-payment-capability.test.ts`.

The review did not widen to W27/W28 implementation, W30/W31 planned work, or a
repository-wide audit.

## Evidence reviewed

- Authoritative cards:
  `.memory-bank/tasks/TASK-080-T3-FT-007-W29.task.json`,
  `.memory-bank/tasks/TASK-089-T3-FT-007-W29.task.json`, and
  `.memory-bank/tasks/TASK-090-T3-FT-007-W29.task.json` (`status: done`).
- Current task evidence under `.protocols/TASK-080-T3-FT-007-W29/`,
  `.protocols/TASK-089-T3-FT-007-W29/`,
  `.protocols/TASK-090-T3-FT-007-W29/`, and the corresponding `.tasks/`
  directories. Each current functional protocol contains `VERDICT: PASS`; each
  current semantic protocol contains `SEMANTIC_VERDICT: semantic-pass`.
- W29 reconciliation:
  `.tasks/TASK-090-T3-FT-007-W29/TASK-090-T3-FT-007-W29-S-MB-SYNC-final-report-docs-01.md:7-61`.
  It confirms all three closures and preserves historical failures without
  treating them as current outcomes.
- Post-sync gates:
  `.protocols/AUTONOMOUS-RUN/decision-log.md:1532-1545` and
  `.protocols/AUTONOMOUS-RUN/status.md:34-43`: `mb-lint` passed 74 files and
  strict doctor returned `status: pass`, 0 errors, 1 expected promotion warning,
  and 2 info.

## Confirmed findings

### TD-W29-01 — MEDIUM: canonical bare-route completeness reached proof only after functional PASS

TASK-080 Attempt 1 reached executor GREEN and independent functional `PASS`,
but the subsequent semantic gate proved a HIGH behavior gap: authorized Student
and Parent requests succeeded only with a caller-supplied `classId`, while bare
`/home` and `/classes` returned `403`
(`.protocols/AUTONOMOUS-RUN/decision-log.md:1230-1247`). The preserved
adversarial probe demonstrates the exact mechanism on both routes
(`.tasks/TASK-080-T3-FT-007-W29/semantic-navigation-probe.test.ts:72-85`).

The gap forced a feature-doctor route, task-plan and public-boundary
reconciliation, fresh plan review and strict readiness, then a second
RED/GREEN implementation and complete verification cycle
(`.protocols/AUTONOMOUS-RUN/decision-log.md:1251-1274` and
`.tasks/TASK-080-T3-FT-007-W29/execution-evidence.md:25-40,107-117`). This is
material repeated change and regression-proof cost, not merely a historical
style issue.

The current implementation is corrected: C&S enumerates the complete
server-authorized class list, and an optional `classId` only filters that list
(`src/routes/home/destination.server.ts:96-145`). Current route and browser
tests exercise bare Student/Parent access to both classes
(`tests/routes/ft-007-home-classes.test.ts:182-207` and
`e2e/ft-007-home-classes.spec.ts:109-137`), so no current behavior defect is
claimed.

Smallest remediation direction: retain complete bare Student/Parent
destination enumeration as a first-class claim-level GREEN assertion whenever
the Home/Classes loader or C&S accessible-class query changes. Do not reduce
the proof to query-qualified navigation or broad check/test/build gates.

### TD-W29-02 — MEDIUM: verifier finalization stalled twice after successful proof and gates

Two separate TASK-089 Reviewer sessions completed disposable probes and broad
quality gates but then remained blocked in `ep_poll/futex` or `futex` without
writing the mandatory durable verdict. The second stall occurred at the
required co-review handoff, and the repeated condition forced
`HALT_QUALITY_GATES` plus recovery-first Judge handling
(`.protocols/AUTONOMOUS-RUN/decision-log.md:1388-1415`). This is an observable
verification-reliability mechanism: successful evidence had to be reproduced
and reconciled before the queue could continue.

The eventual verifier also records that every attempted `Codex Luna` `xhigh`
co-review was rejected because that model is unsupported for the current
account, after which the bounded local recovery completed
(`.protocols/TASK-089-T3-FT-007-W29/verification.md:81-97,109-135`). The
available evidence does not prove that model rejection caused both futex
stalls, so that causal link is not asserted. It does prove that model
availability and verdict-finalization paths are currently unreliable together
in this runtime.

Smallest remediation direction: preflight the required co-review capability and
take the existing bounded local recovery immediately when it is unavailable;
ensure timeout/interruption and provider-rejection exits always write an
explicit durable terminal handoff instead of leaving successful probes without
a verdict. No task replay or new workflow state is proposed by this report.

## Non-findings and uncertainty

- No material technical debt was confirmed in the current W29 production
  formulas, authorization paths, ownership boundaries, state isolation, or
  disposal behavior. TASK-080 Attempt 2, TASK-089, and TASK-090 all have current
  independent functional and semantic evidence covering their accepted claims.
- TASK-090's first verifier-owned fixture failed during setup and was corrected
  without changing production behavior
  (`.protocols/TASK-090-T3-FT-007-W29/verification.md:83-90`). One isolated
  fixture mistake does not establish a separate material debt mechanism.
- The review did not infer debt from module/file size, sibling-route sharing,
  coverage percentage, or existing advisory Memory Bank metadata warnings;
  the inspected evidence does not show a separate material impact for those
  observations.

This report is advisory and does not block, repair, promote, close, or route any
task, feature, requirement, checkpoint, or queue state.
