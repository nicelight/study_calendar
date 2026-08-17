---
description: Fresh independent functional verification report for TASK-035-T3-FT-002-W19.
status: final
---
# Independent Verification — TASK-035-T3-FT-002-W19

## Result

`FT-002-AC-011` / `REQ-003` / `REQ-014` does not pass. The real
`/center/{centerId}/class/{classId}` SvelteKit route does not invoke the
authorization/data loader because its server module exports only
`_createClassEntryPageLoad`, not `load`.

In a fresh disposable SSR/HTTP matrix, permitted Admin, Teacher, Student, and
Parent requests returned `200` with an empty shell and no server-resolved
center/class/role context. Anonymous, mismatched-center, mismatched-class,
cross-center, non-member, unassigned, removed-assignment, and revoked-session
requests also returned `200` with no redirect or authorization failure. No
protected class data was exposed and persisted state remained unchanged, but
both the required success path and required denial behavior are absent.

## Evidence

- Durable protocol:
  `.protocols/TASK-035-T3-FT-002-W19/verification.md`.
- Fresh matrix:
  `.tasks/TASK-035-T3-FT-002-W19/fresh-verifier-ssr-http-matrix.md`.
- Source locator:
  `src/routes/center/[centerId]/class/[classId]/+page.server.ts:15-51`; there is
  no recognized `load` export.
- Test blind spot:
  `tests/routes/center-class-entry.test.ts:139-142` directly invokes the
  factory and manually renders the component rather than exercising route
  wiring.
- Production build entry exported only `_createClassEntryPageLoad`, matching
  the live observation.
- Fresh focused/regression selection passed 8 files / 36 tests; `npm run
  check`, full `npm run test` (30 files / 131 tests), `npm run build`, and diff
  checks also passed. These gates do not exercise the missing SvelteKit export.
- Source review confirmed the currently unreachable factory consumes request
  Actor Context and the existing Center & Scheduling
  `getAuthorizedClassScope`, compares both path IDs plus actor/role, and has no
  direct database access. The component has no server/module authorization or
  Lesson Context/calendar dependency.

## Scope and regression integrity

- The task-owned source remains limited to the protected route directory and
  focused test.
- Existing `/admin/{centerId}`, TASK-034 date behavior, TASK-032
  zero-occurrence scheduling, calendar, and Lesson Context selected regressions
  passed in the fresh 36-test run; the full 131-test suite passed.
- No direct database/permission bypass or FT-003 ownership expansion was found
  in the task change surface.
- The mandatory Codex Luna co-review model was unavailable; both prescribed
  launch attempts for each independent focus were rejected, and no substitute
  model was used, as required by the finding-adjudication fallback.

## Reviewer report

- verdict: `REQUEST_CHANGES`
- findings: `HIGH` — wire the existing authorization factory to SvelteKit's
  recognized server `load` boundary and add an actual route-level SSR/HTTP
  assertion so permitted context and denial responses cannot pass through a
  direct-factory-only test.
- evidence_checked: indexed T3 card and dependency; direct task-linked
  architecture/access/transport/query contracts; actual source and generated
  build entry; fresh disposable HTTP matrix; focused, regression, check, full
  test, build, and diff gates.
- risks_or_questions: none requiring operator interpretation; the accepted
  route and denial contract is unambiguous.

## Handoff

Task status remains `in_progress`. Return the task to `/exe
TASK-035-T3-FT-002-W19` for a bounded retry, then rerun fresh `/verify`.
Per-task `/red-verify` is not eligible until functional verification passes.
No implementation, lifecycle status, dependency, feature, requirement, or
scheduler state was changed.

VERDICT: FAIL
