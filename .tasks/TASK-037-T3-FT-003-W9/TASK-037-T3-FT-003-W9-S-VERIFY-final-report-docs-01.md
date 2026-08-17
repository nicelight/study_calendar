---
description: Independent functional verification report for TASK-037-T3-FT-003-W9.
status: active
---
# TASK-037-T3-FT-003-W9 — functional verification

## Outcome

`FT-003-AC-007 / REQ-005 / REQ-014 / REQ-016` passed fresh independent
verification. The production-preview HTTP matrix proved DB-backed lesson facts
and geometry for authorized Admin/Teacher/Student/Parent sessions, fail-closed
behavior for every task-named denial branch, and complete persisted-state
equality. Public `/`, `/lesson-context`, FT-002 surfaces, the provider boundary,
and required project gates remain intact.

VERDICT: PASS

## Decisive evidence

- Real disposable production-preview HTTP matrix: allowed roles `200` with only
  `class-own` current lesson identity/date/status; anonymous/revoked `303`, and
  cross-center/non-member/unassigned/removed `403`, with no protected facts.
- Complete `29`-table snapshot equality:
  `0c050af75db4dc468aa69e918a02a5d523a89c6d9f1d924b36641d72715c8fb0`
  before/after the main matrix, and
  `7bff2f9849732d9c492a82de277dfa886be0503c8d0dd18de514b45fc2e2e32c`
  before/after removed-assignment denial and safe rerun.
- Fresh focused/sibling tests: `11/11` task cases and `42/42` selected
  regressions. Full gates: check `0/0`, test `31` files / `142` tests, build
  PASS, `git diff --check` PASS.
- Source/generated-output review: the route uses the registered Actor Context
  and Center & Scheduling public query path; no direct SQLite/provider bypass,
  fixture-weekday source, Lesson Context modification, or second source exists.

## Evidence route

- Full commands, claim mapping, state hashes, scope review, and handoff:
  `.protocols/TASK-037-T3-FT-003-W9/verification.md`.
- Executor RED/GREEN remains supporting evidence only:
  `.tasks/TASK-037-T3-FT-003-W9/attempt-1-red.md` and
  `.tasks/TASK-037-T3-FT-003-W9/attempt-1-green.md`.
- The requested `Codex Luna` co-review model was unavailable after both allowed
  attempts for each focus; no substitute model was used.

## Lifecycle

No lifecycle status was changed. T3 still requires
`/red-verify TASK-037-T3-FT-003-W9` before the explicit owner may close it.
