---
description: Independent functional verification report for TASK-017-T3-FT-004-W6.
status: active
---
# Functional Verification — TASK-017-T3-FT-004-W6

- verdict: PASS
- findings: none
- evidence_checked: direct task card and canonical Collaboration/access-control
  basis; actual Collaboration public boundary and database schema; fresh
  verifier-owned isolated probe; required check/build/test gates.
- risks_or_questions: none affecting this task-scoped verdict.

## Evidence

- Fresh probe: [verifier-owned-probe.test.ts](verifier-owned-probe.test.ts),
  run twice with [verification-run.log](verification-run.log).
- `FT-004-AC-003` / `REQ-008`: arbitrary reply depth through 16 levels,
  first-reply activation, complete current shared feed, message reaction,
  and shared/personal separation passed.
- `FT-004-AC-004` / `REQ-008`: eleven-plus current branches produced exactly
  ten recent tabs; hidden branch rows remained retained within center B and
  reactivated after new activity.
- `REQ-014` / access-control authority and scope: retained center-A roots,
  replies, authors, reaction, and projected branch source rows remained in the
  database but replacement-center shared/personal projections were empty;
  old read, reaction read/target, reply target, and mutation attempts were
  denied. Old-target and missing-target error codes matched, and no forbidden
  row was inserted.
- Required gates: `npm run check`, `npm run build`, and `npm run test` all
  exited `0` (`0` check diagnostics, successful client/SSR build, 12 files /
  39 tests).

## Scope and handoff

- No production, spec, task-card, index, lifecycle, scheduler, or unrelated
  task files were changed by verification.
- Executor claim-path and executor gate receipts were treated as supporting
  only; no execute receipt was reused.
- Recommended scheduler action: retain `in_progress` and run the required
  per-task `/red-verify TASK-017-T3-FT-004-W6`.

VERDICT: PASS
