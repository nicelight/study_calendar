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
