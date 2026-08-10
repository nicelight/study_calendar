---
description: Standalone adversarial semantic report for TASK-015-T3-FT-001-W2.
status: final
---
# Semantic Verification — TASK-015-T3-FT-001-W2

## verdict:

REQUEST_CHANGES — the current implementation has an unprotected public provisioning write.

## findings:

- **HIGH:** `CompositionRoot.identityAccess` exposes `IdentityAccessBoundary.provisionAccount` directly. That public method performs the atomic account+invitation insert but has no actor/session, own-center membership, or Admin authorization check. A direct typed caller can create an arbitrary role-bearing account and invitation without passing through `CenterSchedulingBoundary.provisionAccount`; the focused tests cover only the latter path.

## evidence_checked:

- Current task card and direct task-linked Account Provisioning, Access Control, domain, lifecycle, architecture, testing, and T3 policy inputs.
- Durable functional PASS: `.protocols/TASK-015-T3-FT-001-W2/verification.md:16-25`.
- Current implementation: `src/lib/server/composition-root.ts:6-22`, `src/lib/server/modules/identity-access/public.ts:53-64`, `src/lib/server/modules/center-scheduling/public.ts:29-40`.
- Current focused evidence: `tests/identity-access/provisioning.test.ts:35-113`; it proves the authorized wrapper, rollback, reuse, and expiry cases, plus absence of `createAccount`/`issueInvitation`, but not direct provider-boundary access.

## risks_or_questions:

- No operator question; this is a proved break of an unambiguous authorization boundary.
- Recommended scheduler action: keep the task open/ineligible for T3 closure and route a bounded correction or reviewed FT-001 follow-up. Rerun functional verification and then this semantic gate after repair.
- Lifecycle was not changed.

SEMANTIC_VERDICT: semantic-fail
