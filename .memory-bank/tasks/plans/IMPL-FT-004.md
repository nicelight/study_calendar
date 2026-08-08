---
description: Implementation plan for FT-004 day collaboration.
status: active
---
# IMPL-FT-004 — Day Collaboration

## Goal

Implement scoped comments/reactions and durable threaded day discussions.

## Scope / non-goals

Include one editable comment per account/field, five reactions, arbitrary reply depth, ten active branch tabs, retention, and shared/personal authorization. Exclude event-bus infrastructure and unrelated lesson/progress writes.

## Strategy and ownership

Collaboration owns comments, reactions, messages, replies, and branch visibility at `src/lib/server/modules/collaboration/`. It consumes actor and calendar scope boundaries.

## Ordered tasks

| Wave | Task | Outcome | Dependency |
|---|---|---|---|
| W5 | TASK-011-T3-FT-004-W5 | comments, reactions, and scope | TASK-005-T3-FT-002-W3 |
| W6 | TASK-012-T2-FT-004-W6 | threaded branches and tabs | TASK-011-T3-FT-004-W5 |

## Gates and verification

Run `npm run check`, `npm run build`, and `npm run test`; verify AC-001/002/005 on TASK-011 and AC-003/004 on TASK-012. Use the cards’ claim-linked RED/GREEN paths for owner, visibility, reaction, depth, ordering, retention, and privacy.
