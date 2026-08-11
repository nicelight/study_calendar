---
description: Fresh independent semantic planning review for FT-001 W9.
status: active
---
# Review FT-001

REVIEWED_PLANNING_REVISION: 2
VERDICT: REJECT

FINDINGS:

1. BLOCKER — `TASK-019-T3-FT-001-W9` is a T3 material authentication/security
   task (`REQ-001/002/014`) whose provider/session proof has no exact
   `FT-001-AC-*` locator in `source_artifacts` or `evidence_required`; the two
   evidence items also use descriptive names instead of resolving claim or
   canonical-obligation locators. This violates the prospective material-NFR
   and claim-linked evidence rules in
   `.memory-bank/workflows/tier-policy.md#task-scoped-acceptance-evidence` and
   `#claim-linked-red--green-for-t2t3`. Repair owner: `/feature-to-tasks FT-001`.

2. HIGH — `TASK-020-T3-FT-001-W9` AC-006 evidence checks only an
   `HttpOnly/SameSite` cookie. It does not make the canonical
   `foundation_session` contract's `Path=/`, exact `SameSite=Lax`, and
   HTTPS-only `Secure` condition a decisive RED/GREEN comparison. The missing
   proof is in `.memory-bank/contracts/authentication-transport.md#session-issuance-and-revocation`.
   Repair owner: `/feature-to-tasks FT-001`.

3. HIGH — `TASK-020-T3-FT-001-W9` AC-007 evidence does not explicitly prove
   that invitation capability remains server-bound through authentication state
   and rejects callback state mismatch/tampering, although that is required by
   `.memory-bank/contracts/authentication-transport.md#browser-api-path` and
   `#invitation-acceptance-path`. Repair owner: `/feature-to-tasks FT-001`.

TASKS_REVIEWED: `TASK-019-T3-FT-001-W9`, `TASK-020-T3-FT-001-W9`,
`TASK-021-T3-FT-001-W9`; preserved context `TASK-003-T3-FT-001-W2` (failed),
`TASK-004-T3-FT-001-W3` (done), `TASK-015-T3-FT-001-W2` (done), and Foundation
`TASK-001/002` (done).

VALIDATION: Planning Revision 2 is positive; task index resolves 21 unique IDs;
the dependency graph is acyclic and all dependencies resolve; all W9 tasks are
T3/W9/planned with complete schema fields, direct auth transport/provider,
access-control, boundary, domain/state, testing, and tier-policy routes. FT-001
AC-001..008 have current owners `TASK-004/015/020/021`. Local bounded
architecture review: APPROVE. No current code, lifecycle status, or historical
verification/evidence was modified.

SECURITY_RISKS: Provider normalization, server-only verification, no dev-login
bypass, session/invite/Admin server authorization, and no direct route/UI writes
are normatively prohibited and represented in the cards; execution is unsafe to
start until the three proof gaps above are reconciled.

NEXT_STEP: Reconcile with `/feature-to-tasks FT-001`, then rerun
`/review-tasks-plan FT-001`; after approval, use the conditional T3
`/mb-doctor` gate before execution.
