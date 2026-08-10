# Review FT-004 task planning surface

VERDICT: APPROVE
REVIEWED_PLANNING_REVISION: 1

target: FT-004
review_mode: fresh independent read-only review after bounded T3 rebuild

structural_integrity:
- PASS — `node scripts/mb-lint.mjs` passes; the indexed task set has unique resolving entries, and FT-004 IDs/tier/feature/wave values are consistent. The replacement cards are valid JSON and complete T3 single-card handoffs.
- PASS — `TASK-012-T2-FT-004-W6` remains historical `T2/W6/in_progress`; `TASK-016` and `TASK-017` are indexed `T3/W6/planned`. `TASK-014` depends on both replacements and no longer depends on `TASK-012`.
- PASS — Global Backbone is `complete` with positive `Planning Revision: 1`; Foundation gate `TASK-002-T3-FT-000-W1` is `done` and reachable through the prerequisite chain.

coverage_and_slicing:
- PASS — exact feature acceptance closure is complete: `TASK-016` owns `FT-004-AC-001`, `FT-004-AC-002`, and `FT-004-AC-005`; `TASK-017` owns `FT-004-AC-003` and `FT-004-AC-004`, plus the separately grounded `REQ-014` threaded-discussion harm path. Each accepted AC has a stable feature heading, governing REQs, and an exact owning-task locator.
- PASS — the split is minimal and cohesive: comment/reaction center-lifecycle isolation and threaded-discussion/branch/tab isolation are independently implementable and provable sibling outcomes. Shared Collaboration/database/test roots are advisory overlap, not merge evidence; sequential execution remains explicit.
- PASS — no orphan, unrelated outcome, duplicate ownership, or dependency-proof inheritance was found. Historical `TASK-011`/`TASK-012` evidence and the feature `SEMANTIC_VERDICT: semantic-fail` remain correction context only.

design_readiness:
- PASS — FT-004 has `spec_design_status: complete`; direct canonical routes resolve for architecture, Day Discussion boundary, plain and anchored Access Control, domain relationships/persistence, lifecycle, testing, and workflow policy.
- PASS — accepted modular monolith, one shared database, Collaboration sole write owner, server-resolved actor/class/student scope, retained-row behavior, and Lesson Context consumer direction are preserved. No copied topology or new graph edge is required.

execution_readiness:
- PASS — `TASK-016` and `TASK-017` are correctly T3 for protected cross-center reads, target checks, mutations, uniqueness, and privacy; `planned` is legal while dependencies/readiness promotion remain outstanding.
- PASS — both cards provide native check/build/test gates, exact claim-linked RED/GREEN contracts, realistic T3 harm proof, isolated disposable state, state-before/state-after comparison, safe rerun, cleanup, forbidden scope, and per-task functional/semantic proof routes. No hard write boundary was inferred from advisory `touched_files`.
- PASS — no task promotes or normalizes lifecycle state; downstream execution is correctly gated by the readiness gate and sequential ownership.

architecture_review:
  verdict: APPROVE
  findings: none
  evidence_checked:
  - C4 L1 product, EP-003, FT-004, IMPL-FT-004, FT-004 protocol plan/decision log, indexed FT-004 cards, preserved TASK-012, and downstream TASK-014.
  - `.memory-bank/architecture/system-architecture.md`, `.memory-bank/contracts/boundary-map.md`, `.memory-bank/contracts/access-control.md`, `.memory-bank/domains/core-domain.md`, `.memory-bank/states/lifecycle-map.md`, `.memory-bank/testing/strategy.md`, `.memory-bank/foundation.md`, and current Collaboration public/database ownership surfaces.
  risks_or_questions: none; the retained feature semantic-fail is an execution/closure prerequisite, not an unresolved architecture decision.

blockers: none
repair_owner: none
next_action: run the required readiness gate `/mb-doctor --strict` (or the applicable non-scheduler readiness gate), then execute `TASK-016-T3-FT-004-W6` and `TASK-017-T3-FT-004-W6` sequentially with each task's `/verify` and required T3 `/red-verify`; do not promote tasks here. Rerun the FT-004 feature semantic gate only after both fresh replacements close.
report_path: `.tasks/TASK-MB-REVIEW-TASKS-PLAN/TASK-MB-REVIEW-TASKS-PLAN-S-TASKS-FT-004-final-report-docs-03.md`
