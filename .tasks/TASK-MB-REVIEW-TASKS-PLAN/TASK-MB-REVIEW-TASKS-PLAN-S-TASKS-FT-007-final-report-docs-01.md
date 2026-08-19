---
description: Fresh semantic task-plan review of FT-007 Navigation and Statistics after the TASK-058..069 rebuild.
status: final
---
# Review FT-007 — Navigation and Statistics

VERDICT: REJECT

REVIEWED_PLANNING_REVISION: 2

ARCHITECTURE_REVIEW: REQUEST_CHANGES

BLOCKING_FINDINGS: 2

## Review mode and disposition

This is a full fresh review of the current indexed FT-007 surface. The former
TASK-051..057 queue has been replaced by TASK-058..069, so the prior report was
not treated as authoritative cache.

The operator's two decisions are applied and are no longer findings:

- The Identity & Access Actor Context Boundary may return `fullName` and
  `registeredAt` to the statistics flow; direct account-table reads remain
  forbidden.
- New accounts require surname and given name. FT-007 adds no migration,
  backfill, or legacy-account path.

The rebuild also resolves the former task cohesion and proof-transfer findings:
implementation units have sibling cards, focused integration cards own the
feature-level navigation outcomes, and the old real-database command was
replaced with focused disposable-DB commands. The disposable-DB replacement is
still not fail-closed under the current Playwright runtime; see Finding 2.

## Blocking findings

### 1. TASK-066 crosses the accepted ownership direction and leaves AC-003 without a legal composition owner

The accepted Actor Context Boundary says that Lesson Context may call the I&A
profile query only after Center & Scheduling has resolved the authorized account
IDs ([Boundary Map](../../.memory-bank/contracts/boundary-map.md:119)). The
accepted orchestration owner for scoped statistics is Lesson Context, which
calls I&A actor/profile and the provider registry/metric queries
([Boundary Map](../../.memory-bank/contracts/boundary-map.md:323)).

TASK-066 instead assigns the complete FT-007-AC-003 result, including the I&A
profile projection, to the Center & Scheduling query
([TASK-066](../../.memory-bank/tasks/TASK-066-T3-FT-007-W30.task.json:20)); its
hard runtime scope forbids both Identity & Access and Lesson Context
([TASK-066 boundary](../../.memory-bank/tasks/TASK-066-T3-FT-007-W30.task.json:57)).
This cannot legally obtain the required profile fields under the accepted
graph. TASK-069 owns Lesson Context composition but only claims FT-007-AC-004
([TASK-069](../../.memory-bank/tasks/TASK-069-T3-FT-007-W32.task.json:20)); no
task therefore owns the runnable cross-slice composition/integration proof for
the complete AC-003 result.

TASK-069 also links only the C&S and I&A boundaries for this composition
([TASK-069 source artifacts](../../.memory-bank/tasks/TASK-069-T3-FT-007-W32.task.json:32));
its direct Learning Progress and Financial Ledger provider edges must be
discoverable after the ownership split.

Effect: execution would have to either introduce an unauthorized C&S → I&A
profile call, bypass the accepted boundary, or implement the missing
composition/AC ownership implicitly.

Repair owner: `/feature-to-tasks FT-007`. Keep TASK-066 limited to
C&S-owned registry/scope facts; move profile enrichment and composition-level
AC-003 proof to Lesson Context/TASK-069 or create the minimum required
integration card, with exact direct boundary links and no duplicated provider
formula proof.

### 2. Disposable E2E isolation is declared but not enforceable

TASK-062, TASK-065, and TASK-069 pass an explicit `DATABASE_URL=tmp/...db`
([TASK-062 gate](../../.memory-bank/tasks/TASK-062-T3-FT-007-W29.task.json:15),
[TASK-065 gate](../../.memory-bank/tasks/TASK-065-T3-FT-007-W30.task.json:15),
[TASK-069 gate](../../.memory-bank/tasks/TASK-069-T3-FT-007-W32.task.json:15)).
However, Playwright is configured with `reuseExistingServer: true`, so an
already-running server may be reused instead of starting with that task's
database environment ([playwright.config.ts](../../playwright.config.ts:32)).
That server can still be connected to the default `study-calendar.db`.

The required parent directory is also not prepared by the current database
adapter: `new Database(this.filename)` is called directly
([database.ts](../../src/lib/server/platform/database.ts:11)), while the
workspace currently has no `tmp/` directory. A fresh run with a nested
`tmp/ft-007-*.db` path can therefore fail before the claimed disposable proof
starts. The task hard boundaries forbid `study-calendar.db`, but the current
runtime path cannot guarantee that boundary.

Effect: the required RED/GREEN browser evidence is not reliably runnable and
may violate the task's hard database boundary when an existing dev server is
present.

Repair owner: `/feature-to-tasks FT-007`. Make the focused E2E path fail closed
and reproducible: guarantee a newly started server uses the disposable DB,
prepare the disposable path, and record cleanup without broadening any task's
write boundary or touching `study-calendar.db`.

## Coverage results

### Structural integrity — PASS

The current index contains 12 unique FT-007 records, all identity-matching
T3/W27–W32 cards. Dependencies resolve and the graph is acyclic. All cards are
`planned`, which is legal because their prerequisites are planned or not yet
complete. Planning Revision is the positive current Revision 2; the Foundation
gate `TASK-002-T3-FT-000-W1` is `done` and every FT-007 card reaches it
transitively. `node scripts/mb-lint.mjs` passed for 74 files with only existing
advisory metadata warnings, and `git diff --check` passed.

### Coverage and slicing — REJECT

All six FT-007 acceptance criteria have one current exact task locator:
AC-001 → TASK-062, AC-002 → TASK-065, AC-003 → TASK-066, AC-004 → TASK-069,
AC-005 → TASK-068, and AC-006 → TASK-067. The implementation/integration split
is otherwise materially clearer than the former queue. The AC-003 assignment
is rejected because the assigned card cannot legally perform the full
cross-slice outcome; this is Finding 1.

### Design readiness — REJECT

The feature design is complete, the profile and no-legacy decisions are now
explicit, and the global backbone remains complete at Revision 2. The accepted
architecture subreview returned `REQUEST_CHANGES` because TASK-066 contradicts
the registered consumer/provider interaction and AC-003 composition ownership;
this is Finding 1. The direct provider-boundary links for the repaired
composition must be added in the same feature-local reconciliation.

### Execution readiness — REJECT

T3 tiering, planned statuses, Foundation reachability, task-local proof
contracts, and the focused E2E command separation are otherwise coherent. The
browser proof still has the hard runtime contradiction described in Finding 2.
No task was promoted, normalized, started, closed, blocked, or otherwise
mutated by this review.

## Fresh semantic focuses

1. Hard runtime boundaries, task claim ownership, AC/REQ locators, RED/GREEN
   evidence, cohesion, and disposable E2E scope: `REQUEST_CHANGES`; confirmed
   Findings 1–2 and the current traceability risk.
2. C4 architecture, dependency direction, public boundaries, orchestration,
   canonical contract sufficiency, and wave rationale: `REQUEST_CHANGES`;
   confirmed the TASK-066/AC-003 ownership defect and disposable runtime risk.

The required bounded architecture review independently returned
`REQUEST_CHANGES` with the same two material findings. No separate architecture
artifact was created.

## Additional traceability note

TASK-058 and TASK-059 use `REQ-003`, while FT-007/EP-006 and the RTM list
FT-007's direct requirements as REQ-014 and REQ-017. The plan lists REQ-003 as
a supporting input, so this is not treated as a third blocker in this verdict;
the feature-tasking repair should make that supporting cross-feature role
explicit or remove the unnecessary mapping.

## Handoff

NEXT_ROUTE: `/feature-to-tasks FT-007` to repair the two findings above, then
rerun `/review-tasks-plan FT-007`. `/spec-redesign` is not required: the
operator's profile-boundary decision is accepted and the remaining defects are
feature-local task ownership and execution-boundary problems. Do not promote or
execute the FT-007 queue while this verdict is `REJECT`.

Review integrity: no reviewed feature, contract, plan, task card, index,
lifecycle, status, dependency, code, protocol, or scheduler state was changed.
Only this required report and request entry were written.
