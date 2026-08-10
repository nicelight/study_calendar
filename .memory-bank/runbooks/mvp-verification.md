---
description: Foundation and MVP verification path for the one-server shared-database deployment.
status: active
last_updated: 2026-08-08
source_of_truth:
  - .memory-bank/runbooks/mvp-verification.md
---
# MVP Verification Runbook

## Purpose

Provide the smallest reproducible proof path for the accepted modular monolith
before real center data is used. This runbook routes evidence; feature
acceptance criteria and the project testing strategy remain the owners of the
specific product assertions.

## Foundation smoke path

The Foundation queue must establish these project-native scripts and then use
them as the durable minimal path:

```text
npm run check
npm run build
npm run test
npm run dev -- --host 127.0.0.1
```

The current repository cannot run these commands yet because no application
package/runtime or test harness exists; that absence is the evidence for
`Foundation Required: true`, not a failure of this runbook.

The first smoke must prove, in one server process:

1. the SvelteKit entry path starts and serves one representative route;
2. the server reaches the one shared database through the configured adapter;
3. a migration/schema probe can create and read an isolated fixture;
4. an unauthenticated protected request is denied and an authenticated fixture
   reaches a module public boundary;
5. a failed probe leaves no partial fixture or binding state.

Record command output and the result in the Foundation task evidence; do not
promote this runbook into a product task or implementation plan here.

## Required pre-real-data checks

Run the following risk-based evidence groups after the Foundation smoke and
before operator acceptance:

| Risk | Minimum proof |
|---|---|
| Shared boundary/write leakage | Module boundary review plus a cross-slice integration path showing each owner writes only its state. |
| Privacy/access | Negative server-side matrix for unauthenticated, wrong center/class/student, removed teacher, and guessed personal context. |
| Provider binding | Telegram and Google success/failure, invitation reuse, duplicate identity, and no-partial-binding scenarios. |
| Scheduling/history | Recurring schedule, one-lesson transfer/cancel, stable lesson identity, assignment removal, and historical access. |
| Learning/finance | Both class modes, absent/no charge, absent-to-present correction, historical price, audit, deterministic replay, full/partial/excess payment. |
| Projection/UI | Date navigation, shared/personal context preservation, non-color state cue, marker placement across week/month boundaries, and marker non-mutation. |

Use the cheapest project-native check that proves each outcome. Do not add a
test category solely for coverage shape; follow
[.memory-bank/testing/strategy.md](../testing/strategy.md).

## Deployment smoke

- Start exactly one built SvelteKit server process.
- Point it at exactly one configured shared database.
- Confirm provider configuration is outbound-only and no provider response is a
  persisted source of truth.
- Exercise one authorized read and one denied read through the server.
- Confirm a financial marker changes only its presentation location and not
  Payment, allocation, or balance.

## Evidence and recovery

- Isolate fixtures from real data and clean them up after the run.
- For a failed transaction, inspect state-before/state-after and repeat the
  smallest failing scenario after correction.
- Store commands, logs, screenshots, and verdicts in the task-selected
  `.protocols/<TASK_ID>/` and `.tasks/<TASK_ID>/` paths, as required by the
  project testing policy.
- A failing applicable check is evidence to investigate; do not weaken the
  assertion or mark the path green without the required proof.
