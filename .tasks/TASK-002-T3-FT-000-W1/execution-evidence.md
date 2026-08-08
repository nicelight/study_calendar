---
description: Execution evidence for the TASK-002-T3-FT-000-W1 integrated Foundation gate.
status: active
---
# Execution Evidence — TASK-002-T3-FT-000-W1

## Attempt and input basis
- attempt: 1
- cwd: `/home/serg/Projects/study_calendar`
- task state before prospective checks: `in_progress`
- source basis: existing working tree with broad pre-existing modified/untracked files, preserved as-is
- production change surface: none
- disposable runtime: one SvelteKit/Vite server on `127.0.0.1:5173` and one temporary SQLite database, removed after smoke

## Integrated project gate
Command: `npm run check && npm run build && npm run test`

Observed result: exit `0`; `svelte-check found 0 errors and 0 warnings`, Vite
client/server build completed, and Vitest reported `1` file / `4` tests passed.

This is pre-implementation GREEN for `REQ-000` and the Foundation exit gate.
No artificial production RED was created because no production change was
needed after the baseline was already green.

## One-server integrated smoke
Command: `DATABASE_URL=<isolated-temp-db> npm run dev -- --host 127.0.0.1`

The single server reported `http://127.0.0.1:5173/` and was stopped with
Ctrl-C after the smoke.

- `GET /` → `200 OK`, representative Foundation route served.
- Protected request without cookie → `401` and `{"error":"unauthorized"}`.
- Same request with `foundation_session=session-1` → `200` with resolved actor
  and authorized `center-1` scope.

## Isolated database and atomic failure probe
The disposable SQLite fixture was seeded with a teacher/session, center
membership, second account, pending invitation, and existing duplicate provider
identity. The built composition root performed a create/read/delete/drop
roundtrip and a failed binding transaction.

- Roundtrip returned `{id:"fixture-1",value:"roundtrip"}`.
- Failure: `UNIQUE constraint failed: external_identities.provider, external_identities.subject`.
- State before: `{invitation_status:"pending",identity_count:0}`.
- State after: `{invitation_status:"pending",identity_count:0}`.
- Cleanup inspection: no fixture table, invitation still `pending`, account-2
  identity count `0`; temporary directory removed after server shutdown.

The first probe used an invalid duplicate seed and succeeded unexpectedly. It
was classified as setup failure, restored only the disposable fixture, and was
excluded from claim evidence; the corrected retry above is the claim evidence.

## Boundary result
- No production outcome files changed.
- Task status is `in_progress`; protocol/evidence files are task-scoped.
- Forbidden scope untouched; no product behavior, second service/database,
  event bus, or new public boundary introduced.
