---
description: Bounded Revision 2 task-plan rerun for the FT-004 browser-completion delta.
status: active
---
# Review FT-004 task planning surface — browser rerun R2

VERDICT: REJECT

REVIEWED_PLANNING_REVISION: 2

ARCHITECTURE_REVIEW: APPROVE

## Review mode and delta

Это bounded rerun предыдущего browser review: текущая `Planning Revision: 2`
совпадает с предыдущим отчётом, а delta подтверждён прямым сравнением
актуальных feature/contracts/plans/protocols/task cards. Два semantic focus
review проведены fresh-контекстами на `gpt-5.6-luna/xhigh`; отдельный fresh
architecture review проверил новый participant-label boundary.

Исправления агента, которые подтверждены:

- owner decision по labels теперь зафиксирован в
  `.protocols/FT-004/clarification.md:75-88`,
  `.memory-bank/contracts/boundary-map.md:116-152`,
  `.memory-bank/contracts/access-control.md:104-133` и
  `.memory-bank/contracts/collaboration-browser-surface.md:10-22`;
- обе карточки используют canonical `.memory-bank/scripts/` gate paths
  (`TASK-102:30-60`, `TASK-103:24-54`);
- AC-005/artifact mapping и no-cookie/invalid-session/revocation proof
  добавлены в текущие карточки (`TASK-102:62-80,143-146`,
  `TASK-103:56-73,142-146`).

Исторические backend claims TASK-011/TASK-016/TASK-017 удержаны только как
backend evidence; они не закрывают browser acceptance и не являются причиной
текущего reject.

## Structural integrity — PASS

- Global Backbone `complete`, positive `Planning Revision: 2`, Foundation gate
  `TASK-002-T3-FT-000-W1` — `done` (`.memory-bank/spec-backbone.md:84-98`,
  `.memory-bank/foundation.md:10-25`).
- Read-only schema/index probe: 61 indexed entries, 61 unique resolving files,
  all task cards schema-valid, identity/tier/feature/wave consistent, no missing
  dependencies or cycles. Current cards are valid `planned` T3 product tasks:
  `.memory-bank/tasks/index.json:241-246`,
  `.memory-bank/tasks/TASK-102-T3-FT-004-W35.task.json:1-29`,
  `.memory-bank/tasks/TASK-103-T3-FT-004-W36.task.json:1-23`.
- `node .memory-bank/scripts/mb-lint.mjs` passed; existing unrelated
  frontmatter warnings remain advisory. `/mb-doctor` was not impersonated by
  this semantic review.

## Design and architecture — PASS

Participant-label ownership is now unambiguous: Identity & Access owns
`fullName`, Collaboration first authorizes the current discussion and selects
IDs, and Lesson Context only composes/renders `{accountId, fullName}`. The
accepted graph contains the explicit `Collaboration -> Identity & Access`
Actor Context edge (`.memory-bank/contracts/boundary-map.md:38-52,116-152`),
and the split/ownership is reflected in
`.protocols/FT-004/plan.md:87-116` and
`.memory-bank/tasks/plans/IMPL-FT-004.md:22-40,120-137`.

Fresh architecture review: `APPROVE`; no material ownership, dependency
direction, boundary, or unresolved operator decision remains. The missing
`getParticipantLabels` implementation is the declared TASK-102 delta, not a
planning defect.

## Blocking findings

### BLOCKER-1 — incomplete feature task-plan reconciliation

`.memory-bank/features/FT-004-day-collaboration.md:175-187` still contains the
exact marker `PLANNING_RECONCILIATION_REQUIRED`. The review input contract
declares this marker blocking and routes it to `/feature-to-tasks FT-004`
(`.agents/skills/review-tasks-plan/SKILL.md:48-59`); the tasking contract
requires successful reconciliation to remove it
(`.agents/skills/feature-to-tasks/SKILL.md:242-250`). The cards and contracts
were edited, but the affected feature handoff remains formally incomplete.

Repair owner: `/feature-to-tasks FT-004`.

### BLOCKER-2 — AC locators do not match the canonical case-sensitive format

The feature headings are uppercase `FT-004-AC-001` … `FT-004-AC-005`
(`.memory-bank/features/FT-004-day-collaboration.md:42-75`), while the current
task `source_artifacts` use lowercase anchors: TASK-102
`#ft-004-ac-005` (`:89-105`) and TASK-103
`#ft-004-ac-001` … `#ft-004-ac-005` (`:82-99`). The acceptance-trace parser
requires the exact uppercase locator form
(`.memory-bank/scripts/mb-doctor/acceptance-trace.mjs:22-28,219-247`), so the
cards currently have no mechanically recognized exact AC ownership.

After those locators are corrected, TASK-102 also needs a literal
`FT-004-AC-005` in `verification_targets`: its current targets are generic
(`TASK-102:143-146`), while TASK-103 already names its ACs in `verify`
(`TASK-103:56-60`). The parser requires target-linked AC proof
(`.memory-bank/scripts/mb-doctor/acceptance-trace.mjs:274-292`).

Repair owner: `/feature-to-tasks FT-004`.

### BLOCKER-3 — duplicate T3 evidence contract in TASK-102

`TASK-102.evidence_required[0]` and `[4]` repeat the same REQ-014/access-denial
outcome — removed membership/teacher assignment, no-existence leakage,
state-before/state-after and the same artifact — at
`.memory-bank/tasks/TASK-102-T3-FT-004-W35.task.json:75` and `:79`. This violates
the claim-linked T2/T3 rule that each evidence item be necessary and
non-duplicative (`.memory-bank/workflows/tier-policy.md:107-116`).

Repair owner: `/feature-to-tasks FT-004`.

### BLOCKER-4 — stale and contradictory downstream status in FT-004 plans

Both current plan surfaces state that `TASK-014-T3-FT-003-W8` retains
`in_progress` and depends on both FT-004 replacement cards:
`.memory-bank/tasks/plans/IMPL-FT-004.md:163-169` and
`.protocols/FT-004/plan.md:163-169`. The authoritative indexed card is already
`done` and its dependencies point to the earlier FT-004 W6 tasks, not TASK-102/
TASK-103 (`.memory-bank/tasks/TASK-014-T3-FT-003-W8.task.json:1-10`). TASK-039,
which TASK-102 actually depends on, is also `done`
(`.memory-bank/tasks/TASK-039-T3-FT-003-W10.task.json:1-8`). This stale reverse
dependency/status note can mislead execution routing and must be reconciled in
the feature plan/protocol.

Repair owner: `/feature-to-tasks FT-004`.

## Non-blocking checks

- Canonical gates are now executable paths in both cards.
- Anonymous, invalid-session, revoked-session, forged-scope and
  deny-before-mutation scenarios are explicitly present; disposable SQLite,
  state snapshots, forbidden scopes, and cleanup conditions are present in both
  cards.
- W35 → W36 sequencing and direct task dependencies are consistent in the
  cards and current queue (`IMPL-FT-004:32-44,120-137`; task cards
  `:13-16`).

## Handoff

FT-004 remains unsafe for `/exe`. Run `/feature-to-tasks FT-004` to remove the
feature marker, correct exact uppercase AC locators and TASK-102 target linkage,
deduplicate TASK-102 evidence, and synchronize the stale plan/protocol note.
Then rerun `/review-tasks-plan FT-004`. After a current-revision `APPROVE`, run
the applicable `/mb-doctor --strict` gate before sequential `/exe` execution.

This review changed only its REQUEST and report artifacts; feature, contracts,
plans, protocols, task cards, index, lifecycle, statuses, code, and evidence
artifacts were not modified.

report_path: `.tasks/TASK-MB-REVIEW-TASKS-PLAN/TASK-MB-REVIEW-TASKS-PLAN-S-TASKS-FT-004-BROWSER-R2-final-report-docs-01.md`
