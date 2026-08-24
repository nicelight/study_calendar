---
description: Fresh full semantic review of the reconciled FT-007 task-planning surface at Planning Revision 2.
status: final
---
# Review FT-007 — Navigation and Statistics

VERDICT: APPROVE

REVIEWED_PLANNING_REVISION: 2

ARCHITECTURE_REVIEW: not_required

BLOCKING_FINDINGS: none

## Review mode and current delta

Это fresh full review текущей post-reconciliation surface после зависшего
предыдущего reviewer. Старый report не использован как authoritative proof.
Текущая delta проверена напрямую по feature, plan, task cards, canonical
contracts и evidence:

- Calendar and Membership Query Boundary теперь явно включает серверно-
  resolved accessible class list с `class identity`, `center`, `name` и `mode`,
  а Home/Classes остаются тонкими adapters без локальной authorization.
  ([boundary-map](../../.memory-bank/contracts/boundary-map.md:166-208))
- `TASK-080` теперь owns C&S public accessible-class query вместе с единым
  Home/Classes AC-002 outcome, получил completed `TASK-095` prerequisite и
  отдельный provider probe; его lifecycle наблюдался как `in_progress` и не
  менялся. ([card](../../.memory-bank/tasks/TASK-080-T3-FT-007-W29.task.json:2-105),
  [plan](../../.memory-bank/tasks/plans/IMPL-FT-007.md:49-113))
- `TASK-098` теперь явно потребляет bare Home/Classes result только как route
  integration и не присваивает себе C&S provider proof.
  ([card](../../.memory-bank/tasks/TASK-098-T3-FT-007-W31.task.json:25-80))
- Existing done evidence for `TASK-079`, `TASK-094`, `TASK-095` remains current
  functional `PASS` plus T3 `semantic-pass`; historical failures remain
  history and are not reused as current proof. `TASK-080` current functional
  `PASS` and semantic `semantic-fail` remain execution evidence for the
  explicitly reconciled correction, not closure evidence.

## 1. Structural integrity — PASS

- Global Backbone is `complete` with positive `Planning Revision: 2`; the
  Foundation final gate is `TASK-002-T3-FT-000-W1` and is `done`.
  ([backbone](../../.memory-bank/spec-backbone.md:84-125),
  [foundation](../../.memory-bank/foundation.md:5-18))
- The read-only Ajv2020 probe validated all 9 indexed FT-007 task records
  against `.memory-bank/schemas/task.schema.json`; all nine returned `valid:
  true`.
- `.memory-bank/tasks/index.json` resolves 56/56 cards. The target set has 9
  unique entries, all cards resolve, all IDs match their card records, and
  ID/tier/feature/wave consistency is exact (`T3`, `FT-007`, `W27..W31`).
  The dependency probe found no missing dependency and no DAG cycle.
- All target task `docs`, `source_artifacts`, `normative_inputs`, and
  `verification_targets` paths resolve. Every product task is `W1+` and has
  concrete `REQ` linkage.

## 2. Coverage and slicing — PASS

The feature has exactly nine stable AC headings with governing REQs and an
explicit acceptance-closure table. ([feature](../../.memory-bank/features/FT-007-navigation-and-statistics.md:43-141),
[RTM](../../.memory-bank/requirements.md:160-166)) The independent exact-locator
probe found one and only one feature-matching owner for every AC, no orphan or
duplicate owner, and no task/AC REQ mismatch:

| Feature AC / REQ | Exact owner | Current status |
|---|---|---|
| `FT-007-AC-001` / `REQ-017` | `TASK-079-T3-FT-007-W28` | `done` |
| `FT-007-AC-002` / `REQ-014, REQ-017` | `TASK-080-T3-FT-007-W29` | `in_progress` |
| `FT-007-AC-003` / `REQ-014, REQ-017` | `TASK-096-T3-FT-007-W30` | `planned` |
| `FT-007-AC-004` / `REQ-017` | `TASK-097-T3-FT-007-W31` | `planned` |
| `FT-007-AC-005` / `REQ-017` | `TASK-090-T3-FT-007-W29` | `ready` |
| `FT-007-AC-006` / `REQ-017` | `TASK-089-T3-FT-007-W29` | `ready` |
| `FT-007-AC-007` / `REQ-014, REQ-017` | `TASK-098-T3-FT-007-W31` | `planned` |
| `FT-007-AC-008` / `REQ-014, REQ-017` | `TASK-094-T3-FT-007-W27` | `done` |
| `FT-007-AC-009` / `REQ-014, REQ-017` | `TASK-095-T3-FT-007-W28` | `done` |

The plan's boundary pass identifies nine independent material implementation
outcomes. Account-profile paths correctly merge into one complete Identity &
Access result; Home and Classes correctly merge into one server-resolved AC-002
result; provider facts, attendance, payment, composition, sorting and Profile
remain independently completable. The new C&S provider query is part of the
AC-002 implementation outcome, not a proof-only sibling. `TASK-095` retains
AC-009 ownership, while `TASK-098` adopts only Home/Classes route integration.
([plan](../../.memory-bank/tasks/plans/IMPL-FT-007.md:96-113))

No dependency proof is transferred: every task has its own exact
`source_artifacts`, `verification_targets`, and `evidence_required` locator.
The current cards do not create an unrelated acceptance outcome or duplicate
the C&S registry-facts claim.

## 3. Design readiness — PASS

- FT-007 has `spec_design_status: complete` and `clarification_status:
  complete`; the accepted route/Profile decision is recorded and no feature
  clarification remains pending or blocked. ([feature](../../.memory-bank/features/FT-007-navigation-and-statistics.md:1-19),
  [clarification](../../.protocols/FT-007/clarification.md:7-62))
- Each concrete concern has a registered canonical route: Access Control,
  Authentication Transport, Boundary Map, Statistics Projection, Core Domain,
  Testing Strategy, and the applicable workflow/tier sections. No hub-only
  T2/T3 design was used.
- The current C&S extension preserves the accepted owner, source-of-truth,
  dependency direction, and public boundary. It adds no slice, graph edge,
  role, membership rule, source owner, persistence, or migration. The boundary
  directly defines server-resolved list selection, denial behavior, forbidden
  caller-selected authorization, and verification coverage.
  ([boundary-map](../../.memory-bank/contracts/boundary-map.md:166-208),
  [TASK-080 constraints/invariants](../../.memory-bank/tasks/TASK-080-T3-FT-007-W29.task.json:67-103))
- TASK-080 makes the C&S owner, thin route adapters, forbidden profile/metric
  output, no local authorization, and isolated proof path discoverable. TASK-098
  makes the Profile owner, canonical routes, exact fields, no writes, and
  dependency-only Home/Classes integration discoverable.
- No accepted ownership, dependency, invariant, compatibility, persistence,
  or public-contract choice remains unresolved in a way that would force
  execution to choose between distinct outcomes. Therefore a separate
  architecture-review artifact is not required.

## 4. Execution readiness — PASS

- Current statuses are legal and were only observed: `TASK-079`, `TASK-094`,
  and `TASK-095` are `done` with current functional PASS and T3 semantic-pass
  evidence; `TASK-080` remains `in_progress` after its current semantic-fail;
  `TASK-089` and `TASK-090` are `ready` with all dependencies `done`; and
  `TASK-096`, `TASK-097`, `TASK-098` remain `planned` while their dependencies
  are unmet. The review does not normalize, promote, close, block, or infer
  any scheduler lifecycle decision.
- The existing done evidence was checked directly. `TASK-094` closes the
  all-path profile facts/query result (`AC-008`); `TASK-079` closes the shell,
  logout, isolation and cleanup result (`AC-001`); `TASK-095` closes the
  corrected server-resolved C&S registry-facts result (`AC-009`). Historical
  FAIL/RETRY/Judge artifacts remain preserved and are not substituted for the
  current PASS evidence.
  ([requirements evidence routes](../../.memory-bank/requirements.md:439-489),
  [TASK-094 evidence](../../.protocols/TASK-094-T3-FT-007-W27/verification.md:8-108),
  [TASK-095 evidence](../../.protocols/TASK-095-T3-FT-007-W28/verification.md:9-132))
- TASK-080's current semantic-fail is precisely retained: bare Student/Parent
  `/home` and `/classes` over-deny when `classId` is absent. The reconciled
  card now owns the contract-correct C&S list query and its own provider/route/
  browser proof, while the current `in_progress` state remains open. This is
  a planned correction prerequisite, not a missing planning owner.
  ([semantic evidence](../../.protocols/TASK-080-T3-FT-007-W29/red-verification.md:19-88),
  [reconciled card](../../.memory-bank/tasks/TASK-080-T3-FT-007-W29.task.json:28-103))
- All nine cards are complete T3 handoffs with non-empty purpose,
  scalar success outcome, direct canonical inputs, concrete REQs, valid
  dependencies, gates/verification targets, literal hard boundaries,
  forbidden scopes, stop conditions, and task-local claim-linked RED/GREEN
  evidence contracts. Ajv and boundary probes found no schema/path defect.
- Prospective `planned|ready` material-NFR cards carry exact AC/REQ locators,
  verification targets, and evidence contracts with observable RED/GREEN,
  decisive comparisons and artifacts. TASK-098 explicitly checks only
  integration with TASK-080 and does not inherit C&S provider proof.
  ([tier policy](../../.memory-bank/workflows/tier-policy.md:90-148),
  [TASK-098 proof scope](../../.memory-bank/tasks/TASK-098-T3-FT-007-W31.task.json:25-96))

## Independent co-review focuses and bounded fallback

Two different focuses were established as required by the semantic pack:

1. **Focus A — acceptance closure / exact claims / ownership / slicing.**
   Fresh `Codex Luna`/`xhigh` launch was bounded to the FT-007 feature, RTM,
   plan, all nine cards, dependency records, execute-loop cohesion rules and
   tier claim-ownership rules. The launch returned no compact result within the
   bounded wait; the equivalent local focus independently derived the 9/9
   unique-owner table above and checked no orphan, duplicate, unrelated, or
   proof-only sibling outcome.
2. **Focus B — design / execution / C&S boundary / TASK-080↔TASK-098 / proof
   scope.** Fresh `Codex Luna`/`xhigh` launch was bounded to the same target and
   normative basis with this separate scope. It returned no compact result
   within the bounded wait; the equivalent local focus checked the accepted
   Boundary Map extension, card hard/forbidden scopes, current statuses,
   dependency legality, done evidence, and prospective T3 proof obligations.

The launches were shut down after the bounded wait. No focus result was treated
as a vote, and no collaborator artifact was created.

## Architecture result

The accepted C&S boundary already assigns accessible-class eligibility/list
selection and route consumption. Current evidence supplies ownership, failure,
compatibility, forbidden-bypass and proof-path rules, so there is no material
architecture question that could change this verdict.

## Verdict and handoff

APPROVE

All four coverage groups pass. There is no planning repair route.

NEXT_ROUTE: At the applicable T3 feature/task boundary, run the required
`/mb-doctor --strict`; then the lifecycle owner may route the reconciled
`TASK-080` correction and its fresh `/verify` plus T3 `/red-verify`, while the
independent ready/planned cards retain their existing status ownership. This
review does not execute, verify, promote, close, block, sync, or infer scheduler
lifecycle, and it does not authorize use of the stale TASK-080 functional PASS
as semantic closure.

REVIEW_INTEGRITY: Only this report and REQUEST.md were written. No task card,
plan, feature/spec, index, code, protocol, evidence, lifecycle/status,
promotion, scheduler checkpoint, or AUTONOMOUS-RUN artifact was mutated by this
review.
