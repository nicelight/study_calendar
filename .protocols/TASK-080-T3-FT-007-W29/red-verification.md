---
description: Current adversarial semantic verification for TASK-080-T3-FT-007-W29 Attempt 2.
status: final
---
# Red Verification — TASK-080-T3-FT-007-W29

## Semantic target

- Task outcome: `FT-007-AC-002 / REQ-014 / REQ-017`; protected bare `/home`
  and `/classes` expose only the currently server-authorized Admin, Teacher,
  Student, and Parent destinations. Student/Parent receive the complete C&S
  accessible-class list without caller-selected authorization.
- Accepted basis: the indexed TASK-080 card; FT-007-AC-002; Boundary Map
  Actor Context and Calendar/Membership Query boundaries; Access Control
  authority/scope; disposable-browser proof; and T3 tier obligations.
- Lifecycle was observed as `in_progress` and was not changed.

## Evidence and adversarial coverage

- Fresh functional `/verify` PASS was treated as supporting evidence only:
  `.protocols/TASK-080-T3-FT-007-W29/verification.md` and
  `.tasks/TASK-080-T3-FT-007-W29/verifier-attempt-2-functional-probe.md`.
  Attempt 2 RED/GREEN, execution evidence, handoff, and implementation report
  were inspected. Attempt 1 and the historical semantic-fail were retained as
  supporting history only and were not reused as current proof.
- Current implementation inspection covered
  `src/lib/server/modules/center-scheduling/public.ts:373-416` and
  `src/routes/home/destination.server.ts:96-145`. The provider resolves the
  Student/Parent class union from server-side center membership plus
  class-membership/parent-link facts and returns only C&S-owned
  `{ classId, centerId, name, mode }`; routes use request-local
  `event.locals.actor`, and `classId` only filters an already authorized
  provider result.
- Reviewer-owned repeated probes passed:
  `npm run test -- tests/center-scheduling/ft-007-accessible-class-list.test.ts`
  (`1` file / `1` test) and
  `npm run test -- tests/routes/ft-007-home-classes.test.ts` (`1` file / `13`
  tests). `git diff --check` passed for the reviewed change surface.
- Adversarial coverage included complete bare Student/Parent lists on both
  canonical routes, Admin own-center and Teacher assigned-class mappings,
  caller-supplied class filtering, anonymous/revoked/cross-center/
  non-member/removed-assignment denial, request-local actor use, provider and
  destination ownership, no route database access or writes, no profile or
  metric facts, and disposable browser isolation/cleanup from the fresh
  verifier evidence. Existing class/calendar destination loaders retain their
  own server scope checks.
- Two independent `Codex Luna` `xhigh` co-reviews were completed after one
  bounded recovery: Focus A (server authorization and capability boundary) and
  Focus B (canonical navigation integration and non-goals). Neither found an
  evidenced material reachable break.

## Admitted findings

- none

## Operator questions

- none

## Verdict

SEMANTIC_VERDICT: semantic-pass

## Owner handoff

- Evidence/report paths: this protocol; the current functional PASS/report;
  Attempt 2 RED/GREEN/execution evidence; the task card; and the inspected
  task-linked contracts/specs.
- Recommended scheduler action: the normal T3 closure decision is eligible
  after the existing functional PASS and this semantic PASS; keep lifecycle
  ownership with the scheduler and do not infer closure in this review.
- Resume route: scheduler/lifecycle owner; no `/exe`, `/verify`, `/mb-sync`,
  scheduler transition, task status change, or AUTONOMOUS-RUN edit was
  performed.
