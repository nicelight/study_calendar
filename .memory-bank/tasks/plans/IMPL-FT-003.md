---
description: Implementation plan for FT-003 calendar and lesson context.
status: active
---
# IMPL-FT-003 — Elastic Calendar and Lesson Context

## Goal

Implement the weekly calendar and the authorized shared/personal day projections.

## Scope / non-goals

Include geometry, exact date navigation, shared lesson material, personal data composition, context preservation, and server-side privacy. Exclude provider-owned writes and financial mutation from projection reads.

## Strategy and ownership

Lesson Context owns composition at `src/lib/server/modules/lesson-context/`; it consumes named read boundaries and never reconstructs authorization from UI routes. The accepted Revision 2 Personal Progress Query is provider-owned by Learning Progress: Lesson Context passes `lessonId` and server-resolved actor/context and never resolves `homeworkId`.

## Ordered tasks

| Wave | Task | Outcome | Dependency |
|---|---|---|---|
| W7 | TASK-013-T2-FT-003-W7 | calendar geometry and navigation | TASK-006-T2-FT-002-W4 |
| W8 | TASK-014-T3-FT-003-W8 | authorized day-context composition using the provider-owned lesson-scoped grade query | TASK-008, TASK-009, TASK-010, TASK-016, TASK-017, TASK-013, TASK-018 |

## W7 Boundary Reconciliation

- `TASK-013-T2-FT-003-W7` is the authoritative completed W7 task with current
  functional `PASS` and feature-level `semantic-pass` evidence for AC-001/002;
  the durable links are recorded in the FT-003 feature document and the
  [W7 boundary sync report](../../../.tasks/TASK-013-T2-FT-003-W7/TASK-013-T2-FT-003-W7-S-MB-SYNC-final-report-docs-01.md).
- `TASK-014-T3-FT-003-W8` retains its `in_progress` lifecycle, historical
  evidence, and existing dependencies; its Revision 2 reconciliation adds the
  indexed provider prerequisite `TASK-018-T3-FT-005-W8` without changing its
  identity, tier, wave, or retry history.
- `TASK-013-T2-FT-003-W7` remains untouched with its completed Revision 1
  evidence; the accepted modular-monolith, one-server, and shared-database
  architecture remains unchanged.

## Gates and verification

Use `npm run check`, `npm run build`, and `npm run test`; verify AC-001/002 on
TASK-013, the provider contract on TASK-018, and AC-003/004/005/006 on
TASK-014. The cards carry separate claim-linked RED/GREEN, role/privacy,
context-preservation, lesson-scoped projection, composition, and non-mutation
evidence paths. No execution or verification is part of this reconciliation.

## Planning Revision 2 reconciliation

The global backbone is `complete` at Planning Revision 2. Existing FT-003 task
identity, tier, wave, lifecycle, historical evidence, and retry history remain
preserved. The provider outcome is split to Learning Progress because Lesson
Context cannot own or bypass that boundary. The Revision 2 plan review was
approved before the current W8 execution; its planning decision is retained as
historical basis and is not reopened by feature sync.

## W8 Feature Boundary Reconciliation

- `TASK-013-T2-FT-003-W7`, `TASK-014-T3-FT-003-W8`, and the provider prerequisite
  `TASK-018-T3-FT-005-W8` are indexed `done` with current claim-linked
  functional/semantic evidence. The feature-level report is
  [FT-003 W8 sync](../../../.tasks/FT-003/FT-003-S-MB-SYNC-final-report-docs-01.md).
- AC-001/002 remain owned by TASK-013; AC-003..006 remain owned by TASK-014;
  the lesson-scoped grade provider claim remains owned by TASK-018.
- The current dependency set, task identities, retry history, accepted
  architecture, feature/epic lifecycle, and RTM lifecycle values are preserved.
