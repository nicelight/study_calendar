---
description: Independent adversarial semantic verification for TASK-009-T3-FT-005-W5 Attempt 2.
status: final
---
# Red Verification — TASK-009-T3-FT-005-W5 — Attempt 2

## Semantic target

- Task outcome: students complete assigned homework; teachers record only `α`,
  `β`, `γ`, or `F`; prohibited students/parents cannot read another
  student's grade.
- Accepted boundaries: class and student scope are resolved server-side;
  Learning Progress owns homework/grade state; grade visibility is limited to
  the selected student/linked family, assigned teacher, and own-center Admin.
- Normative inputs: task card; FT-005 AC-001/AC-002; Personal Progress Query
  Boundary; Access Control Contract; Core Domain ownership map; Learning and
  Finance lifecycle.

## Evidence and adversarial coverage

- Current Attempt 2 executor report and functional verification report were
  inspected as supporting evidence only; Attempt 1 semantic-fail/report-01 was
  used only as the bounded correction basis.
- Current source confirms `requireClassStudent` checks the server-resolved
  requested-class membership on both public `recordGrade` and `getGrade`.
- Fresh verifier-owned public-boundary probe passed `2/2`, covering completion
  persistence and grade-free class projection, exact `α`/`β`/`γ`/`F` scale,
  invalid-grade non-mutation, and positive/negative privacy scope.
- Fresh correction-specific public-boundary probe passed `1/1` (with two
  unrelated tests skipped): teacher and own-center Admin were denied both
  grade write and read for a student enrolled only in a same-center secondary
  class; denied writes left zero grade rows.
- Probes used disposable in-memory SQLite state, deterministic fixtures,
  explicit cleanup, and no network, credentials, production data, or external
  side effect.

## Admitted findings

- None. The historical cross-class target bypass was not reproducible after
  the bounded correction, and no other material break of the accepted task
  outcome was observed in the fresh supported public-boundary coverage.

## Operator questions

- none

## Verdict

SEMANTIC_VERDICT: semantic-pass

## Owner handoff

- Evidence/report paths: this file, the Attempt 2 functional and executor
  reports, current Learning Progress source, correction test, and
  verifier-owned probe.
- Recommended owner action: record this semantic verdict at the existing
  lifecycle boundary; no repair or operator decision is indicated by this
  review.
- This review did not run `/execute`, `/verify`, `/mb-sync`, lifecycle closure,
  promotion, or any queue/Memory Bank mutation.
