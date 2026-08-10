---
description: Independent adversarial semantic verification of TASK-016-T3-FT-004-W6.
status: final
---
# Red Verification — TASK-016-T3-FT-004-W6

## Semantic target

- Accepted outcome: comments and field reactions remain attributable,
  center-scoped, usable in the replacement center, and isolated from retained
  prior-center rows across supported class identity reuse.
- Direct boundaries: Collaboration owns comments/reactions and their writes;
  Identity & Access supplies actor context; Center & Scheduling supplies
  server-resolved center/class/lesson/student scope; the shared database
  retains historical rows.
- Scope is limited to `FT-004-AC-001`, `FT-004-AC-002`, and `FT-004-AC-005`.
  TASK-017 threaded discussions, branches, and tabs were not reviewed or
  executed.

## Evidence and adversarial coverage

- Functional `PASS` in
  `.protocols/TASK-016-T3-FT-004-W6/verification.md` was treated as input,
  not as semantic proof.
- Inspected current source, schema, composition wiring, direct canonical
  contracts, task scope, and actual production-surface diff. No production,
  schema, registered-test, task-card, spec, or lifecycle change was made by
  this review; the current task implementation surface is clean relative to
  the pre-existing worktree changes.
- Fresh supported-path evidence covered class delete/recreate with reused class,
  schedule, and lesson identities; retained prior-center comment/reaction
  rows; replacement projection; prior-row edit and reaction-target denial;
  current-center comment attribution/uniqueness; all five reactions and
  reactor projection; shared/personal and cross-center negative authorization;
  retained-row state comparison; safe rerun and cleanup.
- Writer scan found Collaboration as the only business writer for
  `collaboration_comments` and `collaboration_reactions`; no consumer-side
  bypass or second source of truth was found.

## Admitted findings

None. No evidenced material authority, privacy, scope, ownership, persistence,
retention, or maintenance-boundary break was found on the accepted TASK-016
surface.

## Operator questions

None. The accepted ownership, server-scope, retention, and cross-center denial
rules are unambiguous in the task card and direct canonical contracts.

## Verdict

SEMANTIC_VERDICT: semantic-pass

## Owner handoff

- Evidence/report paths: this protocol, `.protocols/TASK-016-T3-FT-004-W6/verification.md`,
  and the two task reports under `.tasks/TASK-016-T3-FT-004-W6/`.
- Recommended owner action: evaluate unchanged TASK-016 lifecycle for T3
  closure eligibility from functional PASS plus this semantic result.
- Resume route: lifecycle owner/scheduler; no `/mb-sync` was run and no status,
  queue, dependency, promotion, closure, or implementation state was changed.
