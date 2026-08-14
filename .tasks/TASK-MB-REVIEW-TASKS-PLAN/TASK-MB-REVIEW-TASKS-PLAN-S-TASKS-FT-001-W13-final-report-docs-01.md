---
description: Fresh semantic task-planning review for FT-001 W13 email/password access.
status: active
---
# Review FT-001 — W13 email/password access

VERDICT: REJECT

REVIEWED_PLANNING_REVISION: 2

ARCHITECTURE_VERDICT: REQUEST_CHANGES

## Blocking findings

1. **HIGH — Design readiness / architecture contradiction.**
   [.memory-bank/states/lifecycle-map.md#access-and-membership](../../.memory-bank/states/lifecycle-map.md#access-and-membership)
   permits Session issuance only after verified external-identity resolution or
   binding. The accepted password path explicitly permits issuance after a
   password credential succeeds in
   [.memory-bank/features/FT-001-authentication-and-binding.md#ft-001-ac-010--first-admin-uses-local-emailpassword-bootstrap-and-browser-login](../../.memory-bank/features/FT-001-authentication-and-binding.md#ft-001-ac-010--first-admin-uses-local-emailpassword-bootstrap-and-browser-login),
   [.memory-bank/contracts/access-control.md#binding-and-session-rules](../../.memory-bank/contracts/access-control.md#binding-and-session-rules),
   and
   [.memory-bank/contracts/authentication-transport.md#session-issuance-and-revocation](../../.memory-bank/contracts/authentication-transport.md#session-issuance-and-revocation).
   TASK-028 directly names the contradictory lifecycle section as a normative
   input, so execution cannot satisfy all canonical inputs simultaneously.
   No operator decision is needed: the already accepted password path resolves
   the intended behavior. Repair owner: `/feature-to-tasks FT-001` must align
   the canonical Session transition before strict readiness.

2. **HIGH — Coverage and slicing / execution cohesion.**
   `TASK-028-T3-FT-001-W13` combines two independently completable material
   units: (a) the local CLI plus empty-account atomic Admin/credential bootstrap
   and secret-input boundary, and (b) credential verification plus browser
   login/session transport. The first can be implemented and proved against
   disposable database/CLI state without the HTTP path; the second can be
   implemented and proved with a disposable pre-created credential without the
   CLI. They have distinct failure, retry, rollback, and proof surfaces. A
   shared AC, Identity & Access owner, credential shape, T3 tier, or end-to-end
   outcome does not make them one execution-cohesive task under
   [.memory-bank/workflows/execute-loop.md#execution-cohesive-task-boundary](../../.memory-bank/workflows/execute-loop.md#execution-cohesive-task-boundary).
   Repair owner: `/feature-to-tasks FT-001` must split them into ordered sibling
   cards with exact claim/proof ownership, without changing completed
   TASK-025/TASK-026 history.

## Coverage results

- **Structural integrity: pass.** Global Backbone is `complete` at positive
  Planning Revision 2. `node scripts/mb-lint.mjs` passed (`66 files`; only
  existing advisory frontmatter warnings). The index contains 27 unique,
  identity-consistent cards; dependencies resolve; the DAG is acyclic. Stale
  TASK-027 is absent. TASK-028 is T3/FT-001/W13 and depends on done TASK-025.
- **Coverage and slicing: reject.** Stable FT-001-AC-001..010 headings and
  governing REQs resolve, with AC-010 exactly linked from TASK-028. Historical
  AC/task evidence remains owned by its existing done/failed cards. The current
  W13 card nevertheless fails the independent cohesion probe described above.
- **Design readiness: reject.** PRD clarification is complete, FT-001 reports
  `spec_design_status: complete`, no design row is pending, and the password
  bootstrap/authentication shape is otherwise consistent across access-control,
  authentication transport, boundary ownership, persistence, runbook, and task
  proof. The direct lifecycle contradiction is blocking.
- **Execution readiness: reject.** T3 is correct; native check/test/build gates,
  exact AC/REQ locators, concrete RED/GREEN evidence, disposable-state proof,
  anti-goals, and forbidden completed-task scope are present. TASK-028's
  `ready` state is not executable while this review is `REJECT`; this review
  does not mutate that status.

## Architecture review

- verdict: `REQUEST_CHANGES`
- findings: the Session lifecycle row omits successful password verification
  as an allowed issuance predecessor; no other material C4, ownership,
  dependency, transaction, transport, or proof-path blocker was found.
- evidence checked: product, EP-001, FT-001, IMPL-FT-001, all indexed FT-001
  cards, TASK-028/TASK-025 and transitive Foundation context, system
  architecture, access-control, authentication-transport, boundary-map,
  core-domain, lifecycle-map, MVP verification runbook, testing strategy, and
  tier/task-boundary policies.
- risks_or_questions: none; no operator decision is required.

## Evidence paths

- [.memory-bank/tasks/TASK-028-T3-FT-001-W13.task.json](../../.memory-bank/tasks/TASK-028-T3-FT-001-W13.task.json)
- [.memory-bank/tasks/plans/IMPL-FT-001.md#w13-emailpassword-rebuild](../../.memory-bank/tasks/plans/IMPL-FT-001.md#w13-emailpassword-rebuild)
- [.memory-bank/features/FT-001-authentication-and-binding.md](../../.memory-bank/features/FT-001-authentication-and-binding.md)
- [.memory-bank/spec-backbone.md#global-backbone-status](../../.memory-bank/spec-backbone.md#global-backbone-status)
- [.memory-bank/contracts/boundary-map.md#account-provisioning-boundary](../../.memory-bank/contracts/boundary-map.md#account-provisioning-boundary)
- [.memory-bank/domains/core-domain.md#persistence-and-transaction-rules](../../.memory-bank/domains/core-domain.md#persistence-and-transaction-rules)
- [.memory-bank/workflows/tier-policy.md#task-claim-and-dependency-ownership](../../.memory-bank/workflows/tier-policy.md#task-claim-and-dependency-ownership)

REVIEW_INTEGRITY: No reviewed product/spec/plan/task/index/code/protocol,
lifecycle, status, dependency, retry history, or scheduler state was changed.
The architecture verdict is integrated here; no separate architecture artifact
was created.

NEXT_OWNER: `/feature-to-tasks FT-001`, then rerun
`/review-tasks-plan FT-001`. Do not route TASK-028 to `/exe` or `/mb-doctor`
until the replacement planning surface receives `APPROVE` for Planning
Revision 2.
