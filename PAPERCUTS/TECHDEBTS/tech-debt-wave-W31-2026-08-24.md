# Technical-debt advisory — Wave W31

Date: 2026-08-24
Review mode: fresh bounded Reviewer advisory. This report changes no
implementation, tests, task or product lifecycle, scheduler checkpoint,
verification artifact, decision log, or debt lifecycle.

## Review disposition

- verdict: `APPROVE` for scheduler terminal-routing consideration;
- advisory findings: one `MEDIUM`, one `LOW`;
- scheduler blocking: `no`. The current TASK-097 and TASK-098 functional
  `PASS` plus required T3 `semantic-pass` remain authoritative, and this report
  cannot block, repair, promote, or route workflow state.

## Checked scope

Only the completed W31 surface was reviewed:

- `TASK-097-T3-FT-007-W31`: typed bidirectional Statistics sorting and its
  focused/disposable-browser evidence;
- `TASK-098-T3-FT-007-W31`: bounded read-only Profile, canonical protected
  shell route/logout proof, and its focused/disposable-browser evidence;
- the W31 `/mb-sync` reconciliation that records both cards `done`, FT-007 and
  EP-006 `implemented`, sole-mapped REQ-017 `implemented`, shared REQ-014
  `planned`, and no inferred feature-level `verified` state.

The actual W31 production/test change surface checked was:

- `src/routes/statistics/+page.svelte:1-197`,
  `tests/routes/ft-007-statistics-sorting.test.ts:1-65`, and
  `e2e/ft-007-statistics.spec.ts:1-158`;
- `src/routes/profile/+page.server.ts:1-36`,
  `src/routes/profile/+page.svelte:1-41`,
  `tests/routes/ft-007-profile-routes.test.ts:1-89`, and
  `e2e/ft-007-profile-routes.spec.ts:1-131`.

`src/routes/+layout.svelte` was inspected as TASK-098 dependency/integration
context but was not changed by W31. The review did not widen to W27-W30
implementation or a repository-wide audit.

## Evidence and commands used

- Authoritative cards:
  `.memory-bank/tasks/TASK-097-T3-FT-007-W31.task.json` and
  `.memory-bank/tasks/TASK-098-T3-FT-007-W31.task.json`.
- Current functional and semantic evidence under
  `.protocols/TASK-097-T3-FT-007-W31/`,
  `.protocols/TASK-098-T3-FT-007-W31/`, and the corresponding `.tasks/`
  directories. Current reports record `VERDICT: PASS` and
  `SEMANTIC_VERDICT: semantic-pass` for both cards.
- W31 sync report:
  `.tasks/TASK-098-T3-FT-007-W31/TASK-098-T3-FT-007-W31-S-MB-SYNC-final-report-docs-01.md:8-79`.
- Durable acceptance/closure surfaces:
  `.memory-bank/features/FT-007-navigation-and-statistics.md:74-108,338-370`,
  `.memory-bank/contracts/statistics-projection.md:35-81`,
  `.memory-bank/contracts/access-control.md:90-118`,
  `.memory-bank/requirements.md:106-125,515-537`,
  `.memory-bank/epics/EP-006-navigation-and-statistics.md:40-46`, and the W31
  changes in the implementation plan, FT-007 checklist, and changelog.
- Read-only inspection commands included `git status --short`,
  `git show --stat --oneline --summary 388df10`,
  `git diff 568598f..388df10 -- <W31 production/test paths>`,
  `git diff -- <W31 sync durable paths>`, `rg -n <W31/AC/REQ terms>`, and
  line-numbered `nl -ba` reads of the sources, tests, cards, reports, and sync
  surfaces.
- This advisory did not rerun product gates. It used the current independent
  receipts: TASK-097 `check/test/build/diff/mb-lint/strict-doctor` plus the
  full `36`-interaction disposable browser matrix all passed
  (`.tasks/TASK-097-T3-FT-007-W31/TASK-097-T3-FT-007-W31-S-VERIFY-final-report-docs-01.md:23-41`);
  TASK-098 focused `3/3`,
  disposable browser `1/1`, and all card gates passed
  (`.tasks/TASK-098-T3-FT-007-W31/TASK-098-T3-FT-007-W31-S-VERIFY-final-report-docs-02.md:11-16`).
  The caller-owned
  post-sync evidence records `mb-lint` PASS for 74 files, strict doctor PASS at
  0 errors / 0 warnings / 2 info, and `git diff --check` PASS.

## Confirmed findings

### TD-W31-01 — MEDIUM: both W31 browser claims required a post-verifier evidence-completion cycle

The same evidence-planning mechanism occurred in both W31 cards:

- TASK-097's first browser flow rendered all `18` sort controls but executed
  only `12` clicks, so it did not prove every column in both directions
  (`.protocols/TASK-097-T3-FT-007-W31/verification.md:12-17,46-51`). The
  verifier returned `NEEDS-CLARIFICATION`; a bounded executor resume expanded
  the proof to `36` interactions, followed by a fresh verification pass
  (`.tasks/TASK-097-T3-FT-007-W31/TASK-097-T3-FT-007-W31-S-EXE-final-report-code-02.md:7-14` and
  `.tasks/TASK-097-T3-FT-007-W31/TASK-097-T3-FT-007-W31-S-VERIFY-final-report-docs-01.md:9-38`).
- TASK-098's first browser flow directly reached the four destinations and
  exercised logout but did not observe the exact links and logout form in the
  hydrated shell. The verifier therefore returned `NEEDS-CLARIFICATION`
  (`.tasks/TASK-098-T3-FT-007-W31/TASK-098-T3-FT-007-W31-S-VERIFY-final-report-docs-01.md:11-26`).
  A bounded executor resume added the runtime shell observation, after which a
  separate fresh verification passed
  (`.tasks/TASK-098-T3-FT-007-W31/TASK-098-T3-FT-007-W31-S-EXE-final-report-code-02.md:6-11`
  and `.tasks/TASK-098-T3-FT-007-W31/TASK-098-T3-FT-007-W31-S-VERIFY-final-report-docs-02.md:11-16`).

This is confirmed repeated verification cost, not a coverage-percentage or
style preference: two independently scoped W31 tasks completed broad gates yet
needed an additional executor handoff, evidence artifact, and fresh verifier
cycle because literal browser matrices were not complete at the first GREEN.
No current behavior defect is claimed; the completed specs now cover the
accepted matrices and both semantic reviews passed.

Smallest remediation direction: for future browser-backed cards, translate the
literal task `verification_targets` into a compact executable interaction
matrix before the first GREEN. For this pattern that means enumerating
`control × direction × active-state/order assertion` and
`runtime shell control × exact attribute × activation/result`. Reuse the
existing task-owned helpers and runner; no new framework or workflow layer is
justified.

### TD-W31-02 — LOW: TASK-098 retains a superseded lifecycle route inside `verification_targets`

The current authoritative TASK-098 card is `status: done`
(`.memory-bank/tasks/TASK-098-T3-FT-007-W31.task.json:1-5`) and contains the
current semantic/closure record with `/mb-sync` as its then-next action
(`:73-103`). Its second `verification_targets` entry nevertheless ends with
`Required next route: ... /red-verify ...; status remains in_progress`
(`:154-156`). The W31 sync report simultaneously states TASK-098 is `done` and
that the durable evidence/routes/lifecycle agree
(`.tasks/TASK-098-T3-FT-007-W31/TASK-098-T3-FT-007-W31-S-MB-SYNC-final-report-docs-01.md:19-33,59-68`).

The authoritative top-level status, later closure entry, current functional
and semantic artifacts, and wave checkpoint disambiguate the real state, so
this is not a scheduler blocker. It is an observable maintenance contradiction
inside an indexed task card, however: a future reader treating
`verification_targets` as current normative handoff can be routed to repeat an
already completed semantic review. The post-sync lint/strict-doctor PASS did
not surface this class of stale embedded prose.

Smallest remediation direction: at a future authorized task-card maintenance
boundary, keep `verification_targets` limited to stable claim/proof targets;
retain point-in-time verdict and next-route prose only in the ordered `verify`
history (or label it explicitly historical). No lifecycle or card edit is made
by this advisory.

## Uncertainty and non-findings

- The current W31 production behavior, provider boundaries, authorization,
  source non-mutation, disposable cleanup, and accepted sorting/Profile
  outcomes have fresh functional and semantic PASS evidence. No current
  production defect was confirmed.
- Both browser specs use a local `waitForTimeout(500)` before hydrated
  interaction (`e2e/ft-007-statistics.spec.ts:98-100` and
  `e2e/ft-007-profile-routes.spec.ts:55-64`). Fixed timing may deserve attention
  if flakiness is observed, but the inspected evidence includes repeated fresh
  passes and does not establish a current reliability failure; it is not
  admitted as a separate finding.
- No debt is inferred from component size, repeated table markup, test count,
  style, metadata advisories, or dependency age alone.

This report is advisory only. Neither finding blocks scheduler terminal
routing, and the report itself does not repair, promote, close, verify, or
route any task, feature, requirement, checkpoint, or queue state.
