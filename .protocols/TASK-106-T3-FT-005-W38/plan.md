---
description: Execution plan for TASK-106-T3-FT-005-W38.
status: active
---
# Plan — TASK-106-T3-FT-005-W38

## Goal

Render homework item, class-visible completion statuses, Student completion,
and Admin/assigned-Teacher grade controls in the existing Lesson Context page;
prove the accepted completion/grade/privacy behavior through a disposable
Playwright flow.

## Non-goals

- No new route, API, persistence relation, client-wide store, or direct DB access.
- No server/provider/module edits; W37 is the dependency and source of truth.
- No attendance, payments, schema, or unrelated browser-surface changes.
- No use or mutation of `study-calendar.db`.

## Inputs / source specs
- Task record: `.memory-bank/tasks/TASK-106-T3-FT-005-W38.task.json`
- Task index: `.memory-bank/tasks/index.json`
- Feature/Epic: `.memory-bank/features/FT-005-learning-progress.md`, `EP-004`
- REQ IDs: `REQ-009`, `REQ-014`
- Canonical: Learning Progress Browser Surface, Access Control, Boundary Map, System Architecture, Testing Strategy.

## Richer execution inputs (optional)
- Source Artifacts: task card `source_artifacts`.
- Normative Inputs: task card `normative_inputs`.
- Verification Targets: task card `verification_targets`.

## Constraints / invariants (MUST / NEVER)
- MUST consume W37's server projection and named actions.
- MUST keep shared completion data grade-free.
- MUST show grades only in the permitted personal/teacher/admin contexts supplied by the server.
- MUST use fresh server data after actions and a failure-safe disposable DB flow.
- NEVER trust client role, center, class, lesson, student, or homework identifiers.
- NEVER touch `runtime_context.forbidden_scope`.

## Scope
### In scope
- `src/routes/lesson-context/+page.svelte`
- focused tests under `tests/lesson-context/` and `tests/routes/`
- `e2e/ft-005-homework-grading-ui.spec.ts`
- exact disposable DB target `tmp/ft-005-homework-grading-ui.db` during the runner only

### Out of scope
- `src/routes/lesson-context/+page.server.ts` and all server modules
- database/platform/API/runner/config files
- shared/real database and unrelated dirty worktree changes

## Proposed changes
### Touched areas (hypotheses OK)
- `src/routes/lesson-context/+page.svelte` — render server-projected homework and named forms.
- `tests/lesson-context/` or `tests/routes/` — focused render/route assertions if needed.
- `e2e/ft-005-homework-grading-ui.spec.ts` — disposable role/privacy/persistence proof.
- `tmp/ft-005-homework-grading-ui.db` — runner-created disposable state only; cleanup receipt required.

### Preflight-confirmed change surface
- Expected hints kept: yes.
- Additional same-outcome files/areas and rationale: none at start.
- Hard `write_boundary` present and satisfied: yes.
- `forbidden_scope` / stop-condition check: clear.

## Applicable quality gates
- [ ] `npm run check` — proves Svelte/TypeScript correctness.
- [ ] `npm run build` — proves production SSR/client compilation.
- [ ] `npm run test` — required project regression gate.
- [ ] `node scripts/run-disposable-e2e.mjs --database tmp/ft-005-homework-grading-ui.db --spec e2e/ft-005-homework-grading-ui.spec.ts` — proves isolated browser claims and cleanup.
- [ ] `git diff --check` — proves patch whitespace integrity.

## Claim-linked RED / GREEN (T2/T3)
- applicability: applicable.
- accepted claim locator(s): `FT-005-AC-001 / REQ-009`; `FT-005-AC-002 / REQ-009 / REQ-014`.
- planned test/probe and environment: focused route/UI test plus one disposable Playwright flow in `tmp/` with owned server.
- observable RED: current page has no homework progress section, completion action, create action, or grade selector; browser proof is absent.
- corresponding GREEN: fresh server-rendered page exposes completion/create/grade controls in permitted contexts; disposable flow proves creation, completion/reload, all accepted grades, permitted personal display, and unrelated privacy denial.
- accepted not-applicable reason and alternative proof: none.
- T3 isolation, safe rerun, cleanup, and permission boundary: runner removes exact target and WAL/SHM/journal sidecars in `finally`; no real DB or forbidden server/config scope.

## Fan-out plan (if needed)
- None; execution is bounded and sequential.

## MB-SYNC handoff / owner
Scheduler/outer lifecycle owner performs closure and wave sync after `/verify` and `/red-verify`. This delegated `/exe` run records evidence and hands off only.

Checklist:
- [ ] Owner identified: scheduler/outer lifecycle owner.
- [ ] Explicit standalone owner basis: n/a.
- [ ] `.memory-bank/` docs needing update: task/feature lifecycle reconciliation remains downstream; no product doc update by this implementer.
- [ ] `.memory-bank/index.md` router update needed: no.
- [ ] RTM update in `.memory-bank/requirements.md` needed: no.
- [ ] Task registry/status update owner: outer lifecycle owner after verification.
- [ ] Changelog update owner: outer lifecycle owner at sync boundary.

## Definition of done
- UI and disposable proof implement the task outcome inside the hard boundary.
- All required gates are run or an exact blocker is recorded.
- Current-attempt RED/GREEN, actual files, cleanup receipt, and next `/verify` handoff are reproducibly recorded.
