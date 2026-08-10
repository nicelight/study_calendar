---
description: Fresh Revision 2 semantic task-plan review for FT-005 after TASK-018 correction.
status: active
---
# Review FT-005 — TASK-018

REVIEWED_PLANNING_REVISION: 2
VERDICT: APPROVE

FINDINGS: none blocking. TASK-018 is a complete single-card T3/W8 handoff with
the exact `FT-005-AC-002` locator and `REQ-009`/`REQ-014` linkage. Learning
Progress owns the provider and internal lesson-to-homework selection; Lesson
Context is the read-only downstream consumer. The hard write boundary is
limited to `src/lib/server/modules/learning-progress/` and
`tests/learning-progress/`; Foundation, Lesson Context, TASK-014, and its
protocol/evidence surfaces are forbidden. The card explicitly specifies
exactly-one -> selected grade or null, zero -> null/no grade, and multiple ->
`ambiguous-homework-selection` with no grade and no ordering/recency/title/
position tie-break. It covers α/β/γ/F privacy, unauthenticated,
wrong-student, wrong-class, and cross-center denial, no existence leakage,
non-mutation, disposable state, state-before/state-after comparison, safe
rerun, cleanup, native gates, `/verify`, and T3 `/red-verify` evidence paths.

VALIDATION: `.memory-bank/schemas/task.schema.json` validation passed; `mb-lint`
passed; TASK-018 is indexed exactly once and has no missing dependency or DAG
cycle. Direct dependencies TASK-009 and TASK-006 are `done`; downstream
TASK-014 directly depends on TASK-018. TASK-009/TASK-010 current evidence,
historical retry records, and TASK-014 `in_progress` correction evidence remain
preserved and are not broadened or normalized. Bounded local architecture
review: APPROVE.

TASK_READY: YES — planning-ready for the conditional readiness gate; TASK-018
remains `planned` and no lifecycle promotion was applied.

NEXT_STEP: Run the applicable `/mb-doctor`, then execute
`TASK-018-T3-FT-005-W8` through its T3 RED/GREEN, `/verify`, and
`/red-verify` paths; retry downstream `TASK-014-T3-FT-003-W8` only after the
provider task's required closure evidence is available.
