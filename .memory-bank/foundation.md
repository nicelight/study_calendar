---
description: Foundation Dev Path evidence and feature pressure map.
status: active
last_updated: 2026-08-08
source_of_truth:
  - .memory-bank/foundation.md
---
# Foundation Dev Path

## Gate Anchors

- Foundation Required: true
- Foundation Requirement: REQ-000
- Foundation Pseudo-Feature: FT-000
- Foundation Gate Task: TASK-002-T3-FT-000-W1

## Decision Evidence

The accepted target is a strict shared-boundary modular monolith: six
capability slices, one SvelteKit server, one shared persisted database, server-
side authorization, cross-slice transactions, provider binding, and a
deterministic financial ledger. The repository currently has no application
package/runtime, executable entrypoint, database schema/migration baseline,
provider compatibility probe, or test harness. Feature work cannot safely begin
without a walking skeleton that proves the runtime, storage, contract, and
verification path. Therefore a separate Foundation Dev Path is required.

Foundation is product-enabling infrastructure only. It must not implement
calendar, collaboration, education, or financial product behavior beyond the
minimal probes needed to prove the accepted boundaries.

## Minimal Work Path

- Build command: `npm run check && npm run build` after the Foundation project
  bootstrap establishes the project-native scripts.
- Start command: `npm run dev -- --host 127.0.0.1` for the local smoke path; the
  deployment smoke uses one built SvelteKit server process.
- Primary entrypoint: SvelteKit application entry through `src/hooks.server.ts`
  and `src/routes/`, wired to the single
  `src/lib/server/composition-root.ts`.
- Smoke path: one server starts, one database adapter connects, an isolated
  schema/fixture roundtrip succeeds, protected access denies without an actor,
  and a failed binding/transaction leaves no partial state.
- Test command: `npm run test` after Foundation establishes the smallest
  project-native harness required by the risk-based testing policy.
- Evidence: current-state inspection found no `package.json`, product source,
  database schema/migration, or tests; target pressure and exit probes are
  recorded in [.memory-bank/runbooks/mvp-verification.md](runbooks/mvp-verification.md).

## Feature Pressure Map

| Feature | Pressure | Foundation Response | Probe | Status |
|---|---|---|---|---|
| FT-001 Authentication and Binding | Provider callbacks, atomic binding, actor context, and no-partial failure | Server entry, session/provider adapter seams, Identity & Access public boundary, and test harness | Provider failure/reuse/duplicate binding leaves persisted state unchanged | required |
| FT-002 Center and Scheduling | Shared scope, lesson identity, assignment revocation, and database lifecycle | One database connection/migration path and Center & Scheduling boundary | Create scoped fixture, transfer one lesson identity, revoke assignment, recheck access | required |
| FT-003 Calendar and Lesson Context | One temporal basis and shared/personal projection boundary | SvelteKit route/load adapter to module public queries and smoke fixture | One server serves shared and personal context without changing selected scope | required |
| FT-004 Day Collaboration | Persisted arbitrary-depth messages, retention, and privacy | Transactional persistence seam and Collaboration boundary | Nested reply/hidden branch fixture retains all messages and scope | required |
| FT-005 Learning Progress | Attendance transition crosses into financial reconciliation | Cross-slice command transaction seam and verification harness | Individual/group absent creates no charge; correction is atomic and auditable | required |
| FT-006 Financial Ledger | Exact money, deterministic allocation, audit, marker projection, and role authority | Exact-value storage baseline, Financial Ledger boundary, replay harness | Full/partial/excess/replay and Admin/Teacher authorization produce stable facts | required |

## Deferred Decisions

| Decision | Why deferred | Trigger to revisit |
|---|---|---|
| Database engine and migration library | No runtime baseline exists; the accepted requirement is one shared transactional database, not a vendor. | Foundation storage probe before persistence implementation. |
| Telegram/Google SDK configuration | Integrations are accepted but credentials and runtime adapter seams do not exist. | Foundation provider compatibility probe. |

## Foundation Exit Criteria

- minimal path passes
- compatibility probes pass
- no P0/P1 design pressure unresolved
- feature dev path allowed

## Queue Handoff

The minimum indexed Foundation queue is:

- `TASK-001-T3-FT-000-W0` — done: bootstrap substrate, composition/boundary
  seams, and focused isolated probes;
- `TASK-002-T3-FT-000-W1` — done: the single final integrated Foundation gate,
  dependent on `TASK-001-T3-FT-000-W0`.

Planning and the Foundation execution gate are complete. Product task records
remain intentionally absent until the owning product task-planning workflow
creates them.
