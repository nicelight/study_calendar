---
description: Лог изменений Memory Bank.
status: active
---
# Changelog

## [2026-08-14] Wave 16 — FT-002 feature semantic closure sync

- Reconciled the fresh feature-level `SEMANTIC_VERDICT: semantic-pass` over
  FT-002 AC-001..AC-009 and linked the durable report.
- Promoted FT-002 and REQ-004 to `verified`; EP-001 is now `verified` after its
  FT-001/FT-002 feature outcomes and applicable requirements are complete.
- Preserved TASK-026, TASK-031, TASK-032, all implementation, dependencies,
  and historical evidence; no task status or code changed.

## [2026-08-14] Wave 16 — TASK-032 functional closure sync

- Reconciled the explicit closure decision: `TASK-032-T2-FT-002-W16` is now
  `done` with Attempt 2 functional `PASS` and linked verification evidence.
- Preserved the adapter-specific contract: Admin maps to HTTP 400
  `invalid_schedule`; assigned Teacher remains private sentinel-only with no
  Teacher HTTP transport; exact Schedule/Lesson state equality and project
  gates are recorded.
- Kept FT-002, REQ-004, and EP-001 `planned` pending a fresh feature-level
  `/red-verify --feature FT-002`; TASK-026/TASK-031 and all code/evidence remain
  unchanged.

## [2026-08-14] Wave 16 — TASK-032 adapter-specific verification correction

- Reconciled the failed verification against the current implementation:
  Center & Scheduling rejects zero-occurrence requests for both Admin and
  assigned Teacher before Schedule/Lesson mutation, but only the existing
  Admin adapter maps that rejection to HTTP 400 `{ error: "invalid_schedule" }`.
- Updated FT-002-AC-009, REQ-004, TASK-032, and linked plans/protocols so the
  assigned Teacher proof observes the private
  `invalid-schedule-occurrences` owner/domain sentinel and exact state equality;
  no Teacher HTTP transport is added. Admin browser/AC-008 proof remains
  unchanged and Admin-only.
- TASK-032 remains `in_progress` for re-execution; FT-002 remains `planned`.
  No task was marked `done`, and no code/test or public error-contract change
  was made by this reconciliation.

## [2026-08-14] Wave 16 — TASK-032 R2 proof-scope correction

- Added the canonical assigned-Teacher authority input
  `.memory-bank/contracts/access-control.md#accepted-permission-matrix` to
  TASK-032.
- Kept AC-009 server-boundary proof for both own-center Admin and assigned
  Teacher, each requiring `400 invalid_schedule` and exact Schedule/Lesson
  state equality; restricted browser/action/draft-retention observation to the
  Admin path supporting AC-008. No Teacher localStorage or browser-draft claim
  remains in TASK-032 verification targets.

## [2026-08-14] Wave 16 — TASK-032 lifecycle and principal-proof reconciliation

- Reconciled the current lifecycle truth: FT-002 and REQ-004 remain `planned`
  while TASK-032 is unimplemented, so EP-001 is now `active` / `planned`.
  FT-001's verified evidence, shared REQ-014, REQ-003, and all done task
  identities/evidence remain preserved; no task was reopened or promoted.
- Corrected TASK-032 AC-009 proof obligations to run the same zero-occurrence
  command as both an own-center Admin and an assigned Teacher. Each principal
  must receive the existing HTTP 400 `{ error: "invalid_schedule" }` result
  and independently prove exact Schedule/Lesson state-before/state-after
  equality. No new public error shape or code/test change was introduced.

## [2026-08-14] Wave 16 — TASK-032 zero-occurrence schedule planning

- Applied operator decision `2` from the FT-002 semantic concern: a valid
  date/weekday selection with zero actual occurrences is rejected before any
  Schedule or Lesson persistence or mutation.
- Added FT-002-AC-009 and the REQ-004 contract wording, extending the existing
  Center & Scheduling boundary/lifecycle specs with the unchanged Admin `400
  { error: "invalid_schedule" }` failure shape and state-before/state-after
  equality requirement.
- Queue action is `rebuild_required`: created ready
  `TASK-032-T2-FT-002-W16` with direct dependencies on done TASK-026 and
  TASK-031. TASK-031 localStorage/browser scope and all historical task
  identities/evidence remain immutable; no code or test implementation is
  included in planning.
- FT-002 and REQ-004 are `planned`, not `verified`, until TASK-032 closes and a
  fresh `/red-verify --feature FT-002` covers AC-001..AC-009.

## [2026-08-14] Wave 15 — TASK-031 schedule-draft sync

- Reconciled the already-recorded closure: `TASK-031-T2-FT-002-W15` is `done`
  with independent functional `PASS` for FT-002-AC-008 / REQ-004.
- Routed its verification/evidence through FT-002, REQ-004, IMPL-FT-002, the
  FT-002 protocol plan/decision log, task index, and TODO. TASK-026 remains
  `done` and unchanged; no promotion or dependent task state was changed.
- Reconciled FT-002 and REQ-004 to `implemented`, not `verified`. A fresh
  feature-level `/red-verify --feature FT-002` over AC-001..AC-008 is the next
  semantic gate.

## [2026-08-14] FT-002 scoped schedule-draft rebuild

- Added exact AC-008 and the canonical browser draft contract: same
  `centerId`/`classId` localStorage key, whitelisted ISO-date/weekday payload,
  clean malformed fallback, failure retention, success cleanup, SSR safety,
  and explicit secret/server/dependency anti-goals.
- Queue action is `rebuild_required`: created ready
  `TASK-031-T2-FT-002-W15` after done TASK-026. TASK-026 and all historical
  code, task, protocol, verification, and semantic evidence remain unchanged.
- Returned FT-002 and REQ-004 to `planned` for the new unimplemented claim;
  Planning Revision remains `2`. Debug evidence preserves empty-weekday POST
  rejection as expected and does not confirm a checkbox UI defect.

## [2026-08-14] FT-001 final feature verification sync

- Reconciled the already-written explicit owner closure: FT-001 is
  `active` / `verified` and RTM REQ-001 is `verified` after the fresh
  feature-level `semantic-pass` covered AC-001..AC-011.
- Routed the current aggregate semantic report and final sync evidence through
  FT-001, requirements/RTM, `IMPL-FT-001`, and the FT-001 protocol plan and
  decision log. The 2026-08-11 AC-001..008 reconciliation remains historical.
- Preserved TASK-029/TASK-030 as `done` with all task-level evidence, shared
  REQ-014 and EP-001 as `verified`, historical TASK-003 failure, dependencies,
  task index/statuses, Planning Revision, architecture, code/tests, and dirty
  worktree state. No queue promotion was applied by `/mb-sync`.

## [2026-08-13] Wave 14 — TASK-030 password-login sync

- Reconciled the already-recorded closure: authoritative
  `TASK-030-T3-FT-001-W14` is `done` with independent functional `PASS` and
  required T3 `semantic-pass` for FT-001-AC-011 / REQ-001 / REQ-014.
- Routed TASK-030 evidence through FT-001, RTM, `IMPL-FT-001`, the FT-001
  protocol plan/decision log, TODO, and the task-level sync report. Deployment
  guidance was already current and required no change; task index/statuses were
  not rewritten.
- Reconciled FT-001 and REQ-001 to `implemented`. They are not `verified`:
  the required fresh `/red-verify --feature FT-001` over AC-001..AC-011 is
  pending, while the existing 2026-08-11 aggregate report covers AC-001..008.
- Preserved shared REQ-014 and EP-001 as `verified`, TASK-029 and all historical
  task/evidence state, Planning Revision, architecture, code/tests, queue
  promotion, and unrelated dirty-worktree changes.

## [2026-08-13] Wave 13 — TASK-029 first-Admin bootstrap sync

- Reconciled the already-recorded closure: authoritative
  `TASK-029-T3-FT-001-W13` is `done` with independent functional `PASS` and
  required T3 `semantic-pass` for FT-001-AC-010 / REQ-001 / REQ-014.
- Routed the existing task/evidence truth through FT-001, the REQ RTM route,
  `IMPL-FT-001`, and the FT-001 plan. The task index already contained TASK-029;
  its identity, dependency, tier, and evidence markers were not rewritten.
- Preserved: TASK-030 remains `planned`; FT-001 remains `active` / `planned`;
  REQ-001 remains `planned` and shared REQ-014 remains `verified`; TASK-025/026, historical task evidence,
  dependencies, Planning Revision, architecture, and dirty worktree state are
  unchanged. No promotion or lifecycle transition was applied by `/mb-sync`.

## [2026-08-13] FT-001 W13 first-Admin authentication rebuild

- Applied the operator decision replacing the unexecuted Telegram-discovery
  bootstrap with local email/password bootstrap and browser login using an
  interactive email prompt plus hidden password prompt, normalized unique
  email, Node built-in `scrypt`, random salt,
  `timingSafeEqual`, generic invalid credentials, and the existing session/
  cookie.
- Reconciled PRD/REQ/feature and canonical Identity & Access, transport, access,
  data, lifecycle, verification, deployment, and plan artifacts. Existing
  Telegram/Google flows remain accepted; registration/recovery/email
  verification/MFA/password history/new dependency remain excluded.
- Queue action is `rebuild_required`: removed never-executed/unreviewed stale
  TASK-027 and formally rejected, unexecuted TASK-028 from the indexed model.
  Fresh TASK-029 is T3/W13/ready after done TASK-025 and owns CLI bootstrap;
  TASK-030 is T3/W14/planned after TASK-029 and owns browser login/session.
  TASK-025 and TASK-026 were not changed.
- REQ-001 and FT-001 return to `planned` for the new AC-010/011 scope; all
  historical AC-001..009/task evidence is preserved. Planning Revision remains
  `2`. No implementation or tests were executed by this planning run.

## [2026-08-11] Product outer lifecycle reconciliation

- Applied the already-recorded outer owner decision: FT-002..FT-006 and
  EP-001..EP-005 are `active` / `verified`; RTM REQ-003..REQ-016, including
  shared REQ-014, is `verified`.
- Preserved all task records and history, including historical
  `TASK-012-T2-FT-004-W6=failed`; this is not final human product acceptance.

## [2026-08-11] Wave 10 — FT-001 lifecycle verification reconciliation

- Applied: explicit top-level operator decision to set FT-001 document
  `status: active` and feature `lifecycle: verified` after the terminal queue,
  current task/feature semantic gates, Planning Revision 2 approval, strict
  doctor PASS, and W10 technical-debt PASS with no material findings.
- Reconciled: RTM `REQ-001` and `REQ-002` to `verified`; shared `REQ-014`
  remains `planned` because its other feature mappings are outside this
  decision.
- Preserved: TASK-003 historical `failed` status and evidence, TASK-019..024
  statuses/dependencies/tiers, all task retry and verification history, FT-001
  AC/spec content, and all other features/epics. No task was re-executed.
- Evidence: [FT-001 feature semantic report](../.tasks/FT-001/FT-001-S-RED-VERIFY-final-report-docs-01.md),
  [FT-001 feature sync report](../.tasks/FT-001/FT-001-S-MB-SYNC-final-report-docs-02.md),
  and [W10 tech-debt report](../PAPERCUTS/TECHDEBTS/tech-debt-wave-W10-2026-08-11.md).

## [2026-08-11] Wave 10 — FT-001 feature-level MB-SYNC after semantic pass

- Reconciled: fresh feature-level `semantic-pass` over FT-001 AC-001..AC-008
  into the feature doc, `IMPL-FT-001`, the RTM evidence route, and FT-001
  protocol indexes.
- Recorded supporting ownership only: TASK-022 → AC-006/007 browser binding,
  TASK-023 → AC-004/007 bounded retention/failure, and TASK-024 → AC-006/007
  composition/platform wiring. Primary AC ownership remains TASK-004,
  TASK-015, TASK-020, and TASK-021.
- Preserved historical failed TASK-003, all task statuses and evidence history,
  FT-001 `status: draft` / `lifecycle: planned`, REQ lifecycles, and promotion;
  no code or canonical spec decision changed. The pure `spec-index` and task
  index were validated without semantic edits.
- Evidence: [feature semantic report](../.tasks/FT-001/FT-001-S-RED-VERIFY-final-report-docs-01.md)
  and [feature MB-SYNC report](../.tasks/FT-001/FT-001-S-MB-SYNC-final-report-docs-02.md).

## [2026-08-11] Wave 10 — TASK-024 composition wiring sync

- Reconciled: authoritative `TASK-024-T3-FT-001-W10` is `done` with current
  independent functional `PASS` and required per-task T3 `semantic-pass`
  evidence into the task card, FT-001, the REQ RTM evidence route,
  `IMPL-FT-001`, and the FT-001 protocol indexes.
- Recorded only the proven composition-boundary result: platform/config and
  the single composition root own provider registry wiring; auth transport is
  dependency-only; configured Telegram/Google starts, safe missing-config
  failure, and client secret non-exposure remain intact. TASK-020 remains the
  primary AC-006/AC-007 proof owner.
- Preserved TASK-022/023 and all W9 task/protocol/evidence history and
  ownership; FT-001/REQ lifecycle, dependency, promotion, architecture, and
  Planning Revision remain unchanged.
- Validation: sync-local task/feature/RTM/index/protocol/evidence links and
  lifecycle/status boundaries were re-read; full lint, `/mb-doctor`, code, and
  project tests were not run by `/mb-sync`.

## [2026-08-11] Wave 10 — TASK-023 bounded auth-state retention sync

- Reconciled: authoritative `TASK-023-T3-FT-001-W10` is `done` with current
  independent functional `PASS` and required per-task T3 `semantic-pass`
  evidence into the task card, FT-001, the REQ RTM evidence route,
  `IMPL-FT-001`, and the FT-001 protocol indexes.
- Recorded only the proven bounded result: issue/consume expiry pruning,
  failed-start discard of only the newly issued state, valid-sibling
  preservation, safe provider failure, and unchanged product state. Honest
  pre-implementation GREEN remains supporting evidence; no new worker, store,
  capacity policy, or lifecycle was introduced.
- Preserved TASK-022 and all W9 task/protocol/evidence history and ownership;
  TASK-024 remains `planned`, FT-001/REQ lifecycle remains unchanged, and no
  dependency, promotion, architecture, or feature-owner transition was made.
- Validation: sync-local task/feature/RTM/index/protocol/evidence links and
  lifecycle/status boundaries were re-read; full lint, `/mb-doctor`, code, and
  project tests were not run by `/mb-sync`.

## [2026-08-11] Wave 10 — TASK-022 browser-context binding sync

- Reconciled: authoritative `TASK-022-T3-FT-001-W10` is `done` with current
  independent functional `PASS` and required per-task T3 `semantic-pass`
  evidence into the task card, FT-001, the REQ RTM evidence route,
  `IMPL-FT-001`, and the FT-001 protocol indexes.
- Recorded only the proven browser-binding hardening for FT-001-AC-006/007:
  matching opaque browser cookie, fail-closed invalid/cross-browser/replayed
  callback behavior before provider/Identity & Access completion, exact valid
  Telegram/Google behavior, and one-use cleanup. TASK-020 remains the primary
  AC-006/AC-007 owner.
- Preserved Attempt 1/2/3 history, the verifier retry basis, all task-local
  evidence, and every W9 task/protocol/evidence record. Expiry-pruning and
  failed-start observations remain supporting-only; no TASK-023 ownership,
  status, dependency, promotion, or lifecycle transition was applied.
- Validation: sync-local task/feature/RTM/index/protocol/evidence links and
  lifecycle/status boundaries were re-read; full lint, `/mb-doctor`, code, and
  project tests were not run by `/mb-sync`.

## [2026-08-11] Wave 9 — FT-001 feature-level semantic coverage sync
- Reconciled: fresh FT-001 `semantic-pass` evidence for AC-001..AC-008 into
  the FT-001 feature, `IMPL-FT-001`, and the existing FT-001 protocol indexes.
- Recorded only proven primary coverage: TASK-004 → AC-001/002/004,
  TASK-015 → AC-003/005, TASK-020 → AC-006/007, and TASK-021 → AC-008.
  TASK-019 is recorded only for its proven provider/session/invitation
  integration primitives.
- Preserved: failed TASK-003 evidence and all task-local histories,
  identities, statuses, retry budgets, dependencies, architecture, feature/
  requirement lifecycle, and promotion fields. No task card or code changed.
- Validation: feature/plan/protocol/changelog links, AC routing, indexed task
  statuses, semantic verdicts, and lifecycle/preservation boundaries were
  re-read by sync-local validation; full lint/doctor and project tests were
  not run by `/mb-sync`.

## [2026-08-11] Wave 9 — TASK-021 protected Admin UI/provisioning sync
- Reconciled: authoritative `TASK-021-T3-FT-001-W9` is `done` with current
  functional `PASS` and required T3 `semantic-pass` evidence into FT-001,
  `IMPL-FT-001`, and the FT-001 protocol indexes; current evidence markers
  were added to the task card without changing its status or identity.
- Recorded only proven FT-001-AC-008 claims: protected own-center Admin
  SSR/form/JSON API provisioning; server-side denial before mutation for
  unauthenticated, non-Admin, and wrong-center requests; ignored client scope;
  existing `createParticipant` ownership; server-generated invitation values;
  TASK-020 handoff; and atomic account+membership+invitation state.
- Preserved executor Attempt 1 honest RED/focused failure, Attempt 2 bounded
  fixture/rollback correction, Attempt 3 route/type/framework-gate correction,
  and retry budget `2/2` used; TASK-019/020, all task-local receipts, feature
  product lifecycle, requirement lifecycle, and accepted architecture remain
  unchanged. No feature promotion or dependent transition was applied.
- Validation: sync-local links, verdicts, task-index/statuses, RTM routes,
  FT-001/IMPL/protocol routes, lifecycle values, and this changelog entry were
  re-read; full lint/doctor, code, and tests were not run by `/mb-sync`.

## [2026-08-11] Wave 9 — TASK-020 browser/API transport sync
- Reconciled: authoritative `TASK-020-T3-FT-001-W9` is `done` with current
  functional `PASS` and required T3 `semantic-pass` evidence into FT-001,
  `IMPL-FT-001`, and the FT-001 protocol indexes.
- Recorded only proven browser/API claims: Telegram/Google login and exact
  actor resolution, `foundation_session` cookie conditions, logout/revocation
  denial, server-bound invitation callback state, one-use exact-account
  acceptance, and safe rejection/rollback without invitation consumption or
  partial state.
- Preserved Attempt 1's missing-transport RED and failed focused gate, the
  Attempt 2 invitation-state continuity correction, and retry budget `1/2`
  used with `1` retry remaining. TASK-019 remains `done`; TASK-021 remains
  `planned`; no code or dependent task was changed.
- Unchanged: FT-001 remains `status: draft` / `lifecycle: planned`; no
  requirement lifecycle, architecture, Planning Revision, or promotion
  transition was applied.
- Validation: sync-local links, verdicts, task index/statuses, FT-001/IMPL/
  protocol routes, and this changelog entry were re-read; full lint/doctor
  were not run by `/mb-sync`.

## [2026-08-11] Wave 9 — TASK-020 invitation-state continuity correction
- Corrected the task-owned browser/API transport path so
  `AuthenticationStateStore.issue()` preserves the server-bound invitation
  context through provider callback consumption; valid acceptance now reaches
  `acceptInvitation`, while wrong-account, forged, replayed, and rollback
  cases retain safe non-consuming errors.
- Recorded the Attempt 2 focused and required-gate evidence in
  `.protocols/TASK-020-T3-FT-001-W9/` and
  `.tasks/TASK-020-T3-FT-001-W9/execution-evidence.md`.
- Preserved TASK-019/TASK-021 cards and history, Admin UI scope, provider
  secrets, lifecycle/status, and the accepted transport/session contracts.
- Validation: focused route tests (`1 file / 5 tests`), `npm run check`,
  `npm run build`, full `npm run test` (`20 files / 69 tests`), and
  `git diff --check` passed; `/verify` and `/red-verify` remain pending.

## [2026-08-11] Wave 9 — TASK-019 provider/session boundary sync
- Reconciled: authoritative `TASK-019-T3-FT-001-W9` is `done` with current
  functional `PASS` and required T3 `semantic-pass` evidence markers, plus
  the already-proven claims, into FT-001, `IMPL-FT-001`, and the FT-001
  protocol indexes.
- Recorded only proven claims: server-only verified Telegram/Google provider
  normalization and failure safety; server-owned opaque session issuance,
  revocation, and exact HTTPS/local-HTTP cookie options; and atomic exact-account
  invitation acceptance with one-use/rejection/rollback behavior.
- Preserved: Attempt 1 functional `FAIL`, Attempt 2 correction basis, and the
  `1/2` retry budget (`1` retry remaining), plus TASK-019 identity/status.
  TASK-020 and TASK-021 remain `planned`; no dependent promotion, architecture,
  code, or lifecycle transition was applied.
- Validation: sync-local links, evidence, task index/status, FT-001/IMPL/protocol
  routes, and changelog consistency were re-read; full lint/doctor were not run.
## [2026-08-11] Wave 9 — FT-001 browser/API task reconciliation
- Added: subject-based `authentication-transport` and `provider-adapters`
  contracts for the minimum SvelteKit login/session, invitation acceptance,
  logout, provider verification, and protected Admin participant path.
- Reconciled: FT-001 AC-006..AC-008 and new planned W9 cards
  `TASK-019`..`TASK-021`; Planning Revision remains `2` and the accepted
  modular-monolith/one-server/one-database architecture is unchanged.
- Preserved: TASK-003 failed historical evidence, TASK-004 and TASK-015
  identities/statuses/evidence, all Foundation tasks, dependencies, and retry
  history; no implementation or lifecycle closure was performed.
- Validation: `node scripts/mb-lint.mjs` passed (66 files); JSON/index parse and
  new task summaries passed. Fresh-context `/review-tasks-plan FT-001` remains
  the next gate.

## [2026-08-10] Wave 6 — FT-004 feature-level boundary sync after lifecycle reconciliation
- Reconciled: current FT-004 `semantic-pass` claims are routed only through
  `TASK-016-T3-FT-004-W6` and `TASK-017-T3-FT-004-W6`, covering AC-001..AC-005
  with their current functional `PASS` and T3 semantic evidence.
- Updated: FT-004 feature navigation, `IMPL-FT-004`, and the feature-level sync
  report now describe the current claim ownership and evidence routes.
- Preserved: historical `TASK-012` `failed`/`superseded` disposition, T2/W6
  identity, dependencies, retry history, Attempt 1/2 evidence, old feature
  `semantic-fail`, and Attempt 2 `NEEDS-CLARIFICATION` remain unchanged.
- Unchanged: FT-004 remains `status: draft` / `lifecycle: planned`; no code,
  task identity, retry budget, architecture, Planning Revision, promotion,
  closure, or dependent transition changed.
- Validation: sync-local re-read passed; caller-owned `node scripts/mb-lint.mjs`
  passed (64 files) and `node scripts/mb-doctor.mjs --strict` passed (0 errors,
  0 warnings, 2 info).

## [2026-08-10] Wave 6 — FT-004 historical lifecycle reconciliation
- Reconciled: TASK-012 is now indexed `failed` with an explicit historical
  `superseded` disposition to TASK-016/TASK-017; no unsupported `superseded`
  schema status was introduced.
- Updated: FT-004 current evidence now records feature-level
  `SEMANTIC_VERDICT: semantic-pass` for AC-001..AC-005 and links the fresh
  report plus the current T3 replacement evidence.
- Preserved: TASK-012 identity, T2/W6 tier and wave, dependencies, Attempt 1/2
  evidence, retry history, old feature `semantic-fail`, and Attempt 2
  `NEEDS-CLARIFICATION`; the old report remains untouched.
- Unchanged: FT-004 document lifecycle remains `draft`/`planned`; no code,
  tests, architecture, dependency, or Planning Revision changed.
- Validation: task JSON/evidence links, task index/dependency references,
  feature/plan/decision-log routing, and historical report preservation were
  re-read locally; no `/verify`, `/red-verify`, `mb-lint`, or doctor was run.

## [2026-08-10] Wave 8 — FT-003 feature-level semantic boundary sync
- Reconciled: indexed `TASK-013-T2-FT-003-W7`, `TASK-014-T3-FT-003-W8`, and
  provider prerequisite `TASK-018-T3-FT-005-W8` are `done` with current
  claim-linked functional/semantic evidence; FT-003 feature evidence is
  `semantic-pass`.
- Updated: FT-003 feature navigation and `IMPL-FT-003` now route the current
  TASK-014 functional/semantic evidence, the TASK-018 provider evidence, and
  this feature-level sync report.
- Preserved: AC-001/002 ownership remains with TASK-013, AC-003..006 with
  TASK-014, and the lesson-scoped provider claim with TASK-018. No claim was
  broadened beyond its authoritative evidence.
- Preserved: task cards, task identities, current dependency set, retry
  budgets, accepted architecture, FT-003/EP-002 state, and REQ lifecycle
  values remain unchanged; no closure, promotion, or dependent transition was
  applied by `/mb-sync`.
- Validation: sync-local links/index/RTM/spec/lifecycle checks passed;
  explicit Architect/operator post-sync `node scripts/mb-lint.mjs` passed
  (64 files) and `node scripts/mb-doctor.mjs --strict` passed (0 errors,
  0 warnings, 2 info).

## [2026-08-10] Wave 8 — TASK-018 FT-005 boundary sync
- Reconciled: authoritative `TASK-018-T3-FT-005-W8` is `done` with current
  functional `PASS` and required T3 `semantic-pass` evidence for the
  provider-owned lesson-scoped grade query; its card now carries those
  existing evidence markers.
- Updated: FT-005 task coverage and `IMPL-FT-005` link the current functional
  protocol, semantic report, and this W8 boundary report.
- Confirmed: task index entry, exact dependencies, REQ-009/REQ-014 RTM
  ownership, Planning Revision 2 canonical routes, and root/feature routers
  agree with the authoritative task and evidence sources.
- Preserved: TASK-014 remains `in_progress` with its accepted dependency on
  TASK-018; no TASK-014 lifecycle, source, protocol, or evidence surface was
  changed.
- Preserved: FT-005/EP-004 document status and lifecycle and affected REQ
  lifecycle values remain `draft`/`planned`; no feature-level semantic
  verdict, promotion, or dependent transition was applied.
- Validation: sync-local checks plus the explicit Architect/operator-owned
  post-sync `mb-lint` (64 files) and `mb-doctor --strict` (0 errors, 0 warnings)
  passed.

## [2026-08-10] Wave 7 — FT-003 full boundary sync
- Reconciled: authoritative `TASK-013-T2-FT-003-W7` is `done` with current
  functional `PASS` evidence and FT-003 feature-level `semantic-pass` evidence
  for `FT-003-AC-001` and `FT-003-AC-002`; task, feature, plan, and evidence
  navigation now agree.
- Updated: FT-003 task coverage and `IMPL-FT-003` link the current W7
  functional/semantic evidence and this boundary report; the root Memory Bank
  router now links the changed FT-003 implementation plan.
- Confirmed: task index, W7 task evidence, RTM ownership/lifecycle, canonical
  spec routes, Planning Revision 1, accepted architecture, and routers are
  consistent with the authoritative records.
- Preserved: `TASK-014-T3-FT-003-W8` remains `blocked` with its accepted
  dependencies; `TASK-012-T2-FT-004-W6` remains historical `T2` / `W6` /
  `in_progress`; `TASK-016`/`TASK-017` remain completed W6 T3 replacements and
  their W6 sync history is unchanged.
- Deferred: no dependent unblock, task/feature/epic/REQ lifecycle promotion,
  closure, dependency redesign, or architecture decision was made by this
  sync.
- Handoff: return to the explicit Architect/operator owner for applicable
  post-sync lint/doctor gates; this sync did not run `mb-lint`, `/mb-doctor`,
  `/verify`, `/red-verify`, code, or tests.

## [2026-08-10] Wave 6 — FT-004 full boundary sync
- Reconciled: authoritative `TASK-016-T3-FT-004-W6` and
  `TASK-017-T3-FT-004-W6` are `done`, each with current functional `PASS` and
  required T3 `semantic-pass` evidence; their task index, cards, and evidence
  paths agree.
- Updated: FT-004 navigation now links both current functional/semantic
  evidence sets and the combined W6 boundary report; FT-004 remains
  `status: draft`, `lifecycle: planned`.
- Confirmed: `TASK-014` already depends on both replacement tasks; the RTM,
  canonical spec/architecture links, task plans, and Memory Bank routers remain
  consistent with the accepted Planning Revision 1 split.
- Preserved: `TASK-012-T2-FT-004-W6` remains exactly historical `T2` / `W6` /
  `in_progress` with its Attempt 1/2 evidence; the feature
  `SEMANTIC_VERDICT: semantic-fail`, affected REQ lifecycles, and accepted
  modular-monolith/one-server/one-database architecture remain unchanged.
- Deferred: no feature-level `semantic-pass`, feature/epic/REQ promotion,
  dependent unblock, closure, or promotion decision was made by this sync.
- Handoff: return to the explicit Architect/operator owner for applicable
  post-sync lint/doctor gates; this sync did not run `mb-lint`, `/mb-doctor`,
  `/verify`, `/red-verify`, code, or tests.

## [2026-08-10] Wave 6 — TASK-016 FT-004 task-scoped sync
- Reconciled: authoritative `TASK-016-T3-FT-004-W6` is `done` with current
  functional `PASS` and required T3 semantic `semantic-pass` evidence for
  `FT-004-AC-001`, `FT-004-AC-002`, and `FT-004-AC-005`.
- Updated: FT-004 task coverage now links the current TASK-016 functional,
  semantic, and task-scoped sync reports.
- Confirmed: TASK-016 evidence links, task registry, downstream TASK-014
  dependency, RTM ownership, canonical spec routes, and `.memory-bank` router
  surfaces agree; no mechanical task-index/router repair was needed.
- Preserved: TASK-017 remains `planned`; TASK-012 remains historical
  `in_progress`; FT-004/EP-003 and affected REQ lifecycle values, feature
  semantic verdict, accepted architecture, and Planning Revision 1 remain
  unchanged. No promotion or dependent transition was applied.
- Deferred: normal full W6 boundary sync and feature semantic reconciliation
  remain open until TASK-017 is closed by its owner.
- Handoff: explicit Architect/operator owner retains the next action; this
  manual sync did not run `mb-lint`, `/mb-doctor`, `/verify`,
  `/red-verify`, code, or tests.

## [2026-08-08] Wave 6 — TASK-010 FT-005 boundary sync
- Reconciled: indexed `TASK-010-T3-FT-005-W6` is `done` with current functional
  `PASS` and required T3 semantic `semantic-pass` evidence for
  `FT-005-AC-003` and `FT-005-AC-004`.
- Preserved: indexed `TASK-009-T3-FT-005-W5` remains `done`; no stale or
  historical report was used as current W6 closure evidence.
- Updated: FT-005 task coverage now links the current W6 functional and
  semantic evidence plus the compact W6 sync report.
- Confirmed: task index, REQ-010/REQ-014/REQ-015 RTM ownership and AC routes,
  linked canonical contracts/specs, and `.memory-bank` routers agree with the
  authoritative task records; no mechanical router repair was needed.
- Preserved: FT-005/EP-004 document status and lifecycle, and affected REQ
  lifecycle values remain `draft`/`planned` as applicable; no promotion,
  dependent transition, or product lifecycle decision was applied.
- Handoff: sync-local consistency validation passed. Scheduler-owned
  post-sync lint/doctor and any subsequent promotion remain outside this sync.

## [2026-08-08] Wave 5 — TASK-009 / TASK-011 FT-005 + FT-004 boundary sync
- Reconciled: indexed `TASK-009-T3-FT-005-W5` is `done` with current Attempt 2
  functional report-02 `PASS` and current T3 semantic report-02
  `semantic-pass` evidence for `FT-005-AC-001` and `FT-005-AC-002`.
- Reconciled: indexed `TASK-011-T3-FT-004-W5` is `done` with current functional
  report-01 `PASS` and current T3 semantic report-01 `semantic-pass` evidence
  for `FT-004-AC-001`, `FT-004-AC-002`, and `FT-004-AC-005`.
- Updated: FT-004 and FT-005 task-coverage navigation now points to the
  current reports and the compact combined W5 sync report.
- Preserved: TASK-009 Attempt 1 semantic-fail/report-01 remains historical
  correction basis only and is excluded from current closure proof.
- Confirmed: task index, RTM ownership, linked canonical contracts/specs,
  feature/epic references, spec registry/backbone, and `.memory-bank/index.md`
  remain consistent; no router repair or new design decision was needed.
- Preserved: FT-004/FT-005 and EP-003/EP-004 document status and lifecycle, and
  affected REQ lifecycle values remain `draft`/`planned` as applicable; no
  promotion, dependent transition, or product lifecycle decision was applied.
- Handoff: sync-local consistency validation passed. Explicit Orchestrator
  remains responsible for applicable post-sync lint/doctor and next handoff;
  `/mb-sync` did not run them.

## [2026-08-08] Wave 5 — TASK-009 FT-005 boundary sync
- Reconciled: indexed `TASK-009-T3-FT-005-W5` is `done` with current Attempt 2
  functional report-02 `PASS` and current T3 semantic report-02
  `semantic-pass` evidence for `FT-005-AC-001` and `FT-005-AC-002`.
- Preserved: Attempt 1 semantic-fail/report-01 remains historical correction
  basis only and is excluded from current closure evidence.
- Reconciled: FT-005 task coverage, implementation plan, linked canonical
  contracts/specs, task registry, dependency, EP-004 reference, and RTM
  ownership agree with the completed W5 task outcome.
- Confirmed: `.memory-bank/index.md`, task index, feature links, spec registry,
  and spec backbone already route the affected durable surfaces; no mechanical
  router repair was needed.
- Preserved: FT-005/EP-004 document status and lifecycle, and REQ-009,
  REQ-014 RTM lifecycle values remain `draft`/`planned` as applicable; no
  promotion, dependent transition, or product lifecycle decision was applied
  by `/mb-sync`.
- Handoff: sync-local consistency validation passed. Explicit owner
  Orchestrator remains responsible for applicable post-sync lint/doctor and
  the next workflow handoff; `/mb-sync` did not run them.

## [2026-08-08] Wave 5 — TASK-008 FT-006 boundary sync
- Reconciled: indexed `TASK-008-T3-FT-006-W5` is `done` with current Attempt 2
  functional report-02 `PASS` and current T3 semantic report-02
  `semantic-pass` evidence for `FT-006-AC-002`, `FT-006-AC-003`,
  `FT-006-AC-005`, `FT-006-AC-006`, and `FT-006-AC-007`.
- Preserved: Attempt 1 semantic-fail/report-01 remains historical correction
  basis only and is excluded from current closure evidence.
- Reconciled: FT-006 task coverage, implementation plan, linked canonical
  contracts/specs, task registry, dependency, EP-005 reference, and RTM
  ownership agree with the completed W5 task outcome.
- Confirmed: `.memory-bank/index.md`, task index, feature links, spec registry,
  and spec backbone already route the affected durable surfaces; no mechanical
  router repair was needed.
- Preserved: FT-006/EP-005 document status and lifecycle, and REQ-010,
  REQ-012, REQ-013, REQ-014, REQ-015, and REQ-016 RTM lifecycle values remain
  `draft`/`planned` as applicable; no promotion, dependent transition, or
  product lifecycle decision was applied by `/mb-sync`.
- Handoff: sync-local consistency validation passed. Scheduler-owned
  `mb-lint`, strict doctor, and any subsequent promotion remain outside this
  sync boundary.

## [2026-08-08] Wave 4 — TASK-006 FT-002 / TASK-007 FT-006 boundary sync
- Reconciled: indexed `TASK-006-T2-FT-002-W4` and
  `TASK-007-T3-FT-006-W4` are `done` with current independent functional
  `PASS` evidence; TASK-007 also has the required T3 semantic `semantic-pass`
  evidence for `FT-006-AC-001` and `FT-006-AC-004`.
- Reconciled: current FT-002 feature-level semantic `semantic-pass` evidence
  covers the completed `FT-002-AC-001..AC-006` scope and is linked from the
  feature document and durable report.
- Confirmed: FT-002/FT-006 task plans, linked canonical contracts/specs, task
  registry, dependencies, feature/epic references, and RTM ownership agree with
  the completed W4 boundary outcomes.
- Preserved: TASK-007's historical Attempt 1 functional `FAIL` remains
  correction evidence; current Attempt 2 functional and semantic reports are
  the closure evidence linked by the authoritative task record.
- Preserved: FT-002, FT-006, their epics, and affected REQ lifecycle values
  remain `planned`; no promotion, selection, implementation, verification,
  red-verification, dependent transition, or product lifecycle decision was
  applied by `/mb-sync`.

## [2026-08-08] Wave 3 — TASK-004 and TASK-005 boundary sync
- Reconciled: indexed `TASK-004-T3-FT-001-W3` and
  `TASK-005-T3-FT-002-W3` are already `done` under scheduler-owned closure
  decisions, with current independent functional `PASS` and required T3
  semantic `semantic-pass` evidence links.
- Preserved: TASK-005 Attempt 1 `semantic-fail` remains historical correction
  evidence in report-01; current closure evidence points to corrected Attempt 2
  functional and semantic report-02 artifacts.
- Confirmed: FT-001/FT-002 feature plans, their task-linked canonical specs,
  task index entries, and RTM ownership agree with TASK-004 coverage of
  `FT-001-AC-001`, `FT-001-AC-002`, and `FT-001-AC-004`, and TASK-005 coverage
  of `FT-002-AC-001` and `FT-002-AC-002`. The REQ-014 RTM route now includes
  its existing `FT-002-AC-001` linkage.
- Preserved: FT-001, FT-002, EP-001, and their requirement lifecycle values
  remain `planned`; no feature, epic, or requirement lifecycle decision was
  written at this wave boundary.
- Preserved: no task promotion, selection, dependent unblock/block, or final
  product lifecycle transition was applied by `/mb-sync`; post-sync gates and
  the next scheduler pass remain caller-owned.

## [2026-08-08] Wave 2 — FT-001 TASK-015 boundary sync
- Reconciled: indexed `TASK-015-T3-FT-001-W2` is `done` with current
  independent functional `PASS` and semantic `semantic-pass` evidence links.
- Confirmed: FT-001 feature/plan, Account Provisioning Boundary, Access
  Control Contract, and RTM references agree with the repaired server-authorized
  atomic provisioning path.
- Preserved: `TASK-003` remains the historical `failed` attempt and its BUG
  record now links the TASK-015 correction; `TASK-004` remains `blocked` on
  `TASK-015`; FT-001 and its requirements remain `planned`.
- Preserved: no lifecycle promotion, dependent unblock, implementation, or
  verification decision was inferred or changed by `/mb-sync`.

## [2026-08-08] Wave 2 — FT-001 early local reconciliation
- Updated: reconciled the changed Account Provisioning Boundary and Access
  Control Contract links with FT-001, its implementation plan, TASK-003 failure
  history/BUG, and the indexed TASK-015 follow-up record.
- Updated: extended FT-001 RTM test locators through `FT-001-AC-005` while
  preserving all requirement and feature lifecycle values as `planned`.
- Preserved: `TASK-003` remains `failed`, `TASK-004` remains `blocked` on
  `TASK-015`, and `TASK-015` remains `in_progress`; no retry budget, promotion,
  closure, or dependent lifecycle was changed.
- Handoff: TASK-015 has executor and independent functional `PASS` evidence;
  execution is paused for the required `/red-verify TASK-015-T3-FT-001-W2`,
  after which its lifecycle owner must decide closure. This early sync is
  partial by boundary and does not replace the final wave sync.

## [2026-08-08] Wave 1 — Foundation boundary sync
- Updated: reconciled the completed `TASK-002-T3-FT-000-W1` gate and its
  functional `PASS` / semantic `semantic-pass` evidence into Foundation and
  FT-000 handoff routing.
- Preserved: task lifecycle ownership, RTM lifecycle, and promotion remain
  with the scheduler/owning workflow.

## [2026-08-08] Wave 0 — Foundation W0 durable sync
- Updated: reconciled `TASK-001-T3-FT-000-W0` closure/evidence routing with the
  authoritative indexed task record (`done`, functional `PASS`, semantic
  `semantic-pass`).
- Updated: recorded that the dependent final Foundation gate
  `TASK-002-T3-FT-000-W1` remains `planned`; REQ-000 and FT-000 lifecycle stay
  open until that gate completes.

## [2026-08-07] Initial setup
- Created Memory Bank skeleton
- Seeded core docs (product, requirements, testing, task registry)
