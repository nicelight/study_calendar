---
description: Independent adversarial semantic verification for TASK-050-T3-FT-006-W26.
status: active
---
# Red Verification — TASK-050-T3-FT-006-W26

## Accepted outcome

`FT-006-AC-008 / REQ-013`: Calendar derives Student paid/unpaid lesson-day
state from the authoritative Financial Ledger projection; shared Admin/Teacher
views omit guessed per-student payment state; the complete real-browser payment
flow remains authorized and non-mutating outside the Ledger owner.

## Independent review focuses

- A forged Student payment submission fails before any financial mutation.
- A forged `studentAccountId` query hint cannot make a shared Admin calendar
  expose personal payment state.
- Calendar reads the named Lesson Context projection and owns no financial SQL,
  table access, write path, or reconstructed balance.
- The local real-DB flow preserves the dedicated fixture and removes only exact
  captured sessions.

## Evidence

- Fresh adversarial semantic probe was added within the hard boundary in
  `tests/routes/calendar-navigation.test.ts` and passed 1 file / 6 tests.
  It compared a full in-memory database snapshot around forged payment denial,
  tested forged shared URL state, and inspected server/page ownership rules.
- The semantic probe confirmed `calendarLoad` uses
  `lessonContext.getStudentPaymentStatuses`, shared roles have no
  `paymentStatus`, and Calendar sources contain no direct financial table or
  SQLite access.
- Fresh real-database browser probe passed 1/1 after the semantic addition;
  the dedicated accounts remained, one payment and one allocation remained,
  and `e2e_named_sessions` was `0`.
- Fresh final gates passed: `npm run check`, `npm run build`, `npm test`
  (56 files / 177 tests), real-db E2E, `git diff --check`, `mb-lint`, and strict
  doctor.
- No co-reviewer tool was available in this session; the semantic review was
  performed independently against direct task-linked contracts and current
  source/test evidence.

## Findings / questions

No material finding or operator-owned question was admitted. The named
projection boundary, student-only state, shared-role omission, forged-scope
denial, and real-DB cleanup rules remain unambiguous.

## Handoff

- Recommended scheduler action: record semantic evidence and close TASK-050;
  then run W26 boundary `/mb-sync` and advisory `/tech-debt wave W26`.
- No planning repair, tier escalation, or follow-up task is required.

SEMANTIC_VERDICT: semantic-pass
