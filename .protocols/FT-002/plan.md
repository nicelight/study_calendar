---
description: Bounded task-planning resume state for FT-002.
status: active
---
# FT-002 Task Planning Plan

## Outcome and scope

Deliver center-bounded membership/class management and recurring lesson scheduling with independent lesson exceptions and preserved identity.

## Canonical inputs and ownership

- Feature: [.memory-bank/features/FT-002-center-and-scheduling.md](../../.memory-bank/features/FT-002-center-and-scheduling.md)
- Owner: Center & Scheduling at `src/lib/server/modules/center-scheduling/`.
- Public boundary: [.memory-bank/contracts/boundary-map.md#calendar-and-membership-query-boundary](../../.memory-bank/contracts/boundary-map.md#calendar-and-membership-query-boundary)
- Access contract: [.memory-bank/contracts/access-control.md](../../.memory-bank/contracts/access-control.md)
- Foundation prerequisite is transitive through FT-001.

## Boundary and waves

1. `TASK-005-T3-FT-002-W3` owns center membership, class modes, and provider-owned authorization facts (AC-001, AC-002).
2. `TASK-006-T2-FT-002-W4` owns recurrence, per-lesson operations, transfer identity, assignment authorization, and the Financial Ledger identity integration (AC-003, AC-004, AC-005, AC-006), after membership and the charge foundation.
3. `TASK-026-T3-FT-002-W12` remains the completed owner of the protected
   own-center Admin class/schedule surface (AC-007).
4. The new unmerged unit is the schedule form's browser-only draft lifecycle:
   save the exact `{startDate,endDate,weekdays}` whitelist under a
   `centerId` + `classId` scoped `localStorage` key, restore only that form,
   ignore missing/malformed values to clean defaults, and clear only after
   successful schedule creation (AC-008). It reaches useful implementation
   and browser proof without changing scheduling persistence or validation, so
   no merge with completed TASK-026 or the server lifecycle task is justified.
   The resulting `TASK-031-T2-FT-002-W15` depended directly on done TASK-026,
   was the next sequential ready queue item, and is now closed `done` with
   independent functional `PASS`.
5. Operator decision `2` resolves the feature-level semantic concern as a
   separate server-owned outcome: a valid ISO date range and valid weekday
   selection that yields no actual dates in the inclusive range MUST be
   rejected before the schedule or lesson write path. The existing Admin
   transport contract remains the external failure shape (`400` with
   `{ error: 'invalid_schedule' }`). This is a fresh T2 unit, not a repair or
   scope expansion of TASK-031: `TASK-032-T2-FT-002-W16` owns AC-009 and the
   no-mutation proof, with direct prerequisites TASK-026 and TASK-031 for the
   protected form/adapter and its already-closed draft lifecycle.

Consumers query the named public boundary; they do not write scheduling state. Lesson Context composes downstream views, Collaboration and Learning Progress own their data, and Financial Ledger owns charge facts; adding dependencies on those downstream consumers would create cycles, so only TASK-007 is a prerequisite for TASK-006's charge-identity integration.

## Verification

Use project-native gates plus claim-linked paths: AC-001/002 center and class authorization; AC-003 recurrence isolation; AC-004 transfer identity and charge uniqueness; AC-005 historical access; AC-006 immediate removal denial. Each owned AC has a concrete RED/GREEN observation and artifact path in its indexed card.

AC-008 uses a real-browser RED/GREEN comparison on the protected schedule
form: the current page loses a populated draft after reload; GREEN restores the
same center/class form, keeps other center/class forms clean, ignores malformed
storage, preserves the draft after expected validation failure, and removes
only the matching key after successful creation. Project-native check, build,
and test gates remain required. The browser probe records request Form Data and
`localStorage` state; it must not infer a checkbox UI defect from an omitted
`weekdays` payload.

## Revision 2 reconciliation

Global Backbone `complete`, Planning Revision `2`; FT-002 reuses the accepted
Center & Scheduling boundary with no task-level impact. TASK-005 and TASK-006
remain untouched with their identity, status, evidence, dependencies, and
retry history preserved.

## W15 schedule draft closure

The explicit 2026-08-14 operator requirement adds material AC-008 after
TASK-026 was completed. Queue action is `rebuild_required`: TASK-026 and every
historical task remain unchanged, while a fresh T2 identity owns only the new
browser draft behavior. The authoritative card now records `done` with
functional `PASS`; its evidence is linked from the card and
`.protocols/TASK-031-T2-FT-002-W15/verification.md`. Global Backbone stays
`complete` at Planning Revision `2`; the accepted module graph and server
ownership are unchanged. FT-002/REQ-004 are `implemented`, not `verified`,
until a fresh feature-level `/red-verify --feature FT-002` covers AC-001..AC-008.

## W16 zero-occurrence schedule rejection

The fresh AC-009 unit is `rebuild_required`: the accepted operator decision
adds a material server-side invariant after TASK-031 closed. TASK-032 is T2
because it changes Center & Scheduling domain validation and transaction
preconditions, with persistence/lesson state and HTTP failure behavior in the
proof surface. Its RED/GREEN path must show the current zero-lesson
`schedule_created` behavior, then a `400 invalid_schedule` response with
state-before/state-after equality and no schedule or lesson row. A valid
occurrence path, authorization, and TASK-031 browser draft behavior remain
regression prerequisites, not claims transferred to TASK-032.

Expected gates are `npm run check`, `npm run build`, and `npm run test`, plus a
fresh server/action probe and a protected-browser form submission observing
the exact failure envelope and unchanged state. No schema migration,
dependency, UI/localStorage, or new public error shape is authorized.
