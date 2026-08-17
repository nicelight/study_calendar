---
description: Semantic boundary verification for TASK-040-T3-FT-001-W20.
status: final
---
# TASK-040-T3-FT-001-W20 — Semantic Verification

The current implementation was reviewed against FT-001-AC-013, the Account
Provisioning Boundary, and the access-control rules.

An initial review correctly found a direct Center & Scheduling read of the
Identity & Access `password_credentials` table. That finding was fixed before
closure: the email projection now belongs to Identity & Access and is wired
through the composition root. The independent re-review found no remaining
material finding.

The Admin transport is a thin adapter. It resolves the request actor from the
server session, requires own-center Admin scope, and delegates creation to
Center & Scheduling. Center & Scheduling rechecks that scope, delegates account
and credential persistence to Identity & Access, and validates the selected
student as a same-center student before committing the parent link. The
surrounding transaction covers account, credential, membership, and link
state, so duplicate email and invalid parent selection leave no partial write.

The password is accepted only by the server action, normalized email is stored
uniquely, and the action returns only success metadata. The existing `/login`
route and server session are reused. The legacy provider invitation path is
retained for compatibility and is not required by the visible direct-account
Admin flow. The calendar card change removes visible status and identifier
labels without changing the underlying lesson identity used for navigation.

Focused tests, full gates, and source inspection found no material authority
bypass, password leakage, cross-center parent link, second authentication
lifecycle, synthetic real-DB fixture, or unrelated architecture change.

SEMANTIC_VERDICT: semantic-pass
