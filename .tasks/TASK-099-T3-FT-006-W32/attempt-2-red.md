# TASK-099-T3-FT-006-W32 — Attempt 2 RED

- attempt: 2
- Claim: `FT-006-AC-009 / REQ-011 / REQ-014`, with exact monetary precision
  required by the Financial Ledger contract and PRD.
- Phase: same-task correction after durable reconciliation of Attempt 1.
- Retry correction basis: confirmed semantic finding `F-001` and completed
  `/feature-doctor FT-006` clarification.
- Original RED retained: the verifier-owned browser probe recorded
  `value=10.125`, `step=0.01`, `stepMismatch=true`, `valid=false`, and
  `formValid=false` for the supported exact value. The original evidence is
  preserved at `.protocols/TASK-099-T3-FT-006-W32/red-verification.md` and
  the semantic report; it is not replayed or relabeled as a new initial RED.
- Correction target: the existing Admin class/override inputs and Lesson
  Context payment amount input must accept and submit the same exact decimal
  values accepted by Financial Ledger, including `10.125`.
- Production change status: not yet changed when this retry RED was recorded.
