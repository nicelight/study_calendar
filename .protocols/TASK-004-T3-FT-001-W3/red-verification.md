---
description: Fresh independent adversarial semantic verification for TASK-004-T3-FT-001-W3.
status: active
---
# Red Verification — TASK-004-T3-FT-001-W3

## Semantic target

- Accepted outcome: both accepted providers bind only to the invitation/session
  account, the second provider requires server-side owner reconfirmation, and
  failed provider/callback paths cannot leave a partial identity binding.
- Accepted boundaries: Identity & Access owns account, invitation, external
  identity, session, and confirmation writes; provider adapters remain behind
  that boundary; membership stays owned by Center & Scheduling.

## Evidence and adversarial coverage

- Fresh functional verification is PASS in
  `.protocols/TASK-004-T3-FT-001-W3/verification.md`; it was treated as an
  input, not semantic proof.
- Inspected the actual source/change surface, schema constraints, composition
  wiring, focused tests, executor claim path, and direct canonical task specs.
- The invitation target and second-provider target are both server-resolved:
  the first comes from the persisted invitation and the second from the active
  confirmed session. Caller role/account data cannot select either target.
- Reconfirmation verifies an already bound provider identity against the same
  session account. A missing, revoked, unconfirmed, or wrong-account identity
  cannot reach the second-provider insert.
- The one-use confirmation is session-owned, cascades with session removal, and
  is consumed in the same transaction as successful second-provider binding.
  Duplicate insertion rolls back without consuming confirmation, preserving a
  safe retry path.
- Database uniqueness enforces one `(provider, subject)` owner and at most one
  identity per provider for an account. Invitation consumption and first
  identity insertion share one transaction, so duplicate/callback failure
  cannot consume the invitation partially.
- Repository reference inspection found no route/UI identity write, direct
  external-identity mutation outside Identity & Access, identity merge path,
  second source of truth, or unregistered inter-module edge on this change
  surface.
- Fresh isolated tests and required gates remained green: focused 4/4, full
  suite 13/13, check 0 errors/0 warnings, production build exit 0, and clean
  diff hygiene.

## Admitted findings

None.

## Operator questions

None. The accepted binding, ownership, confirmation, and atomicity behavior is
unambiguous for this task.

## Verdict

SEMANTIC_VERDICT: semantic-pass

## Owner handoff

- Evidence/report paths: this protocol,
  `.protocols/TASK-004-T3-FT-001-W3/verification.md`, and
  `.tasks/TASK-004-T3-FT-001-W3/TASK-004-T3-FT-001-W3-S-RED-VERIFY-final-report-docs-01.md`.
- Recommended owner action: the scheduler/lifecycle owner may evaluate closure
  using the functional PASS and this required T3 semantic pass; no lifecycle or
  dependent state was changed here.
- Resume route: lifecycle owner/scheduler; replan, BUG, and operator decision
  are not required by this review.

