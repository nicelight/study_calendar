---
description: Adversarial semantic verification basis for TASK-017-T3-FT-004-W6.
status: active
---
# Red Verification — TASK-017-T3-FT-004-W6

## Semantic target

- Task outcome: Collaboration keeps threaded messages, replies, message
  reactions, common feed, and recent branch tabs arbitrarily deep, retained,
  and scoped across supported class identity reuse.
- Accepted contract and boundaries: Collaboration is the sole writer and
  public owner for discussion state; every protected read, target, and command
  uses actor plus server-resolved center/class/student scope; hidden branches
  remain retained; Lesson Context may only consume the scoped public boundary.

## Evidence and adversarial coverage

- Existing functional verification: [functional report](../../.tasks/TASK-017-T3-FT-004-W6/TASK-017-T3-FT-004-W6-S-VERIFY-final-report-docs-01.md)
  records PASS from fresh verifier-owned evidence.
- Actual change surface: the production Collaboration/database diff is empty;
  source review covered `public.ts`, the Collaboration schema/indexes in
  `database.ts`, the composition root, and the registered Day Discussion Query
  Boundary. The source search found Collaboration as the only production writer
  of message/reaction tables and the only composition-root owner of the public
  boundary.
- Supported hostile coverage: class delete/recreate with the same class and
  lesson identity; retained old shared/personal roots, replies, authors,
  message reaction, feed rows, and branch projection; replacement-center
  projection, branch read, reaction read/target, reply target, and mutations;
  current shared/personal attribution and separation; arbitrary depth;
  first-reply activation; ten-tab ordering; retained hidden branch and
  reactivation; old-target versus missing-target failure behavior.
- Runtime evidence: [verifier-owned probe](../../.tasks/TASK-017-T3-FT-004-W6/verifier-owned-probe.test.ts)
  passed twice in disposable in-memory state; [run log](../../.tasks/TASK-017-T3-FT-004-W6/verification-run.log)
  records the rerun and required gates.
- Boundary review: source filters and target checks consistently bind
  `centerId`, `classId`, `lessonId`, discussion scope, and personal student
  scope after server-side actor/class/lesson resolution; raw retained rows are
  not projected to the replacement context, and no consumer-side writer or
  alternate discussion owner was observed.

## Admitted findings

Only evidenced material breaks of an accepted outcome. None.

## Operator questions

None.

## Verdict

The semantic marker is recorded exactly once in the linked final report:
`.tasks/TASK-017-T3-FT-004-W6/TASK-017-T3-FT-004-W6-S-RED-VERIFY-final-report-docs-01.md`.

## Owner handoff

- Evidence/report paths: this protocol, the linked final report, and the
  functional verification report/probe.
- Recommended owner action: retain task `in_progress`; no lifecycle or
  scheduler mutation is performed by this verifier. The T3 functional and
  semantic obligations are both evidenced for the lifecycle owner.
- Resume route: `n/a` unless the lifecycle owner requests a separate follow-up.
