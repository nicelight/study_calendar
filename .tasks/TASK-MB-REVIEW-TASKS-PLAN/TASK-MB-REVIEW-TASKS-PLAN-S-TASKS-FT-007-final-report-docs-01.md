---
description: Fresh full semantic task-plan review of the current FT-007 Navigation and Statistics queue.
status: final
---
# Review FT-007 — Navigation and Statistics

VERDICT: REJECT

REVIEWED_PLANNING_REVISION: 2

ARCHITECTURE_REVIEW: not_required

BLOCKING_FINDINGS: 3

## Review mode and prior-finding disposition

This is a full current-surface review, not a bounded rerun. No exact repair
delta was supplied, and the prior report is non-authoritative cache.

The previous ownership-direction finding is substantively repaired:
TASK-073 limits Center & Scheduling to scoped structural facts, TASK-074 and
TASK-075 own provider projections, and TASK-076 gives Lesson Context the legal
four-boundary AC-003 composition
([TASK-073](../../.memory-bank/tasks/TASK-073-T3-FT-007-W30.task.json),
[TASK-076](../../.memory-bank/tasks/TASK-076-T3-FT-007-W32.task.json)). The
previous disposable-runtime concern is also represented by a fail-closed owned
server/path/cleanup contract in TASK-070
([TASK-070](../../.memory-bank/tasks/TASK-070-T3-FT-007-W29.task.json)). Those
repairs do not close the new current-surface findings below.

## Blocking findings

### 1. AC-001 and AC-002 are assigned to proof-only sibling tasks

The execution-cohesive boundary requires one material implementation/change
result per task and says that proof, tests, and probes remain with that result;
they do not create a task boundary
([Execute Loop](../../.memory-bank/workflows/execute-loop.md#execution-cohesive-task-boundary)).

TASK-071 touches only route tests, one E2E spec, and a disposable DB path. Its
card explicitly says shell/logout implementation remains with TASK-060 and
TASK-061 and that TASK-071 "proves only" their feature-level integration, while
TASK-071 is the exact owner of FT-007-AC-001
([TASK-071](../../.memory-bank/tasks/TASK-071-T3-FT-007-W30.task.json)). TASK-072
has the same shape for Home/Classes: only tests/E2E/disposable state, explicit
proof-only wording, and exact FT-007-AC-002 ownership after TASK-063/TASK-064
implementation
([TASK-072](../../.memory-bank/tasks/TASK-072-T3-FT-007-W31.task.json)).

These are proof-only siblings, not independently completable implementation
results. Their presence also makes later product work depend on proof packaging:
TASK-072 depends on TASK-071, and TASK-076 depends on TASK-071. Complete AC
coverage and an end-to-end path do not make those boundaries cohesive.

Repair owner: `/feature-to-tasks FT-007`. Rebuild AC-001/AC-002 ownership so
each runnable card owns a material implementation/change result and keeps its
claim-equivalent RED/GREEN proof with that result. Retire proof-only siblings;
do not transfer dependency proof or duplicate an exact AC merely to preserve
the current task count.

### 2. Several prospective cards have duplicated or over-broad exact-claim locators

The tier policy makes an exact AC or canonical proof-obligation locator the
owner of that claim. A section locator is valid only when the whole section is
one obligation; dependency and context links do not narrow or transfer it
([Task Claim and Dependency Ownership](../../.memory-bank/workflows/tier-policy.md#task-claim-and-dependency-ownership)).

Current cards conflict with that rule:

- TASK-058 and TASK-059 both assign
  `statistics-projection.md#participant-profile-metadata` to themselves while
  proving different provisioning subsets. Neither card proves the whole
  section, and the same exact locator is duplicated
  ([TASK-058](../../.memory-bank/tasks/TASK-058-T3-FT-007-W27.task.json),
  [TASK-059](../../.memory-bank/tasks/TASK-059-T3-FT-007-W28.task.json)).
- TASK-063 and TASK-064 both assign the much broader
  `boundary-map.md#calendar-and-membership-query-boundary` while claiming only
  separate Home and Classes adapter mappings
  ([TASK-063](../../.memory-bank/tasks/TASK-063-T3-FT-007-W29.task.json),
  [TASK-064](../../.memory-bank/tasks/TASK-064-T3-FT-007-W29.task.json)).
- TASK-060 assigns the multi-path Authentication Transport `#browserapi-path`
  section to a shell-only result, and TASK-061 assigns only the logout subset
  of the broader session issuance/revocation section
  ([TASK-060](../../.memory-bank/tasks/TASK-060-T3-FT-007-W28.task.json),
  [TASK-061](../../.memory-bank/tasks/TASK-061-T3-FT-007-W28.task.json)).
- TASK-070 maps its material fail-closed proof obligation to REQ-014/REQ-017
  but has no exact FT-007 AC locator. If this is a task-owned material NFR, the
  prospective NFR rule requires the exact AC; if it is only the shared proof
  method, it cannot authorize a separate product claim by itself
  ([TASK-070](../../.memory-bank/tasks/TASK-070-T3-FT-007-W29.task.json),
  [Task-scoped evidence](../../.memory-bank/workflows/tier-policy.md#task-scoped-acceptance-evidence)).

Execution would therefore have to decide which subset of each broad section a
card really owns, or would close duplicated claims from two cards. Card prose
cannot authorize that choice.

Repair owner: `/feature-to-tasks FT-007`. Give every retained card one exact,
resolving, non-duplicated task-owned claim locator grounded in accepted
REQ/spec evidence. Feature-to-tasks may add feature-local ACs only where the
accepted REQ/spec already grounds a distinct implementation outcome; otherwise
merge the proof into the cohesive owner. Keep dependency proof with its owner.

### 3. The Profile destination and canonical FT-007 endpoint identities are unresolved

The accepted architecture explicitly defers concrete HTTP route names and
payload schemas to downstream feature design
([System Architecture](../../.memory-bank/architecture/system-architecture.md#deferred-decisions)).
FT-007 requires Home, Classes, Statistics, Profile, and Logout destinations
([FT-007-AC-001](../../.memory-bank/features/FT-007-navigation-and-statistics.md#ft-007-ac-001--protected-pages-expose-one-navigation-shell-and-logout)),
but the feature, Statistics contract, implementation plan, and cards register
no canonical Home/Classes/Statistics/Profile route identities or page contract.

The repository currently has no Profile route. TASK-060's hard write boundary
contains only the root layout and route tests, so it cannot create one; its
proof checks only that the five named destinations render. TASK-063,
TASK-064, TASK-076, and TASK-077 instead use broad `src/routes/` boundaries
without naming the endpoint they are meant to create
([TASK-060](../../.memory-bank/tasks/TASK-060-T3-FT-007-W28.task.json),
[TASK-063](../../.memory-bank/tasks/TASK-063-T3-FT-007-W29.task.json),
[TASK-064](../../.memory-bank/tasks/TASK-064-T3-FT-007-W29.task.json),
[TASK-076](../../.memory-bank/tasks/TASK-076-T3-FT-007-W32.task.json),
[TASK-077](../../.memory-bank/tasks/TASK-077-T3-FT-007-W33.task.json)). No card
owns a working Profile destination. Execution must either invent public route
identities and a Profile behavior or render a broken destination.

Operator question: What is the minimum accepted Profile destination for
FT-007, and what canonical SvelteKit route identities should Home, Classes,
Statistics, and Profile use?

Repair owner: `/feature-doctor FT-007` for the missing Profile/public-path
decision, followed by `/feature-to-tasks FT-007` to apply the accepted answer
to the feature plan, exact task ownership, hard boundaries, and endpoint proof.
`/spec-redesign` is not required unless the accepted answer changes the shared
application-shell or capability-boundary contract.

## Coverage results

### Structural integrity — satisfied

Global Backbone is complete at positive Planning Revision 2, and FT-007 has no
`PLANNING_RECONCILIATION_REQUIRED` marker. The index contains 14 unique current
FT-007 records from W27 through W33; ID/tier/feature/wave values match, every
dependency resolves, and the graph is acyclic. All cards are T3 and `planned`.
That status is legal while dependencies, the review rejection, and future waves
remain unresolved. The Foundation gate TASK-002 is `done`, and all external
direct dependencies inspected for this queue are `done`.

`node scripts/mb-lint.mjs` completed successfully for 74 Memory Bank files;
only pre-existing advisory frontmatter warnings were emitted.

### Coverage and slicing — rejected

The six accepted feature ACs each have one current exact task locator:
AC-001 -> TASK-071, AC-002 -> TASK-072, AC-003 -> TASK-076, AC-004 -> TASK-077,
AC-005 -> TASK-075, and AC-006 -> TASK-074. Provider/composition ownership for
AC-003/005/006 and presentation ownership for AC-004 are coherent with the
accepted graph. Findings 1 and 2 reject the proof-only AC-001/002 boundaries
and ambiguous canonical subset claims; Finding 3 identifies the unowned Profile
destination.

### Design readiness — rejected

The statistics row shape, formulas, role scope, read-only behavior, provider
ownership, and Lesson Context orchestration are sufficiently defined by the
Statistics Projection, Boundary Map, Access Control, and Core Domain contracts.
No current accepted-boundary question remains, so a separate architecture
review would add no verdict-changing information. Finding 3 nevertheless makes
the feature's `spec_design_status: complete` untruthful for the runnable route
surface: feature-owned endpoint identities and Profile behavior remain open.

### Execution readiness — rejected

T3 classification, Foundation reachability, planned lifecycle state, provider
hard boundaries, and the isolated-state intent are otherwise consistent. The
queue is not executable because Findings 1 and 2 leave task/claim ownership
invalid and Finding 3 would force execution to choose a public route/profile
contract. No reviewed lifecycle or durable planning state was normalized or
mutated.

## Fresh semantic focuses

1. Acceptance closure, eligible exact claims, dependency ownership, and
   execution cohesion. Evidence: the AC map is complete, but TASK-071/TASK-072
   are proof-only and TASK-058/059 plus TASK-063/064 duplicate broad canonical
   locators. This focus produced Findings 1 and 2.
2. Design/execution readiness, endpoint registration, capability ownership,
   hard scope, and claim-linked T3 proof. Evidence: provider ownership and the
   AC-003 composition now match accepted contracts, while endpoint/Profile
   ownership is absent and TASK-060/061/070 proof mapping is insufficient.
   This focus produced Findings 2 and 3.

For each focus the required `Codex Luna` fresh co-review launch was attempted
and retried once. The runtime rejected all attempts because that model is not
available; the semantic pack forbids substituting another model, so the caller
completed the inspected focus locally under its fallback. No co-review artifact
or vote was created.

## Handoff

NEXT_ROUTE: `/feature-doctor FT-007` to resolve the exact operator question in
Finding 3, then `/feature-to-tasks FT-007` to repair all three findings, then
rerun `/review-tasks-plan FT-007`. Do not promote or execute the FT-007 queue
while this report remains `REJECT`.

Review integrity: no reviewed product, requirement, canonical spec, feature,
plan, task card, index, lifecycle, status, dependency, code, protocol,
evidence, or scheduler state was changed. The required REQUEST and this current
report were replaced; the mandatory session papercut log records unrelated tool
friction outside reviewed state.
