---
description: Executor handoff for TASK-025 bootstrap Admin center creation.
status: active
---
# Handoff — TASK-025-T3-FT-001-W11

## Summary

- A manually bootstrapped provider-bound Admin now authenticates to `/admin`.
- An Admin with no membership receives a browser form that creates one
  server-identified center and the Admin membership in one transaction.
- Existing member Admins are redirected to their own protected center Admin
  participant surface; repeated bootstrap and non-Admin/forged requests fail.
- Attempt 2 correction: `/admin` POST accepts only one `name` field. Submitted
  `centerId`, `role`, `accountId`, duplicates, or other fields fail with 400
  before `createBootstrapCenter` and before any persistence mutation.

## Where to look

- `src/lib/server/modules/center-scheduling/public.ts`
- `src/routes/admin/center-page.server.ts`
- `src/routes/admin/+page.server.ts`
- `src/routes/admin/+page.svelte`
- `src/routes/auth/transport.server.ts`
- `tests/center-scheduling/bootstrap-center.test.ts`
- `tests/routes/admin-center-bootstrap.test.ts`
- Test-only time-fixture corrections:
  `tests/identity-access/session-lifecycle.test.ts` and
  `tests/routes/admin-provisioning.test.ts`
- Hard write-boundary compliance: not set; all changes remain inside the exact
  delegated semantic scope plus required executor evidence and papercut log.

## How to run / verify

- `npm run check`
- `npm test`
- `npm run build`
- verifier-owned correction probe:
  `npx vitest run --config .tasks/TASK-025-T3-FT-001-W11/vitest.verify.config.ts`
- claim-linked RED/GREEN and retry evidence:
  `progress.md#execution-attempt-2--verifier-directed-correction`
- reuse candidate: none; independent Reviewer should rerun focused and required
  gates because executor command read surfaces were broad.

## Known issues

- Formal indexed task card was absent at execution start; Orchestrator owns
  registry/lifecycle reconciliation.

## Follow-ups

- Independent `/verify`, then `/red-verify` because this is T3 auth/access work.
