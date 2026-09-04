---
description: Independent adversarial semantic verification for TASK-100-T3-FT-006-W33.
status: active
---
# Red Verification — TASK-100-T3-FT-006-W33

## Semantic target

- Accepted outcome: `FT-006-AC-010 / REQ-012 / REQ-013 / REQ-014 / REQ-015` — an
  own-center Admin can inspect each recorded/cancelled payment once and can
  explicitly confirm edit/cancel corrections with authoritative replay,
  allocation, balance, and audit results.
- Governing boundary: the Admin page is a thin server-side adapter; Financial
  Ledger remains the sole owner of payment commands, persistence, replay,
  allocation, balance, and audit. Authorization is rechecked by actor,
  center, class, student, and payment scope.

## Evidence and adversarial coverage

- Existing functional verification is `VERDICT: PASS` in
  `.protocols/TASK-100-T3-FT-006-W33/verification.md` and
  `.tasks/TASK-100-T3-FT-006-W33/TASK-100-T3-FT-006-W33-S-VERIFY-final-report-docs-01.md`.
- The current implementation change is the committed Admin finance route/page
  and its focused route/browser coverage in `git show HEAD`:
  `src/routes/admin/[centerId]/finance/+page.server.ts`,
  `src/routes/admin/[centerId]/finance/+page.svelte`,
  `tests/routes/admin-finance-journal.test.ts`, and
  `e2e/ft-006-admin-journal.spec.ts`.
- Direct source review traced server-resolved scope and existing Ledger calls at
  `src/routes/admin/[centerId]/finance/+page.server.ts:228-312,392-423`, and
  confirmed the current provider idempotency behavior at
  `src/lib/server/modules/financial-ledger/public.ts:447-484,494-522`.
- The verifier-owned probe was rerun with
  `timeout 180s npx vitest run --config .tasks/TASK-100-T3-FT-006-W33/verifier-vitest.config.ts`:
  exit `0`, one file and one test passed. Its custom unique confirmation
  strings prove the provider path, but do not exercise the literal confirmation
  values rendered by the journal forms.
- The disposable browser evidence covers one payment only at
  `e2e/ft-006-admin-journal.spec.ts:101-157`; it proves isolation and one
  edit/cancel sequence, not multiple new corrections by one Admin.
- Both adjudication focuses were attempted twice with `Codex Luna`/`xhigh`;
  each launch was rejected by the installed provider before model launch, so
  no co-review output was used.

## Admitted findings

- `F-001 — The journal exhausts the Ledger confirmation key after the first
  correction of each operation type.` Every rendered edit form posts the same
  `confirmation=confirm-edit` at
  `src/routes/admin/[centerId]/finance/+page.svelte:248-256`, and every cancel
  form posts the same `confirmation=confirm-cancel` at
  `src/routes/admin/[centerId]/finance/+page.svelte:258-265`. The existing
  Financial Ledger looks up commands by `(actor, operation, confirmation)` and
  returns `confirmation-conflict` when the payment or payload differs at
  `src/lib/server/modules/financial-ledger/public.ts:459-464,502-507`; the
  successful command persists that key at
  `src/lib/server/modules/financial-ledger/public.ts:480,518`. Therefore, after
  one Admin edits one payment, the same Admin's edit form for a different
  payment is a supported new explicit correction but deterministically fails;
  cancelling a second payment fails analogously. This prevents the accepted
  journal from correcting multiple payments and is a material break of
  `FT-006-AC-010`, not a duplicate-payment safety issue.

## Operator questions

- none

## Verdict

SEMANTIC_VERDICT: semantic-fail

## Owner handoff

- Evidence/report paths: this protocol and
  `.tasks/TASK-100-T3-FT-006-W33/TASK-100-T3-FT-006-W33-S-RED-VERIFY-final-report-docs-01.md`.
- Recommended owner action: keep Task-100 out of closure and repair the
  journal UI/action contract so each new confirmed edit/cancel gets a fresh
  per-submission confirmation/idempotency value while an exact retry reuses
  that value. Add a two-payment browser regression for two edits and two
  cancellations, then rerun fresh `/verify TASK-100-T3-FT-006-W33` followed by
  fresh `/red-verify TASK-100-T3-FT-006-W33`.
- Resume route: scheduler-owned repair/retry for Task-100; no lifecycle or
  scheduler mutation was performed by this review.
