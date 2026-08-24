---
description: Adversarial semantic verification for TASK-096 Statistics composition.
status: final
---
# Red Verification — TASK-096-T3-FT-007-W30

## Semantic target

- Task outcome: `FT-007-AC-003 / REQ-014 / REQ-017`; Lesson Context composes
  complete authorized Students, Teachers, and Classes rows through the four
  accepted provider boundaries, and `/statistics` remains a serializable,
  read-only transport/presentation adapter.
- Accepted basis: the indexed TASK-096 card, feature AC and requirements,
  direct Access Control, Statistics Projection, Boundary Map, System
  Architecture, Testing Strategy, and Tier Policy contracts.
- Lifecycle was observed as `in_progress` and was not changed.

## Evidence and adversarial coverage

- The single current functional `VERDICT: PASS` in
  `.protocols/TASK-096-T3-FT-007-W30/verification.md` was treated as supporting
  evidence only. Complete Attempt 1 protocol, RED/GREEN, executor/verifier
  reports and probes, actual source/tests, and the unrelated dirty-work boundary
  were inspected independently.
- Focus A covered C&S-before-profile ordering, actor/session and removed-scope
  denial, profile/metric provider edges, table bypass, unauthorized response
  data, request-local state, and cross-boundary ownership. Focus B covered
  multi-class/co-teacher row cardinality, field completeness, serialization,
  failure behavior, non-mutation, and route responsibility.
- The reviewed implementation scopes through C&S before profile enrichment,
  calls accepted provider queries, returns serializable values, maps denials
  without row disclosure, keeps provider facts unchanged, and leaves the route
  thin. No material bypass, mutation, or dependency reversal was proved.
- The supported C&S command/schema permits the same student in multiple group
  classes and multiple teachers in one class
  (`center-scheduling/public.ts:824-838`, `database.ts:72-82`). On that reachable
  surface, the composition emits one Student row per class membership and sums
  per-class counts (`lesson-context/public.ts:363-389,396-414`); for a Teacher,
  it emits only the current actor in the Teachers collection while still
  exposing co-teacher names (`lesson-context/public.ts:390-415`). The focused
  task test explicitly fixes that co-teacher behavior at
  `tests/lesson-context/ft-007-statistics-composition.test.ts:205-227`.
- The canonical Statistics Projection instead describes Student `class names`
  and Teacher rows/counts across assigned classes, while AC-003/PRD use a
  singular Student class column. The earlier product input explicitly left
  multi-class Student rendering and Teacher-registry row selection open, and
  the accepted FT-007 decision log resolves profile metadata, metric semantics,
  provider sequencing, and route identity but not these row-selection choices.
- Both fresh `Codex Luna` `xhigh` co-review launches and their required single
  retries failed because that model is unavailable in this runtime. No
  substitute model was used.

## Admitted findings

- none; no material break of an unambiguous accepted outcome was proved.

## Operator questions

- For a Student with several supported class memberships, must the Students
  registry contain one participant row with all class/teacher names, or one row
  per student/class relation as implemented? Correspondingly, is a Teacher's
  `studentCount` the number of distinct student accounts or the sum of class
  membership counts?
- For a Teacher viewing the Teachers registry, are permitted rows limited to
  that current Teacher, or do they include co-teachers assigned to the returned
  classes? The current implementation chooses self-only; the accepted
  assigned-class wording does not settle the competing privacy/completeness
  outcomes.

## Verdict

SEMANTIC_VERDICT: semantic-concern

## Owner handoff

- Evidence/report paths: this protocol;
  `.tasks/TASK-096-T3-FT-007-W30/TASK-096-T3-FT-007-W30-S-RED-VERIFY-final-report-docs-01.md`;
  the current functional PASS; and the source/spec locators above.
- Recommended scheduler action: `HALT_CLARIFICATION_REQUIRED`; do not close
  TASK-096 or promote dependent TASK-097/TASK-098 until the row-cardinality and
  Teacher-row scope answers are durably accepted, reconciled, and the
  applicable functional/semantic gates rerun.
- Resume route: `/feature-doctor FT-007` for operator-owned product/spec/task
  routing; no `/exe`, `/verify`, `/mb-sync`, planning repair, Judge, scheduler
  transition, task status change, or AUTONOMOUS-RUN edit was performed here.
