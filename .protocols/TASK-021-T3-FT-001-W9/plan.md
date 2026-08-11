---
description: Execution plan for TASK-021-T3-FT-001-W9.
status: active
---
# Plan — TASK-021-T3-FT-001-W9

## Goal

Expose the minimum protected Admin participant UI, form action, and JSON API
that provisions a teacher/student/parent in the route's own center and returns
the one-time invitation URL/status.

## Non-goals

- No direct database writes from routes/components.
- No replacement for `createParticipant`, no provider logic, no dev-login
  bypass, no secrets, and no client-selected account/center/admin authority.
- No unrelated Admin screens or changes to TASK-019/020 cards/history or old
  failed task records.

## Inputs / source specs

- Task record: `.memory-bank/tasks/TASK-021-T3-FT-001-W9.task.json`
- Task index: `.memory-bank/tasks/index.json`
- Feature: `.memory-bank/features/FT-001-authentication-and-binding.md`
- REQ IDs: REQ-001, REQ-002, REQ-014

## Richer execution inputs

- `.memory-bank/contracts/authentication-transport.md#protected-admin-provisioning-path`
- `.memory-bank/contracts/boundary-map.md#account-provisioning-boundary`
- `.memory-bank/contracts/boundary-map.md#calendar-and-membership-query-boundary`
- `.memory-bank/contracts/access-control.md#authority-and-scope`
- `.memory-bank/domains/core-domain.md#persistence-and-transaction-rules`
- `.memory-bank/states/lifecycle-map.md#access-and-membership`
- `.memory-bank/architecture/system-architecture.md#main-architecture-units`
- `.memory-bank/testing/strategy.md#evidence-and-ownership`
- `.memory-bank/workflows/tier-policy.md#claim-linked-red--green-for-t2t3`

## Constraints / invariants (MUST / NEVER)

- MUST use the verified `locals.actor` and the existing session cookie; the
  action rechecks the target center through Center & Scheduling.
- MUST generate account/invitation identifiers server-side and return only the
  invitation URL/status/expiry needed by the UI.
- MUST preserve atomicity by calling `createParticipant` once; rollback is
  observed through an isolated induced membership failure.
- NEVER trust submitted center/account/admin fields or write module tables from
  a route/component.

## Scope

### In scope

- `src/routes/admin/` page load, Svelte 5 page, form action, and JSON API.
- `tests/routes/` SSR/action/API authorization, safe error, integration, and
  no-leakage coverage.
- `tests/center-scheduling/` only if a same-outcome boundary regression is
  necessary.
- `.protocols/TASK-021-T3-FT-001-W9/` and `.tasks/TASK-021-T3-FT-001-W9/` evidence.

### Out of scope

- `TASK-019`/`TASK-020` cards/history and old failed task records.
- Identity & Access or Center & Scheduling production implementation changes.
- Provider adapters, provider credentials, or any new persistence owner.

## Proposed changes

### Touched areas (hypotheses OK)

- `src/routes/admin/[centerId]/participants/+page.server.ts` — protected SSR
  load/form action.
- `src/routes/admin/[centerId]/participants/+page.svelte` — minimal form and
  invitation status display.
- `src/routes/admin/[centerId]/participants/+server.ts` — protected JSON GET/POST
  transport.
- `src/routes/admin/provisioning.server.ts` — shared thin transport adapter.
- `tests/routes/admin-provisioning.test.ts` — isolated regression evidence.

### Preflight-confirmed change surface

- Expected hints kept: `src/routes/admin/`, `tests/routes/`,
  `tests/center-scheduling/`.
- Additional same-outcome files/areas and rationale: none yet.
- Hard `write_boundary` present and satisfied: not set.
- `forbidden_scope` / stop-condition check: clear.

## Applicable quality gates

- [x] `npm run check` — PASS; 0 Svelte diagnostics; see
  `.tasks/TASK-021-T3-FT-001-W9/check-attempt-3.txt`.
- [x] `npm run build` — PASS; SSR/client build completed; see
  `.tasks/TASK-021-T3-FT-001-W9/build-attempt-3.txt`.
- [x] `npm run test` — 21 files / 74 tests passed; see
  `.tasks/TASK-021-T3-FT-001-W9/full-test-attempt-3.txt`.
- [x] focused Admin route probe — 5/5 passed; task-owned authorization, atomicity,
  invitation handoff, safe rerun, and no-leakage claims; see
  `.tasks/TASK-021-T3-FT-001-W9/focused-green-attempt-3.txt`.

## Claim-linked RED / GREEN (T2/T3)

- applicability: applicable
- accepted claim locator(s): FT-001-AC-008; protected Admin provisioning path;
  account provisioning boundary; persistence/transaction rules.
- planned test/probe and environment: disposable in-memory SQLite and injected
  provider transport fixture; direct route transport invocation for SSR/action/
  API with server-issued sessions.
- observable RED: the Admin transport module/page/API is absent, so the focused
  claim probe cannot reach protected success/denial/atomicity behavior.
- corresponding GREEN: own-center Admin succeeds through `createParticipant`,
  all negative requests fail before mutation, returned invitation is usable by
  TASK-020 transport, and induced membership failure leaves state unchanged.
- T3 isolation, safe rerun, cleanup, and permission boundary: `:memory:` DB per
  test, explicit root close, no provider credentials, no production DB, and no
  direct route persistence.

## Fan-out plan (if needed)

- None; no subagents are authorized for this Implementer session.

## MB-SYNC handoff / owner

Scheduler or explicit standalone owner performs sync after verification/status
decision. `/exe` only records handoff notes.

- Owner identified: none for lifecycle closure; user requested execution only.
- `.memory-bank/` docs needing update: none beyond task-owned execution state;
  implementation navigation is already present in the feature/task plan.
- `.memory-bank/index.md` router update needed: no.
- RTM update needed: no.
- Task registry/status update owner: current `/exe` for `in_progress` only;
  later lifecycle owner after `/verify` and `/red-verify`.

## Definition of done

- Production route/page/API and regression probe are implemented within scope.
- RED and claim-equivalent GREEN plus check/build/full-test evidence are linked.
- Task remains `in_progress`; after the required check/build gate repair, next
  owner is `/verify` followed by T3 `/red-verify`; no lifecycle closure is
  performed here.
