---
description: Bounded feature-doctor triage for the TASK-099 exact-decimal browser input finding.
status: complete
last_updated: 2026-09-04
source_of_truth:
  - .protocols/FT-006/clarification.md
---
# FT-006 Feature Doctor Clarification

## F-001 — browser precision narrows accepted exact money

### Validation status and semantic basis

`complete` — the fresh T3 semantic finding is confirmed and bounded to the
existing `TASK-099-T3-FT-006-W32` implementation surface. The supported Admin
pricing input at `src/routes/admin/[centerId]/finance/+page.svelte:85` and the
existing Lesson Context amount input at `src/routes/lesson-context/+page.svelte:232`
both use `step="0.01"`. An independent Playwright validity probe reproduced
`value=10.125` as `stepMismatch: true`, `valid: false`, and
`formValid: false`. The Financial Ledger accepts the same exact value through
`normalizePositiveAmount` at `src/lib/server/modules/financial-ledger/public.ts:1319`,
and the existing `10.1250` historical-price regression passed.

The current authority already settles the intended behavior: the Financial
Ledger contract requires one exact decimal-safe representation end to end, the
PRD requires exact monetary sums without binary rounding, and
`FT-006-AC-003` already requires decimal-precision checks. No accepted
cents-only rule exists. This is therefore an implementation/evidence defect,
not an unresolved product or canonical-contract decision.

Evidence:

- `.protocols/TASK-099-T3-FT-006-W32/red-verification.md:46-67,83-93`
- `.tasks/TASK-099-T3-FT-006-W32/TASK-099-T3-FT-006-W32-S-RED-VERIFY-final-report-docs-01.md:34-64`
- `.memory-bank/contracts/financial-ledger.md#financial-facts-and-invariants`
- `.memory-bank/prd.md#payments-and-balance`
- `.memory-bank/features/FT-006-financial-ledger.md#FT-006-AC-003`

### Contract-valid resolution and impact

The single contract-valid resolution under the accepted authority is to keep
full exact decimal precision across the supported Admin pricing and Lesson
Context amount inputs. The implementation must remove the artificial
two-decimal browser constraint and preserve the existing server validation and
Financial Ledger ownership; it must not silently round a submitted amount.

The likely affected consumers are the two existing Svelte inputs and the
TASK-099 focused browser regression. The Financial Ledger normalization,
pricing commands, persistence model, public ownership boundary, and existing
payment action do not need a semantic change. A cents-only scale would
contradict the current accepted contract and would require a separate
`/write-prd` product decision plus canonical redesign; it is not an available
local resolution for this triage.

- `Design impact: none` — accepted exact-money design and ownership remain
  sufficient.
- `Behavior spec impact: none` — no linked behavior JSON or canonical contract
  needs refresh.
- Feature/task planning impact: none — TASK-099 already owns both consumer
  files and its focused E2E/test surface.

### Owner and revalidation route

The minimum repair owner is the existing execution owner for the confirmed
implementation defect: `/exe TASK-099-T3-FT-006-W32`. Keep the task lifecycle,
scheduler/checkpoint, queue, and FT-000 unchanged. After the bounded repair,
rerun `/verify TASK-099-T3-FT-006-W32`, then the required T3
`/red-verify TASK-099-T3-FT-006-W32`.

## Routing state

- Validation status: `complete`.
- No operator-owned decision remains; accepted `FT-006-AC-*` identities and
  their exact `REQ:` links remain stable.
- Immediate route: `/exe TASK-099-T3-FT-006-W32`, followed by fresh functional
  verification and fresh T3 semantic verification.
- No `/feature-to-tasks`, `/spec-redesign`, `/write-prd`, lifecycle, scheduler,
  queue, or FT-000 route is required by this finding.
