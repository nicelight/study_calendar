---
description: Execution plan for TASK-016-T3-FT-004-W6.
status: active
---
# Plan — TASK-016-T3-FT-004-W6

## Goal

Prove or minimally implement that comments and reactions remain attributable,
center-scoped, and usable after supported class identity reuse, while retained
prior-center rows cannot be read, targeted, mutated, or collided with.

## Non-goals

- Threaded messages, reply depth, branch tabs, or message retention owned by TASK-017.
- Reusing or editing TASK-012 evidence or lifecycle.
- Deleting retained Collaboration rows.
- Changing the modular-monolith graph, one-server deployment, one shared database, or Collaboration ownership.

## Inputs / source specs

- Task record: `.memory-bank/tasks/TASK-016-T3-FT-004-W6.task.json`
- Task index: `.memory-bank/tasks/index.json`
- Feature/Epic: `.memory-bank/features/FT-004-day-collaboration.md`
- REQ IDs: REQ-006, REQ-007, REQ-014

## Richer execution inputs

- Source Artifacts: `.memory-bank/contracts/boundary-map.md#day-discussion-query-boundary`; `.memory-bank/contracts/access-control.md#authority-and-scope`; `.memory-bank/contracts/access-control.md#data-minimization-and-failure-behavior`; `.memory-bank/domains/core-domain.md#domain-relationships`; `.memory-bank/domains/core-domain.md#persistence-and-transaction-rules`; `.memory-bank/states/lifecycle-map.md#collaboration`.
- Normative Inputs: `.memory-bank/workflows/tier-policy.md#claim-linked-red--green-for-t2t3`; `.memory-bank/testing/strategy.md#evidence-and-ownership`.
- Verification Targets: AC-001 comment identity-reuse matrix; AC-002 five-reaction/center uniqueness matrix; AC-005 cross-center negative authorization and retained-row proof.

## Constraints / invariants (MUST / NEVER)

- MUST keep all Collaboration writes in Collaboration over the one shared database.
- MUST combine actor with server-resolved center/class/student scope at protected reads, target checks, and mutations.
- MUST preserve prior-center rows and attribution.
- NEVER expose or mutate retained prior-center comments/reactions through the replacement center.
- NEVER broaden into TASK-017 message/branch/tab behavior.

## Scope

### In scope

- `src/lib/server/modules/collaboration/`
- `src/lib/server/platform/database.ts`
- `tests/collaboration/`
- Task-owned protocol and evidence files.

### Out of scope

- `.memory-bank/tasks/TASK-001-T3-FT-000-W0.task.json`
- `.memory-bank/tasks/TASK-002-T3-FT-000-W1.task.json`
- `.memory-bank/tasks/TASK-012-T2-FT-004-W6.task.json`
- TASK-017 outcome and any public graph/spec/lifecycle redesign.

## Proposed changes

### Touched areas (hypotheses OK)

- Collaboration public/database source — only if the current claim probe identifies a bounded defect.
- `tests/collaboration/` — isolated disposable claim probe/evidence if needed; existing current source tests are preferred when they prove the exact claim.

### Preflight-confirmed change surface

- Expected hints kept: `src/lib/server/modules/collaboration/`, `src/lib/server/platform/database.ts`, `tests/collaboration/`.
- Additional same-outcome files/areas and rationale: none at preflight.
- Hard `write_boundary` present and satisfied: not set.
- `forbidden_scope` / stop-condition check: clear; no forbidden files touched.

## Applicable quality gates

- [ ] `npm run check` — proves the typed SvelteKit source remains valid.
- [ ] `npm run build` — proves the deployable server build remains valid.
- [ ] `npm run test` — proves the current project regression suite, including Collaboration isolation.

## Claim-linked RED / GREEN (T2/T3)

- applicability: applicable
- accepted claim locator(s): FT-004-AC-001, FT-004-AC-002, FT-004-AC-005
- planned test/probe and environment: focused Vitest Collaboration identity-reuse scenario using `:memory:` SQLite, two centers, same class/lesson identities, retained-row snapshot, current-center comment/reaction creation, and denied prior-center read/target/mutation.
- observable RED: current replacement-center projection or mutation exposes/collides with retained prior-center comments/reactions, or current-center ownership/attribution/uniqueness fails.
- corresponding GREEN: prior-center objects are absent/denied and unchanged; current-center comments/reactions remain usable, attributed, visible to permitted viewers, and unique within center scope.
- accepted not-applicable reason and alternative proof: none planned; T3 claims require isolated proof.
- T3 isolation, safe rerun, cleanup, and permission boundary: in-memory database per test, no network/credentials/production data, `afterEach` closes the database, and actor plus server-resolved scope are exercised through public Collaboration commands/queries.

## Fan-out plan (if needed)

- None; no delegated agents.

## MB-SYNC handoff / owner

Scheduler or explicit standalone owner performs sync after verification/status
decision. `/exe` only records handoff notes.

Checklist:

- [x] Owner identified: scheduler
- [ ] Explicit standalone owner basis recorded if manual closure is expected: n/a
- [ ] `.memory-bank/` docs needing update (WHY/WHERE, no pseudocode): none identified; implementation/evidence is task-owned.
- [ ] `.memory-bank/index.md` router update needed: no
- [ ] RTM update in `.memory-bank/requirements.md` needed: no
- [ ] Task registry/status update owner: scheduler after `/verify` and T3 semantic gate
- [ ] Changelog update owner: scheduler/workflow boundary

## Definition of done

- Attempt 1 justified pre-implementation GREEN is recorded in the current progress/evidence receipt.
- Explicit no-production-change rationale and actual task evidence surface are recorded.
- Focused probe plus required check/build/test receipts are recorded in `.tasks/TASK-016-T3-FT-004-W6/execution-evidence.md`.
- `/verify TASK-016-T3-FT-004-W6` is the next owner; this execution does not close the task.
