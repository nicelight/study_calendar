---
description: Adversarial semantic verification for TASK-094-T3-FT-007-W27.
status: final
---
# Red Verification — TASK-094-T3-FT-007-W27

## Semantic target
- Task/feature outcome: `FT-007-AC-008 / REQ-014 / REQ-017`; every supported
  bootstrap Admin, invitation participant, and direct-password participant
  receives trimmed `fullName` and immutable server-generated `registeredAt`,
  with exact current-actor and scoped-statistics projections.
- Accepted contract and boundaries: Identity & Access owns profile facts and
  queries; C&S owns actor/scope and transaction orchestration; supported
  creation failures are atomic; no profile-derived authority, raw-row bypass,
  migration, backfill, fallback, or legacy compatibility path is accepted.

## Evidence and adversarial coverage
- Existing verification verdict: `.protocols/TASK-094-T3-FT-007-W27/verification.md`
  records independent functional `VERDICT: PASS`; it was treated as supporting
  evidence only.
- Changed files / diff / runtime evidence: actual source and test diff was
  inspected across `database.ts`, Identity & Access public/internal seams,
  C&S provisioning, Admin transport/pages/API, CLI bootstrap, and focused
  tests. Fresh runs passed
  `.tasks/TASK-094-T3-FT-007-W27/verifier-probe.ts` and the five-file targeted
  regression set.
- Accepted-outcome surfaces covered: exact projection keys and values,
  revoked-session denial, immutable timestamp, required-name propagation,
  Identity & Access ownership, server-side Admin/own-center authorization,
  no direct consumer table access, literal hard write boundary, and exclusion
  of migration/backfill/fallback/legacy behavior.
- Supported paths exercised: first bootstrap Admin, invitation participant,
  direct-password student and parent, invalid/duplicate/profile-write failure
  rollback, parent-link rollback, duplicate-ID/missing-ID projection input,
  revoked actor, and existing unnamed account behavior. Two fresh independent
  `Codex Luna` co-reviews (authorization/ownership and atomicity/path failure)
  returned no candidate findings.

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
- Evidence/report paths: `.tasks/TASK-094-T3-FT-007-W27/verification-evidence.md`,
  `.tasks/TASK-094-T3-FT-007-W27/verifier-probe.ts`, this report, and
  `.tasks/TASK-094-T3-FT-007-W27/TASK-094-T3-FT-007-W27-S-RED-VERIFY-final-report-docs-01.md`.
- Recommended owner action: retain the task lifecycle unchanged and let the
  explicit lifecycle owner apply the normal T3 closure route after the
  existing functional PASS and this semantic PASS.
- Resume route or `n/a`: `n/a`
