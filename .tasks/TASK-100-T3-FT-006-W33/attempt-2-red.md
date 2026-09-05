---
description: Claim-linked Attempt 2 RED evidence for TASK-100-T3-FT-006-W33.
status: active
---
# Attempt 2 — Claim-linked RED

- attempt: `2`
- applicability: applicable; the retry is bound to the accepted `F-001`
  correction under `FT-006-AC-010 / REQ-012 / REQ-013 / REQ-014 / REQ-015`.
- correction basis: Attempt 1's independent T3 semantic-fail proved that the
  journal posts fixed `confirm-edit` and `confirm-cancel` values. The Financial
  Ledger treats `(actor, operation, confirmation)` as the idempotency key, so a
  second new edit/cancel must receive a fresh value while an exact retry must
  reuse its value.
- probe change: the existing disposable browser spec was extended inside the
  task boundary to seed two payments and exercise two edits and two
  cancellations by the same Admin. The initial fixture assertion was corrected
  from balance `6` to the authoritative combined-payment balance `5`; that
  correction is probe setup only and does not weaken the claim.
- command: `node scripts/run-disposable-e2e.mjs --database
  tmp/ft-006-admin-journal.db --spec e2e/ft-006-admin-journal.spec.ts`
- cwd: `/home/serg/Projects/study_calendar`
- input state basis: repository revision `43780aad1b024fbbf8e89e7b2b15c55719a2368a`;
  the Attempt 1 production implementation and historical evidence were
  preserved; only the task-local disposable spec and Attempt 2 protocol files
  were changed before this probe. `study-calendar.db` was not opened or
  changed, and its SQLite sidecars were absent.
- result: after the fixture expectation correction, the first edit succeeded
  and the second distinct edit did not produce `Платёж изменён.` within the
  Playwright timeout. The current page still submitted the same literal
  `confirm-edit` value, so the existing Ledger returned the expected
  `confirmation-conflict` path. Exit code: `1`.
- decisive comparison: the accepted two-payment browser outcome requires both
  new edits and both new cancellations by one Admin; the unchanged UI cannot
  complete the second edit and therefore does not satisfy the correction.
- evidence: disposable runner output from the command above; test failure was
  at `e2e/ft-006-admin-journal.spec.ts:177` after the first edit had passed.
- no production behavior was changed before this RED observation.
