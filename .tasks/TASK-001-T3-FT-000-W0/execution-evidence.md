# Execution evidence — TASK-001-T3-FT-000-W0

## Attempt and source basis

- attempt: 1
- source revision: `118b59dda5207d6b0fbbc61c9aad10cd2422160e`
- completed at: `2026-08-08T10:14:25+0500`
- repository had pre-existing Memory Bank/framework drift; those paths were not part of this implementation.
- `TASK-002-T3-FT-000-W1` remained `planned` and was not changed.

## Honest pre-implementation RED

All three probes ran after the durable `ready -> in_progress` transition and
before production implementation changes.

1. `REQ-000` baseline:
   - command: `if [ -e package.json ] || [ -e src ] || [ -e tests ]; then echo 'unexpected executable baseline present'; exit 0; else echo 'RED: package.json, src/, and tests/ are absent; no runnable scripts or harness'; exit 1; fi`
   - exit: `1`
   - observation: `RED: package.json, src/, and tests/ are absent; no runnable scripts or harness`.
2. `system-architecture.md#composition-and-request-data-flow`:
   - command: `if [ -f src/lib/server/composition-root.ts ] && [ -d src/lib/server/modules/identity-access ] && [ -d src/lib/server/modules/center-scheduling ]; then echo 'unexpected composition/boundary path present'; exit 0; else echo 'RED: composition root and both accepted public seam roots are absent'; exit 1; fi`
   - exit: `1`
   - observation: `RED: composition root and both accepted public seam roots are absent`.
3. `core-domain.md#persistence-and-transaction-rules`:
   - command: `if [ -d tests/foundation ] && [ -f tests/foundation/index.test.ts ]; then echo 'unexpected Foundation fixture probe present'; exit 0; else echo 'RED: isolated roundtrip and failed-transaction fixture probe is absent'; exit 1; fi`
   - exit: `1`
   - observation: `RED: isolated roundtrip and failed-transaction fixture probe is absent`.

## Claim-equivalent GREEN

- `REQ-000`: `npm run check` exited `0`; `svelte-check found 0 errors and 0 warnings`. `npm run build` exited `0`; SvelteKit client and SSR bundles were built.
- Composition/request path: `npm run test` exited `0`; `1` test file and `4` tests passed. The focused harness resolves an actor through Identity & Access, reaches Center & Scheduling through its public scope query, and denies the same query without an actor.
- Persistence/atomicity: the focused harness passed an isolated SQLite roundtrip, provider-verification failure, invitation reuse, duplicate provider identity, and state-before/state-after equality after failed binding.

## Boundary and ownership evidence

- One `getCompositionRoot()` wires one `SharedDatabase`, `IdentityAccessBoundary`, and `CenterSchedulingBoundary`.
- The runtime default is the configured file path `study-calendar.db`; `DATABASE_URL` may provide the same single path explicitly, while tests use disposable `:memory:` databases.
- `src/hooks.server.ts` resolves request actor state through the Identity & Access boundary; no request/user state is stored in module scope.
- The route adapter calls the Center & Scheduling public scope query and does not own business writes.
- Identity & Access writes only account/session/invitation/provider tables; Center & Scheduling writes only center/membership tables.
- No future capability roots, event bus, shared cross-slice repository, second server, or provider credentials were added.

## Isolation and cleanup

- Tests use a fresh `:memory:` SQLite database per test and close it in `afterEach`.
- Provider behavior is supplied by local test doubles; no Telegram/Google network or credentials are used.
- No external side effect or real data was touched.

## Required gate receipts

- `npm run check` — exit `0`; final run after all implementation/test changes.
- `npm run build` — exit `0`; final run after all implementation/test changes. `adapter-auto` emitted its expected informational note that no production platform adapter is selected.
- `npm run test` — exit `0`; `1` file, `4` tests passed; final run after all implementation/test changes.

The final Foundation integrated server smoke remains owned by `TASK-002` and
was not run or changed here.
