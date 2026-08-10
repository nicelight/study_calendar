---
description: Лог изменений Memory Bank.
status: active
---
# Changelog

## [2026-08-10] Wave 7 — FT-003 full boundary sync
- Reconciled: authoritative `TASK-013-T2-FT-003-W7` is `done` with current
  functional `PASS` evidence and FT-003 feature-level `semantic-pass` evidence
  for `FT-003-AC-001` and `FT-003-AC-002`; task, feature, plan, and evidence
  navigation now agree.
- Updated: FT-003 task coverage and `IMPL-FT-003` link the current W7
  functional/semantic evidence and this boundary report; the root Memory Bank
  router now links the changed FT-003 implementation plan.
- Confirmed: task index, W7 task evidence, RTM ownership/lifecycle, canonical
  spec routes, Planning Revision 1, accepted architecture, and routers are
  consistent with the authoritative records.
- Preserved: `TASK-014-T3-FT-003-W8` remains `blocked` with its accepted
  dependencies; `TASK-012-T2-FT-004-W6` remains historical `T2` / `W6` /
  `in_progress`; `TASK-016`/`TASK-017` remain completed W6 T3 replacements and
  their W6 sync history is unchanged.
- Deferred: no dependent unblock, task/feature/epic/REQ lifecycle promotion,
  closure, dependency redesign, or architecture decision was made by this
  sync.
- Handoff: return to the explicit Architect/operator owner for applicable
  post-sync lint/doctor gates; this sync did not run `mb-lint`, `/mb-doctor`,
  `/verify`, `/red-verify`, code, or tests.

## [2026-08-10] Wave 6 — FT-004 full boundary sync
- Reconciled: authoritative `TASK-016-T3-FT-004-W6` and
  `TASK-017-T3-FT-004-W6` are `done`, each with current functional `PASS` and
  required T3 `semantic-pass` evidence; their task index, cards, and evidence
  paths agree.
- Updated: FT-004 navigation now links both current functional/semantic
  evidence sets and the combined W6 boundary report; FT-004 remains
  `status: draft`, `lifecycle: planned`.
- Confirmed: `TASK-014` already depends on both replacement tasks; the RTM,
  canonical spec/architecture links, task plans, and Memory Bank routers remain
  consistent with the accepted Planning Revision 1 split.
- Preserved: `TASK-012-T2-FT-004-W6` remains exactly historical `T2` / `W6` /
  `in_progress` with its Attempt 1/2 evidence; the feature
  `SEMANTIC_VERDICT: semantic-fail`, affected REQ lifecycles, and accepted
  modular-monolith/one-server/one-database architecture remain unchanged.
- Deferred: no feature-level `semantic-pass`, feature/epic/REQ promotion,
  dependent unblock, closure, or promotion decision was made by this sync.
- Handoff: return to the explicit Architect/operator owner for applicable
  post-sync lint/doctor gates; this sync did not run `mb-lint`, `/mb-doctor`,
  `/verify`, `/red-verify`, code, or tests.

## [2026-08-10] Wave 6 — TASK-016 FT-004 task-scoped sync
- Reconciled: authoritative `TASK-016-T3-FT-004-W6` is `done` with current
  functional `PASS` and required T3 semantic `semantic-pass` evidence for
  `FT-004-AC-001`, `FT-004-AC-002`, and `FT-004-AC-005`.
- Updated: FT-004 task coverage now links the current TASK-016 functional,
  semantic, and task-scoped sync reports.
- Confirmed: TASK-016 evidence links, task registry, downstream TASK-014
  dependency, RTM ownership, canonical spec routes, and `.memory-bank` router
  surfaces agree; no mechanical task-index/router repair was needed.
- Preserved: TASK-017 remains `planned`; TASK-012 remains historical
  `in_progress`; FT-004/EP-003 and affected REQ lifecycle values, feature
  semantic verdict, accepted architecture, and Planning Revision 1 remain
  unchanged. No promotion or dependent transition was applied.
- Deferred: normal full W6 boundary sync and feature semantic reconciliation
  remain open until TASK-017 is closed by its owner.
- Handoff: explicit Architect/operator owner retains the next action; this
  manual sync did not run `mb-lint`, `/mb-doctor`, `/verify`,
  `/red-verify`, code, or tests.

## [2026-08-08] Wave 6 — TASK-010 FT-005 boundary sync
- Reconciled: indexed `TASK-010-T3-FT-005-W6` is `done` with current functional
  `PASS` and required T3 semantic `semantic-pass` evidence for
  `FT-005-AC-003` and `FT-005-AC-004`.
- Preserved: indexed `TASK-009-T3-FT-005-W5` remains `done`; no stale or
  historical report was used as current W6 closure evidence.
- Updated: FT-005 task coverage now links the current W6 functional and
  semantic evidence plus the compact W6 sync report.
- Confirmed: task index, REQ-010/REQ-014/REQ-015 RTM ownership and AC routes,
  linked canonical contracts/specs, and `.memory-bank` routers agree with the
  authoritative task records; no mechanical router repair was needed.
- Preserved: FT-005/EP-004 document status and lifecycle, and affected REQ
  lifecycle values remain `draft`/`planned` as applicable; no promotion,
  dependent transition, or product lifecycle decision was applied.
- Handoff: sync-local consistency validation passed. Scheduler-owned
  post-sync lint/doctor and any subsequent promotion remain outside this sync.

## [2026-08-08] Wave 5 — TASK-009 / TASK-011 FT-005 + FT-004 boundary sync
- Reconciled: indexed `TASK-009-T3-FT-005-W5` is `done` with current Attempt 2
  functional report-02 `PASS` and current T3 semantic report-02
  `semantic-pass` evidence for `FT-005-AC-001` and `FT-005-AC-002`.
- Reconciled: indexed `TASK-011-T3-FT-004-W5` is `done` with current functional
  report-01 `PASS` and current T3 semantic report-01 `semantic-pass` evidence
  for `FT-004-AC-001`, `FT-004-AC-002`, and `FT-004-AC-005`.
- Updated: FT-004 and FT-005 task-coverage navigation now points to the
  current reports and the compact combined W5 sync report.
- Preserved: TASK-009 Attempt 1 semantic-fail/report-01 remains historical
  correction basis only and is excluded from current closure proof.
- Confirmed: task index, RTM ownership, linked canonical contracts/specs,
  feature/epic references, spec registry/backbone, and `.memory-bank/index.md`
  remain consistent; no router repair or new design decision was needed.
- Preserved: FT-004/FT-005 and EP-003/EP-004 document status and lifecycle, and
  affected REQ lifecycle values remain `draft`/`planned` as applicable; no
  promotion, dependent transition, or product lifecycle decision was applied.
- Handoff: sync-local consistency validation passed. Explicit Orchestrator
  remains responsible for applicable post-sync lint/doctor and next handoff;
  `/mb-sync` did not run them.

## [2026-08-08] Wave 5 — TASK-009 FT-005 boundary sync
- Reconciled: indexed `TASK-009-T3-FT-005-W5` is `done` with current Attempt 2
  functional report-02 `PASS` and current T3 semantic report-02
  `semantic-pass` evidence for `FT-005-AC-001` and `FT-005-AC-002`.
- Preserved: Attempt 1 semantic-fail/report-01 remains historical correction
  basis only and is excluded from current closure evidence.
- Reconciled: FT-005 task coverage, implementation plan, linked canonical
  contracts/specs, task registry, dependency, EP-004 reference, and RTM
  ownership agree with the completed W5 task outcome.
- Confirmed: `.memory-bank/index.md`, task index, feature links, spec registry,
  and spec backbone already route the affected durable surfaces; no mechanical
  router repair was needed.
- Preserved: FT-005/EP-004 document status and lifecycle, and REQ-009,
  REQ-014 RTM lifecycle values remain `draft`/`planned` as applicable; no
  promotion, dependent transition, or product lifecycle decision was applied
  by `/mb-sync`.
- Handoff: sync-local consistency validation passed. Explicit owner
  Orchestrator remains responsible for applicable post-sync lint/doctor and
  the next workflow handoff; `/mb-sync` did not run them.

## [2026-08-08] Wave 5 — TASK-008 FT-006 boundary sync
- Reconciled: indexed `TASK-008-T3-FT-006-W5` is `done` with current Attempt 2
  functional report-02 `PASS` and current T3 semantic report-02
  `semantic-pass` evidence for `FT-006-AC-002`, `FT-006-AC-003`,
  `FT-006-AC-005`, `FT-006-AC-006`, and `FT-006-AC-007`.
- Preserved: Attempt 1 semantic-fail/report-01 remains historical correction
  basis only and is excluded from current closure evidence.
- Reconciled: FT-006 task coverage, implementation plan, linked canonical
  contracts/specs, task registry, dependency, EP-005 reference, and RTM
  ownership agree with the completed W5 task outcome.
- Confirmed: `.memory-bank/index.md`, task index, feature links, spec registry,
  and spec backbone already route the affected durable surfaces; no mechanical
  router repair was needed.
- Preserved: FT-006/EP-005 document status and lifecycle, and REQ-010,
  REQ-012, REQ-013, REQ-014, REQ-015, and REQ-016 RTM lifecycle values remain
  `draft`/`planned` as applicable; no promotion, dependent transition, or
  product lifecycle decision was applied by `/mb-sync`.
- Handoff: sync-local consistency validation passed. Scheduler-owned
  `mb-lint`, strict doctor, and any subsequent promotion remain outside this
  sync boundary.

## [2026-08-08] Wave 4 — TASK-006 FT-002 / TASK-007 FT-006 boundary sync
- Reconciled: indexed `TASK-006-T2-FT-002-W4` and
  `TASK-007-T3-FT-006-W4` are `done` with current independent functional
  `PASS` evidence; TASK-007 also has the required T3 semantic `semantic-pass`
  evidence for `FT-006-AC-001` and `FT-006-AC-004`.
- Reconciled: current FT-002 feature-level semantic `semantic-pass` evidence
  covers the completed `FT-002-AC-001..AC-006` scope and is linked from the
  feature document and durable report.
- Confirmed: FT-002/FT-006 task plans, linked canonical contracts/specs, task
  registry, dependencies, feature/epic references, and RTM ownership agree with
  the completed W4 boundary outcomes.
- Preserved: TASK-007's historical Attempt 1 functional `FAIL` remains
  correction evidence; current Attempt 2 functional and semantic reports are
  the closure evidence linked by the authoritative task record.
- Preserved: FT-002, FT-006, their epics, and affected REQ lifecycle values
  remain `planned`; no promotion, selection, implementation, verification,
  red-verification, dependent transition, or product lifecycle decision was
  applied by `/mb-sync`.

## [2026-08-08] Wave 3 — TASK-004 and TASK-005 boundary sync
- Reconciled: indexed `TASK-004-T3-FT-001-W3` and
  `TASK-005-T3-FT-002-W3` are already `done` under scheduler-owned closure
  decisions, with current independent functional `PASS` and required T3
  semantic `semantic-pass` evidence links.
- Preserved: TASK-005 Attempt 1 `semantic-fail` remains historical correction
  evidence in report-01; current closure evidence points to corrected Attempt 2
  functional and semantic report-02 artifacts.
- Confirmed: FT-001/FT-002 feature plans, their task-linked canonical specs,
  task index entries, and RTM ownership agree with TASK-004 coverage of
  `FT-001-AC-001`, `FT-001-AC-002`, and `FT-001-AC-004`, and TASK-005 coverage
  of `FT-002-AC-001` and `FT-002-AC-002`. The REQ-014 RTM route now includes
  its existing `FT-002-AC-001` linkage.
- Preserved: FT-001, FT-002, EP-001, and their requirement lifecycle values
  remain `planned`; no feature, epic, or requirement lifecycle decision was
  written at this wave boundary.
- Preserved: no task promotion, selection, dependent unblock/block, or final
  product lifecycle transition was applied by `/mb-sync`; post-sync gates and
  the next scheduler pass remain caller-owned.

## [2026-08-08] Wave 2 — FT-001 TASK-015 boundary sync
- Reconciled: indexed `TASK-015-T3-FT-001-W2` is `done` with current
  independent functional `PASS` and semantic `semantic-pass` evidence links.
- Confirmed: FT-001 feature/plan, Account Provisioning Boundary, Access
  Control Contract, and RTM references agree with the repaired server-authorized
  atomic provisioning path.
- Preserved: `TASK-003` remains the historical `failed` attempt and its BUG
  record now links the TASK-015 correction; `TASK-004` remains `blocked` on
  `TASK-015`; FT-001 and its requirements remain `planned`.
- Preserved: no lifecycle promotion, dependent unblock, implementation, or
  verification decision was inferred or changed by `/mb-sync`.

## [2026-08-08] Wave 2 — FT-001 early local reconciliation
- Updated: reconciled the changed Account Provisioning Boundary and Access
  Control Contract links with FT-001, its implementation plan, TASK-003 failure
  history/BUG, and the indexed TASK-015 follow-up record.
- Updated: extended FT-001 RTM test locators through `FT-001-AC-005` while
  preserving all requirement and feature lifecycle values as `planned`.
- Preserved: `TASK-003` remains `failed`, `TASK-004` remains `blocked` on
  `TASK-015`, and `TASK-015` remains `in_progress`; no retry budget, promotion,
  closure, or dependent lifecycle was changed.
- Handoff: TASK-015 has executor and independent functional `PASS` evidence;
  execution is paused for the required `/red-verify TASK-015-T3-FT-001-W2`,
  after which its lifecycle owner must decide closure. This early sync is
  partial by boundary and does not replace the final wave sync.

## [2026-08-08] Wave 1 — Foundation boundary sync
- Updated: reconciled the completed `TASK-002-T3-FT-000-W1` gate and its
  functional `PASS` / semantic `semantic-pass` evidence into Foundation and
  FT-000 handoff routing.
- Preserved: task lifecycle ownership, RTM lifecycle, and promotion remain
  with the scheduler/owning workflow.

## [2026-08-08] Wave 0 — Foundation W0 durable sync
- Updated: reconciled `TASK-001-T3-FT-000-W0` closure/evidence routing with the
  authoritative indexed task record (`done`, functional `PASS`, semantic
  `semantic-pass`).
- Updated: recorded that the dependent final Foundation gate
  `TASK-002-T3-FT-000-W1` remains `planned`; REQ-000 and FT-000 lifecycle stay
  open until that gate completes.

## [2026-08-07] Initial setup
- Created Memory Bank skeleton
- Seeded core docs (product, requirements, testing, task registry)
