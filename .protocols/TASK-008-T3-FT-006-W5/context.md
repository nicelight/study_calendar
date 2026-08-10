---
description: Execution context for TASK-008-T3-FT-006-W5.
status: active
---
# Context — TASK-008-T3-FT-006-W5

## Purpose

Implement the Financial Ledger payment command and projection surface within
the accepted Financial Ledger ownership boundary.

## Execution Attempt
- attempt: 1
- started: 2026-08-08 18:35:33 +0500

## Execution Attempt
- attempt: 2
- started: 2026-08-08 19:13:03 +0500
- retry basis: bounded task-local correction retry 1/2 after the Attempt 1 T3 semantic-fail
- correction target: range-consistent `getBalanceProjection`; out-of-range allocations must not be returned or used when a bounded range is requested
- preserved basis: Attempt 1 RED, functional PASS, semantic-fail, and report-01 artifacts remain historical/supporting evidence

## Inputs (what drives this task)
- Task record: `.memory-bank/tasks/TASK-008-T3-FT-006-W5.task.json`
- Task index: `.memory-bank/tasks/index.json`
- Specs: `.memory-bank/contracts/financial-ledger.md`, `.memory-bank/contracts/access-control.md`, `.memory-bank/contracts/boundary-map.md`, `.memory-bank/states/lifecycle-map.md`, `.memory-bank/domains/core-domain.md`
- Acceptance criteria source: `.memory-bank/features/FT-006-financial-ledger.md#acceptance-criteria`

## Richer inputs
- Source Artifacts: AC-002, AC-003, AC-005, AC-006, AC-007; storage/data-flow rules; financial projection boundary.
- Normative Inputs: Financial Ledger, Access Control, Financial Projection, and Learning/Finance lifecycle contracts.
- Constraints / Invariants: Admin own-center authority; Teacher assigned-class create-only; exact decimal arithmetic; oldest-first allocation; projection reads are non-mutating; repeated confirmed intent is idempotent.
- Verification Targets: decimal deterministic replay; partial/full/excess states; authority/edit/cancel audit; week/month marker projection; retry safety.

## Fallback basis
- Classic feature doc: `.memory-bank/features/FT-006-financial-ledger.md`
- Requirements / RTM: `REQ-010`, `REQ-012`, `REQ-013`, `REQ-014`, `REQ-015`, `REQ-016` as linked by the task card.
- Duo docs: `.memory-bank/architecture/system-architecture.md#storage-and-data-flow-rules`, `.memory-bank/domains/core-domain.md#persistence-and-transaction-rules`

## Loaded context set
- `AGENTS.md`
- `.memory-bank/constitution.md`
- `.memory-bank/spec-backbone.md`
- `.memory-bank/spec-index.md`
- `.memory-bank/workflows/tier-policy.md`
- `.memory-bank/contracts/financial-ledger.md`
- `.memory-bank/contracts/access-control.md`
- `.memory-bank/contracts/boundary-map.md`
- `.memory-bank/features/FT-006-financial-ledger.md`

## Decisions / assumptions
- Decision: keep Financial Ledger as the sole writer of payment, allocation, balance, marker, and financial-audit state; consume Center & Scheduling facts through its existing public port.
- Decision: use isolated disposable `:memory:` databases and deterministic clocks for all prospective T3 probes.
- Assumption (needs verification): feature-level payload shape remains implementation-owned; public methods will use request objects while preserving the named contract operations.

## Commands run / environment notes
- Attempt 1 read-only preflight confirmed task/dependency/index/review state and current dirty-worktree overlap before its prospective work.
- Attempt 2 reused the open `in_progress` task, initialized its new Execution Attempt before the correction RED/prod write, and preserved the existing dirty-worktree changes.

## Open questions / blockers
- None at preflight. Stop if payment behavior would require a new cross-slice write or an unaccepted public contract.

## Next session
- Start by reading: `context.md`, `plan.md`, `progress.md`
- Next action (one concrete step): run fresh independent `/verify TASK-008-T3-FT-006-W5`; after functional PASS, run required T3 `/red-verify`.
