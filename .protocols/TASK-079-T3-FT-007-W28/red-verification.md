---
description: Adversarial semantic verification for TASK-079-T3-FT-007-W28.
status: final
---
# Red Verification — TASK-079-T3-FT-007-W28

## Semantic target
- Task outcome: `FT-007-AC-001 / REQ-017`; one server-authoritative
  protected navigation shell preserves the existing logout owner, and its
  browser proof is disposable, isolated, and fail-closed.
- Accepted boundaries: task card; FT-007-AC-001; REQ-014/REQ-017;
  Authentication Transport session revocation; Access Control authority and
  scope; Boundary Map Actor Context; Testing Strategy disposable browser
  proof; and T3 tier obligations.

## Evidence and adversarial coverage
- Current functional PASS: `.protocols/TASK-079-T3-FT-007-W28/verification.md`
  and `.tasks/TASK-079-T3-FT-007-W28/TASK-079-T3-FT-007-W28-S-VERIFY-final-report-docs-03.md`.
  It was treated as supporting evidence, not semantic proof.
- Historical Attempt 1/2 FAIL evidence and Attempt 3 RED/GREEN, handoff, and
  execution evidence were read without relabeling: `attempt-1-independent-verification-fail.md`,
  `TASK-079-T3-FT-007-W28-S-VERIFY-RETRY-final-report-docs-02.md`,
  `attempt-3-red.md`, `attempt-3-green.md`, `execution-evidence.md`, and
  `.protocols/TASK-079-T3-FT-007-W28/handoff.md`.
- Focus A (server boundary): fresh `Codex Luna`/`xhigh` co-review and the
  current SSR/logout evidence found no material break. The review covered
  request-local actor projection, protected/public and anonymous behavior,
  nested protected prefixes, exact controls, client-authority exclusion, and
  existing POST logout revocation/cookie clearing/old-token denial.
- Focus B (runtime isolation): fresh `Codex Luna`/`xhigh` co-review and
  reviewer-owned probes found no material break. Current ordinary selection
  listed exactly the two real-database specs; explicit disposable selection
  listed exactly the task spec. Unsafe path probes rejected real, outside,
  nested, and normalized traversal targets. A forced exception probe observed
  cleanup of the database, `-wal`, `-shm`, and `-journal` paths after `finally`.
- Current code was inspected across `src/routes/+layout.server.ts`,
  `src/routes/+layout.svelte`, `src/hooks.server.ts`, the existing logout
  transport, `playwright.config.ts`, `scripts/run-disposable-e2e.mjs`, the
  task tests, and the focused E2E spec. A fresh static contract probe passed
  for request-local server authority, role-only projection, existing logout
  ownership, explicit database injection, owned-server/no-reuse mode,
  cleanup in `finally`, and conditional ordinary/disposable selection.
- The existing fresh browser/real-database fingerprint evidence in the current
  functional PASS was checked for supported-path isolation. No scheduler or
  lifecycle file was changed by this review.

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
- Evidence/report paths: this protocol, `.tasks/TASK-079-T3-FT-007-W28/TASK-079-T3-FT-007-W28-S-RED-VERIFY-final-report-docs-01.md`, the current functional PASS/report, Attempt 1/2/3 evidence, and the inspected task-linked contracts.
- Recommended next owner: scheduler/lifecycle owner may apply the normal T3 closure decision after functional PASS plus this semantic PASS; leave task lifecycle `in_progress` until that owner acts.
- Resume route: scheduler/lifecycle owner; no `/exe`, `/verify`, `/mb-sync`, `/debug`, scheduler transition, task status change, or `AUTONOMOUS-RUN` edit was performed.
