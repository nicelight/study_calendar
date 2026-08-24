---
description: Current adversarial semantic verification for TASK-089-T3-FT-007-W29 Attempt 1.
status: final
---
# Red Verification — TASK-089-T3-FT-007-W29

## Semantic target

- Task outcome: `FT-007-AC-006 / REQ-014 / REQ-017`; Learning Progress returns
  authorized numeric attendance percentages over conducted student/lesson
  slots, including default-present, explicit absence, correction, and assigned
  Teacher aggregation, without changing attendance or financial facts.
- Accepted boundary: actor identity comes from Identity & Access; current
  class, membership, assignment, and conducted-lesson scope comes through the
  Calendar and Membership Query Boundary; Learning Progress owns attendance
  facts and this aggregate; Lesson Context/routes and C&S persistence remain
  outside the task.
- Lifecycle was observed as `in_progress` and was not changed.

## Evidence and adversarial coverage

- The authoritative task card, FT-007-AC-006, the Statistics Projection
  attendance contract, Actor Context, Calendar and Membership, Personal
  Progress, Access Control, Learning/finance lifecycle, and applicable T3
  tier/closure rules were inspected.
- Fresh functional `/verify` `PASS` was treated as supporting evidence only:
  `.protocols/TASK-089-T3-FT-007-W29/verification.md` and
  `.tasks/TASK-089-T3-FT-007-W29/TASK-089-T3-FT-007-W29-S-VERIFY-final-report-docs-01.md`.
  Attempt 1 RED/GREEN, execution evidence, protocol handoff, and implementation
  report were inspected and retained as supporting history.
- Current source inspection covered
  `src/lib/server/modules/learning-progress/public.ts:279-345` and
  `:617-655`. The query resolves the actor, obtains authorization through C&S
  public seams, filters C&S lessons to `completed`, aggregates only
  Learning Progress attendance rows, and has no direct C&S persistence access.
  C&S authorization is re-evaluated for each caller-supplied class lookup;
  caller input does not substitute for server-side scope.
- Focus A covered conducted-only numerator/denominator, default-present and
  explicit absence, correction on the next read, no-slot `0`, Student/Teacher
  scope, anonymous/revoked/private/unassigned/cross-center/removed-assignment
  denial, and read isolation. Focus B covered Actor Context/C&S/Personal
  Progress ownership, anti-goals and forbidden scope, direct-table bypass,
  non-mutation, disposable state, and claim/evidence integrity.
- The preserved stalled verifier artifacts
  `.tasks/TASK-089-T3-FT-007-W29/verifier-owned-probe.test.ts` and
  `verifier-owned-probe-attempt-2.test.ts`, plus the fresh final verifier
  probe, were read. Their observations were not promoted as a semantic
  verdict; the fresh probe provides independent current-state support with a
  new `:memory:` fixture and state-before/state-after checks.
- Each required `Codex Luna` `xhigh` co-review launch was attempted and retried
  once. Both retries were rejected by the provider because that model is not
  supported for the current ChatGPT account. The bounded local completion of
  both independent focuses found no evidence-backed candidate finding.

## Admitted findings

- none

## Operator questions

- none

## Verdict

SEMANTIC_VERDICT: semantic-pass

## Owner handoff

- Evidence/report paths: this protocol, the current functional PASS report and
  verification handoff, Attempt 1 RED/GREEN/execution evidence, the preserved
  verifier probes, the authoritative task card, and the direct task-linked
  canonical contracts listed above.
- Recommended owner action: scheduler/lifecycle owner may evaluate the normal
  T3 closure route using the current functional PASS plus this semantic PASS;
  retain lifecycle ownership outside this review.
- Resume route or `n/a`: `n/a`; no implementation, task card, lifecycle,
  scheduler checkpoint, queue/dependent, spec, or `/mb-sync` state was changed.
