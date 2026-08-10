---
description: Durable decisions for the FT-000 Foundation queue.
status: active
---
# FT-000 Foundation Decision Log

## 2026-08-08 — Foundation queue reconciled

- Authority: `.memory-bank/spec-backbone.md` is `complete` with
  `strict_architecture_scaffold` and Planning Revision `1`; Foundation is
  required because the repository has no executable SvelteKit/DB/test
  baseline.
- Preserved target: modular monolith, one SvelteKit server, one shared
  database, capability slices with explicit public boundaries and write owners.
- Reused substrate: existing architecture, boundary, access-control, domain,
  testing, and Foundation runbook specs; no new canonical substrate spec is
  needed.
- Minimum scope: composition root, platform seams, Identity & Access and
  Center & Scheduling boundary seams, isolated fixture/test harness, and the
  required integrated smoke. Product slices and product behavior remain out of
  scope.
- Queue shape: one T3 W0 implementation/probe task followed by one dependent
  T3 W1 final Foundation gate task; no product tasks are indexed.
- Deferred choices: database engine/migration library and exact Telegram/Google
  SDK configuration remain execution-level decisions under the accepted
  contracts.
- At the time of this entry, lifecycle was planning-only; the final gate was
  left open for the next workflow handoff. Subsequent execution and semantic
  evidence remain authoritative in the task-linked protocol and evidence paths.

## Unresolved decisions

None. A new material branch about the accepted architecture, storage contract,
provider boundary, or Foundation sufficiency must stop execution and route to
`/spec-design`.
