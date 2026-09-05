---
description: Bounded task-planning resume state for FT-005.
status: active
---
# FT-005 Task Planning Plan

## Outcome and scope

Deliver class-visible homework completion, private accepted-scale grades, the
authorized lesson-scoped personal grade query, attendance with financially
correct absent-to-present reconciliation, and assigned-Teacher lesson-day
attendance entry. The remaining browser gap is limited to the existing
`/lesson-context` surface: create the single class-scoped homework item,
student completion, class-visible completion status, and Teacher/Admin grading.

## Canonical inputs and ownership

- Feature: [.memory-bank/features/FT-005-learning-progress.md](../../.memory-bank/features/FT-005-learning-progress.md)
- Primary owner: Learning Progress at `src/lib/server/modules/learning-progress/`.
- Boundaries: [Personal Progress Query](../../.memory-bank/contracts/boundary-map.md#personal-progress-query-boundary) and [Attendance Charge Reconciliation](../../.memory-bank/contracts/boundary-map.md#attendance-charge-reconciliation-boundary).
- Browser boundary: [Learning Progress Browser Surface](../../.memory-bank/contracts/learning-progress-browser-surface.md#server-composed-homework-projection).
- Financial rules: [.memory-bank/contracts/financial-ledger.md#financial-facts-and-invariants](../../.memory-bank/contracts/financial-ledger.md#financial-facts-and-invariants)
- Planning authority: [.memory-bank/spec-backbone.md](../../.memory-bank/spec-backbone.md), Global Backbone `complete`, Planning Revision `2`.

## Boundary and waves

1. `TASK-009-T3-FT-005-W5` owns homework completion and grade scale/privacy (AC-001, AC-002).
2. `TASK-010-T3-FT-005-W6` owns attendance eligibility and atomic reconciliation (AC-003, AC-004), after scheduling and ledger charge foundations.
3. `TASK-018-T3-FT-005-W8` owns the authorized lesson-scoped personal grade
   query, provider-owned homework selection, and privacy proof under AD-007,
   after TASK-009 and TASK-006.
4. `TASK-042-T3-FT-005-W22` owns the assigned-Teacher lesson-day attendance
   list and atomic absent-subset/default-present save, after TASK-010 and
   TASK-041.
5. `TASK-105-T3-FT-005-W37` will own the server-composed `/lesson-context`
   homework projection and named, server-authorized create, completion, and
   grading actions.
6. `TASK-106-T3-FT-005-W38` will own the corresponding UI and disposable
   Playwright proof after TASK-105.

Learning Progress owns attendance; Financial Ledger owns charge, allocation, balance, and audit writes.

## Browser completion and grading boundary — 2026-09-04

The operator accepted the minimal class-scoped model: reuse the existing
`learning_homework` shape, resolve the single item for the current authorized
class in Learning Progress, and do not add a `lesson_id` relation, migration,
new API, or consumer-owned mapping. Existing `FT-005-AC-001` and
`FT-005-AC-002` remain the only product acceptance criteria; no additional
non-critical AC is introduced.

The work is split into two sequential T3 outcomes because the route transport
must be stable before the browser surface can prove it. No production-only
task is needed: the current repository has no production-specific configuration
for this feature.

## Verification

Run native gates with claim-linked paths: AC-001 class-visible completion,
AC-002 accepted grade scale/privacy, AD-007 lesson-scoped provider query,
AC-003 both-mode charge eligibility, AC-004 atomic historical-price
reconciliation/audit/isolation, and AC-005 assigned-Teacher lesson-day
attendance entry for individual and group classes. TASK-009 and TASK-010
evidence remains evidence for their original outcomes only; TASK-042 owns the
new browser/integration contour.

The current browser completion/grading contour was planned as two sequential
cards. W37 is limited to server composition and named form actions; W38 is
limited to the existing page UI and one disposable Playwright flow. The
canonical shape, privacy rules, and cleanup target are defined by [Learning
Progress Browser Surface](../../.memory-bank/contracts/learning-progress-browser-surface.md).
W37's claim-linked proof covers AC-001/AC-002, repeat-create count/identity
equality, server-generated opaque ID generation and uniqueness, and isolated
teardown. W38's current proof covers Admin/assigned-Teacher creation before
Student completion, reload persistence, accepted grades, corresponding versus
unrelated privacy, and exact cleanup. The browser contour is independently
verified at the W38 task boundary; FT-005, EP-004, and REQ-009 remain
`planned` pending the feature-level aggregate/lifecycle decision.

## W8 card completeness correction

`TASK-018-T3-FT-005-W8` is the sole owner of the Revision 2 provider outcome.
Its direct canonical inputs are the accepted
[System Architecture](../../.memory-bank/architecture/system-architecture.md),
[Boundary Map](../../.memory-bank/contracts/boundary-map.md),
[Access Control](../../.memory-bank/contracts/access-control.md),
[Core Domain](../../.memory-bank/domains/core-domain.md),
[Lifecycle Map](../../.memory-bank/states/lifecycle-map.md), and
[Testing Strategy](../../.memory-bank/testing/strategy.md), selected through
the [Spec Index](../../.memory-bank/spec-index.md) and
[Spec Backbone](../../.memory-bank/spec-backbone.md).

The card's hard write boundary is limited to the Learning Progress module and
its focused tests. It preserves dependencies on TASK-009 and TASK-006, exact
identity/tier/wave/status intent (`TASK-018-T3-FT-005-W8`, `T3`, `W8`,
`planned`), and explicitly forbids TASK-014 and its evidence surfaces.
The provider receives `lessonId` and server-resolved actor/context, owns
selection, and proves the deterministic cardinality path: one candidate yields
the selected grade (or null when its grade row is absent), zero yields null/no
grade, and multiple yields `ambiguous-homework-selection` with no grade.
The task card carries the exact `FT-005-AC-002` RED/GREEN evidence handoff,
isolated state-before/state-after, safe rerun/cleanup, native gates, and
verifier artifact paths; no implementation, execute/verify, lifecycle, or
retry-budget action is included here.

## Task-plan approval and decomposition closure — 2026-09-04

The fresh `/review-tasks-plan FT-005` returned `APPROVE` at Planning Revision
`2` ([review report](../../.tasks/TASK-MB-REVIEW-TASKS-PLAN/TASK-MB-REVIEW-TASKS-PLAN-S-TASKS-FT-005-R5-final-report-docs-01.md)).
The final sequential queue is `TASK-105-T3-FT-005-W37` →
`TASK-106-T3-FT-005-W38`; decomposition is closed for this revision. The
cards, FT-005, EP-004, and REQ-009 remain `planned` until the applicable
readiness/promotion and execution owners act. No implementation, verification,
or product lifecycle promotion is implied by this approval.

## Revision 2 reconciliation

The provider contract is explicit: Learning Progress receives `lessonId` and
server-resolved actor/context, selects homework internally, and returns a
personal grade projection. No existing lifecycle or evidence changed; the new
provider task is planned and requires fresh review before execution.

## W37 server transport closure — 2026-09-05

The authoritative `TASK-105-T3-FT-005-W37` card is now `done` after its current
Attempt 2 functional `PASS`, required T3 `semantic-pass`, and scheduler closure.
The server-side Lesson Context outcome is reconciled through the current
functional/semantic protocols and reports linked from the task card and the
W37 sync report. The outcome remains bounded to the existing Learning Progress
provider and named Lesson Context actions; no lesson relation, migration, new
API, consumer-owned mapping, or ownership change was introduced.

## W38 browser UI closure — 2026-09-05

The authoritative `TASK-106-T3-FT-005-W38` card is now `done` after its current
Attempt 1 functional `PASS`, required T3 `semantic-pass`, and scheduler
closure. The W38 UI/browser outcome is reconciled through the functional and
semantic protocols/reports linked from the task card and the W38 sync report.
It remains bounded to the existing Lesson Context page, W37's server
projection/actions, and the exact disposable Playwright path; no server,
provider, route, API, persistence, or ownership boundary changed.

The sequential W37/W38 browser contour is now task-evidenced. FT-005, EP-004,
and REQ-009 remain `planned` pending their feature-level aggregate/lifecycle
owner decision; shared REQ-014 remains `planned`. No promotion, dependent
transition, Judge/Reviewer change, or Planning Revision change is made here.
