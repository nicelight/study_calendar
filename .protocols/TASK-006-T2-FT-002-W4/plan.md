---
description: Execution plan for TASK-006-T2-FT-002-W4.
status: active
---
# Plan — TASK-006-T2-FT-002-W4

## Goal

Provide stable recurring schedule and Lesson facts through the Center &
Scheduling public boundary, with current assignment authorization and no
duplicate Financial Ledger charge identity after transfer.

## Non-goals

- Do not compose Lesson Context, Collaboration, or Learning Progress projections.
- Do not write Financial Ledger state from Center & Scheduling.
- Do not change authentication/provider behavior or introduce a global lifecycle decision.

## Inputs / source specs

- Task record: `.memory-bank/tasks/TASK-006-T2-FT-002-W4.task.json`
- Task index: `.memory-bank/tasks/index.json`
- Feature/Epic: `.memory-bank/features/FT-002-center-and-scheduling.md`
- REQ IDs: `REQ-004`, `REQ-014`

## Richer execution inputs

- Source Artifacts: FT-002 AC-003..AC-006; system architecture storage/data flow.
- Normative Inputs: boundary map Calendar and Membership Query Boundary; Core Domain ownership map; Lifecycle Map scheduling and lesson context; Access Control.
- Verification Targets: task card AC-003..AC-006 mappings.

## Constraints / invariants (MUST / NEVER)

- MUST keep schedule, Lesson, assignment, and authorization writes in Center & Scheduling.
- MUST re-check current assignment at each protected read/change.
- MUST preserve Lesson identity, scheduling-owned context, and author attribution on transfer/cancel/removal.
- NEVER mutate unrelated repetitions.
- NEVER create duplicate chargeable Lesson identity.
- NEVER compose downstream projections in this module.

## Scope

### In scope

- `src/lib/server/platform/database.ts` schedule/Lesson persistence.
- `src/lib/server/modules/center-scheduling/public.ts` recurrence, exception, query, authorization, attribution, and Financial Scope/Fact boundary.
- `src/lib/server/composition-root.ts` Financial Ledger wiring required for integration proof.
- `tests/center-scheduling/recurring-scheduling.test.ts` claim-scoped regression coverage.

### Out of scope

- Other capability modules, routes/UI, task lifecycle closure, verification, semantic red verification, and MB-SYNC.

## Proposed changes

### Touched areas (hypotheses OK)

- `src/lib/server/platform/database.ts` — persist Center & Scheduling schedules and lessons.
- `src/lib/server/modules/center-scheduling/public.ts` — implement owner-side public commands/queries and Financial Ledger scope port.
- `src/lib/server/composition-root.ts` — expose Financial Ledger with Center & Scheduling as its accepted scope provider.
- `tests/center-scheduling/recurring-scheduling.test.ts` — verify AC-003..AC-006.

### Preflight-confirmed change surface

- Expected hints kept: `src/lib/server/modules/center-scheduling/`, `tests/center-scheduling/`.
- Additional same-outcome files/areas and rationale: shared database schema and composition root are required by the accepted storage and public-boundary contracts; no downstream consumer files are needed.
- Hard `write_boundary` present and satisfied: not set.
- `forbidden_scope` / stop-condition check: clear; no Foundation task record touched and no global lifecycle branch required.

## Applicable quality gates

- [ ] `npm run check` — proves type/schema consistency for the public boundary.
- [ ] `npm run build` — proves the SvelteKit production build remains valid.
- [ ] `npm run test` — proves the task behavior and project regression suite.
- [ ] `git diff --check` — proves no whitespace corruption in the changed surface.

## Claim-linked RED / GREEN (T2/T3)

- applicability: applicable
- accepted claim locators: `FT-002-AC-003`, `FT-002-AC-004`, `FT-002-AC-005`, `FT-002-AC-006`
- planned test/probe and environment: fresh in-memory SQLite composition root with center/class/member/assignment fixtures; the same focused test file supplies honest pre-implementation RED and post-change claim-equivalent GREEN.
- observable RED: recurring schedule, selected exception, stable transfer/charge integration, and assignment history operations are absent or fail against the current schema/boundary.
- corresponding GREEN: generated planned lessons, isolated add/transfer/cancel, stable identity/context and one charge row, current assignment access, preserved author, and immediate removal denial.
- accepted not-applicable reason and alternative proof: none.
- T3 isolation, safe rerun, cleanup, and permission boundary: not applicable to T2; tests use fresh in-memory SQLite and close it after each case.

## Fan-out plan (if needed)

- No delegation.

## MB-SYNC handoff / owner

Scheduler or explicit standalone owner performs sync after verification/status
decision. `/exe` only records handoff notes.

- [ ] Owner identified: lifecycle owner / `/verify` then explicit owner.
- [ ] `.memory-bank/` docs needing update (WHY/WHERE, no pseudocode): feature/task durable state at wave boundary; owner routes `/mb-sync`.
- [ ] `.memory-bank/index.md` router update needed: no.
- [ ] RTM update in `.memory-bank/requirements.md` needed: owner decision after verification.
- [ ] Task registry/status update owner: explicit lifecycle owner after `/verify`.
- [ ] Changelog update owner: `/mb-sync` owner.

## Definition of done

- Production behavior and focused tests satisfy AC-003..AC-006 within task scope.
- Required check/build/test gates are recorded with reproducible evidence.
- RED/GREEN evidence and final Implementer handoff point to current artifacts.
- Task remains open for independent `/verify`; this execution does not close T2.
