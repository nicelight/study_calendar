---
description: Independent functional verification of corrected Attempt 2 for TASK-012-T2-FT-004-W6.
status: active
---
# Verification — TASK-012-T2-FT-004-W6 — Attempt 2

## What was verified

- The corrected current source was verified independently after supported
  class deletion and cross-center recreation of the same class, schedule, and
  lesson identities.
- Current behavior isolates retained prior-center comments, reactions,
  shared/personal messages, branches, tabs, and attributable identities while
  leaving those rows unchanged.
- The replacement lifecycle preserves owner-only comment editing, independent
  comment/reaction uniqueness, shared/personal scope, arbitrary-depth replies,
  first-reply branch activation, ten-tab recent projection, hidden-message
  retention, and reactivation.
- Attempt 1 functional and feature-semantic reports were read only as the
  historical correction basis. They are not proof of this current result.
- Task lifecycle remains `in_progress`. No implementation, lifecycle,
  scheduler, promotion, retry, or feature-semantic action was performed.

## Verification basis

- Indexed task:
  `.memory-bank/tasks/TASK-012-T2-FT-004-W6.task.json`, uniquely registered in
  `.memory-bank/tasks/index.json`; dependency
  `TASK-011-T3-FT-004-W5` is `done` and remains a prerequisite only.
- Task-owned claims: `FT-004-AC-003` and `FT-004-AC-004` under `REQ-008`,
  with `REQ-006`/`REQ-014` and `FT-004-AC-005` constraining current
  shared/personal and cross-center scope without transferring dependency claim
  ownership.
- Direct canonical specs:
  `.memory-bank/contracts/boundary-map.md#day-discussion-query-boundary`,
  `.memory-bank/states/lifecycle-map.md#collaboration`, and
  `.memory-bank/domains/core-domain.md#domain-relationships`; applicable
  source links also include the accepted architecture target and Access
  Control Contract.
- Accepted inter-module rows and exact contracts:
  Collaboration -> Identity & Access through `Actor Context Boundary` and
  Collaboration -> Center & Scheduling through
  `Calendar and Membership Query Boundary`.
- Current Attempt 2 `context.md`, `plan.md`, `progress.md`, `handoff.md`,
  execution evidence, retry report, actual diff, production source, relevant
  tests, and current feature `semantic-fail` correction basis were inspected.
- T2 policy requires fresh verifier-owned outcome proof, applicable task/spec
  gates, and confirmation that actual scope does not require a higher tier.

## Executor claim path

- Attempt 1 initial RED/GREEN remains in
  `.tasks/TASK-012-T2-FT-004-W6/execution-evidence.md` and is historical
  supporting evidence only.
- Attempt 2 retained the current FT-004 feature `semantic-fail`, then recorded
  fresh pre-correction RED from the unchanged focused lifecycle probe: 2/2
  tests reproduced prior-center disclosure/mutation after identity reuse.
- The same Attempt 2 probe later passed 2/2 and all executor gates passed.
  These executor observations are supporting-only and were not reused as this
  Reviewer's independent functional proof.

## Reused execute evidence

- Receipt locator: none.
- Supported claims: none.
- Reason: the handoff offers no eligible bounded-input receipt; current-state
  checks and independent probes were rerun.

## New targeted probes

- Verifier-owned artifact:
  `.tasks/TASK-012-T2-FT-004-W6/verify-attempt-2.test.ts` with adjacent
  `verify-attempt-2-vitest.config.ts`.
- Command:
  `npm run test -- --config .tasks/TASK-012-T2-FT-004-W6/verify-attempt-2-vitest.config.ts --reporter=verbose`.
- Result: exit `0`; 1 file / 2 tests passed on Vitest `4.1.10` and Node
  `v22.22.1` from `/home/serg/Projects/study_calendar`.
- Isolation: each test uses a new `:memory:` SQLite composition root, closes it
  after the test, and touches no network, credentials, production data, or
  persistent external state.
- Claim mapping:
  - Lifecycle-isolation test covers supported delete/recreate identity reuse,
    empty replacement-center shared/personal projections, prior branch denial,
    old target/mutation denial, unchanged retained comments/reactions, and no
    attributable identity disclosure.
  - Preservation test covers distinct new-center rows, owner-only edit,
    shared/personal separation, a root with no tab before reply, an 18-level
    reply chain, eleven active branches, exactly ten recent tabs, hidden branch
    retention, and nested-reply reactivation.

## Task-scoped checklist

- [x] `FT-004-AC-003`: the replacement lifecycle retains a root plus 18
  nested replies without a depth counter/cap, creates no tab before the first
  reply, and keeps every permitted shared message in the common feed while
  excluding personal and prior-center messages.
- [x] `FT-004-AC-004`: eleven replacement-center branches project roots
  11..2 as exactly ten recent tabs; root 1 remains queryable with both
  messages, returns to the first tab after nested activity, and retains all
  three messages.
- [x] Correction constraint: after current public class/schedule
  delete/recreate identity reuse, replacement-center reads return no
  prior-center comment, reaction, shared/personal message, branch, tab, author,
  or reactor; old edit/reply/reaction targets are denied and retained rows are
  unchanged.
- [x] Preservation constraints: new-center comments/reactions are distinct
  from retained rows; the author can edit their own new comment and another
  current-center Admin cannot; shared and personal discussions remain separate.

## Architecture, scope, and non-goals

- `CollaborationBoundary` continues to resolve the actor through Identity &
  Access and current class/lesson/student facts through Center & Scheduling.
  All affected persisted reads/targets use the server-resolved `center_id`.
- Collaboration remains the only business writer. A source scan found
  Collaboration writes only in its public boundary and schema ownership only
  in `src/lib/server/platform/database.ts`; no neighboring business writer,
  second tab/message state, cleanup hook, or new dependency edge appeared.
- Prior rows are retained, branch visibility remains a query projection, reply
  depth remains uncapped, and no hidden branch is deleted.
- No non-empty hard `write_boundary` exists; both forbidden Foundation task
  records are unchanged.

## Repeated checks

- Focused project-native Collaboration suite:
  `npm run test -- tests/collaboration/comments-reactions.test.ts tests/collaboration/threaded-discussions.test.ts tests/collaboration/center-lifecycle-isolation.test.ts --reporter=verbose`
  -> exit `0`; 3 files / 7 tests passed.
- Fresh replay of the exact prior failed supported-path vector:
  `npm run test -- --config .tasks/FT-004/red-feature-vitest.config.ts --reporter=verbose`
  -> exit `0`; 1 file / 1 test passed against the corrected current source.
- `npm run check` -> exit `0`; 0 errors and 0 warnings.
- `npm run build` -> exit `0`; client/SSR production build completed. The
  adapter-auto environment note was informational.
- `npm run test` -> exit `0`; 12 files / 39 tests passed.
- `git diff --check` -> exit `0` with no output.

## Blocking tier finding

- Original indexed tier: `T2`.
- Required tier under
  `.memory-bank/workflows/tier-policy.md#tier-classification-and-escalation`:
  `T3`.
- Trigger: Attempt 2 changes protected cross-center reads, target checks,
  ownership-sensitive mutations, and uniqueness boundaries specifically to
  prevent prior-center privacy disclosure and unauthorized mutation. This is
  direct `auth/permissions/security-sensitive behavior` under the tier policy,
  regardless of the local `center_id` implementation mechanism.
- Consequence: the functional behavior is GREEN, but this T2 verification
  cannot establish closure eligibility for a T3 correction. The current task
  must be routed through `/feature-to-tasks FT-004` for controlled rebuild or
  split, followed by the applicable fresh plan review/doctor and execution of
  the replacement T3 task ID.

## Reviewer report

- verdict: `OWNER_DECISION_NEEDED`.
- findings: `BLOCKER` — corrected behavior passes, but the actual privacy/
  authorization correction is under-tiered as T2 and cannot receive a credible
  PASS under the governing policy.
- evidence_checked: unique indexed card, dependency, tier policy, FT-004
  correction basis, direct canonical specs and graph contracts, Attempt 2
  protocol/handoff/report, actual diff/source/tests, fresh independent probe,
  focused regressions, required gates, owner-write scan, and forbidden scope.
- risks_or_questions: no product behavior is ambiguous; the unresolved
  workflow question is controlled T3 reconstruction/re-execution of the
  already evidenced correction.

## Handoff

- Recommended owner/action: route the original task through
  `/feature-to-tasks FT-004` for the required T3 replacement/split and
  re-execution; preserve the current GREEN observations as supporting evidence
  only.
- Lifecycle changed by verifier: no.
- `/execute`, `/red-verify`, `/mb-sync`, lifecycle closure, feature
  promotion, retries, scheduler status changes, and planning repair were not
  run.
- Current report:
  `.tasks/TASK-012-T2-FT-004-W6/TASK-012-T2-FT-004-W6-S-VERIFY-final-report-docs-02.md`.

VERDICT: NEEDS-CLARIFICATION
