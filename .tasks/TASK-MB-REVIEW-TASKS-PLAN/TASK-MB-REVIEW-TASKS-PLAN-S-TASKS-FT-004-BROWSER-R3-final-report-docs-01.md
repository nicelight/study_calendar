---
description: Bounded Revision 2 task-plan rerun for the final FT-004 browser proof linkage.
status: active
---
# Review FT-004 task planning surface — browser rerun R3

VERDICT: REJECT

REVIEWED_PLANNING_REVISION: 2

ARCHITECTURE_REVIEW: not_required

## Review mode and checked delta

Это bounded rerun предыдущего R2 review: Planning Revision остаётся `2`, а
исправленный delta проверен прямым чтением текущих feature/plan/protocol/task
files и acceptance-trace parser. Оба co-review focus обновлены fresh-контекстами
на `gpt-5.6-luna/xhigh`; оба независимо подтвердили один blocking finding.

Подтверждённые исправления:

- `PLANNING_RECONCILIATION_REQUIRED` удалён из
  `.memory-bank/features/FT-004-day-collaboration.md`;
- точные uppercase `FT-004-AC-001..005` теперь присутствуют в
  `source_artifacts` (`TASK-102:88-103`, `TASK-103:82-99`);
- дублирующий REQ-014 item удалён из TASK-102: осталось четыре
  `evidence_required` entries (`TASK-102:74-79`);
- планы указывают TASK-014 как `done`
  (`.memory-bank/tasks/plans/IMPL-FT-004.md:82-91`,
  `.protocols/FT-004/plan.md:163-169`).

## Structural and execution checks — PASS except finding below

- Global Backbone `complete`, positive Planning Revision `2`, Foundation gate
  `TASK-002-T3-FT-000-W1` — `done` (`.memory-bank/spec-backbone.md:84-98`,
  `.memory-bank/foundation.md:10-25`).
- Read-only schema/index/DAG validation: 61 unique resolving entries, all task
  cards schema-valid, current FT-004 IDs consistent with T3/feature/wave,
  dependencies resolve and the graph is acyclic
  (`.memory-bank/tasks/index.json:241-246`).
- Canonical gate paths, RED/GREEN/artifact contracts, disposable SQLite and
  cleanup, no-cookie/invalid-session/revocation, deny-before-mutation and T3
  forbidden scopes are present in both cards
  (`TASK-102:30-60,62-79,129-165`; `TASK-103:24-54,56-72,128-170`).
- `mb-lint` passed with existing advisory warnings. A scoped FT-004
  `git diff --check` is clean; the full current-worktree command reports an
  unrelated whitespace issue at `AGENTS.md:210`, so that environment note must
  be cleaned or excluded before executing the card's full gate.

## Coverage and slicing — PASS except finding below

W35 → W36 remains a cohesive sequential split: TASK-102 owns server projection
and named form-action transport; TASK-103 owns the browser UI and browser proof.
All five feature ACs have stable headings, governing REQs, and exact matching
`source_artifacts` ownership. The current plan/protocol status statements and
direct task dependencies are consistent with the indexed cards; historical
TASK-012 remains excluded from the executable queue.

## Design readiness — PASS

Clarification is complete, no reconciliation/blocked marker remains, and the
accepted participant-label path is unchanged and already reviewed: Identity &
Access owns `fullName`, Collaboration authorizes and selects participant IDs,
and Lesson Context composes display data. No new architecture or boundary
question was introduced by this mechanical rerun, so
`ARCHITECTURE_REVIEW: not_required` is applicable.

## Blocking finding

### BLOCKER-1 — AC IDs are absent from both `verification_targets`

The current cards contain exact AC locators in `source_artifacts`, and AC IDs in
`verify`/`evidence_required`, but none in `verification_targets`:

- TASK-102 has no `FT-004-AC-005` in `verification_targets`
  (`.memory-bank/tasks/TASK-102-T3-FT-004-W35.task.json:142-146`);
- TASK-103 has no `FT-004-AC-001..005` in `verification_targets`
  (`.memory-bank/tasks/TASK-103-T3-FT-004-W36.task.json:142-146`).

The acceptance-trace implementation explicitly checks
`task.verification_targets` for the exact AC ID
(`.memory-bank/scripts/mb-doctor/acceptance-trace.mjs:274-292`). Its
planned/ready path therefore produces `TASK_ACCEPTANCE_PROOF_MISSING` with
`verification_target_missing` for TASK-102 AC-005 and TASK-103 AC-001..005.
This means the claimed AC trace is not reproducible against the current cards;
the `verify` field does not substitute for `verification_targets`.

Repair owner: `/feature-to-tasks FT-004`; add each task-owned AC ID to its
corresponding `verification_targets`, then rerun `/review-tasks-plan FT-004`.

## Handoff

FT-004 remains unsafe for `/exe` despite the substantial fixes. First reconcile
the missing target-linked AC IDs through `/feature-to-tasks FT-004`. After a
current-revision `APPROVE`, run the applicable `/mb-doctor --strict` gate and
then execute TASK-102 and TASK-103 sequentially.

This review changed only its REQUEST and report artifacts; feature, contracts,
plans, protocols, task cards, index, lifecycle, statuses, code and evidence
artifacts were not modified.

report_path: `.tasks/TASK-MB-REVIEW-TASKS-PLAN/TASK-MB-REVIEW-TASKS-PLAN-S-TASKS-FT-004-BROWSER-R3-final-report-docs-01.md`
