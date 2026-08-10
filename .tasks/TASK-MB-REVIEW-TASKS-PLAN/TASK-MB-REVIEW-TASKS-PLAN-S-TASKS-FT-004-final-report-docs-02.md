# Review FT-004 task planning surface

VERDICT: APPROVE
REVIEWED_PLANNING_REVISION: 1

verdict: APPROVE
revision: 1
target: FT-004
review_mode: fresh independent Reviewer review after the controlled T3 rebuild/split

structural_findings:
- PASS — `.memory-bank/tasks/index.json` has 17 unique entries and all 17 indexed task cards are present, unique, schema-valid, and ID/tier/feature/wave consistent; dependency IDs and linked artifact paths resolve.
- PASS — FT-004 cards are consistently indexed as `TASK-011-T3-FT-004-W5`, preserved historical `TASK-012-T2-FT-004-W6`, `TASK-016-T3-FT-004-W6`, and `TASK-017-T3-FT-004-W6`.
- PASS — Foundation final gate `TASK-002-T3-FT-000-W1` is `done` and is reached transitively through the completed FT-004 prerequisite chain.

coverage_and_slicing:
- PASS — feature AC closure is complete: TASK-016 owns fresh T3 `FT-004-AC-001`, `FT-004-AC-002`, and `FT-004-AC-005`; TASK-017 owns fresh T3 `FT-004-AC-003`, `FT-004-AC-004`, and the accepted `REQ-014` threaded-discussion harm path. Each has exact feature AC locators in `source_artifacts` and matching `reqs`.
- PASS — the split is coherent and independently implementable/provable: comments/reactions isolation and threaded discussion/branch/tab isolation are sibling outcomes. Shared Collaboration/database/test roots are advisory overlap only; canonical execution remains sequential. No orphan or unowned FT-004 outcome remains.
- PASS — TASK-014 explicitly depends on both replacement cards and remains blocked while either is not done; it does not depend on historical TASK-012.
- PASS — TASK-011 and TASK-012 evidence is retained as historical/prerequisite context only. TASK-012 Attempt 2 is not replacement closure proof, and the feature `SEMANTIC_VERDICT: semantic-fail` marker remains present as the correction basis.

design_readiness:
- PASS — Global Backbone is `complete` with positive `Planning Revision: 1`; FT-004 `spec_design_status` is `complete`, with one applicable canonical path per architecture, boundary, access, domain, and lifecycle concern and no unresolved material design question.
- PASS — accepted modular monolith, one SvelteKit server, one shared database, Collaboration sole writer, Actor Context and Calendar/Membership provider boundaries, retained-row behavior, and server-resolved center/class/student authorization are directly linked by both replacement cards.
- PASS — the cards include sufficient shape, ownership, invariants, stop conditions, persistence constraints, and direct verification paths without introducing a new graph edge, event bus, second writer, deletion, or architecture decision.

execution_readiness:
- PASS — TASK-016 and TASK-017 are correctly T3 for the evidenced cross-center authorization, protected read/target/mutation, uniqueness, and privacy correction. Their `planned` status is preserved pending this review and the applicable doctor gate; TASK-011 is `done`, while TASK-014 is correctly `blocked` by unfinished replacement dependencies.
- PASS — both replacement cards are complete single-card T3 handoffs with native check/build/test gates, exact claim-linked RED/GREEN evidence contracts, non-empty verification targets, isolated disposable-state/safe-rerun/cleanup requirements, and no hard write boundary falsely derived from `touched_files`.
- PASS — no replacement task inherits TASK-012 or dependency proof; each replacement has its own `.protocols/TASK-016...`/`.protocols/TASK-017...` and `.tasks/TASK-016...`/`.tasks/TASK-017...` proof routes.

architecture_review:
  verdict: APPROVE
  findings: none
  evidence_checked:
  - C4 L1 product, EP-003, FT-004, IMPL-FT-004, FT-004 protocol plan/decision log, index, replacement cards, and downstream TASK-014/dependencies.
  - `.memory-bank/architecture/system-architecture.md`, `.memory-bank/contracts/boundary-map.md`, `.memory-bank/contracts/access-control.md`, `.memory-bank/domains/core-domain.md`, `.memory-bank/states/lifecycle-map.md`, `.memory-bank/testing/strategy.md`, and `.memory-bank/foundation.md`.
  - Current Collaboration public/database ownership surface and the accepted Lesson Context consumer dependency.
  risks_or_questions: none; the historical FT-004 semantic-fail remains an execution/closure prerequisite, not an architecture ambiguity.

blockers: none
repair_owner: none
next_action: run `/mb-doctor` at the T3 feature/task-queue boundary (use `--strict` before scheduler handoff), then execute TASK-016 and TASK-017 sequentially with their required `/verify` and per-task `/red-verify`; keep TASK-012 historical and rerun feature semantic verification only after fresh replacements close.
report_path: `.tasks/TASK-MB-REVIEW-TASKS-PLAN/TASK-MB-REVIEW-TASKS-PLAN-S-TASKS-FT-004-final-report-docs-02.md`
