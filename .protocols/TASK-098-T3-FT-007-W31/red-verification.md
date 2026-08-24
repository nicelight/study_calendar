---
description: Adversarial semantic verification for TASK-098-T3-FT-007-W31.
status: active
---
# Red Verification — TASK-098-T3-FT-007-W31

## Semantic target
- Task outcome: an authenticated actor reaches exactly `/home`, `/classes`, `/statistics`, and `/profile`; Profile is a bounded read-only current-actor projection; anonymous, revoked, and logged-out sessions receive no protected data.
- Accepted boundaries: `FT-007-AC-007 / REQ-014 / REQ-017`; Profile consumes only Identity & Access `getCurrentActorProfile`, exposes exactly `fullName`, `role`, `registeredAt`, adds no persistence or mutation path, and consumes the existing TASK-080 bare Home/Classes result without changing Center & Scheduling ownership.

## Evidence and adversarial coverage
- Current functional evidence is the fresh Attempt 1 `VERDICT: PASS` in `.protocols/TASK-098-T3-FT-007-W31/verification.md` and `.tasks/TASK-098-T3-FT-007-W31/TASK-098-T3-FT-007-W31-S-VERIFY-final-report-docs-02.md`; preserved `docs-01` was not used as current proof.
- Inspected the task change surface, protected-route actor hook/layout, Identity & Access query and revocation path, existing logout handler, Home/Classes destination adapter, and the disposable runner. `/profile` has the single route identity and calls only the server-owned current-actor query; its page has exactly the three accepted fields and no control or write path. Home/Classes retain the TASK-080 `getAccessibleClassList` path for Student/Parent rather than reproducing C&S internals.
- Fresh reviewer-owned probes passed: `npx vitest run tests/routes/ft-007-profile-routes.test.ts` (3/3) and `node scripts/run-disposable-e2e.mjs --database tmp/ft-007-profile-routes.db --spec e2e/ft-007-profile-routes.spec.ts` (1/1). The hydrated shell exposed all four exact hrefs and actual `POST /auth/logout` form; every route activated; anonymous/pre-revoked and post-logout old-token requests failed closed. The disposable DB and WAL/SHM/JOURNAL sidecars were absent before and after; `study-calendar.db` stayed `size=356352`, `mtime=2026-08-24 16:17:41.936247476 +0500`, `inode=265994`.
- Two fresh independent `Codex Luna` / `xhigh` co-reviews covered (1) hydrated shell, direct navigation, form/logout and revocation, and (2) Profile ownership/fields, TASK-080 integration, isolation and non-mutation. Neither admitted a material finding. No task-owned hard-boundary or forbidden-scope breach was observed; this review wrote only its required protocol/report and the AGENTS-required papercut record.

## Admitted findings
none.

## Operator questions
none.

## Verdict
SEMANTIC_VERDICT: semantic-pass

## Owner handoff
- Evidence/report paths: this protocol; `.tasks/TASK-098-T3-FT-007-W31/TASK-098-T3-FT-007-W31-S-RED-VERIFY-final-report-docs-01.md`; current functional evidence at `.protocols/TASK-098-T3-FT-007-W31/verification.md`.
- Recommended owner action: retain `TASK-098-T3-FT-007-W31` as `in_progress`; the scheduler/lifecycle owner may evaluate T3 closure eligibility from the independent functional PASS and this semantic-pass. This verification does not close the task.
- Resume route: lifecycle owner/scheduler closure decision. The Judge overlay is not triggered: the current functional PASS is Attempt 1, no retry or complete-wave checkpoint is in scope, and no conflicting evidence, repeated failure, or competing recovery route was found.
