---
description: Fresh independent adversarial semantic verification for TASK-015-T3-FT-001-W2.
status: active
---
# Red Verification — TASK-015-T3-FT-001-W2

## Semantic target

- Accepted outcome: only the server-authorized Center & Scheduling
  `provisionAccount` path may reach the Identity & Access account-plus-
  invitation writer; account and invitation writes remain atomic.
- Direct basis: task card, `FT-001-AC-003`, `FT-001-AC-005`, Account
  Provisioning Boundary, Access Control Contract, system architecture,
  core-domain transaction rules, lifecycle access rules, and T3 policy.

## Evidence and adversarial coverage

- Fresh functional `/verify` is `PASS` in the current attempt and was treated
  as supporting context for this separate semantic gate.
- Inspected the actual retry-2 change surface and current tests. The public
  composition root exposes `identityAccess` and `centerScheduling`; only C&S
  receives the internal Identity & Access writer.
- Inspected the C&S command order: it resolves the actor and checks membership
  plus `admin` role before invoking the writer. The writer inserts account and
  invitation inside one database transaction.
- Inspected the public Identity & Access surface and repository references:
  `provisionAccount` is absent from `IdentityAccessBoundary`; only the C&S
  command and internal writer remain. Focused adversarial tests prove the
  runtime public bypass is unavailable and state remains unchanged.
- Hostile supported-path coverage found no material break across unauthorized
  actors, cross-center scope, alternate command absence, valid provisioning,
  duplicate rollback, reuse/expiry rejection, and provider duplicate/failure
  rollback. No direct database or privileged-storage mutation was needed.

## Admitted findings

None.

## Operator questions

None. The accepted public-boundary and authorization order are unambiguous.

## Verdict

SEMANTIC_VERDICT: semantic-pass

## Owner handoff

- Evidence/report paths: this protocol and
  `.tasks/TASK-015-T3-FT-001-W2/TASK-015-T3-FT-001-W2-S-RED-VERIFY-final-report-docs-02.md`.
- Recommended owner action: record the functional and semantic PASS results
  for lifecycle evaluation; do not infer or perform lifecycle closure here.
- Resume route: lifecycle owner/scheduler; no implementation, task status, or
  execution handoff mutation was made by this review.

