---
description: Fresh adversarial semantic verification for TASK-095-T3-FT-007-W28.
status: active
---
# Red Verification — TASK-095-T3-FT-007-W28

## Semantic target
- Task outcome: expose the scoped Center & Scheduling registry-facts query for
  `FT-007-AC-009` / `REQ-014` / `REQ-017`.
- Accepted boundary: return only server-authorized C&S institution, class,
  membership, parent-link, assignment/count facts, and account IDs; preserve
  C&S ownership and leave profile, metric, and final-composition ownership to
  the accepted neighboring boundaries.

## Evidence and adversarial coverage
- Existing verification verdict: fresh task-level `/verify` Attempt 2 / retry 1
  is `PASS` in `.protocols/TASK-095-T3-FT-007-W28/verification.md` and
  `.tasks/TASK-095-T3-FT-007-W28/TASK-095-T3-FT-007-W28-S-VERIFY-RETRY-final-report-docs-03.md`.
- Historical evidence preserved: Attempt 1 FAIL and evidence, Judge
  `REDIRECT`, Attempt 2 RED/GREEN, and handoff were inspected as supporting
  retry context; none was altered.
- Current source/diff: `src/lib/server/modules/center-scheduling/public.ts:309-364`
  and `:932-1065`; registry helpers select only C&S-owned tables and return no
  Identity & Access profile or role fields. The public query accepts only a
  server-resolved `ActorContext` and no client scope.
- Adversarial coverage: independent source inspection plus fresh Focus A and
  Focus B `Codex Luna` `xhigh` co-reviews covering actor/ownership boundary,
  Identity & Access/accounts bypass, exact projection, Admin/Teacher scope,
  Student/Parent/anonymous/unassigned/removed-assignment denial, row
  non-disclosure, non-mutation, isolation, and regression/gate evidence.
- Supported-path context: C&S schema FKs bind assignments, class students,
  and parent links to center memberships; MVP excludes multiple centers.
- Required gates in the fresh functional evidence passed: focused provider
  probe, `npm run check`, `npm run test`, `npm run build`, `git diff --check`,
  `node scripts/mb-lint.mjs`, and `node scripts/mb-doctor.mjs --strict`.

## Admitted findings
Only evidenced material breaks of an accepted outcome. Use `none` when no
finding is admitted.
- none

## Operator questions
Only questions required to judge a proved realistic material risk or accepted
outcome. Use `none` when no operator decision is required.
- none

## Verdict
SEMANTIC_VERDICT: semantic-pass

## Owner handoff
- Evidence/report paths: this report and
  `.tasks/TASK-095-T3-FT-007-W28/TASK-095-T3-FT-007-W28-S-RED-VERIFY-final-report-docs-01.md`,
  plus the preserved functional verification and retry artifacts above.
- Recommended owner action: scheduler/lifecycle owner may evaluate the normal
  T3 closure route; this verification does not perform closure or status work.
- Resume route or `n/a`: `n/a`; retain all prior Attempt 1/2 evidence.
