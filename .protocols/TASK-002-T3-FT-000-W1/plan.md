---
description: Execution plan for TASK-002-T3-FT-000-W1.
status: active
---
# Plan — TASK-002-T3-FT-000-W1

## Goal
Run the project-native check/build/test gates and one-server Foundation smoke
against an isolated disposable shared database.

## Non-goals
- No product feature behavior or product task records.
- No second server, database, store, event bus, or architecture change.
- No dependency-task proof copying, lifecycle closure, `/verify`, `/red-verify`,
  `/mb-sync`, or promotion.

## Scope
### In scope
- Task-scoped protocol and evidence under `.protocols/TASK-002-T3-FT-000-W1/`
  and `.tasks/TASK-002-T3-FT-000-W1/`.
- Existing project-native commands and disposable runtime smoke.

### Out of scope
- Production source changes unless a bounded task-local gate defect is found.

## Claim-linked RED / GREEN (T2/T3)
- applicability: applicable
- accepted claim locators: `REQ-000`; `mvp-verification.md#foundation-smoke-path`; `core-domain.md#persistence-and-transaction-rules`
- planned test/probe: check/build/test; one dev server; isolated DB roundtrip,
  protected denial, authenticated public boundary, and failed binding state equality.
- RED: honest pre-implementation failure if the existing integrated substrate
  cannot satisfy a required claim; otherwise preserve pre-implementation GREEN
  without changing production behavior.
- T3 isolation: temp disposable DB directory, loopback server only, deterministic
  seed and cleanup.

## Applicable quality gates
- [ ] `npm run check && npm run build && npm run test`
- [ ] `npm run dev -- --host 127.0.0.1`

## Handoff owner
- `/verify` owns final functional verification; `/red-verify` is required after
  functional PASS for this T3 task; lifecycle closure remains outside `/exe`.
