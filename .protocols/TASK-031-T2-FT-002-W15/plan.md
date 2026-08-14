---
description: Execution plan for TASK-031-T2-FT-002-W15.
status: active
---
# Plan — TASK-031-T2-FT-002-W15

## Goal
Keep a valid unfinished recurring schedule draft only for its current center/class browser form until confirmed schedule creation.

## Non-goals
No schedule server-action, persistence, authorization, payload, cookie, dependency, or TASK-026 change.

## Inputs / source specs
- Task record: `.memory-bank/tasks/TASK-031-T2-FT-002-W15.task.json`
- Feature/REQ: FT-002 AC-008 / REQ-004.
- Contract: `authentication-transport.md#class-schedule-draft-retention`.

## Constraints / invariants (MUST / NEVER)
- MUST: use the exact scoped key and serialize only `{startDate,endDate,weekdays}` with valid values.
- MUST: access storage only after client mount or from browser events; malformed/unavailable storage is clean defaults.
- NEVER: modify server ownership/validation, store secrets/arbitrary fields, or restore across center/class scope.

## Scope
### In scope
- `src/routes/admin/[centerId]/+page.svelte` browser lifecycle/event logic.
- `tests/routes/admin-schedule-draft.test.ts` focused client/SSR regression coverage.
- Task protocol and isolated evidence artifacts.

### Out of scope
- All task-card forbidden paths, package files, and TASK-026 artifacts.

## Preflight-confirmed change surface
- Expected hints kept: page component and focused route test.
- Hard `write_boundary` present and satisfied: not set.
- `forbidden_scope` / stop-condition check: clear.

## Applicable quality gates
- [ ] `npm run check` — Svelte/TypeScript and SSR-safe compilation.
- [ ] `npm run build` — production SSR/client build.
- [ ] `npm run test` — project regression suite.
- [ ] Real protected-browser RED/GREEN — FT-002 AC-008 behavior and submitted Form Data/storage comparison.

## Claim-linked RED / GREEN (T2)
- applicability: applicable.
- accepted claim locator: FT-002-AC-008 / REQ-004 and Authentication Transport draft-retention contract.
- planned probe: isolated Chrome Admin form with same-class reload, separate center/class keys, malformed data, rejected empty-weekday submission, and valid success.
- observable RED: populated same-form values disappear after reload because no existing persistence restores them.
- corresponding GREEN: exact valid matching draft restores; malformed/scope-mismatched data stays clean; rejected submit keeps key; `schedule_created` removes only matching key.

## MB-SYNC handoff / owner
- [x] Explicit lifecycle owner decision is recorded in the task card as
  `done` after functional `PASS`; this protocol does not own closure.
- [x] `.memory-bank/` docs needing update: no, implementation matches the already accepted contract.
- [x] `/exe` owned `ready -> in_progress`; the explicit lifecycle owner later
  recorded `done` in the authoritative task card.

## Definition of done
Current attempt has claim-linked RED/GREEN, focused regression evidence, and
required gates. Functional PASS and explicit `done` closure are now reconciled
through the indexed card; feature-level semantic closure remains separate.
