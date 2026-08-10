---
description: Durable decomposition plan for the clarified PRD.
status: active
---
# PRD Bootstrap Plan

## Source
- [.memory-bank/prd.md](../../.memory-bank/prd.md): clarified product source.
- [.memory-bank/spec-backbone.md](../../.memory-bank/spec-backbone.md): ready pre-PRD framing.

## Decomposition
- Derive one L1 Product, stable REQ IDs, five value-oriented epics, and six product features.
- Keep authentication, center operations, calendar/day context, collaboration, learning progress, and finance traceable to PRD behavior.
- Keep privacy, financial correctness, and final acceptance as cross-cutting requirements with feature-level acceptance coverage.
- Stop before architecture/task design; `/spec-design` owns global backbone and Foundation decisions.

## Boundary Scan Result
- Split communication from calendar/day context because threaded chat, reactions, and field comments form an independently observable acceptance cluster.
- Split scheduling/center administration from the calendar because recurring schedule exceptions and membership lifecycle have an independently observable administrative outcome.
- Keep shared/personal day context with the calendar because both use one temporal navigation outcome and one authorized day-opening flow.
- Keep payment ledger separate from learning progress because monetary allocation, audit, and historical-price correctness are independently verifiable outcomes.

## Validation
- Every feature has stable `FT-<NNN>-AC-<NNN>` criteria, governing `REQ-*`, verification method, and acceptance closure.
- No implementation plan, task record, feature-owned design hub, or testing-policy change is created here.
