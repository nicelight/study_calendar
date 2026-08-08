---
description: Execution plan for TASK-003-T3-FT-001-W2.
status: active
---
# Plan — TASK-003-T3-FT-001-W2

## Goal

Provide an Identity & Access public boundary that atomically provisions a
role-bearing account and invitation, binds a verified identity only once, and
rejects expired, revoked, reused, or duplicate identities without persisted
state mutation.

## Non-goals

- Complete Telegram/Google provider flow, confirmed second-provider binding,
  or callback outage handling owned by TASK-004.
- Client role selection, UI polish, provider credentials, or membership writes.
- Changes to any other task record or scheduler lifecycle.

## Inputs / source specs

- Task record: `.memory-bank/tasks/TASK-003-T3-FT-001-W2.task.json`
- Feature: `.memory-bank/features/FT-001-authentication-and-binding.md#FT-001-AC-003`
- REQ IDs: `REQ-001`, `REQ-002`, `REQ-014`
- Canonical boundary: `.memory-bank/contracts/boundary-map.md#account-provisioning-boundary`
- Security contract: `.memory-bank/contracts/access-control.md`
- Domain/persistence: `.memory-bank/domains/core-domain.md#persistence-and-transaction-rules`
- Lifecycle: `.memory-bank/states/lifecycle-map.md#access-and-membership`

## Constraints / invariants

- MUST keep account, role, invitation, external identity, and session writes in Identity & Access.
- MUST use explicit transaction boundaries for atomic binding/provisioning.
- MUST preserve pre-created role and Center & Scheduling membership context.
- NEVER trust a client-selected role or let routes/other slices bypass the public boundary.
- NEVER touch the task cards named in `forbidden_scope`.

## Scope

### In scope

- `src/lib/server/modules/identity-access/`
- `src/lib/server/modules/center-scheduling/` for the accepted provisioning caller/authorization path
- `src/lib/server/composition-root.ts` for module wiring only
- `src/lib/server/platform/database.ts` only for identity-owned invitation persistence needed by the outcome
- `tests/identity-access/` and related existing identity integration coverage
- `.protocols/TASK-003-T3-FT-001-W2/` and `.tasks/TASK-003-T3-FT-001-W2/` evidence
- selected task status transition required by `/exe`

### Out of scope

- Other task records, feature lifecycle, scheduler state, `/verify`, `/red-verify`, and `/mb-sync`.
- Center & Scheduling-owned membership writes.

## Proposed changes

### Touched areas

- `src/lib/server/modules/identity-access/public.ts` — consume an unforgeable
  server-issued provisioning authorization before the account+invitation
  transaction; retain invitation expiry/revocation and atomic binding checks.
- `src/lib/server/modules/center-scheduling/public.ts` — resolve the request
  session and own-center Admin scope, then issue the one-time authorization
  supplied to Identity & Access; retain membership writes here.
- `src/lib/server/composition-root.ts` — wire the private authorization channel
  for the accepted Center & Scheduling to Identity & Access call path without
  exposing its issuer on the root.
- `src/lib/server/platform/database.ts` — persist invitation expiry metadata.
- `tests/identity-access/task-003.test.ts` — task-owned integration scenarios,
  including the direct caller-supplied cross-center regression, and
  state-before/state-after assertions.

### Preflight-confirmed change surface

- Expected hints kept: yes; identity-access implementation and identity-access tests are the direct outcome surface.
- Additional same-outcome files/areas: `src/lib/server/platform/database.ts` persists expiry state; `src/lib/server/modules/center-scheduling/public.ts` and `src/lib/server/composition-root.ts` provide the accepted authorized caller path without changing ownership.
- Hard `write_boundary` present and satisfied: not set; semantic scope and forbidden scope apply.
- `forbidden_scope` / stop-condition check: clear.

## Applicable quality gates

- [ ] `npm run check` — proves TypeScript/SvelteKit consistency for the changed boundary.
- [ ] `npm run build` — proves the integrated production build.
- [ ] `npm run test` — proves task tests and existing project tests.

## Claim-linked RED / GREEN (T2/T3)

- applicability: applicable
- accepted claim locator: `FT-001-AC-003`; task `evidence_required` state-before/state-after contract
- planned test/probe: isolated in-memory SQLite integration tests for expired, revoked, reused, and duplicate identity attempts, with account/role/membership/invitation/binding snapshots.
- observable RED: at least one real AC-003 scenario fails against the pre-change implementation.
- corresponding GREEN: all mapped rejection scenarios throw and state snapshots remain equal; valid provisioning/binding retains the original role and membership.
- T3 isolation, safe rerun, cleanup, and permission boundary: fresh `:memory:` database per test, no credentials/network, close in `afterEach`, no writes outside selected code/tests/protocol/evidence/task status.

## MB-SYNC handoff / owner

Scheduler or explicit lifecycle owner performs later sync/closure. `/exe` records evidence only.

- Owner identified: none in this `/exe` handoff
- `.memory-bank/` docs needing update: none beyond selected task status; task protocol is the durable execution handoff.
- `.memory-bank/index.md` router update needed: no
- RTM update needed: no
- Task registry/status update owner: `/exe` for `ready -> in_progress`; later lifecycle owner for closure
- Changelog update owner: later workflow owner if required

## Definition of done

- Production behavior and tests satisfy the selected task outcome within scope.
- `npm run check`, `npm run build`, and `npm run test` pass.
- Current-attempt RED/GREEN and exact evidence paths are recorded; final functional and semantic verification remain routed to their owners.
