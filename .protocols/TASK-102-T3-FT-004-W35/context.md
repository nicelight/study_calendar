---
description: Execution context for TASK-102-T3-FT-004-W35.
status: active
---
# Context — TASK-102-T3-FT-004-W35

## Purpose
Expose the server-composed Collaboration projection and named authorized
form-action transport through the existing Lesson Context route, including the
atomic migration of its existing form callers.

## Execution Attempt
- attempt: 1 (completed executor evidence; supporting-only after independent
  verifier FAIL)
- started: 2026-09-05 10:03:51 +05
- attempt: 2 (current bounded correction retry)
- started: 2026-09-05 10:56:37 +05
- retry basis: fresh independent verifier report identified only FAIL-01
  (native named-form URL drops `classId`/`lessonId`) and FAIL-02 (unsupported
  `fieldKey`/field reaction `targetId` is written). The retry preserves the
  original RED and corrects only these two findings.
- attempt: 3 (current bounded final correction retry)
- started: 2026-09-05 11:24:37 +05
- retry basis: fresh independent verifier report-02 identified one remaining
  fixed-semantics defect: native named-action URLs from a personal context do
  not preserve `studentAccountId`. Attempts 1 and 2 remain preserved and
  supporting-only; this retry corrects only the existing `actionHref` helper
  and its minimum claim-linked regression proof.

## Inputs (what drives this task)
- Task record: `.memory-bank/tasks/TASK-102-T3-FT-004-W35.task.json`
- Task index: `.memory-bank/tasks/index.json`
- Specs: `.memory-bank/contracts/collaboration-browser-surface.md`,
  `.memory-bank/contracts/boundary-map.md`, `.memory-bank/contracts/access-control.md`,
  `.memory-bank/architecture/system-architecture.md`,
  `.memory-bank/domains/core-domain.md`, `.memory-bank/states/lifecycle-map.md`,
  `.memory-bank/testing/strategy.md`
- Acceptance criteria source: `.memory-bank/features/FT-004-day-collaboration.md#FT-004-AC-005`

## Richer inputs
- Source Artifacts: task card, current FT-004 plan, current FT-004 Browser R5
  `APPROVE` report at Planning Revision 2.
- Normative Inputs: Global Backbone Revision 2; existing Collaboration,
  Identity & Access, Calendar/Membership, and Lesson Context boundaries.
- Constraints / Invariants: session is sole actor authority; Collaboration is
  sole discussion writer; no mutation API, schema, or direct table bypass;
  denied requests must be state-preserving.
- Verification Targets: isolated SQLite route/action integration and the
  disposable browser transport path listed on the task card.

## Loaded context set
- `AGENTS.md`
- `.memory-bank/constitution.md`
- `.memory-bank/spec-backbone.md`
- `.memory-bank/spec-index.md`
- `.memory-bank/workflows/tier-policy.md`
- `.memory-bank/contracts/collaboration-browser-surface.md`
- `.memory-bank/contracts/boundary-map.md`
- `.memory-bank/contracts/access-control.md`

## Decisions / assumptions
- Existing dirty changes in Lesson Context from adjacent tasks are preserved;
  this attempt will extend them in place.
- The existing public Collaboration methods are the accepted mutation boundary;
  the route will pass only server-derived route context plus untrusted content
  and selectors.
- Attempt 3 keeps the accepted public boundaries and T3 proof surfaces: the
  existing form helper will preserve the current personal selector in addition
  to the already-preserved class and lesson selectors. No server authority or
  Collaboration ownership changes are needed.

## Commands run / environment notes
- `node .memory-bank/scripts/mb-doctor.mjs --strict` → PASS.
- `git status --short` → pre-existing unrelated and adjacent-task changes;
  no forbidden task file was touched during preflight.

## Open questions / blockers
- none; verifier findings are bounded by the accepted task contract.

## Next session
- Start by reading: `context.md`, `plan.md`, `progress.md`, and the fresh
  verifier report-02.
- Next action: fresh `/verify TASK-102-T3-FT-004-W35`; if functional PASS,
  route to `/red-verify` under T3 policy. This executor leaves lifecycle and
  scheduler/Judge ownership unchanged.
