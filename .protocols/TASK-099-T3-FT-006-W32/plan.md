---
description: Execution plan for TASK-099-T3-FT-006-W32.
status: active
---
# Plan — TASK-099-T3-FT-006-W32

## Goal

Expose the existing Financial Ledger pricing commands through a protected
own-center Admin finance page, add append-only history/current-default queries,
and initialize the existing editable Lesson Context payment amount.

## Non-goals

- No second persisted default-payment setting or payment flow.
- No changes to `createPayment`, allocation/replay, paid/unpaid labels, attendance, or charge ownership.
- No direct financial SQL in routes or Center & Scheduling writes.
- No calendar or real-database changes.

## Inputs / source specs
- Task record: `.memory-bank/tasks/TASK-099-T3-FT-006-W32.task.json`
- Task index: `.memory-bank/tasks/index.json`
- Feature: `.memory-bank/features/FT-006-financial-ledger.md#FT-006-AC-009`
- REQ IDs: `REQ-011`, `REQ-014`
- Direct canonical contracts: `.memory-bank/contracts/financial-ledger.md`, `.memory-bank/contracts/boundary-map.md#financial-projection-query-boundary`, `.memory-bank/contracts/access-control.md#authority-and-scope`

## Richer execution inputs
- `.memory-bank/architecture/system-architecture.md#composition-and-request-data-flow`
- `.memory-bank/domains/core-domain.md#persistence-and-transaction-rules`
- `.memory-bank/testing/strategy.md#disposable-browser-proof`
- `.memory-bank/workflows/tier-policy.md#claim-linked-red--green-for-t2t3`
- `.memory-bank/tasks/plans/IMPL-FT-006.md`

## Constraints / invariants
- MUST keep Financial Ledger the sole pricing/financial writer.
- MUST resolve Admin center/class/student scope on the server.
- MUST append effective-dated settings and preserve existing Charge rows.
- MUST use one class amount for lesson price and existing payment-form default.
- NEVER trust caller-provided scope, create a second persistence source, or touch forbidden paths.

## Scope
### In scope
- Financial Ledger read queries for price history and current class default.
- Protected Admin center finance adapter/page and link from Admin dashboard.
- Lesson Context initial amount only.
- Focused unit/route tests and disposable Playwright proof in task boundary.

### Out of scope
- `src/routes/calendar/`, `src/lib/server/modules/center-scheduling/`, `study-calendar.db`, `playwright.config.ts`, `scripts/run-disposable-e2e.mjs`.

## Proposed changes
### Touched areas (hypotheses)
- `src/lib/server/modules/financial-ledger/public.ts` — authorized read-only pricing projections.
- `src/routes/admin/[centerId]/+page.svelte` — protected finance navigation.
- `src/routes/admin/[centerId]/finance/` — server adapter and UI.
- `src/routes/lesson-context/` — authorized initial payment amount.
- Task-listed focused tests/E2E — claim-linked proof.

### Preflight-confirmed change surface
- Expected hints kept: yes; all target source/test paths are inside the boundary.
- Additional same-outcome files/areas: none identified.
- Hard `write_boundary` present and satisfied: yes.
- `forbidden_scope` / stop-condition check: clear.

## Applicable quality gates
- [x] `npm run check` — PASS; `svelte-check found 0 errors and 0 warnings`.
- [x] `npm run test` — PASS; 72 files and 247 tests passed.
- [x] `npm run build` — PASS; production build completed.
- [x] `node scripts/run-disposable-e2e.mjs --database tmp/ft-006-admin-pricing.db --spec e2e/ft-006-admin-pricing.spec.ts` — PASS; 1 test passed.
- [x] `git diff --check` — PASS; no output.
- [x] `node .memory-bank/scripts/mb-lint.mjs` — PASS; `mb-lint passed (76 files)`.
- [x] `node .memory-bank/scripts/mb-doctor.mjs --strict` — PASS; 0 errors, with only existing unrelated warnings.

## Claim-linked RED / GREEN (T2/T3)
- applicability: applicable
- accepted claim locator(s): `FT-006-AC-009 / REQ-011 / REQ-014`
- planned test/probe and environment: isolated in-memory unit/route fixtures and project disposable E2E runner with exact `tmp/` database.
- observable RED: current implementation lacks price-history/default query, protected finance surface, and initial payment amount.
- corresponding GREEN: own-center Admin writes/reads deterministic history; future charges use selected setting while old charge is unchanged; payment form starts with class amount and remains editable; denials are non-mutating.
- T3 isolation, safe rerun, cleanup, and permission boundary: disposable runner owns a fresh `tmp/ft-006-admin-pricing.db`, starts its own server, and removes only exact temporary state.

## MB-SYNC handoff / owner
- Owner: scheduler at the wave boundary; `/exe` does not run `/mb-sync`.
- `.memory-bank/` docs needing update: feature/changelog/task coverage only after lifecycle owner verification/sync; no MB edit by this child beyond selected task status.

## Definition of done
- Implementation and focused proof are complete within boundary; all listed gates are recorded; task remains open for `/verify` and T3 `/red-verify`.
