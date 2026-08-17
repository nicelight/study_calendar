---
description: Execution plan for TASK-040-T3-FT-001-W20.
status: final
---
# Plan — TASK-040-T3-FT-001-W20

## Goal

Expose the simplest protected Admin form for direct teacher/student/parent
creation and preserve minimal calendar lesson-card information.

## Implementation boundary

- Identity & Access: server-owned email normalization, salted scrypt
  credential write, and a narrow email projection query.
- Center & Scheduling: own-center Admin authorization, membership write, and
  atomic parent link to a same-center student.
- Admin transport/UI: form parsing, error mapping, and password handoff
  message without returning the password.
- Calendar UI: hide status and internal lesson identifiers while retaining
  existing navigation attributes.

## Verification

- Focused Admin and calendar route tests.
- Full Vitest, Svelte check, production build, real local database E2E, and
  diff whitespace check.
- Independent semantic review of ownership, authorization, atomicity, and
  password visibility.
