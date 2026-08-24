# TASK-079 Attempt 3 — retry claim-specific RED

## Claim

- claim: `FT-007-AC-001 / REQ-017` disposable browser proof must remain
  disposable-only while ordinary real-database Playwright smoke selection
  remains unchanged.
- retry basis: fresh independent `/verify` report-02 at
  `.protocols/TASK-079-T3-FT-007-W28/verification.md` observed ordinary
  `npm run e2e -- --list` selecting the disposable-only spec with the two
  existing real-database specs.
- correction basis: fresh Judge `gpt-5.6-sol/xhigh` authorized only a
  task-local Playwright selection correction and its minimum regression proof.

## Exact pre-correction probes

1. `npm run e2e -- --list`
   - cwd: `/home/serg/Projects/study_calendar`
   - exit code: `0`
   - observed: `Total: 3 tests in 3 files`; selected
     `ft-007-navigation.spec.ts`, `real-database-payment.spec.ts`, and
     `real-database-smoke.spec.ts`.
2. `DISPOSABLE_E2E=1 DATABASE_URL="$PWD/tmp/ft-007-navigation.db" PLAYWRIGHT_PORT=5174 npm run e2e -- --list`
   - cwd: `/home/serg/Projects/study_calendar`
   - exit code: `0`
   - observed: `Total: 3 tests in 3 files`; selected the same three files.

## Qualification

This is claim-specific retry RED for the observed ordinary-vs-disposable
selection defect, not a setup, syntax, or artificial failure. The protocol
Attempt 3 block was durably recorded before these probes and no production
correction was written before them. Attempt 1 and Attempt 2 RED/GREEN evidence
remain preserved and supporting-only.
