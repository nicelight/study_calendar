---
description: Bounded task-planning resume state for FT-003.
status: active
---
# FT-003 Task Planning Plan

## Outcome and scope

Deliver elastic weekly calendar navigation and authorized shared/personal lesson context without cross-student leakage.

## Canonical inputs and ownership

- Feature: [.memory-bank/features/FT-003-calendar-and-lesson-context.md](../../.memory-bank/features/FT-003-calendar-and-lesson-context.md)
- Primary owner: Lesson Context at `src/lib/server/modules/lesson-context/`.
- Consumer boundaries: Calendar and Membership Query, Personal Progress Query, Day Discussion Query, and Financial Projection Query in [boundary-map](../../.memory-bank/contracts/boundary-map.md).
- Composition spine: [.memory-bank/architecture/system-architecture.md#composition-and-request-data-flow](../../.memory-bank/architecture/system-architecture.md#composition-and-request-data-flow)

## Boundary and waves

1. `TASK-013-T2-FT-003-W7` owns calendar geometry, date selection, and perceivable lesson state (AC-001, AC-002), after scheduling.
2. `TASK-014-T3-FT-003-W8` owns shared/personal composition, context-preserving navigation, and server-side privacy (AC-003..AC-006), after all provider slices.

Cross-slice business orchestration remains in Lesson Context; provider data remains owned by its source slice.

## Verification

Run native gates with claim-linked paths: AC-001 geometry/date navigation, AC-002 color-independent cue, AC-003 shared material, AC-004 personal composition, AC-005 context preservation, and AC-006 guessed-student denial. The T2/T3 cards carry separate RED/GREEN observations and artifacts for every claim.
