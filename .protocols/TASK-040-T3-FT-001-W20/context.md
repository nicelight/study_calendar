---
description: Execution context for TASK-040-T3-FT-001-W20.
status: final
---
# Context — TASK-040-T3-FT-001-W20

## Purpose

Implement the bounded FT-001-AC-013 direct Admin account flow while preserving
the existing password login/session path, provider compatibility, and the
minimal calendar-card presentation.

## Loaded context

- `AGENTS.md`
- `.memory-bank/constitution.md`
- `.memory-bank/features/FT-001-authentication-and-binding.md`
- `.memory-bank/contracts/boundary-map.md`
- `.memory-bank/contracts/access-control.md`
- `.memory-bank/contracts/authentication-transport.md`
- `.memory-bank/testing/strategy.md`
- `.memory-bank/tasks/TASK-040-T3-FT-001-W20.task.json`

## Scope decisions

- Admin creates teacher, student, or parent by email/password.
- Parent selects an existing student from the same center.
- Existing `/login` and server session are reused; OAuth invitation code stays
  compatibility-only outside the visible direct-account form.
- Real-DB E2E must not create a product account or synthetic fixture.

## Ownership check

Identity & Access owns account and password credential facts. Center &
Scheduling owns Admin scope, center membership, and parent-student links. The
composition root wires the public query needed to display participant email;
Center & Scheduling does not read Identity & Access tables directly.
