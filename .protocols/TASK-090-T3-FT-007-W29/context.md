---
description: Execution context for TASK-090-T3-FT-007-W29.
status: active
---
# Context — TASK-090-T3-FT-007-W29

## Purpose

Implement the Financial Ledger-owned, read-only factual payment-capability
projection for `FT-007-AC-005 / REQ-014 / REQ-017` without reconstructing or
mutating payment, allocation, charge, balance, audit, or Center & Scheduling
facts.

## Execution Attempt

- attempt: 1
- started: 2026-08-22 18:50:30 +0500

## Inputs (what drives this task)

- Task record: `.memory-bank/tasks/TASK-090-T3-FT-007-W29.task.json`
- Task index: `.memory-bank/tasks/index.json`
- Feature / acceptance: `.memory-bank/features/FT-007-navigation-and-statistics.md#FT-007-AC-005`
- Requirements: `REQ-014`, `REQ-017`

## Richer inputs

- Source artifacts and normative inputs: exact links in the indexed task card.
- Canonical contracts: Statistics Projection payment-capability query,
  Financial Ledger facts/transactions, Actor Context, Financial Scope and
  Lesson Fact, Financial Projection Query, and Access Control authority/scope.
- Verification target: isolated provider role/scope and factual-date matrix
  through the accepted public ports.

## Loaded context set

- `AGENTS.md` and `.memory-bank/roles/implementer.md`
- `.agents/skills/exe/SKILL.md`
- `.memory-bank/tasks/TASK-090-T3-FT-007-W29.task.json`
- `.memory-bank/features/FT-007-navigation-and-statistics.md`
- `.memory-bank/contracts/{statistics-projection,financial-ledger,boundary-map,access-control}.md`
- `.memory-bank/workflows/{tier-policy,execute-loop,autonomy-policy}.md`
- `.memory-bank/tasks/plans/IMPL-FT-007.md` and current FT-007 review approval

## Decisions / assumptions

- Local tactic: expose one Financial Ledger public query using the existing
  Actor Context and Financial Scope/Lesson Fact ports; no new edge or owner.
- Count only current persisted allocation rows whose recorded Payment and
  active Charge remain counted, and obtain each actual lesson date from the
  accepted lesson-fact port before comparison.

## Commands run / environment notes

- `node scripts/mb-doctor.mjs --strict` → PASS before task start.
- Broad unrelated dirty work exists, but neither hard-boundary source/test file
  was dirty before this attempt.

## Open questions / blockers

- None.

## Next session

- Start by reading: `context.md`, `plan.md`, `progress.md`.
- Next action: add and run the isolated claim-specific pre-implementation probe.
