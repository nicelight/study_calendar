---
description: Execution plan for TASK-012-T2-FT-004-W6.
status: active
---
# Plan — TASK-012-T2-FT-004-W6

## Goal

Expose Collaboration-owned message/reply commands and scoped discussion
projections that preserve arbitrary nesting and all messages while limiting the
recent branch-tab projection to the ten most recently active roots.

## Non-goals

- Do not change TASK-011 comment, reaction, or authorization ownership.
- Do not add UI/routes, an event bus, a second store, or a separate tab state machine.
- Do not cap reply depth or delete/hide retained messages from the common feed.
- Do not run verification, semantic review, lifecycle closure, or Memory Bank sync.

## Inputs / source specs

- Task record: `.memory-bank/tasks/TASK-012-T2-FT-004-W6.task.json`
- Task index: `.memory-bank/tasks/index.json`
- Feature/Epic: `.memory-bank/features/FT-004-day-collaboration.md`
- REQ IDs: `REQ-006`, `REQ-008`, `REQ-014`

## Richer execution inputs

- Source Artifacts: FT-004 AC-003/AC-004; accepted architecture; Day Discussion Query Boundary; Access Control; Core Domain discussion relationship; Collaboration lifecycle.
- Normative Inputs: `.memory-bank/contracts/boundary-map.md#day-discussion-query-boundary`, `.memory-bank/states/lifecycle-map.md#collaboration`, `.memory-bank/domains/core-domain.md#domain-relationships`.
- Verification Targets: nested depth, first-reply tab transition, common-feed completeness and scope, eleven-plus ordering, ten-tab limit, retention, and reactivation.

## Constraints / invariants (MUST / NEVER)

- MUST keep message, reply, activity, and tab-projection ownership in Collaboration.
- MUST authorize every public command/query through the existing actor and class/student scope boundaries.
- MUST retain every branch message and return all permitted messages in the common feed.
- MUST activate a branch tab only after the root receives its first reply and show at most ten recent tabs.
- NEVER cap parent depth, treat a hidden tab as deletion, or add an unaccepted cross-slice edge.

## Scope

### In scope

- Collaboration message persistence in the existing shared database schema owner.
- Collaboration public message/reply commands and common/branch/recent-tab queries.
- One focused in-memory integration test for the task-owned AC-003/AC-004 claims.
- Task protocol, execution evidence, final Implementer report, and handoff.

### Out of scope

- Routes/UI, lesson/progress/financial writes, dependency proof reconstruction, verification verdicts, task closure, and feature sync.

## Proposed changes

### Touched areas (hypotheses OK)

- `src/lib/server/modules/collaboration/public.ts` — message/reply owner operations and scoped projections.
- `src/lib/server/platform/database.ts` — durable Collaboration message rows and lookup indexes.
- `tests/collaboration/threaded-discussions.test.ts` — focused AC-003/AC-004 RED/GREEN probe.

### Preflight-confirmed change surface

- Expected hints kept: `src/lib/server/modules/collaboration/`, `tests/collaboration/`.
- Additional same-outcome files/areas and rationale: `src/lib/server/platform/database.ts` is the existing project-level shared schema owner required to persist Collaboration messages; no composition-root change is needed.
- Hard `write_boundary` present and satisfied: not set.
- `forbidden_scope` / stop-condition check: clear; no Foundation task record is touched and no new branch-retention product decision is needed.

## Applicable quality gates

- [x] Focused RED/GREEN: `npm run test -- tests/collaboration/threaded-discussions.test.ts` — proves AC-003/AC-004 directly.
- [x] `npm run check` — proves public API/type consistency.
- [x] `npm run build` — proves the production SvelteKit build remains valid.
- [x] `npm run test` — proves task behavior and project regression coverage.
- [x] `git diff --check` — proves the edited surface has no whitespace corruption.

## Claim-linked RED / GREEN (T2/T3)

- applicability: applicable
- accepted claim locators: `FT-004-AC-003`, `FT-004-AC-004`
- planned test/probe and environment: fresh in-memory SQLite composition root with server-side center/class/student/lesson fixtures; one focused test per AC runs first against the pre-W6 source and then unchanged or claim-equivalently strengthened after implementation.
- observable RED: AC-003 has no message/reply/common-feed/branch-tab public behavior; AC-004 has no eleven-branch recent ordering, retention, or reactivation behavior.
- corresponding GREEN: an arbitrarily deep retained reply chain creates a tab on first reply and remains complete in the scoped common feed; eleven active branches project only the ten newest, a hidden branch remains queryable, and new nested activity restores it.
- accepted not-applicable reason and alternative proof: none.
- T3 isolation, safe rerun, cleanup, and permission boundary: not applicable to T2; every probe uses a fresh `:memory:` database closed after the test and has no external side effect.

## Fan-out plan (if needed)

- None; delegation is prohibited for this execution.

## MB-SYNC handoff / owner

- [x] Owner identified: scheduler after independent verification and lifecycle decision.
- [x] Explicit standalone owner basis recorded if manual closure is expected: n/a.
- [x] `.memory-bank/` docs needing update: none during `/exe`; current specs already describe the accepted WHY/WHERE and lifecycle owner handles boundary sync.
- [x] `.memory-bank/index.md` router update needed: no.
- [x] RTM update in `.memory-bank/requirements.md` needed: no during execution.
- [x] Task registry/status update owner: scheduler after independent `/verify`.
- [x] Changelog update owner: lifecycle/sync owner.

## Definition of done

- Honest claim-scoped RED precedes the first W6 production change.
- Minimal production behavior and focused tests satisfy AC-003/AC-004 and direct specs.
- Focused GREEN, required check/build/test gates, actual files, and hard-scope evidence are durable.
- Final Implementer report/handoff routes only to fresh independent `/verify`; task remains `in_progress`.
