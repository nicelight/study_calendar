---
description: Claim-linked Attempt 2 RED evidence for the reconciled TASK-080 outcome.
status: active
---
# Attempt 2 — Claim-linked RED

- attempt: `2`
- applicability: applicable
- claim: `FT-007-AC-002 / REQ-014 / REQ-017`; the existing Center & Scheduling
  boundary must enumerate the complete server-authorized Student/Parent class
  destination list for bare `/home` and `/classes`, while routes remain thin
  adapters.
- correction basis: the preserved Attempt 1 semantic-fail showed that the
  existing route requires `classId` and therefore over-denies the accepted bare
  canonical flow. The reconciled card now explicitly owns the C&S query needed
  to correct that result.
- command: `npm run test -- tests/center-scheduling/ft-007-accessible-class-list.test.ts`
- cwd: `/home/serg/Projects/study_calendar`
- input state basis: Attempt 2 was durably recorded in the task protocol before
  this probe. The new provider test fixture existed, the current C&S public
  boundary had no `getAccessibleClassList`, and the existing route still
  required caller-supplied `classId` for Student/Parent. Existing W27/W28 dirty
  changes and Attempt 1 artifacts were preserved.
- result: exit code `1`; the isolated fixture loaded successfully and the first
  claim-specific assertion failed with `TypeError: api.getAccessibleClassList
  is not a function`.
- decisive comparison: the accepted provider-owned accessible-class list was
  absent, so the current bare canonical Student/Parent outcome could not be
  produced without the reconciled C&S implementation.
- evidence: command output from the Attempt 2 execution session; no
  production behavior was changed before this RED observation.
