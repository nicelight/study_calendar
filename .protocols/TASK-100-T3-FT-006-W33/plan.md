---
description: Execution plan for TASK-100-T3-FT-006-W33.
status: active
---
# Plan — TASK-100-T3-FT-006-W33

## Goal

Let an own-center Admin inspect every scoped recorded/cancelled Payment once,
then edit amount/date or cancel a recorded Payment with explicit confirmation
and see reloaded Ledger-owned allocations, balance/advance, and audit history.

## Non-goals

- No payment-creation form or second financial workflow.
- No route-owned allocation, balance, replay, audit, authorization, or direct
  persistence logic.
- No Teacher correction authority and no client-trusted center/class/student scope.

## Inputs / source specs

- Task: `.memory-bank/tasks/TASK-100-T3-FT-006-W33.task.json`
- Claim: `FT-006-AC-010 / REQ-012 / REQ-013 / REQ-014 / REQ-015`
- Planning: `.memory-bank/tasks/plans/IMPL-FT-006.md`, `.protocols/FT-006/plan.md`
- Normative task-linked financial, boundary, access, architecture, domain,
  lifecycle, testing, execution, and tier-policy sections listed in `context.md`.

## Constraints / invariants

- MUST enumerate only server-resolved own-center class/student pairs and use
  Financial Ledger projections/commands.
- MUST require explicit confirmation and reload authoritative state after success.
- MUST show exact strings and preserve one-time payment identity, status,
  allocations, balance/advance, and payment audit history.
- NEVER write financial tables or accept client-provided authorization scope.
- NEVER touch the declared forbidden scope or `study-calendar.db`.

## Scope

### In scope

- Extend the existing Admin finance route data/actions and page presentation.
- Add focused route/action regression coverage and disposable Playwright proof.

### Out of scope

- Financial Ledger implementation, Lesson Context, Calendar, Center &
  Scheduling implementation, shared runner/config, lifecycle closure, sync,
  dependent promotion, Judge state, and autonomous scheduler state.

## Preflight-confirmed change surface

- Expected files: `src/routes/admin/[centerId]/finance/+page.server.ts`,
  `src/routes/admin/[centerId]/finance/+page.svelte`,
  `tests/routes/admin-finance-journal.test.ts`,
  `e2e/ft-006-admin-journal.spec.ts`.
- Hard `write_boundary`: present and satisfied.
- `forbidden_scope` / stop conditions: clear.
- Existing W32 edits in the shared Svelte page: preserve unchanged.

## Applicable quality gates

- [x] focused RED/GREEN: `npx vitest run tests/routes/admin-finance-journal.test.ts`
- [x] disposable browser: `node scripts/run-disposable-e2e.mjs --database tmp/ft-006-admin-journal.db --spec e2e/ft-006-admin-journal.spec.ts`
- [x] check: `npm run check`
- [x] test: `npm run test`
- [x] build: `npm run build`
- [x] diff: `git diff --check`
- [x] Memory Bank lint: `node .memory-bank/scripts/mb-lint.mjs`
- [x] strict doctor: `node .memory-bank/scripts/mb-doctor.mjs --strict`

## Claim-linked RED / GREEN

- applicability: applicable
- accepted claim locator: `FT-006-AC-010 / REQ-012 / REQ-013 / REQ-014 / REQ-015`
- probe: focused real-boundary in-memory route/action test, plus final disposable
  browser proof using only `tmp/ft-006-admin-journal.db` and its owned server.
- observable RED: current Admin finance route/page had no payment journal or
  correction actions, so an in-scope payment was absent and could not be
  confirmed, edited/cancelled, refreshed, or audited through this adapter.
- corresponding GREEN: every scoped payment appears once; confirmed edit/cancel
  uses the existing commands, refreshed projection is exact/audited, and the
  denial matrix leaves financial state unchanged without a create form.
- T3 isolation: Vitest uses `:memory:`; Playwright uses the exact disposable
  `tmp/ft-006-admin-journal.db`, owned server, safe runner cleanup, and unchanged
  `study-calendar.db` checksum/metadata evidence.

## MB-SYNC handoff / owner

- Owner: scheduler / explicit next workflow owner; `/exe` does not close or sync.
- Task registry/status: lifecycle owner after `/verify` and `/red-verify`.
- Feature, RTM, changelog, scheduler, Judge, and dependent promotion: untouched.

## Definition of done

- Current Attempt 1 has honest claim-linked RED followed by claim-equivalent GREEN.
- All required gates run with reproducible evidence.
- Handoff points to exact current-attempt evidence and routes to `/verify`.
