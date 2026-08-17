---
description: Fresh task-plan review of the FT-003 W9 protected calendar route surface.
status: final
---
# Review FT-003 — W9 protected calendar route

VERDICT: REJECT

REVIEWED_PLANNING_REVISION: 2

ARCHITECTURE_VERDICT: APPROVE

BLOCKING_FINDINGS: 2

## Findings

### 1. Coverage and slicing — TASK-036 merges two independently completable outcomes

`FT-003-AC-007` is already a useful, owner-valid completion by itself: a
protected `/calendar` server load and view render current authorized DB lesson
facts and pass the four-role plus denial SSR/HTTP matrix without the public
fixture. `FT-003-AC-008` is a separate useful completion: rendered lesson
anchors preserve exact date/class/lesson/optional-student identity into the
already existing `/lesson-context`, with its own integration and guessed-student
denial proof.

The current card itself exposes the separation: AC-007 and AC-008 have distinct
exact claims, distinct `evidence_required` entries, and distinct
`verification_targets`; the bounded code surface separates protected
load/data projection from link construction and follow-through. Either result
can be implemented, decisively proved, failed, and retried while the other
remains incomplete. The plan and feature justify the merge only by the same
route/owner and avoiding a duplicated authorization proof, but
`execute-loop.md#execution-cohesive-task-boundary` explicitly says that shared
owner, route/flow, tier, and proof convenience are not merge evidence.

Effect: the current single T3 card is not safe to hand to execution.

Repair owner: `/feature-to-tasks FT-003`. Rebuild the W9 surface into sibling
completion units for AC-007 and AC-008, with the navigation unit depending on
the DB-backed calendar unit where sequencing requires it. Preserve completed
TASK-013/TASK-014/TASK-018 evidence and all unrelated scopes.

### 2. Design readiness — the direct Authentication Transport anchor does not resolve

The canonical heading `## Browser/API path` in
`.memory-bank/contracts/authentication-transport.md` resolves as
`#browserapi-path`. The reviewed surface instead uses
`#browser-api-path` in:

- FT-003 `spec_design_links`;
- TASK-036 `source_artifacts`;
- TASK-036 `normative_inputs`.

This is a blocking direct-SDD-locator defect for a prospective T3 handoff. It
is especially material here because that exact section owns the accepted
protected `/calendar` HTTP path, redirects/denials, public-fixture separation,
and exact `/lesson-context` link contract.

Repair owner: `/feature-to-tasks FT-003`. Replace the three unresolved
fragments with the existing canonical `#browserapi-path`; no shared-contract or
Planning Revision change is required.

## Coverage-group results

- Structural integrity: pass. Global Backbone is complete at positive Planning
  Revision 2; no `PLANNING_RECONCILIATION_REQUIRED` marker exists. TASK-036 is
  the sole indexed T3/FT-003/W9 identity, matches the task-schema surface, and
  remains legally `planned` before review/readiness promotion. The index has 34
  unique identity-consistent cards, all dependencies resolve, and the DAG is
  acyclic. Foundation TASK-002, direct dependencies TASK-013/TASK-014, and the
  provider prerequisite TASK-018 are `done`.
- Coverage and slicing: reject on Finding 1. Exact AC closure is otherwise
  complete and non-orphaned: TASK-013 owns AC-001/002, TASK-014 owns AC-003..006,
  and the current W9 surface maps AC-007/008. FT-002 is verified and is not
  reopened.
- Design readiness: reject on Finding 2. The remaining direct architecture,
  Calendar and Membership Query, Access Control, domain, lifecycle, testing,
  and workflow routes support the accepted behavior. No product or shared-
  architecture choice remains open.
- Execution readiness: tier T3 is correct for permission-sensitive protected
  reads. The non-empty route/test `write_boundary` is hard and sufficient;
  forbidden scopes preserve public `/`, existing `/lesson-context`, capability
  modules, completed prerequisite artifacts, Collaboration, Learning Progress,
  and Financial Ledger. The claim-linked isolated SSR/HTTP, non-mutation,
  safe-rerun, cleanup, check/test/build, and boundary-regression probes are
  otherwise realistic and task-owned. Execution remains blocked until both
  planning repairs are applied and re-reviewed.

## Fresh bounded architecture review

- verdict: `APPROVE`
- findings: none
- evidence_checked: product/EP-002/FT-003/IMPL-FT-003; TASK-013, TASK-014,
  TASK-018, TASK-036; accepted C4/system architecture, Calendar and Membership
  Query, Access Control, Authentication Transport, domain and lifecycle routes;
  current `getAuthorizedClassScope`/`getLessons`, request-scoped Actor Context,
  existing `/lesson-context`, pure calendar presenter, and isolated public `/`
  fixture.
- risks_or_questions: none. Route-only scope is architecturally sufficient if
  execution consumes public queries, performs no direct persistence or
  route-owned authorization, and carries only a server-returned permitted
  student context.

## Validation evidence

- `node scripts/mb-lint.mjs`: pass for 67 Memory Bank files; existing advisory
  frontmatter warnings only.
- Task index/schema/identity/dependency/DAG probe: pass; 34 unique indexed
  records, no unresolved dependency or cycle.
- `git diff --check`: pass.
- The deterministic `/mb-doctor` was not rerun or impersonated by this semantic
  review. Prior strict results predate the new W9 card and do not replace the
  required post-repair readiness gate.

## Semantic co-review availability

The finding-adjudication pack requested two fresh `Codex Luna` co-reviewers,
one for claim/locator sufficiency and one for cohesion/runtime readiness. Each
launch was retried once and rejected before start because this environment
exposes only `gpt-5.6-sol` and `gpt-5.6-terra`. The pack's explicit fallback was
used without substituting another model; the main Reviewer owns this verdict.

REVIEW_INTEGRITY: No reviewed product, requirement, spec, plan, task card,
task index, code, protocol, lifecycle, status, dependency, evidence, or
scheduler state was changed. Only the required request entry and this review
report were written.

NEXT_ROUTE: `/feature-to-tasks FT-003` repairs the W9 slicing and exact locator,
then a fresh `/review-tasks-plan FT-003` must return current-revision APPROVE.
Because the repaired queue remains T3, run the conditional `/mb-doctor`
readiness gate (`--strict` before scheduler handoff) before any `/exe`.
