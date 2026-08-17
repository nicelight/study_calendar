---
description: Fresh FT-002 W18/W19 task-plan review for localized schedule dates and the protected role-scoped class entry shell.
status: final
---
# Review FT-002 — TASK-034 and TASK-035 W18/W19

VERDICT: APPROVE

REVIEWED_PLANNING_REVISION: 2

ARCHITECTURE_VERDICT: APPROVE

BLOCKING_FINDINGS: none

## Coverage verdicts

- **Structural integrity: pass.** Global Backbone is `complete` at positive
  Planning Revision 2, and FT-002 contains no
  `PLANNING_RECONCILIATION_REQUIRED` marker. `node scripts/mb-lint.mjs` passed
  for 67 Memory Bank files with only advisory pre-existing frontmatter
  warnings. The index has 33 unique identity-consistent cards; all dependencies
  resolve and the DAG is acyclic. TASK-034 resolves as T1/FT-002/W18/`planned`
  and TASK-035 as T3/FT-002/W19/`planned`; each depends on done TASK-032. The
  completed TASK-026, TASK-031, and TASK-032 cards remain `done`, retain their
  evidence, and have no working-tree modification.

- **Coverage and slicing: pass.** The accepted feature has eleven stable AC
  headings and each has one exact task owner. The two new outcomes do not
  duplicate historical closure: TASK-034 alone owns AC-010's strict
  `dd/mm/yyyy` presentation plus ISO wire/draft preservation, while TASK-035
  alone owns AC-011's protected four-role class entry shell. Each task is one
  owner-valid implementation-and-proof unit: TASK-034's parser/presentation and
  canonical form/draft conversion cannot deliver the accepted result
  separately, and TASK-035's server load plus thin shell are one protected
  route outcome. No material sibling failure, retry, rollout, or semantic-owner
  boundary is hidden inside either card.

  | Exact acceptance claim | Owning task |
  |---|---|
  | FT-002-AC-001..002 | TASK-005-T3-FT-002-W3 |
  | FT-002-AC-003..006 | TASK-006-T2-FT-002-W4 |
  | FT-002-AC-007 | TASK-026-T3-FT-002-W12 |
  | FT-002-AC-008 | TASK-031-T2-FT-002-W15 |
  | FT-002-AC-009 | TASK-032-T2-FT-002-W16 |
  | FT-002-AC-010 | TASK-034-T1-FT-002-W18 |
  | FT-002-AC-011 | TASK-035-T3-FT-002-W19 |

- **Design readiness: pass.** FT-002 `spec_design_status` is `complete`; REQ-003,
  REQ-004, REQ-014, AC-010/011, the plan, and both cards agree. Authentication
  Transport canonically requires strict `dd/mm/yyyy` controls while retaining
  ISO `YYYY-MM-DD` Form Data/draft JSON, and registers
  `/center/{centerId}/class/{classId}` without replacing
  `/admin/{centerId}`. Boundary Map assigns the class query and authorization
  result to Center & Scheduling and explicitly excludes Lesson Context/calendar
  composition. Access Control covers all four permitted roles and server-side
  denial. Current code already exposes one `AuthorizedClassScope` query for
  Admin, Teacher, Student, and Parent, so execution need not invent or legalize
  a new module edge or persistence contract. The fresh architecture review
  returned `APPROVE` with no finding or owner question.

- **Execution readiness: pass.** TASK-034 is correctly T1: its hard write
  boundary permits only the existing Admin component and focused draft test,
  while server action, Center & Scheduling, done task artifacts, and FT-003
  routes are forbidden. Its compact check/test/build, SSR/source, browser/form,
  invalid-date, ISO Form Data, exact-key draft, and diff checks are sufficient.
  TASK-035 is correctly T3—not T2—because it introduces a protected
  permission-sensitive route and negative authorization matrix. Its complete
  card has non-empty purpose/outcome, direct canonical paths, a hard route/test
  write boundary, forbidden Admin/FT-003/downstream/database scopes, one
  claim-linked RED/GREEN evidence contract, realistic isolated SSR/HTTP role
  and denial probes, and required check/test/build plus source/regression gates.
  Its dependency evidence is not adopted as AC-011 proof. `planned` is legal for
  future W18/W19 waves and this review performs no promotion.

## Fresh architecture review

- verdict: `APPROVE`
- findings: none
- evidence_checked: Product C4 L1, EP-001, FT-002, REQ/RTM, IMPL-FT-002, all
  indexed FT-002 cards and dependency closure, Global Backbone/spec index,
  Authentication Transport, Boundary Map, Access Control, System Architecture,
  Core Domain, Lifecycle Map, testing/runbook policy, current
  `AuthorizedClassScope` implementation and existing four-role probes.
- risks_or_questions: none. AC-010 and AC-011 remain prospective and have not
  inherited the AC-001..009 feature semantic evidence; their fresh proof stays
  with TASK-034 and TASK-035.

## Semantic co-review availability

The mandatory finding-adjudication pack requested two model-pinned `Codex Luna`
co-reviewers with different focuses. Each launch was retried once and rejected
before start because the active environment exposes only `gpt-5.6-sol` and
`gpt-5.6-terra`; the pack's explicit unavailable-model fallback was therefore
used without substituting another model. The caller retained the final
judgment, and the required independent architecture Reviewer completed.

## Evidence

- [.memory-bank/spec-backbone.md](../../.memory-bank/spec-backbone.md)
- [.memory-bank/requirements.md](../../.memory-bank/requirements.md#ft-002-w18w19-planning-reconciliation--2026-08-14)
- [.memory-bank/features/FT-002-center-and-scheduling.md](../../.memory-bank/features/FT-002-center-and-scheduling.md#ft-002-ac-010--schedule-date-input-uses-strict-ddmmyyyy-presentation)
- [.memory-bank/tasks/plans/IMPL-FT-002.md](../../.memory-bank/tasks/plans/IMPL-FT-002.md#w18w19-accepted-ui-boundary-reconciliation)
- [.memory-bank/tasks/TASK-034-T1-FT-002-W18.task.json](../../.memory-bank/tasks/TASK-034-T1-FT-002-W18.task.json)
- [.memory-bank/tasks/TASK-035-T3-FT-002-W19.task.json](../../.memory-bank/tasks/TASK-035-T3-FT-002-W19.task.json)
- [.memory-bank/tasks/TASK-026-T3-FT-002-W12.task.json](../../.memory-bank/tasks/TASK-026-T3-FT-002-W12.task.json)
- [.memory-bank/tasks/TASK-031-T2-FT-002-W15.task.json](../../.memory-bank/tasks/TASK-031-T2-FT-002-W15.task.json)
- [.memory-bank/tasks/TASK-032-T2-FT-002-W16.task.json](../../.memory-bank/tasks/TASK-032-T2-FT-002-W16.task.json)
- [.memory-bank/contracts/authentication-transport.md](../../.memory-bank/contracts/authentication-transport.md#browserapi-path)
- [.memory-bank/contracts/boundary-map.md](../../.memory-bank/contracts/boundary-map.md#calendar-and-membership-query-boundary)
- [.memory-bank/contracts/access-control.md](../../.memory-bank/contracts/access-control.md#accepted-permission-matrix)
- [.memory-bank/workflows/tier-policy.md](../../.memory-bank/workflows/tier-policy.md#tier-classification-and-escalation)

IDENTITY_NOTE: The current index and reviewed planning surface contain
`TASK-035-T3-FT-002-W19`; no `TASK-035-T2-FT-002-W19` record exists. T3 is the
correct tier under the canonical auth/permissions rule and is not a blocking
planning discrepancy.

REVIEW_INTEGRITY: No reviewed product, requirement, spec, plan, task card,
task index, code, protocol, lifecycle, status, dependency, evidence, or
scheduler state was changed. Only the required request entry and this fresh
review report were written.

NEXT_ROUTE: Run `/mb-doctor` because the reviewed queue contains T3 work. After
the applicable readiness/promotion owner acts, route TASK-034 directly to
`/exe TASK-034-T1-FT-002-W18`. Before executing TASK-035, optional
`/technical-premortem TASK-035-T3-FT-002-W19` is warranted by its material
authorization/trust-boundary exposure; otherwise follow the normal T3
`/exe -> /verify -> /red-verify` path. Approval itself does not promote, start,
close, or otherwise mutate either task.
