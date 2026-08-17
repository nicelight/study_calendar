---
description: Execution context for TASK-035-T3-FT-002-W19.
status: active
---
# Context — TASK-035-T3-FT-002-W19

## Purpose
Deliver the protected, role-scoped class entry shell without widening authorization, persistence, Admin management, or FT-003 ownership.

## Execution Attempt
- attempt: 2
- started: 2026-08-14T23:34:35+05:00

## Inputs (what drives this task)
- Task record: `.memory-bank/tasks/TASK-035-T3-FT-002-W19.task.json`
- Task index: `.memory-bank/tasks/index.json`
- Specs: `.memory-bank/contracts/access-control.md`, `.memory-bank/contracts/boundary-map.md`, `.memory-bank/contracts/authentication-transport.md`
- Acceptance criteria source: `.memory-bank/features/FT-002-center-and-scheduling.md#ft-002-ac-011--role-scoped-class-entry-shell-is-available-for-permitted-members`

## Richer inputs (optional)
- Source Artifacts: authenticated browser/API path and the Center & Scheduling calendar/membership query boundary.
- Normative Inputs: Constitution, SDD backbone/index, System Architecture, Access Control, Boundary Map, Authentication Transport, and testing strategy.
- Constraints / Invariants: server session plus `AuthorizedClassScope` determines scope; the route must compare its path IDs to that server result; the component is presentation only.
- Verification Targets: isolated SSR/HTTP four-role success and denial matrix, source boundary proof, existing Admin/TASK-032 regressions, check/test/build/diff.

## Loaded context set (what was read)
- `AGENTS.md`
- `.memory-bank/tasks/TASK-035-T3-FT-002-W19.task.json`
- `.memory-bank/features/FT-002-center-and-scheduling.md`
- `.memory-bank/contracts/access-control.md`
- `.memory-bank/contracts/boundary-map.md`
- `.memory-bank/contracts/authentication-transport.md`
- `.memory-bank/workflows/tier-policy.md`
- `.tasks/TASK-MB-REVIEW-TASKS-PLAN/TASK-MB-REVIEW-TASKS-PLAN-S-TASKS-FT-002-PRE035-R2-final-report-docs-01.md`

## Decisions / assumptions
- Decision: consume the existing Center & Scheduling `getAuthorizedClassScope(sessionToken, classId)` public query; project no student IDs or account ID to the page.
- Decision: compare both `centerId` and `classId` path params with the server-returned scope and use the request-scoped Actor Context only to distinguish an unauthenticated redirect from an authorization denial.
- Assumption (needs verification): the public query's existing four-role behavior is sufficient for the route and its disposable matrix; no new module edge is needed.

## Retry reconciliation
- Attempt 1 functional verification failed only because the real SvelteKit route never exported its recognized `load`; the factory was unreachable. The fresh verifier proved the behavior through a disposable HTTP matrix and requested a bounded wiring correction.
- Attempt 2 correction: export `load` from the same route module and delegate it to the existing factory. The focused test must invoke the exported `load` with a mocked composition root so a direct-factory-only passing path cannot recur.

## Commands run / environment notes
- task/index/dependency/write-boundary preflight → OK; TASK-035 is `ready`, TASK-032 is `done`, no target-route/test dirty overlap.
- prospective T2/T3 proof-path scan → OK; all current `planned|ready` T2/T3 cards have evidence and verification targets.
- `npm run test -- tests/routes/center-class-entry.test.ts` → final claim-equivalent GREEN, 1 file / 11 tests.
- `npm run check`, `npm run test`, `npm run build`, and `git diff --check` → PASS; detailed receipts are in `.tasks/TASK-035-T3-FT-002-W19/gates.md`.
- Attempt 2 real Vite/SvelteKit matrix → fresh RED before the route export, then GREEN after it; permitted/denied HTTP results and cleanup are recorded in `.tasks/TASK-035-T3-FT-002-W19/attempt-2-{red,green}-real-route.md`.
- Attempt 2 final focused test, `npm run check`, full test, build, and diff check → PASS; `.tasks/TASK-035-T3-FT-002-W19/attempt-2-gates.md`.

## Open questions / blockers
- None.

## Next session
- Start by reading: `context.md`, `plan.md`, `progress.md`
- Next action (one concrete step): independently rerun `/verify TASK-035-T3-FT-002-W19` against Attempt 2 real-route evidence.
