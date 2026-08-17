---
description: Execution and claim-linked evidence for TASK-040-T3-FT-001-W20.
status: final
---
# Progress — TASK-040-T3-FT-001-W20

## Current status

- state: verification-complete
- accepted claim locator(s): FT-001-AC-013 / REQ-001 / REQ-014
- accepted scope: direct Admin email/password creation for teacher, student,
  and parent accounts; atomic same-center parent link; minimal calendar cards.

- RED observation and evidence: Before this implementation, the visible Admin
  page exposed invitation-based provisioning only; it had no direct
  email/password form or parent-student selector, and the calendar lesson card
  rendered status and lesson identity text. Evidence is recorded in the
  focused route/UI regression assertions and the bounded implementation diff.

## RED observation and evidence

- Before this implementation, the visible Admin page exposed invitation-based
  provisioning only; it had no direct email/password form or parent-student
  selector. The calendar lesson card rendered status and lesson identity text.
- Evidence: the current route/UI tests and source diff identify the missing
  `createParticipant` password action, direct participant command, parent-link
  transaction, and minimal lesson-card presentation as the bounded outcome.

- GREEN observation and evidence: The focused Admin route suite passed 6/6,
  the full Vitest suite passed 32 files / 147 tests, and check/build/real-DB
  E2E/diff gates passed. The visible Admin flow now asks for role, email,
  password, and—only for a parent—the existing center student. Evidence is
  recorded in verification.md and the final report.

## GREEN observation and evidence

- `tests/routes/admin-center-management.test.ts` passed 6/6, including direct
  student creation, parent link creation, normalized password authentication,
  duplicate email denial, invalid parent-link rollback, and non-Admin denial.
- `npm test` passed 32 files / 147 tests. `npm run check`, `npm run build`,
  `npm run e2e`, and `git diff --check` passed. Real-DB E2E created no product
  account or synthetic fixture and restored the pre-existing lesson material.
- The visible Admin flow now asks for role, email, password, and—only for a
  parent—the existing center student. The action does not return or echo the
  password; the Admin hands over the password they entered.

## Scope and data safety

- Identity & Access owns account and credential persistence; Center & Scheduling
  owns own-center Admin authorization, membership, and parent-link validation.
- The first independent semantic review found and blocked a direct
  `password_credentials` read from Center & Scheduling. It was corrected by
  adding the narrow `IdentityAccessBoundary.getAccountEmail()` projection and
  composition-root wiring; the independent re-review returned
  `SEMANTIC_VERDICT: semantic-pass` and found no remaining material issue.
- Existing real database rows were preserved. No temporary database, fake user,
  OAuth provider, or additional session lifecycle was introduced.
