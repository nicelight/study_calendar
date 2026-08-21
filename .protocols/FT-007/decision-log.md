---
description: Durable decisions for FT-007 task planning.
status: active
---
# FT-007 Decision Log

## 2026-08-18 — Statistics identity and teacher attendance clarification

The operator accepted the recommended feature-local clarification. Student and
Teacher registry rows use an Identity & Access-owned participant `fullName` and
immutable server-generated `registeredAt`; the participant creation path must
collect the full name, while the system owns the registration timestamp.

Teacher attendance percentage is the aggregate of `present` student attendance
across the teacher's assigned classes and conducted lessons, divided by all
assigned-class student/lesson slots. Unmarked slots follow the accepted
default-present attendance workflow. The statistic remains a read-only
projection and does not change attendance facts.

This decision enables FT-007 tasking, adds no capability slice, and leaves
Planning Revision `2` unchanged. It is applied to the PRD, requirements,
feature, core-domain, access, boundary, and statistics projection contracts.

## 2026-08-19 — Review repair decisions

The operator accepted the existing Actor Context Boundary as the minimal
profile seam: Statistics may request `fullName` and immutable `registeredAt`
from Identity & Access for account IDs already scoped by Center & Scheduling;
direct account-table access is forbidden.

Participant creation requires surname and given name. Accounts without a name
are outside the target population; no migration, backfill, or legacy-account
handling is added.

The rejected unexecuted TASK-051..057 surface is rebuilt with fresh identities
because its task boundaries, dependency claims, E2E hard scope, and AC ownership
change. The active replacement uses focused disposable databases for browser
proof and assigns AC-001..006 exactly once.

## 2026-08-20 — Fresh-review blocker repair

The fresh review rejected the unexecuted TASK-062 and TASK-065..069 subset.
AC-003 belongs to Lesson Context because only the accepted statistics
composition owner may sequence scoped Center & Scheduling account IDs through
the Identity & Access profile query and the two metric-provider boundaries.
Center & Scheduling remains limited to its own scoped registry facts.

Disposable browser evidence uses one shared fail-closed runner contract. It
starts an owned server with the explicit `tmp/*.db` `DATABASE_URL`, prepares and
cleans the exact path, rejects the real database, and never reuses an existing
server. The ordinary real-database Playwright smoke remains unchanged.

Because AC ownership, dependencies, and hard runtime scope change, the rejected
subset is rebuilt as TASK-070..077. Unaffected TASK-058..061 and TASK-063..064
retain their identities and material boundaries. Planning Revision remains `2`.

## 2026-08-21 — Canonical routes and cohesive queue boundary

The operator accepted `/home`, `/classes`, `/statistics`, and `/profile` as the
protected route identities. Profile is read-only over Identity & Access-owned
`fullName`, `role`, and immutable `registeredAt`; logout keeps the existing
`POST /auth/logout` contract.

The operator then accepted the replacement task boundary: account profile facts
are one complete Identity & Access outcome across every supported new-account
path; shell/logout proof and the disposable runner remain with the shell
implementation; Home and Classes are one AC-002 implementation result; provider
queries, statistics composition, sorting, and Profile remain separate outcomes.
The unexecuted TASK-058..061, TASK-063/064, and TASK-070..077 queue is rebuilt
with fresh identities. Planning Revision remains `2`.
