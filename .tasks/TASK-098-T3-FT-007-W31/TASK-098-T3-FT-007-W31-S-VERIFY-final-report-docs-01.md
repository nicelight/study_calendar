---
task_id: TASK-098-T3-FT-007-W31
stage: VERIFY
attempt: 1
role: Reviewer
functional_result: NEEDS-CLARIFICATION
report: .protocols/TASK-098-T3-FT-007-W31/verification.md
---
# TASK-098 — Fresh /verify Attempt 1

VERDICT: NEEDS-CLARIFICATION

- Fresh verifier-owned focused test, two disposable owned-server E2E runs, and
  all required task gates passed. They prove bounded Profile data/query access,
  anonymous and revoked denial, logout revocation, four direct canonical
  destinations, disposable cleanup, and unchanged real-DB metadata across the
  required browser proof.
- The shell's exact four hrefs and existing `POST /auth/logout` form are
  currently independently observed only in static source/focused-test evidence.
  The browser test directly reaches destinations and exercises logout but does
  not open the hydrated menu; a bounded runtime-DOM attempt did not reproduce a
  hydrated observation.
- This is an evidence-sufficiency blocker, not a proven implementation defect.
  Keep the task `in_progress`; return it to `/exe TASK-098-T3-FT-007-W31` for
  an authorized disposable browser replacement probe, then use a fresh
  `/verify TASK-098-T3-FT-007-W31`. No lifecycle, red-verify, sync, Judge, or
  scheduler state was changed here.
