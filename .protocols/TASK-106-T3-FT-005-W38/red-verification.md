---
description: Independent adversarial semantic verification for TASK-106-T3-FT-005-W38.
status: final
---
# Red Verification — TASK-106-T3-FT-005-W38

## Semantic target
- Task outcome: the existing `/lesson-context` page renders the provider-owned
  homework item and class-visible completion statuses, lets a Student mark
  completion, and lets an Admin or assigned Teacher record `α`, `β`, `γ`, or
  `F` through the existing server actions with privacy-correct display.
- Accepted basis: `FT-005-AC-001 / REQ-009` and
  `FT-005-AC-002 / REQ-009 / REQ-014`; Learning Progress remains the owner of
  homework facts and Lesson Context only consumes its server projection and
  named actions. No new route, API, persistence relation, client authority, or
  shared grade disclosure is accepted.

## Evidence and adversarial coverage
- The fresh functional prerequisite is `VERDICT: PASS` at
  `.protocols/TASK-106-T3-FT-005-W38/verification.md:146`; the task remains
  `in_progress`.
- Inspected the indexed T3 card, task index identity, FT-005 acceptance
  criteria, direct Learning Progress Browser Surface, Access Control, Boundary
  Map, Architecture, Testing Strategy, and tier-policy sections, plus the
  current task protocol/artifacts and target-scoped implementation diff.
- Source review of `src/routes/lesson-context/+page.svelte:119-174` confirms
  the UI consumes `homeworkProgress`, server-provided labels, and
  `canEditMaterial`; forms submit only named action selectors and server-
  resolved student selectors. It adds no database access, homework identity
  authority, client-wide state, route/API, or authorization logic. Grade
  controls are gated to the server capability, while personal grade display
  remains in the existing personal context and Student/Parent views do not
  render the grade projection.
- The disposable browser artifact
  `e2e/ft-005-homework-grading-ui.spec.ts:117-200` covers Admin creation,
  Student completion and reload persistence, assigned-Teacher `α`/`β`/`γ`/`F`
  entry and reload persistence, corresponding Student/linked-Parent display,
  unrelated Student/unlinked-Parent denial, and state equality around denied
  operations. The functional protocol records the owned disposable server,
  exact `tmp/` database/sidecar cleanup, and no use of `study-calendar.db`.
- Two fresh `Codex Luna` `xhigh` co-reviewers were launched with separate
  privacy/boundary and persistence/operational focuses. They returned no usable
  candidate payload during the bounded review and were not treated as proof.
  Independent hostile source and evidence review found no reportable material
  break or unresolved operator-owned decision.

## Admitted findings
none

## Operator questions
none

## Verdict
SEMANTIC_VERDICT: semantic-pass

## Owner handoff
- Evidence/report paths: this protocol, the current functional protocol, and
  `.tasks/TASK-106-T3-FT-005-W38/TASK-106-T3-FT-005-W38-S-RED-VERIFY-final-report-docs-01.md`.
- Recommended owner action: record this T3 semantic gate alongside the fresh
  functional PASS; lifecycle/scheduler ownership remains unchanged.
- Resume route: `n/a`.
