---
description: Implementation plan for FT-005 learning progress.
status: active
---
# IMPL-FT-005 — Learning Progress

## Goal

Implement homework completion, private grades, the authorized lesson-scoped
personal grade query, attendance state, the authorized financial
reconciliation command, and the assigned-Teacher lesson-day attendance entry.
Close the remaining `/lesson-context` browser surface for class-scoped
homework creation, student completion, class-visible status, and Teacher/Admin
grading.

## Scope / non-goals

Include accepted grade values/privacy, provider-owned lesson-to-homework
selection for the lesson-scoped grade projection, present/absent state, charge
eligibility, absent-to-present correction, audit, isolation, and the
lesson-day absent-subset/default-present save. The browser addition reuses the
existing class-scoped homework model and adds no `lesson_id` relation,
migration, mutation API, or consumer-owned mapping. Exclude direct
financial-table writes and late/partial attendance states. No new product AC
is introduced.

## Strategy and ownership

Learning Progress owns `src/lib/server/modules/learning-progress/`; it exposes
the authorized lesson-scoped grade query, calls the Attendance Charge
Reconciliation Boundary after validating attendance, and never bypasses
Financial Ledger ownership. Lesson Context remains a thin server-composition
and form-action adapter; the page consumes its server projection and named
actions.

## Ordered tasks

| Wave | Task | Outcome | Dependency |
|---|---|---|---|
| W5 | TASK-009-T3-FT-005-W5 | homework and grades | TASK-005-T3-FT-002-W3 |
| W6 | TASK-010-T3-FT-005-W6 | attendance and charge reconciliation | TASK-006-T2-FT-002-W4, TASK-007-T3-FT-006-W4 |
| W8 | TASK-018-T3-FT-005-W8 | provider-owned authorized lesson-scoped grade query | TASK-009-T3-FT-005-W5, TASK-006-T2-FT-002-W4 |
| W22 | TASK-042-T3-FT-005-W22 | assigned-Teacher lesson-day attendance list with absent-subset/default-present save | TASK-010-T3-FT-005-W6, TASK-041-T3-FT-006-W21 |
| W37 | TASK-105-T3-FT-005-W37 | server-composed homework projection and named create/complete/grade actions in Lesson Context | TASK-018-T3-FT-005-W8, TASK-042-T3-FT-005-W22 |
| W38 | TASK-106-T3-FT-005-W38 | homework completion/grading UI and disposable Playwright proof | TASK-105-T3-FT-005-W37 |

## Gates and verification

Run `npm run check`, `npm run build`, and `npm run test`; verify AC-001/002 on
TASK-009, the AD-007 provider query on TASK-018, and AC-003/004 on TASK-010.
Each card uses its own RED/GREEN role/privacy, lesson-scoped projection,
attendance, historical replay, audit, atomicity, and isolation evidence path;
TASK-009 and TASK-010 evidence is not broadened retroactively; TASK-042 owns
the new FT-005-AC-005 lesson-day browser/integration contour and reuses the
existing attendance and lesson-context contracts.

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

## Browser completion and grading handoff

- `TASK-105-T3-FT-005-W37` is the server-side transport boundary. It may
  extend Learning Progress with the minimal class-scoped item projection,
  compose it through Lesson Context, and add only the named
  `createHomework`, `completeHomework`, and `recordGrade` form actions. Client
  input never supplies authoritative `homeworkId` or actor identity. Its
  evidence must prove repeat-create count/identity equality, server-generated
  opaque ID generation and uniqueness, deny-before-write behavior, and exact
  isolated-state teardown.
- `TASK-106-T3-FT-005-W38` depends on W37 and renders the Student completion
  control, class-visible statuses, and Admin/Teacher grade selector. Its one
  disposable Playwright flow proves Admin/assigned-Teacher create, Student
  completion, accepted grades, reload persistence, and corresponding versus
  unrelated grade privacy.
- The canonical transport and proof rules are in
  [Learning Progress Browser Surface](.memory-bank/contracts/learning-progress-browser-surface.md).
- Lifecycle is consistently `planned` for FT-005, EP-004, and the sole FT-005
  mapping for REQ-009 until W37/W38 receive execution and independent
  verification evidence.
- Both cards remain `planned`; execution and verification must produce fresh
  task-owned evidence before any feature lifecycle decision.

## Task-plan approval and decomposition closure — 2026-09-04

The fresh `/review-tasks-plan FT-005` returned `APPROVE` at Planning Revision
`2` ([review report](../../../.tasks/TASK-MB-REVIEW-TASKS-PLAN/TASK-MB-REVIEW-TASKS-PLAN-S-TASKS-FT-005-R5-final-report-docs-01.md)).
The final sequential queue is `TASK-105-T3-FT-005-W37` →
`TASK-106-T3-FT-005-W38`; decomposition is closed for this revision. Both
cards remain `planned` until the applicable readiness/promotion owner acts;
this boundary does not claim implementation, verification, or feature
lifecycle promotion.
