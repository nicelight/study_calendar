---
description: Fresh task-plan re-review of the FT-003 W9/W10 readiness-metadata repair.
status: final
---
# Review FT-003 — W9/W10 readiness-metadata repair

VERDICT: APPROVE

REVIEWED_PLANNING_REVISION: 2

ARCHITECTURE_VERDICT: APPROVE

BLOCKING_FINDINGS: 0

## Findings

None. The prior deterministic readiness findings are addressed at their
metadata root without changing the previously approved semantic task surface.

## Repair and preservation verdict

- TASK-037 and TASK-038 retain every exact task-owned AC locator:
  `.memory-bank/features/FT-003-calendar-and-lesson-context.md#FT-003-AC-007`
  remains only on TASK-037, and the corresponding `#FT-003-AC-008` remains
  only on TASK-038.
- Both cards retain the exact canonical anchors for Calendar and Membership,
  Access Control, Authentication Transport `#browserapi-path`, System
  Architecture request flow, Core Domain read/write flow, Lifecycle, Testing,
  execution cohesion, tier classification, hard write boundary, claim-linked
  RED/GREEN, and tier obligations.
- Alongside those anchors, both `source_artifacts` and `normative_inputs` now
  contain existing plain canonical paths for System Architecture, Boundary
  Map, Access Control, Authentication Transport, Core Domain, and Lifecycle.
  All files exist and are registered or directly routed canonical inputs. The
  plain identities add doctor-recognizable file context but adopt no additional
  contract section, behavior claim, proof obligation, or write authority.
- Compared with the last approved W9/W10 surface, identities, tiers, waves,
  dependencies, status, REQs, purpose, success outcome, anti-goals,
  constraints, invariants, verification targets, RED/GREEN contracts, gates,
  hard write boundaries, forbidden scopes, and stop conditions remain
  semantically unchanged.

## Coverage-group results

### 1. Structural integrity — pass

- Global Backbone is `complete` at positive Planning Revision `2`; FT-003 has
  `spec_design_status: complete` and no
  `PLANNING_RECONCILIATION_REQUIRED`, pending clarification, or blocking design
  marker.
- The index has 35 unique, resolving identity/file pairs. The read-only
  task-schema surface probe found no missing required field, extra top-level
  field, invalid enum, malformed identity, identity/feature/tier/wave mismatch,
  unresolved dependency, or cycle. JSON parsing passes for every indexed card.
- TASK-037 remains the sole `T3` / `FT-003` / `W9` identity; TASK-038 remains
  the sole `T3` / `FT-003` / `W10` identity. Both are product `W1+` cards with
  concrete governing REQs.
- Foundation gate TASK-002 is `done`. TASK-013, TASK-014, and provider
  prerequisite TASK-018 remain `done` with retained functional/semantic
  evidence; every direct prerequisite of TASK-014 also remains `done`.
- TASK-036 has no index entry, task card, task/protocol directory, dependency,
  or current claim/direct locator. Its remaining feature/plan/requirements and
  FT-003 protocol mentions are explicit historical retirement tombstones, not
  runnable state.

### 2. Coverage and slicing — pass

- Exact acceptance ownership is complete and non-overlapping: TASK-013 owns
  AC-001/002; TASK-014 owns AC-003..006; TASK-037 solely owns AC-007; TASK-038
  solely owns AC-008. TASK-018 remains only the completed Learning Progress
  provider prerequisite for TASK-014.
- TASK-037 is one useful completion: the protected `/calendar` server load and
  presentation consume current authorized class/lesson facts and prove the
  four-role plus denial/read-nonmutation matrix without changing the public
  fixture. Splitting its adapter, component, or proof mechanics would not
  produce another independently accepted outcome.
- TASK-038 is a separate useful completion after TASK-037: a real rendered
  lesson link preserves date/class/lesson/optional-student identity into the
  existing `/lesson-context` path and independently observes its server-side
  reauthorization/denial. Link construction without that follow-through does
  not close AC-008, and the card does not inherit TASK-037 proof.
- The shared `src/routes/calendar/+page.svelte` surface is explicitly sequenced
  by `TASK-038 -> TASK-037`; it prevents parallel execution but does not merge
  the completion/retry boundaries. Plan, feature, RTM, waves, change surface,
  gates, and artifacts remain coherent.

### 3. Design readiness — pass

- Feature and task routes identify one canonical owner per concrete concern.
  The Authentication Transport Browser/API section registers protected
  `GET /calendar`, public `/` fixture separation, redirect/denial behavior,
  exact `/lesson-context` query context, and final server-side reauthorization.
- Calendar and Membership Query already exposes server-authorized
  `AuthorizedClassScope` and current `LessonView` facts. Current code provides
  `getAuthorizedClassScope` and `getLessons`; the existing `/lesson-context`
  route/module rechecks class, lesson, and optional student context.
- Center & Scheduling retains scope and lesson authority. Lesson Context
  retains read-composition/final personal-context authorization. The tasks are
  thin SvelteKit transport/presentation work and do not legalize a new query,
  persistence path, cross-slice edge, compatibility branch, rollout rule, or
  business owner.
- Verified FT-002 remains the provider baseline. The public `/` fixture and
  login entry remain present in current code; no FT-004/FT-005/FT-006 or other
  downstream implementation/claim is added.

### 4. Execution readiness — pass

- T3 remains required because both outcomes exercise protected role/class or
  selected-student authorization. Both cards remain legally `planned`: TASK-037
  is eligible only after review/readiness ownership, while TASK-038 correctly
  waits for planned TASK-037; this review performs no promotion.
- TASK-037 keeps the hard write boundary `src/routes/calendar/` plus
  `tests/routes/calendar-authorized.test.ts`. TASK-038 keeps only
  `src/routes/calendar/+page.svelte` plus
  `tests/routes/calendar-navigation.test.ts`. Forbidden scopes protect public
  `/`, the pure calendar helper, existing `/lesson-context`, all capability
  modules, completed prerequisite records/evidence, and downstream owners.
- Each card has one task-owned exact AC, a realistic claim-equivalent RED/GREEN
  result contract, decisive positive/negative comparisons, non-mutation,
  isolated/disposable state, safe rerun/cleanup, distinct artifact paths, and
  required `check`, `test`, and `build` gates. No dependency claim or unrelated
  fixture/safeguard is adopted as task proof.
- Current absence of `src/routes/calendar/` provides an honest behavior-level
  RED basis; existing public queries and Lesson Context route provide a viable
  GREEN path inside the hard scope. Canonical execution remains sequential.

## Fresh bounded architecture review

- verdict: `APPROVE`
- findings: none. W9/W10 preserve the accepted C4 boundaries and separate the
  independently completable AC-007/AC-008 outcomes; TASK-038 correctly depends
  on TASK-037 and TASK-014. Public `/`, server-authorized center/class/student
  scope, Lesson Context authorization ownership, and downstream slice
  ownership remain protected.
- evidence_checked: Product; EP-002; FT-003; IMPL-FT-003; TASK-013/014/037/038
  and direct dependencies; Backbone/Spec Index; System Architecture; Boundary
  Map; Access Control; Authentication Transport; Core Domain; Lifecycle Map;
  Invariants; Testing Strategy; workflow rules; FT-003 protocol/decision log;
  current public `/`, Center & Scheduling queries, and `/lesson-context` code.
- risks_or_questions: none. TASK-037 can serialize existing
  `AuthorizedClassScope.studentAccountIds` and `LessonView`; TASK-038 consumes
  only that server-authorized data and the existing `/lesson-context`
  reauthorization path.

## Deterministic doctor evidence

- The supplied prior owner run reported 4 errors, 1 warning, and 2 info:
  TASK-037 and TASK-038 each had `TASK_SDD_SPEC_LINK_MISSING` plus derived
  `TASK_HANDOFF_INCOMPLETE` because the direct-reader treated the exact anchored
  locators as non-file paths.
- Current direct inspection confirms that each affected card now contains the
  existing plain canonical file identities in both richer handoff fields while
  retaining every exact anchor and AC locator. This closes the identified
  metadata cause for semantic review purposes.
- This Reviewer did not rerun or impersonate `/mb-doctor` and does not report a
  post-repair deterministic PASS. The applicable current strict-readiness
  result remains owned by the doctor/lifecycle owner.

## Validation evidence

- `node scripts/mb-lint.mjs`: pass for 67 Memory Bank files; existing advisory
  frontmatter warnings only.
- `git diff --check`: pass.
- Read-only schema/index/identity/dependency/DAG probe: pass; 35 indexed cards,
  unique identities/files, resolving dependencies, no cycle.
- Exact AC ownership probe: pass for AC-001..008; AC-007 only TASK-037, AC-008
  only TASK-038.
- Plain canonical file and retained anchored-locator probes: pass for both
  target cards.
- TASK-036 runnable/index/file/dependency/locator retirement probe: pass.

## Semantic co-review availability

The finding-adjudication pack required two fresh model-pinned Codex Luna
co-reviewers. The selected focuses were metadata/acceptance closure and
execution cohesion/proof scope. For each focus, the original launch and one
retry failed before start because Codex Luna is unavailable in this runtime.
No substitute model was used; the main Reviewer owns this verdict.

## Integrity and handoff

REVIEW_INTEGRITY: No reviewed product, requirement, spec, plan, task card,
task index, code, protocol, lifecycle, status, dependency, evidence, or
scheduler state was changed. Only the required REQUEST append and this report
were written.

NEXT_ROUTE: The doctor/lifecycle owner obtains the applicable current
post-repair T3 readiness result (`--strict` before scheduler handoff). After a
passing gate and owner promotion, execute TASK-037; after its required
`/verify`, T3 `/red-verify`, and closure, execute TASK-038 through the same
route. No planning repair or operator decision is required.
