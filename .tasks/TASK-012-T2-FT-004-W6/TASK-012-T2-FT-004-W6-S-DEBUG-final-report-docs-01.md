---
description: Read-only diagnosis of the terminal failure of TASK-012.
status: final
---
# Debug — TASK-012-T2-FT-004-W6

## Symptom and reproduction

The current execution attempt was bounded retry 1 / Attempt 2. The original
threading behavior was functionally green, but the feature-level semantic probe
found a real center-lifecycle privacy defect: after supported class identity
reuse, retained center-A comments, reactions, messages, branches, tabs, and
attributable identities were visible or mutable from center B.

Attempt 2 reproduced that vector before correction, then passed after adding
current-center constraints. Evidence:

- `.tasks/FT-004/FT-004-S-RED-VERIFY-final-report-docs-01.md`
- `.tasks/TASK-012-T2-FT-004-W6/execution-evidence.md#attempt-2--bounded-correction-red`
- `.tasks/TASK-012-T2-FT-004-W6/TASK-012-T2-FT-004-W6-S-VERIFY-final-report-docs-02.md`

## Attempt and change surface

- Current attempt: bounded retry 1 / Attempt 2.
- Production correction surface: `src/lib/server/modules/collaboration/public.ts`
  and `src/lib/server/platform/database.ts`.
- Focused regression: `tests/collaboration/center-lifecycle-isolation.test.ts`.
- The diagnosis is read-only; no implementation, lifecycle, or scheduler state
  was changed.

## Root cause and first violated invariant

The initial Collaboration implementation persisted `center_id`, but affected
reads, target checks, mutations, uniqueness checks, and branch/tab projections
did not consistently constrain results by the current server-resolved center.
When a supported class/schedule identity was recreated in another center, old
rows therefore remained reachable through the new center context.

The first violated invariant was the protected Collaboration scope boundary:
cross-center reads and mutations must be denied without existence or identity
leakage while retained prior-center rows remain unchanged. This was a real
implementation defect, not a test-only failure.

The task then failed for a second, workflow-level reason: correcting this
privacy/authorization behavior is T3 under
`.memory-bank/workflows/tier-policy.md:16-20`, while TASK-012 is permanently
indexed as T2. The fresh Attempt 2 verifier therefore returned
`NEEDS-CLARIFICATION` even though the corrected behavior and all gates passed.
The lifecycle owner correctly marked the T2 record terminal `failed` and
superseded it rather than closing a security-sensitive correction under T2.

## Minimum correction

No direct TASK-012 retry is needed. The minimum safe correction was to split the
T3 privacy/lifecycle work into fresh owners:

- `TASK-016-T3-FT-004-W6` for comments and reactions;
- `TASK-017-T3-FT-004-W6` for threaded discussions and tabs.

Both are `done` with fresh functional PASS and semantic-pass evidence, and the
current FT-004 feature semantic gate is `semantic-pass`. TASK-012 should remain
historical `failed`/`superseded`.

## Regression check

Use the replacement T3 probes: recreate a supported class identity across
centers, assert old comments/reactions/messages/branches/tabs/authors/reactors
are neither projected nor mutable, and separately assert arbitrary-depth
replies, first-reply tab activation, ten-tab ordering, retention, and
reactivation. TASK-016 and TASK-017 recorded these checks plus project gates.

## Recurrence

`no_prior_evidence` within the inspected TASK-012 history, FT-004 correction
reports, and replacement-task evidence. The report shows one confirmed
center-scope mechanism and its correction; no earlier independent failure with
the same causal mechanism was needed to explain this terminal disposition, so no
new recurrence guardrail is admitted here.

## Residual uncertainty and next owner

No material uncertainty remains for the original task-owned behavior or its
replacement. The historical T2 failure is a lifecycle/tier record, not a live
threading defect. TASK-016, TASK-017, and the FT-004 feature gate own the
current proof; no owner action is required against TASK-012 itself.

DIAGNOSIS: CONFIRMED
