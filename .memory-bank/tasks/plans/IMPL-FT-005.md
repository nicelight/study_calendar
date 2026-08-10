---
description: Implementation plan for FT-005 learning progress.
status: active
---
# IMPL-FT-005 — Learning Progress

## Goal

Implement homework completion, private grades, the authorized lesson-scoped
personal grade query, attendance state, and the authorized financial
reconciliation command.

## Scope / non-goals

Include accepted grade values/privacy, provider-owned lesson-to-homework
selection for the lesson-scoped grade projection, present/absent state, charge
eligibility, absent-to-present correction, audit, and isolation. Exclude direct
financial-table writes, consumer-owned homework mapping, and late/partial
attendance states.

## Strategy and ownership

Learning Progress owns `src/lib/server/modules/learning-progress/`; it exposes
the authorized lesson-scoped grade query, calls the Attendance Charge
Reconciliation Boundary after validating attendance, and never bypasses
Financial Ledger ownership.

## Ordered tasks

| Wave | Task | Outcome | Dependency |
|---|---|---|---|
| W5 | TASK-009-T3-FT-005-W5 | homework and grades | TASK-005-T3-FT-002-W3 |
| W6 | TASK-010-T3-FT-005-W6 | attendance and charge reconciliation | TASK-006-T2-FT-002-W4, TASK-007-T3-FT-006-W4 |
| W8 | TASK-018-T3-FT-005-W8 | provider-owned authorized lesson-scoped grade query | TASK-009-T3-FT-005-W5, TASK-006-T2-FT-002-W4 |

## Gates and verification

Run `npm run check`, `npm run build`, and `npm run test`; verify AC-001/002 on
TASK-009, the AD-007 provider query on TASK-018, and AC-003/004 on TASK-010.
Each card uses its own RED/GREEN role/privacy, lesson-scoped projection,
attendance, historical replay, audit, atomicity, and isolation evidence path;
TASK-009 evidence is not broadened retroactively.

## TASK-018-T3-FT-005-W8 single-card handoff

- Context/owner: Learning Progress owns the Revision 2 lesson-scoped personal
  grade provider; Lesson Context is only the authorized read consumer and must
  not resolve or persist `homeworkId`.
- Scope/write boundary: execution is hard-bounded to
  `src/lib/server/modules/learning-progress/` and
  `tests/learning-progress/`; task-local protocol/evidence bookkeeping remains
  under `.protocols/TASK-018-T3-FT-005-W8/` and
  `.tasks/TASK-018-T3-FT-005-W8/`. Foundation records and all TASK-014
  artifacts are forbidden.
- Dependencies/status: `TASK-009-T3-FT-005-W5` and
  `TASK-006-T2-FT-002-W4` remain the exact dependencies; the authoritative
  `TASK-018-T3-FT-005-W8` card remains `T3` / `W8` / `done` with its existing
  evidence history. No feature or requirement promotion is part of this
  reconciliation.
- Provider contract: accept stable `lessonId` plus server-resolved
  actor/context and selected-student scope; select only existing
  `learning_homework` rows from the resolved class; return the permitted
  `GradeView | null` without a consumer-owned mapping. Exactly one candidate
  may yield one grade, zero yields null/no grade, and multiple yields
  `ambiguous-homework-selection` with no grade.
- Acceptance/evidence handoff: the card retains the exact
  `FT-005-AC-002` locator and maps it to a disposable public-boundary RED/GREEN
  path covering accepted α/β/γ/F privacy, authorization negatives, all three
  cardinalities, non-mutation, safe rerun, cleanup, native gates, and verifier
  artifacts. TASK-009 evidence remains historical/supporting-only.

## Planning Revision 2 reconciliation

The global backbone is `complete` at Planning Revision 2. Existing TASK-009
and TASK-010 identity, status, historical evidence, and retry history remain
preserved. TASK-018 now carries the provider-owned contract delta required
before TASK-014 can be retried, with its current functional and semantic
evidence reconciled at the W8 boundary.

## W8 boundary evidence

- `TASK-018-T3-FT-005-W8` is `done` with functional `PASS` and T3
  `semantic-pass`; current sources are its indexed card,
  `.protocols/TASK-018-T3-FT-005-W8/verification.md`, and
  `.protocols/TASK-018-T3-FT-005-W8/red-verification.md`.
- The proven outcome remains limited to the Learning Progress provider:
  lesson-scoped authorization, internal class-scoped homework cardinality,
  selected-student grade projection, fail-closed ambiguity, and read-only
  behavior. No TASK-009 claim was broadened and no Lesson Context/TASK-014
  surface was changed.
