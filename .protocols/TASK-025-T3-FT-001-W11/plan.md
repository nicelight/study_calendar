---
description: Execution plan for TASK-025 bootstrap Admin center creation.
status: active
---
# Plan — TASK-025-T3-FT-001-W11

## Goal

Allow a bound Admin with no membership to enter `/admin`, create exactly one
center, and reach its protected Admin surface.

## Non-goals

- Provider console credentials and live provider smoke.
- Class, schedule, teacher privilege, or participant UI expansion.
- Password or development-login paths.

## Constraints / invariants

- Center and membership commit atomically inside Center & Scheduling.
- Routes call public module boundaries and never write the database directly.
- Non-Admin, unauthenticated, repeated bootstrap, and caller-forged scope fail
  before mutation.

## Scope

- Center & Scheduling bootstrap command and Admin-entry query.
- `/admin` server route and Svelte page.
- Auth callback routing for bound Admin accounts.
- Focused isolated tests for success, rollback, denial, and auth regression.

## Applicable quality gates

- `npm run check`
- `npm test`
- `npm run build`

## Claim-linked RED / GREEN

- applicability: applicable
- accepted claim locator: `FT-001-AC-009`
- probe: focused Vitest boundary/HTTP scenarios in disposable in-memory SQLite.
- RED: current implementation lacks bootstrap center public command and `/admin` route.
- GREEN: success/rollback/repeat/non-Admin/forged-input tests pass.
- T3 isolation: in-memory databases only; no provider credentials or external side effects.

## MB-SYNC handoff / owner

- Owner: Orchestrator/scheduler.
- Durable specs were updated before this execution and are not modified here.

## Definition of done

- Focused claim probe and all assigned project gates pass; execution evidence is
  ready for independent `/verify` and `/red-verify`.
