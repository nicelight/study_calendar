---
description: Durable decisions for FT-004 task planning.
status: active
---
# FT-004 Decision Log

## 2026-08-08 — Task queue created

Object ownership/scope and branch projection are distinct cohesive outcomes. Existing collaboration, access, domain, and state contracts are sufficient; no new canonical concern was created. Planning Revision remains `1`.

## 2026-08-08 — TASK-012 Attempt 2 controlled re-tier

Queue action is `rebuild_required`. The indexed identity
`TASK-012-T2-FT-004-W6` has original tier `T2`, while Attempt 2 requires `T3`
because it changes protected cross-center reads, target checks, mutations, and
uniqueness boundaries after supported class identity reuse. The harm proof is
owned by `REQ-014`/`FT-004-AC-005`; preservation crosses the existing
TASK-011 comment/reaction scope and TASK-012 threaded-discussion scope.

No product, canonical-spec, graph, or Planning Revision decision changed.
TASK-012 identity, `in_progress` lifecycle, tier, dependencies, and all Attempt
1/2 evidence are preserved; no replacement card or downstream dependency was
written. A controlled transparent T3 reconstruction must first resolve fresh
identity/claim ownership and the `TASK-014-T3-FT-003-W8` dependency, then route
fresh `/review-tasks-plan FT-004`, the applicable doctor gate, and replacement
execution. Feature semantic review, closure, sync, and promotion remain blocked
until that route completes.
