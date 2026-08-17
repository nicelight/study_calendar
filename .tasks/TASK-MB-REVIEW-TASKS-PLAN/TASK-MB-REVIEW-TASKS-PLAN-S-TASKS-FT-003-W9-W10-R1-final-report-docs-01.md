---
description: Fresh task-plan re-review of the repaired FT-003 W9/W10 calendar route surface.
status: final
---
# Review FT-003 — W9/W10 calendar route repair

VERDICT: APPROVE

REVIEWED_PLANNING_REVISION: 2

ARCHITECTURE_VERDICT: APPROVE

BLOCKING_FINDINGS: 0

## Findings

None. The prior execution-cohesion and canonical-locator blockers are closed.

## Coverage-group results

### 1. Structural integrity — pass

- Global Backbone is `complete` at positive Planning Revision `2`; FT-003 has
  no `PLANNING_RECONCILIATION_REQUIRED` or pending/blocked clarification marker.
- The index contains 35 unique identity-consistent records. TASK-037 is the
  sole `T3` / `FT-003` / `W9` identity and TASK-038 the sole `T3` / `FT-003` /
  `W10` identity; both validate against the current task-model surface and have
  non-empty hard `runtime_context.write_boundary` values.
- Every dependency resolves and the full DAG is acyclic. Foundation gate
  TASK-002 is `done`; TASK-013, TASK-014, and TASK-018 are `done` with retained
  functional/semantic evidence. TASK-037 depends on TASK-013; TASK-038 depends
  on TASK-014 and TASK-037.
- TASK-036 has no index entry, task card, task/protocol directory, dependency,
  claim locator, or current ordered-plan row. The remaining references in the
  feature, implementation plan, and FT-003 protocol are explicitly historical
  retirement/tombstone context and do not make it runnable.

### 2. Coverage and slicing — pass

- Exact FT-003 acceptance ownership is complete and non-overlapping:
  TASK-013 owns AC-001/002, TASK-014 owns AC-003..006, TASK-037 solely owns
  AC-007, and TASK-038 solely owns AC-008. TASK-018 remains only the completed
  Learning Progress provider prerequisite consumed through TASK-014.
- TASK-037 reaches a useful closure independently: the protected `/calendar`
  server load and presentation consume existing authorized class scope/current
  DB lesson facts and prove the four-role plus denial/read-nonmutation matrix,
  while preserving the public fixture.
- TASK-038 reaches a different useful closure after TASK-037: real rendered
  lesson links preserve exact date/class/lesson/optional-student query identity
  into the existing `/lesson-context` route and independently prove its
  reauthorization/denial behavior. It does not inherit TASK-037's AC-007 proof.
- The cards have distinct AC locators, RED/GREEN result contracts, artifacts,
  verification targets, stop conditions, and retry surfaces. Their shared
  `src/routes/calendar/+page.svelte` change point is handled by the explicit
  W9 -> W10 dependency; it prevents parallel execution but does not merge the
  two completion units.
- REQ/RTM and plan/feature/protocol coverage remain coherent. REQ-016's broad
  quality route spans AC-007/008 at the feature boundary: TASK-037 directly
  carries REQ-016, both fresh cards require the project gates, and the later
  aggregate feature gate owns final acceptance. TASK-038's exact AC-008
  behavioral links remain REQ-005, REQ-006, and REQ-014 as stated in the
  feature; no second task-owned NFR claim is invented.

### 3. Design readiness — pass

- Both prospective cards resolve their direct feature and canonical SDD
  locators. The prior fragment error is repaired everywhere on the reviewed
  surface to
  `.memory-bank/contracts/authentication-transport.md#browserapi-path`.
- The accepted Browser/API path registers the protected DB-backed `/calendar`
  endpoint, its unauthenticated/revoked and scope-denial behavior, the public
  `/` fixture separation, the exact `/lesson-context` query contract, and the
  existing route's final server-side authorization ownership.
- Calendar and Membership Query already exposes `AuthorizedClassScope`,
  including server-permitted student identities, and current `LessonView`
  facts. Current code exposes `getAuthorizedClassScope` and `getLessons`, while
  the existing `/lesson-context` load rechecks `classId`, `lessonId`, and
  optional `studentAccountId`. Execution therefore need not invent a query,
  authorization rule, persistence owner, or compatibility behavior.
- The tasks remain thin SvelteKit transport/presentation work over accepted
  public queries. Center & Scheduling retains data/authorization scope;
  Lesson Context retains day-composition and final personal-context
  authorization. No Collaboration, Learning Progress, or Financial Ledger
  implementation/claim expansion is planned.
- Verified FT-002 remains the provider baseline. Its completed scope and
  evidence are not reopened, and its protected class-shell ownership does not
  absorb FT-003 calendar or Lesson Context behavior.

### 4. Execution readiness — pass

- T3 is correct because both cards exercise permission-sensitive protected
  routes and student-context denial. `planned` is legal before the review and
  lifecycle-owner readiness gate; this review performs no promotion.
- TASK-037's hard write boundary is the new `src/routes/calendar/` subtree plus
  its isolated authorization test. TASK-038's is only the calendar component
  plus its isolated navigation test. Forbidden scopes protect public `/`, the
  pure calendar presenter, existing `/lesson-context`, all capability modules,
  completed prerequisite records/evidence, and downstream feature ownership.
- Each card has one task-owned RED/GREEN contract with observable result,
  decisive authorized/denied comparisons, state equality, safe rerun/cleanup,
  and task-owned artifact paths. `npm run check`, `npm run test`, and
  `npm run build` remain required gates. The probes are claim-equivalent,
  realistic against current code, and do not adopt dependency evidence.
- TASK-037 may execute after lifecycle-owner promotion because TASK-013 is
  done. TASK-038 remains planned until TASK-037 is done; TASK-014 is already
  done. Canonical execution is sequential.

## Fresh bounded architecture review

- verdict: `APPROVE`
- findings: none
- evidence_checked: product and EP-002 purpose; FT-003 AC-001..008 and current
  lifecycle; IMPL-FT-003 and FT-003 protocol/decision log; TASK-013, TASK-014,
  TASK-018, TASK-037, and TASK-038; C4/system architecture, Boundary Map,
  Access Control, Authentication Transport, Core Domain, Lifecycle, Foundation,
  and Testing contracts; current public `/`, Center & Scheduling public query,
  and existing `/lesson-context` route/module code.
- risks_or_questions: none. The accepted route adapter can serialize only the
  existing server-authorized class/student scope and lesson facts; no new
  architecture, cross-slice edge, write owner, or rollout decision is required.

## Validation evidence

- `node scripts/mb-lint.mjs`: pass for 67 Memory Bank files; existing advisory
  frontmatter warnings only.
- `git diff --check`: pass.
- Index/task-model/identity/dependency/DAG probe: pass; 35 unique indexed
  records, no missing dependency or cycle.
- AC ownership probe: pass; every FT-003 AC has exactly one owning task, with
  AC-007 mapped only to TASK-037 and AC-008 only to TASK-038.
- Direct-locator probe: pass for TASK-037/TASK-038 `source_artifacts` and
  `normative_inputs`, including canonical `#browserapi-path`.
- TASK-036 retirement probe: pass for index, task files, task/protocol
  directories, dependency/locator fields, and current ordered plan.
- The deterministic `/mb-doctor` was not run or impersonated. Existing strict
  results predate this repaired T3 surface and do not replace the required
  post-review readiness gate.

## Semantic co-review availability

The finding-adjudication pack requires two fresh model-pinned `Codex Luna`
co-reviewers. This runtime does not expose that model. For each selected focus
— cohesion/claim ownership and architecture/boundary readiness — the original
launch and one retry were unavailable before start. The required fallback was
applied without substituting another model; the main Reviewer owns this
verdict.

REVIEW_INTEGRITY: No reviewed product, requirement, spec, plan, task card,
task index, code, protocol, lifecycle, status, dependency, evidence, or
scheduler state was changed. Only the required REQUEST append and this report
were written.

NEXT_ROUTE: Run the conditional `/mb-doctor` T3 queue-readiness gate (use
`--strict` before scheduler handoff). Then the lifecycle owner may promote and
execute TASK-037; after its required `/verify`, T3 `/red-verify`, and closure,
execute TASK-038 through the same route. No additional planning repair or
operator decision is required.
