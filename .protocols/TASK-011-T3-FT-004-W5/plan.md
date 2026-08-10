---
description: Execution plan for TASK-011-T3-FT-004-W5.
status: active
---
# Plan — TASK-011-T3-FT-004-W5

## Goal

Persist attributable account-owned field comments and five standard reactions,
and expose both only through server-resolved shared/personal class/student
scope.

## Non-goals

- No attendance or attendance-correction behavior; those claims belong to
  Learning Progress and are not owned by this task.
- No threaded reply depth, branch tabs, or retention; those are TASK-012.
- No event bus, Lesson Context discussion store, routes/UI, or neighboring-slice
  writes.

## Inputs / source specs

- Task record: `.memory-bank/tasks/TASK-011-T3-FT-004-W5.task.json`
- Task index: `.memory-bank/tasks/index.json`
- Feature: `.memory-bank/features/FT-004-day-collaboration.md`
- REQ IDs: `REQ-006`, `REQ-007`, `REQ-014`
- Review: `.tasks/TASK-MB-REVIEW-TASKS-PLAN/TASK-MB-REVIEW-TASKS-PLAN-S-TASKS-FT-004-final-report-docs-01.md`, `REVIEWED_PLANNING_REVISION: 1`, `VERDICT: APPROVE`

## Richer execution inputs

- Source Artifacts: `FT-004-AC-001`, `FT-004-AC-002`, `FT-004-AC-005`, Day Discussion Query Boundary, Access Control Contract.
- Normative Inputs: `.memory-bank/contracts/boundary-map.md#day-discussion-query-boundary`, `.memory-bank/contracts/access-control.md`, `.memory-bank/domains/core-domain.md#domain-relationships`, `.memory-bank/states/lifecycle-map.md#collaboration`.
- Verification Targets: account/field uniqueness and attribution; five-reaction interaction with permitted reactors; shared/personal and cross-student read/mutation denial.

## Constraints / invariants (MUST / NEVER)

- MUST: resolve actor/session and class/student scope server-side for every public command/query.
- MUST: keep Collaboration as the sole writer of comments and reactions.
- MUST: preserve author and last-change attribution on comment reads.
- NEVER: allow more than one editable comment for one account and field.
- NEVER: leak or mutate shared/personal discussion objects outside permitted role/student scope.
- NEVER: create a second discussion store in Lesson Context or an event bus.

## Scope

### In scope

- Collaboration public boundary and its shared-database schema.
- Composition-root wiring for the Collaboration boundary.
- Claim-scoped tests under `tests/collaboration/`.
- Task protocol and evidence under `.protocols/TASK-011-T3-FT-004-W5/` and `.tasks/TASK-011-T3-FT-004-W5/`.

### Out of scope

- Attendance, correction, learning-progress, financial, lesson-context, route/UI, and provider changes.
- The forbidden Foundation task records listed in `runtime_context.forbidden_scope`.

## Proposed changes

### Touched areas (hypotheses OK)

- `src/lib/server/modules/collaboration/public.ts` — owner-side comments/reactions commands and scoped queries.
- `src/lib/server/platform/database.ts` — durable Collaboration tables in the existing shared schema.
- `src/lib/server/composition-root.ts` — expose the Collaboration boundary to consumers/tests.
- `tests/collaboration/comments-reactions.test.ts` — isolated AC-001/002/005 public-boundary probes.

### Preflight-confirmed change surface

- Expected hints kept: `src/lib/server/modules/collaboration/` and `tests/collaboration/`.
- Additional same-outcome files/areas: shared schema and composition-root wiring are required to persist and expose the Collaboration-owned boundary; no unrelated behavior is changed.
- Hard `write_boundary` present and satisfied: not set.
- `forbidden_scope` / stop-condition check: clear; no event bus or new privacy boundary is required.

## Applicable quality gates

- [ ] focused Collaboration test — proves AC-001/002/005 behavior.
- [ ] `npm run check` — type/syntax correctness for the SvelteKit/TypeScript project.
- [ ] `npm run build` — production build compatibility.
- [ ] `npm run test` — full project regression suite plus task claims.
- [ ] `git diff --check` — whitespace/diff hygiene for the actual change surface.

## Claim-linked RED / GREEN (T2/T3)

- applicability: applicable
- accepted claim locator(s): `FT-004-AC-001`, `FT-004-AC-002`, `FT-004-AC-005`, `REQ-006`, `REQ-007`, `REQ-014`, Day Discussion Query Boundary, Access Control Contract.
- planned test/probe and environment: one disposable in-memory shared database with own and other centers, shared and personal targets, Admin/Teacher/Student/Parent actors, and public-boundary-only calls.
- observable RED: each claim-specific probe observes that the Collaboration boundary/schema is absent before implementation; this is behavior absence, not a setup/import failure.
- corresponding GREEN: one owned field comment persists per account/field with attribution; each supported object accepts one of five reactions and exposes permitted reactors; all read/mutation calls enforce shared/personal and selected-student scope.
- accepted not-applicable reason and alternative proof: none.
- T3 isolation, safe rerun, cleanup, and permission boundary: in-memory SQLite per test, deterministic fixtures, explicit close, no network/credentials/production DB, public boundaries only.

## Fan-out plan (if needed)

- None; no delegated agents.

## MB-SYNC handoff / owner

Scheduler or explicit standalone owner performs sync after verification/status
decision. `/exe` records handoff notes only.

- Owner identified: scheduler / next workflow owner; current user explicitly prohibits `/mb-sync`.
- `.memory-bank/` docs needing update: task outcome navigation/changelog only if lifecycle owner requests during sync; no normative spec change is expected.
- `.memory-bank/index.md` router update needed: no.
- RTM update in `.memory-bank/requirements.md` needed: no; existing REQ coverage is implemented here.
- Task registry/status update owner: lifecycle owner after `/verify` and `/red-verify`.
- Changelog update owner: sync/lifecycle owner.

## Definition of done

- AC-001, AC-002, and AC-005 implementation and claim-scoped evidence are recorded.
- Required focused/check/build/full-test/diff gates pass or their failure is honestly handed off.
- Actual files, scope compliance, RED/GREEN evidence, and next owner are durable in protocol and task artifacts.
- Task remains `in_progress`; `/verify`, `/red-verify`, `/mb-sync`, lifecycle closure, promotion, and other workflow skills are not run here.
